from fastapi import FastAPI,Request,HTTPException, Response ,UploadFile, File, Form
from fastapi.responses import  JSONResponse
from pydantic import BaseModel
import os, time ,shutil, json
from storage import  get_token_info, increment_download, create_token, cleanup_expired_tokens
from config import BASE_STORAGE_PATH, X_ACCEL_PREFIX, X_ACCEL_PREFIX_TMP,TMP_STORAGE_PATH
from utils import normalize_path
from pathlib import Path
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager
from uuid import uuid4
import zipfile
from urllib.parse import quote

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    async def periodic_cleanup():
        while True:
            now = time.time()
            
            # 1. 清理过期token及其相关临时文件
            try:
                temp_paths_to_delete = cleanup_expired_tokens()
                for temp_path in temp_paths_to_delete:
                    if temp_path and os.path.exists(temp_path):
                        shutil.rmtree(temp_path, ignore_errors=True)
                        print(f"[cleanup] Removed expired token temp dir: {temp_path}")
                if temp_paths_to_delete:
                    print(f"[cleanup] Cleaned up {len(temp_paths_to_delete)} expired tokens")
            except Exception as e:
                print(f"[cleanup] Error cleaning expired tokens: {e}")
            
            # 2. 清理token特定的临时目录（上传相关）
            tmp_base = Path("/tmp")
            if tmp_base.exists():
                for folder in tmp_base.iterdir():
                    if folder.is_dir() and len(folder.name) == 32:  # token length is 32 chars
                        # 查找这个token目录下的分片目录
                        if folder.exists():
                            for subfolder in folder.iterdir():
                                if subfolder.is_dir():
                                    meta = subfolder / META_FILE
                                    if meta.exists():
                                        mtime = meta.stat().st_mtime
                                        if now - mtime > 86400:
                                            shutil.rmtree(subfolder, ignore_errors=True)
                                            print(f"[cleanup] Removed temp subfolder: {subfolder}")
                            # 如果token目录为空，也删除它
                            try:
                                if not any(folder.iterdir()):
                                    shutil.rmtree(folder, ignore_errors=True)
                                    print(f"[cleanup] Removed empty token folder: {folder}")
                            except:
                                pass
            
            # 3. 清理孤立的zip临时目录 (没有对应token的)
            try:
                for folder in tmp_base.iterdir():
                    if folder.is_dir() and folder.name.startswith("zip_") and len(folder.name) == 36:  # zip_ + 32 chars
                        # 检查是否超过24小时未被访问
                        if folder.exists():
                            mtime = folder.stat().st_mtime
                            if now - mtime > 86400:  # 24小时
                                shutil.rmtree(folder, ignore_errors=True)
                                print(f"[cleanup] Removed old zip temp dir: {folder}")
            except Exception as e:
                print(f"[cleanup] Error cleaning zip temp dirs: {e}")
            
            await asyncio.sleep(3600)  # 每1小时清理一次

    # 启动后台清理任务
    task = asyncio.create_task(periodic_cleanup())
    print("[startup] Background cleanup task started")

    yield  # 应用生命周期（处理请求）

    # 应用关闭时执行
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("[shutdown] Background cleanup task cancelled")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # "http://127.0.0.1:5500",
    # "http://127.0.0.1:3000",
    # "http://localhost:3000"  # 如果用localhost访问也可以加上
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    real_path: str
    max_downloads: int = 5
    expire_in: int = 86400  # 24 hours
    template_style: int = 0  # Default to 0, can be changed if needed

class UploadRequest(BaseModel):
    real_path: str
    gb_num: int = 2
    expire_in: int = 86400  # 24 hours
    template_style: int = 0  # Default to 0, can be changed if needed

@app.post("/api/admin/download")
def admin_download(req: DownloadRequest, request: Request):
    normalized_path = req.real_path
    if not os.path.exists(normalized_path):
        raise HTTPException(status_code=404, detail="File not found.")
    temp_path = None
    if os.path.isdir(normalized_path):
        zip_token = uuid4().hex
        zip_dir = f"/tmp/zip_{zip_token}"
        os.makedirs(zip_dir, exist_ok=True)
        base_name = os.path.basename(normalized_path.rstrip("/"))
        zip_path = os.path.join(zip_dir, f"{base_name}.zip")
        with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_STORED) as zipf:
            for root, dirs, files in os.walk(normalized_path):
                for file in files:
                    abs_file = os.path.join(root, file)
                    arcname = os.path.relpath(abs_file, start=normalized_path)
                    zipf.write(abs_file, arcname)
        temp_path = zip_dir
        normalized_path = zip_path
    token = create_token("download", normalized_path, req.expire_in, req.template_style, 
                        max_downloads=req.max_downloads, temp_path=temp_path)
    base_url = str(request.base_url).rstrip("/")
    print(f"[admin_download] path={req.real_path}, token={token}")
    return {"link": f"download/{token}"}

@app.post("/api/admin/upload")
def admin_upload(req: UploadRequest, request: Request):
    normalized_path = req.real_path
    if not os.path.exists(normalized_path):
        raise HTTPException(status_code=404, detail="Path not found.")
    if not os.path.isdir(normalized_path):
        raise HTTPException(status_code=400, detail="Upload path must be a directory.")
    token = create_token("upload", normalized_path, req.expire_in, req.template_style, 
                        gb_num=req.gb_num)
    base_url = str(request.base_url).rstrip("/")
    print(f"[admin_upload] path={req.real_path}, token={token}")
    return {"link": f"upload/{token}"}

@app.get("/api/download_direct/{token}")
def download_direct(token: str):
    info = get_token_info(token)
    if not info:
        raise HTTPException(status_code=404, detail="Invalid token.")
    if time.time() > info["expire_at"]:
        raise HTTPException(status_code=403, detail="Link expired.")
    
    if info.get("token_type", "download") != "download":
        raise HTTPException(status_code=403, detail="This token is not for download.")
        
    if info["downloads"] >= info["max_downloads"]:
        raise HTTPException(status_code=403, detail="Download limit reached.")

    increment_download(token)
    response = Response()

    if info['real_path'].startswith(TMP_STORAGE_PATH):
        internal_path = os.path.relpath(info['real_path'], TMP_STORAGE_PATH)
        redirect_prefix = X_ACCEL_PREFIX_TMP
    else:
        internal_path = os.path.relpath(info['real_path'], BASE_STORAGE_PATH)
        redirect_prefix = X_ACCEL_PREFIX

    # URL 编码路径（保留斜杠）
    safe_internal_path = quote(internal_path, safe="/")

    response.headers["Content-Type"] = "application/octet-stream; charset=utf-8"
    response.headers["X-Accel-Redirect"] = f"{redirect_prefix}/{safe_internal_path}"

    # 文件名也要编码，否则中文文件名下载时会乱码
    filename = os.path.basename(info['real_path'])
    safe_filename = quote(filename)
    response.headers["Content-Disposition"] = f"attachment; filename*=UTF-8''{safe_filename}"

    return response

@app.get("/api/token_info/{token}")
def get_token_info_api(token: str):
    info = get_token_info(token)
    if not info:
        return {"valid": False}
    
    base_response = {
        "valid": True,
        "expired": time.time() > info["expire_at"],
        "template_style": info.get("template_style", 0),
        "token_type": info.get("token_type", "download")  # 默认为download保持兼容
    }
    
    if info.get("token_type") == "upload":
        # 计算实际使用的存储空间
        storage_path = Path(info["real_path"])
        used_bytes = 0
        if storage_path.exists() and storage_path.is_dir():
            used_bytes = sum(f.stat().st_size for f in storage_path.rglob("*") if f.is_file())
        
        base_response.update({
            "used_bytes": used_bytes,
            "max_storage_bytes": info["gb_num"] * 1024 * 1024 * 1024,
            "real_path": info["real_path"],
            "directory_name": os.path.basename(info["real_path"])  # 上传目录名
        })
    else:
        # 下载token
        base_response.update({
            "downloads_left": info["max_downloads"] - info["downloads"],
            "file_name": os.path.basename(info["real_path"])  # 下载文件名
        })
    
    return base_response

@app.post("/api/upload_direct/{token}")
async def upload_direct(
    token: str,
    files: list[UploadFile] = File(...)
):
    info = get_token_info(token)
    if not info:
        raise HTTPException(status_code=404, detail="Invalid token.")
    if time.time() > info["expire_at"]:
        raise HTTPException(status_code=403, detail="Link expired.")
    
    # 检查token类型
    if info.get("token_type") != "upload":
        raise HTTPException(status_code=403, detail="This token is not for upload.")

    upload_path = info["real_path"]
    if not os.path.exists(upload_path):
        raise HTTPException(status_code=404, detail="Upload path does not exist.")
    if not os.path.isdir(upload_path):
        raise HTTPException(status_code=400, detail="Upload path must be a directory.")

    # 检查存储容量限制
    current_size = sum(f.stat().st_size for f in Path(upload_path).rglob("*") if f.is_file())
    max_storage_bytes = info["gb_num"] * 1024 * 1024 * 1024
    
    total_upload_size = sum(len(await file.read()) for file in files)
    for file in files:  # 重置文件指针
        await file.seek(0)
    
    if current_size + total_upload_size > max_storage_bytes:
        raise HTTPException(status_code=507, detail="Storage limit exceeded.")

    saved_files = []
    for file in files:
        file_location = os.path.join(upload_path, file.filename)
        with open(file_location, "wb") as f:
            f.write(await file.read())
        saved_files.append(file.filename)

    return JSONResponse(content={"message": "上传成功", "files": saved_files})

##############################分片上传#####################################
STORAGE_DIR = Path("/tmp/storage") #test用，投运时已清除
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

TEMP_DIR = Path("/tmp/temp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

MAX_STORAGE_BYTES = 1 * 1024 * 1024 * 1024  # 2GB
CHUNK_PREFIX = "chunk_"
META_FILE = "meta.json"

def validate_upload_token(token: str):
    """Validate upload token and return storage config"""
    info = get_token_info(token)
    if not info:
        raise HTTPException(status_code=404, detail="Invalid token.")
    if time.time() > info["expire_at"]:
        raise HTTPException(status_code=403, detail="Token expired.")
    
    # 检查token类型
    if info.get("token_type") != "upload":
        raise HTTPException(status_code=403, detail="This token is not for upload.")
    
    storage_dir = Path(info["real_path"])
    temp_dir = Path(f"/tmp/{token}")
    max_storage_bytes = info["gb_num"] * 1024 * 1024 * 1024
    
    return {
        "storage_dir": storage_dir,
        "temp_dir": temp_dir,
        "max_storage_bytes": max_storage_bytes,
        "info": info
    }

#检查文件是否存在
@app.get("/api/check_file/{token}")
def check_file(token: str, relativePath: str):
    config = validate_upload_token(token)
    target_path = config["storage_dir"] / relativePath
    complete = target_path.exists()

    print(f"[check_file] token={token}, path={relativePath} -> complete={complete}")
    return {"complete": complete}

#检查分片上传的状态
@app.get("/api/check_upload/{token}")
def check_upload(token: str, hash: str):
    config = validate_upload_token(token)
    folder = config["temp_dir"] / hash
    uploaded = []
    if folder.exists():
        for f in folder.glob(f"{CHUNK_PREFIX}*"):
            try:
                index = int(f.name.replace(CHUNK_PREFIX, ""))
                uploaded.append(index)
            except:
                continue
    print(f"[check_upload] token={token}, hash={hash} -> uploaded={uploaded}")
    return {"uploaded": uploaded}

#分片上传
@app.post("/api/upload_chunk/{token}")
async def upload_chunk(
    token: str,
    file: UploadFile = File(...),
    index: int = Form(...),
    hash: str = Form(...),
    relativePath: str = Form(...)
):
    config = validate_upload_token(token)
    folder = config["temp_dir"] / hash
    folder.mkdir(parents=True, exist_ok=True)

    # 检查临时目录容量限制
    if config["temp_dir"].exists():
        current_temp_size = sum(f.stat().st_size for f in config["temp_dir"].rglob("*") if f.is_file())
        file_content = await file.read()
        if current_temp_size + len(file_content) > config["max_storage_bytes"]:
            raise HTTPException(507, "Temporary storage limit exceeded")
    else:
        file_content = await file.read()

    with open(folder / f"{CHUNK_PREFIX}{index}", "wb") as f:
        f.write(file_content)

    # 保存元数据
    meta = {
        "relativePath": relativePath,
        "lastModified": int(time.time())
    }
    with open(folder / META_FILE, "w") as f:
        json.dump(meta, f)

    print(f"[upload_chunk] token={token}, hash={hash}, index={index}, path={relativePath}")
    return {"success": True}

#合并分片
class MergeRequest(BaseModel):
    hash: str
    totalChunks: int
    relativePath: str
@app.post("/api/merge_chunks/{token}")
def merge_chunks(token: str, req: MergeRequest):
    config = validate_upload_token(token)
    folder = config["temp_dir"] / req.hash
    if not folder.exists():
        raise HTTPException(404, "Temp folder not found")

    target_path = config["storage_dir"] / req.relativePath
    target_path.parent.mkdir(parents=True, exist_ok=True)

    if target_path.exists():
        print(f"[merge_chunks] already exists: {target_path}")
        return {"message": "already merged"}

    # 检查存储空间限制
    current_size = sum(f.stat().st_size for f in config["storage_dir"].rglob("*") if f.is_file())
    estimated_new_file = sum((folder / f"{CHUNK_PREFIX}{i}").stat().st_size for i in range(req.totalChunks))
    if current_size + estimated_new_file > config["max_storage_bytes"]:
        raise HTTPException(507, "Storage limit exceeded")

    with open(target_path, "wb") as outfile:
        for i in range(req.totalChunks):
            chunk_file = folder / f"{CHUNK_PREFIX}{i}"
            if not chunk_file.exists():
                raise HTTPException(400, f"Missing chunk {i}")
            with open(chunk_file, "rb") as cf:
                shutil.copyfileobj(cf, outfile)

    print(f"[merge_chunks] token={token}, saved to: {target_path}")

    # 删除临时目录
    shutil.rmtree(folder, ignore_errors=True)
    return {"message": "merged", "path": str(target_path)}

#检查合并状态
@app.get("/api/merge_status/{token}")
def merge_status(token: str, hash: str, relativePath: str):
    config = validate_upload_token(token)
    target_path = config["storage_dir"] / relativePath
    merged = target_path.exists()
    
    print(f"[merge_status] token={token}, hash={hash}, path={relativePath} -> merged={merged}")
    return {"merged": merged}

# 清理存储目录
@app.delete("/api/clear_storage/{token}")
def clear_storage(token: str):
    config = validate_upload_token(token)
    if config["storage_dir"].exists():
        for item in config["storage_dir"].iterdir():
            if item.is_dir():
                shutil.rmtree(item, ignore_errors=True)
            else:
                item.unlink()
    print(f"[clear_storage] token={token}, cleared")
    return {"cleared": True}

# 列出存储目录下的所有文件
@app.get("/api/list_files/{token}")
def list_files(token: str):
    config = validate_upload_token(token)
    if not config["storage_dir"].exists() or not config["storage_dir"].is_dir():
        raise HTTPException(status_code=404, detail="存储目录不存在")

    files = []
    for f in config["storage_dir"].rglob("*"):
        if f.is_file():
            files.append(str(f.relative_to(config["storage_dir"])).replace("\\", "/"))
    return {"files": files}
##########################################################################

if __name__ == "__main__":
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8080, reload=True)
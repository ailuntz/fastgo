import time
from typing import Dict
from uuid import uuid4

store: Dict[str, dict] = {}

def create_token(token_type: str, real_path: str, expire_in: int, template_style=0, **kwargs) -> str:
    """
    统一的token创建函数
    token_type: 'download' 或 'upload'
    kwargs: max_downloads (for download), gb_num (for upload), temp_path (for tracking temporary files)
    """
    token = uuid4().hex
    base_info = {
        "token_type": token_type,
        "real_path": real_path,
        "expire_at": time.time() + expire_in,
        "template_style": template_style,
        "temp_path": kwargs.get("temp_path")  # 用于记录临时文件路径
    }
    
    if token_type == "download":
        base_info.update({
            "max_downloads": kwargs.get("max_downloads", 5),
            "downloads": 0
        })
    elif token_type == "upload":
        base_info.update({
            "gb_num": kwargs.get("gb_num", 2),
            "used_bytes": 0  # 追踪已使用的字节数
        })
    
    store[token] = base_info
    return token

def get_token_info(token: str):
    return store.get(token)

def increment_download(token: str):
    if token in store:
        store[token]["downloads"] += 1

def get_expired_tokens():
    """获取所有过期的token"""
    now = time.time()
    expired_tokens = []
    for token, info in store.items():
        if now > info["expire_at"]:
            expired_tokens.append((token, info))
    return expired_tokens

def delete_token(token: str):
    """删除指定的token"""
    if token in store:
        del store[token]
        return True
    return False

def cleanup_expired_tokens():
    """清理所有过期的token并返回需要删除的临时文件路径"""
    expired_tokens = get_expired_tokens()
    temp_paths_to_delete = []
    
    for token, info in expired_tokens:
        if info.get("temp_path"):
            temp_paths_to_delete.append(info["temp_path"])
        delete_token(token)
    
    return temp_paths_to_delete

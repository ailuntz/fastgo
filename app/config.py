# 统一 Nginx 文件根路径
BASE_STORAGE_PATH = "/app/fastgo/"
TMP_STORAGE_PATH = "/tmp/"

X_ACCEL_PREFIX = "/protected"
X_ACCEL_PREFIX_TMP = "/protected_tmp"

# 映射表：用户输入路径前缀 -> 真正 Nginx 根路径
MOUNT_PATH_MAP = {
    "/Volumes/usb_main/usb_main": "/app/fastgo",
    "/mnt/usb_main": "/app/fastgo"
}

#vscode 扩展中需要输入前缀
VSCODE_PREFIX = "/mnt/usb_main"
VSCODE_PREFIX = "/Volumes/usb_main/usb_main"
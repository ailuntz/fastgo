import os
from config import MOUNT_PATH_MAP

def normalize_path(input_path: str) -> str:
    for user_prefix, internal_prefix in MOUNT_PATH_MAP.items():
        if input_path.startswith(user_prefix):
            return input_path.replace(user_prefix, internal_prefix, 1)
    # 不匹配任何前缀，返回原始路径
    return None
// src/api/token.ts
import axios from 'axios';

export interface TokenInfo {
    valid: boolean;
    expired: boolean;
    template_style: number;
    token_type: string; // 'download' 或 'upload'
    
    // 下载token字段
    downloads_left?: number;
    file_name?: string;
    
    // 上传token字段
    used_bytes?: number;
    max_storage_bytes?: number;
    real_path?: string;
    directory_name?: string;
}

export async function fetchTokenInfo(token: string): Promise<TokenInfo> {
    const response = await axios.get(`/api/token_info/${token}`);
    return response.data;
}
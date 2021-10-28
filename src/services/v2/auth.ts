import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

// 用户登录
export async function accountLogin(params: any) {
  const encoded = btoa(`${params.username}:${params.password}`);
  return request(`/auth/login`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
    },
  });
}

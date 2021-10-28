import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
// 创建用户
export async function createAccount(params: any) {
  return request('/account/create', {
    method: 'POST',
    data: params,
  });
}
// 用户登录
export async function accountLogin(params: any) {
  return request(`/account/login`, {
    method: 'POST',
    data: params,
  });
}
// 用户列表
export async function accountSearch(params: any): Promise<any> {
  // console.log(params);
  const newParams: any = {
    page: params.current,
    limit: params.pageSize,
  };
  return request.get(`/account/search`, {
    params: newParams,
  });
}

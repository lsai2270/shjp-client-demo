import request from '@/utils/request';
// 用户信息
export async function accountInfo(id: string): Promise<any> {
  return request.get(`/user/${id}`);
}

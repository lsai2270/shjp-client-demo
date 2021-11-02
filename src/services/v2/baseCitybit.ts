import request from '@/utils/request';

// 合围范围
export async function getMapSurround(data: any): Promise<any> {
  return request.post(`/baseCitybit/base/surround`, { data });
}
// 合围范围
export async function getRoads(data: any): Promise<any> {
  return request.get(`/baseCitybit/road`, { params: data });
}

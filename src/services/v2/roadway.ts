import request from '@/utils/request';

// 创建道路
export async function createRoadway(data: any): Promise<any> {
  return request.post(`/road`, { data });
}
// 创建地块
export async function getRoadwayDetail(id: string): Promise<any> {
  return request.get(`/road/${id}`);
}
//
export async function getRoadwayAll(): Promise<any> {
  return request.get(`/road/all`);
}

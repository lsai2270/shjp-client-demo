import request from '@/utils/request';

// 创建地块
export async function createPlot(data: any): Promise<any> {
  return request.post(`/plot/base`, { data });
}
// 创建地块
export async function createPlanPlot(data: any): Promise<any> {
  return request.post(`/plot/plan`, { data });
}

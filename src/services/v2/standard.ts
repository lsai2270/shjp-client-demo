import request from '@/utils/request';

// 创建规范标准
export async function createStandard(data: any): Promise<any> {
  return request.post(`/standard`, { data });
}
// 创建地块
export async function getStandardList(params: any): Promise<any> {
  const newParams: any = {
    _page: params.current,
    _limit: params.pageSize,
  };
  if (params.name) {
    newParams.name_eq = params.name;
  }
  if (params.areaInfo) {
    newParams['_where[areaInfo.province]'] = params.areaInfo;
  }
  return request.get(`/standard`, { params: newParams });
}

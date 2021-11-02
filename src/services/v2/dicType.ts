import request from '@/utils/request';

// 字典列表
export async function dicTypeList(params: any): Promise<any> {
  // console.log(params);
  const newParams: any = {
    _page: params.current,
    _limit: params.pageSize,
  };
  if (params.name) {
    newParams.name = params.name;
  }
  if (params.code) {
    newParams.code = params.code;
  }
  return request.get(`/dicType`, {
    params: newParams,
  });
}
// 创建字典
export async function dicTypeCreate(params: any): Promise<any> {
  return request.post(`/dicType`, { data: params });
}
// 创建字典数据
export async function dicDataCreateMany(params: any): Promise<any> {
  return request.post(`/dicData/createMany`, { data: params });
}
// 所有字典数据
export async function dicDataAll(params: any): Promise<any> {
  return request.get(`/dicData/all`, { params });
}
// 字典数据列表
export async function dicDataList(params: any): Promise<any> {
  // console.log(params);
  const newParams: any = {
    page: params.current,
    limit: params.pageSize,
  };
  if (params.name) {
    newParams.name = params.name;
  }
  if (params.code) {
    newParams.code = params.code;
  }
  return request.get(`/dicData/list`, {
    params: newParams,
  });
}
// 字典数据更新
export async function updateDicData(id: any, params: any): Promise<any> {
  return request.put(`/dicData/${id}`, { data: params });
}
// 字典数据删除
export async function deleteDicData(id: any): Promise<any> {
  return request.delete(`/dicData/delete/${id}`);
}
// 字典数据列表
export async function getStandardDicData(params: any): Promise<any> {
  const newParams: any = {
    _page: params.current,
    _limit: params.pageSize,
    parentId: 0,
  };
  return request.get(`/dicData/standard/treeList`, { params: newParams });
}

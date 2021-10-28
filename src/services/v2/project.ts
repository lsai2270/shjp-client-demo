import request from '@/utils/request';

export async function create(data: any): Promise<any> {
  return request.post(`/project/create`, { data });
}
export async function updateProject(data: any): Promise<any> {
  return request.put(`/project/update/${data.id}`, { data: data.params });
}
export async function getList(params: any): Promise<any> {
  // console.log(params);
  const newParams: any = {
    _page: params.current,
    _limit: params.pageSize,
  };
  if (params.name) {
    newParams.name = params.name;
  }
  return request.get(`/project`, {
    params: newParams,
  });
}
export async function deleteProject(id: string): Promise<any> {
  return request.delete(`/project/delete/${id}`);
}
export async function batchDeleteProject(data: object): Promise<any> {
  return request.delete(`/project/batchDelete`, { data });
}
export async function getProjectById(id: string): Promise<any> {
  return request.get(`/project/${id}`);
}

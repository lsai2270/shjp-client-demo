import request from '@/utils/request';
// import axios from 'axios'

export async function create(data: any): Promise<any> {
  return request.post(`/forecast/create`, { data });
}

export async function getList(params: any): Promise<any> {
  // console.log(params);
  const newParams: any = {
    page: params.current,
    limit: params.pageSize,
  };
  if (params.name) {
    newParams.name = params.name;
  }
  if (params.projectName) {
    newParams.projectName = params.projectName;
  }
  if (params.projectId) {
    newParams.projectId = params.projectId;
  }
  if (params.fields) {
    newParams.fields = params.fields;
  }
  return request.get(`/forecast/list`, {
    params: newParams,
  });
}
export async function getNetById(id: string): Promise<any> {
  return request.get(`/forecast/getNetById/${id}`);
}
export async function getVisumToken(): Promise<any> {
  return request.get(`/forecast/getVisumToken`);
}
export async function updatePredictById(data: any): Promise<any> {
  return request.put(`/forecast/update/${data.id}`, { data: data.params });
}
export async function getDetailById(id: string): Promise<any> {
  return request.get(`/forecast/list/${id}`);
}
export async function deletePredict(id: string): Promise<any> {
  return request.delete(`/forecast/delete/${id}`);
}
export async function batchDeletePredict(data: object): Promise<any> {
  return request.delete(`/forecast/batchDelete`, { data });
}
export async function getFlowbundle(data: any): Promise<any> {
  // console.log(params);
  return request.post(`/forecast/flowbundle`, { data });
}
export async function getTreeList(params: any): Promise<any> {
  // console.log(params);
  return request.get(`/forecast/tree/list`, { params });
}
export async function tflowfuzzy(data: any): Promise<any> {
  // console.log(data);
  return request.post(`/forecast/tflowfuzzy`, { data });
  // return axios.post(`http://dev-api-visum-net-viewer.citybit.cn/api/procedure/tflowfuzzy`, data);
}
// 轮询
export async function procedureRes(id: any): Promise<any> {
  return request.get(`/forecast/procedureRes/${id}`);
  // return axios.post(`http://dev-api-visum-net-viewer.citybit.cn/api/procedure/tflowfuzzy`, data);
}

export async function prtassignment(data: any): Promise<any> {
  // console.log(data);
  return request.post(`/forecast/prtassignment`, {
    data,
  });
}

export async function createLink(data: any): Promise<any> {
  return request.post(`/link/create`, { data });
}
export async function getAllLinks(params: any): Promise<any> {
  return request.get(`/link/all/`, { params });
}
export async function createNode(data: any): Promise<any> {
  return request.post(`/node/create`, { data });
}
export async function createZone(data: any): Promise<any> {
  return request.post(`/zone/create`, { data });
}
export async function deleteZone(id: string): Promise<any> {
  return request.delete(`/zone/delete/${id}`);
}
export async function getAllZones(params: any): Promise<any> {
  return request.get(`/zone/all/`, { params });
}
export async function createConnector(data: any): Promise<any> {
  return request.post(`/connector/create`, { data });
}

import request from '@/utils/request';

export async function getTemplateById(id: string): Promise<any> {
  return request.get(`/template/${id}`);
}
export async function getTableData(params: any): Promise<any> {
  return request.post(`/table/generate`, { data: params });
}
export async function getTablebatchGenerateData(params: any): Promise<any> {
  return request.post(`/table/batchGenerate`, { data: params });
}

export async function calculateFormulaData(id: string, params: any): Promise<any> {
  return request.post(`/formula/calculate/${id}`, { data: params });
}
export async function paramsUpdateData(id: string, params: any): Promise<any> {
  return request.put(`/params/update/${id}`, { data: params });
}
export async function paramsUpdatePatchData(params: any): Promise<any> {
  return request.put(`/reportParams/updatePatch`, { data: params });
}
export async function initDbTypeParam(data: any): Promise<any> {
  return request.put(`/template/initDbTypeParam/601a0ff58fb73ed007fd20b6`, { data });
}
export async function reportTemplate(id: string): Promise<any> {
  return request.get(`/report/${id}`);
}
export async function reportGetList(params: any): Promise<any> {
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
  if (params.fields) {
    newParams.fields = params.fields;
  }
  return request.get(`/report/list`, {
    params: newParams,
  });
}
export async function reportGetGroupList(params: any): Promise<any> {
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
  if (params.unsetFields) {
    newParams.unsetFields = params.unsetFields;
  }
  return request.get(`/report/group`, {
    params: newParams,
  });
}
export async function createReport(params: any): Promise<any> {
  return request.post(`/report/create`, { data: params });
}
export async function reportInitDbTypeParam(id: string, params: any): Promise<any> {
  return request.put(`/report/initDbTypeParam/${id}`, { data: params });
}
export async function reportUpdateParam(id: string, params: any): Promise<any> {
  return request.put(`/report/update/${id}`, { data: params });
}
// 暂存草稿
export async function reportDraft(params: any): Promise<any> {
  return request.post(`/report/draft`, { data: params });
}
// 保存正文
export async function reportSubmit(params: any): Promise<any> {
  return request.post(`/report/submit`, { data: params });
}
// 刷新
export async function reportParamsUpdate(params: any): Promise<any> {
  return request.put(`/reportParams/updatePatch`, { data: params });
}
// 多人协作
// 创建
export async function userSectionCreate(params: any): Promise<any> {
  return request.post(`/userSection/create`, { data: params });
}
// 列表
export async function userSectionList(params: any): Promise<any> {
  return request.get(`/userSection/list`, { params });
}
// 列表
export async function userSectionListAll(params: any): Promise<any> {
  return request.get(`/userSection/all`, { params });
}
// 更新
export async function userSectionUpdate(id: string, params: any): Promise<any> {
  return request.put(`/userSection/update/${id}`, { data: params });
}
// 刷新
export async function reportRefresh(id: string): Promise<any> {
  return request.post(`/report/refresh/${id}`);
}
// 删除
export async function reportDelete(id: string): Promise<any> {
  return request.delete(`/report/delete/${id}`);
}
// 获取最新草稿
export async function reportGetLatest(params: any): Promise<any> {
  return request.get(`/report/user/getLatest`, { params });
}
// 日志
export async function userLogList(params: any): Promise<any> {
  return request.get(`/userLog/list`, {
    params,
  });
}

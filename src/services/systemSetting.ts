import request from '@/utils/request';
// 参数列表
export async function paramsGetList(params: any): Promise<any> {
  console.log(params);
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
  if (params.type) {
    newParams.type = params.type;
  }
  return request.get(`/params/list`, {
    params: newParams,
  });
}
// 参数创建
export async function createParams(params: any): Promise<any> {
  return request.post(`/params/create`, { data: params });
}
// 参数删除
export async function deleteParams(id: any): Promise<any> {
  return request.delete(`/params/delete/${id}`);
}
// 参数更新
export async function updateParams(id: any, params: any): Promise<any> {
  return request.put(`/params/update/${id}`, { data: params });
}
// 公式列表
export async function formulaGetList(params: any): Promise<any> {
  // console.log(params);
  const newParams: any = {
    page: params.current,
    limit: params.pageSize,
  };
  if (params.name) {
    newParams.name = params.name;
  }
  if (params.belongName) {
    newParams.belong = params.belongName;
  }
  return request.get(`/formula/list`, {
    params: newParams,
  });
}
// 公式创建
export async function createFormula(params: any): Promise<any> {
  return request.post(`/formula/create`, { data: params });
}
// 公式删除
export async function deleteFormula(id: string): Promise<any> {
  return request.delete(`/formula/delete/${id}`);
}
// 公式更新
export async function updateFormula(params: any, id: string): Promise<any> {
  return request.put(`/formula/${id}`, { data: params });
}
// id获取公式
export async function getFormulaById(id: string): Promise<any> {
  return request.get(`/formula/${id}`);
}

// 模版列表
export async function templateList(params: any): Promise<any> {
  // console.log(params);
  let newParams: any = {
    page: params.current,
    limit: params.pageSize,
  };
  if (params.name) {
    newParams.name = params.name;
  }
  if (params.code) {
    newParams.code = params.code;
  }
  if (params.sectionInfoType) {
    newParams = {
      ...newParams,
      sectionInfoType: params.sectionInfoType,
      sectionInfoValue: params.sectionInfoValue,
      _id: params.id,
    };
  }
  return request.get(`/template/list`, {
    params: newParams,
  });
}
// 获取删除内容
export async function deleteTemplate(id: string): Promise<any> {
  return request.delete(`/template/delete/${id}`);
}
// 获取模版内容
export async function getTemplate(id: string): Promise<any> {
  return request.get(`/template/${id}`);
}
// 模版创建
export async function createTemplate(params: any): Promise<any> {
  return request.post(`/template/create`, { data: params });
}
// 模版更新
export async function updateTemplate(id: string, params: any): Promise<any> {
  return request.put(`/template/update/${id}`, { data: params });
}
// 章节创建
export async function createSection(params: any): Promise<any> {
  return request.post(`/section/create`, { data: params });
}
// 删除章节
export async function deleteSection(id: any): Promise<any> {
  return request.delete(`/section/delete/${id}`);
}
// 更新章节
export async function updateSection(id: any, params: any): Promise<any> {
  return request.put(`/section/update/${id}`, { data: params });
}
// 批量更新
export async function updatePatchSection(params: any): Promise<any> {
  return request.put(`/section/updatePatch`, { data: params });
}

// 字典列表
export async function dicTypeList(params: any): Promise<any> {
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
  return request.get(`/dicType/list`, {
    params: newParams,
  });
}
// 创建字典
export async function dicTypeCreate(params: any): Promise<any> {
  return request.post(`/dicType/create`, { data: params });
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
// 表单列表
export async function TableList(params: any): Promise<any> {
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
  return request.get(`/table/list`, {
    params: newParams,
  });
}
// 循环文本列表
export async function cycleTextList(params: any): Promise<any> {
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
  return request.get(`/cycleText/list`, {
    params: newParams,
  });
}
// 循环文本列表删除
export async function deleteCycleTextList(id: any): Promise<any> {
  return request.delete(`/cycleText/delete/${id}`);
}
// 循环文本查询
export async function getCycleTextById(id: any): Promise<any> {
  return request.get(`/cycleText/${id}`);
}
// 循环文本查询
export async function createCycleTextData(params: any): Promise<any> {
  return request.post(`/cycleText/create`, { data: params });
}
// 循环文本更新
export async function updateCycleTextData(id: any, params: any): Promise<any> {
  return request.put(`/cycleText/${id}`, { data: params });
}

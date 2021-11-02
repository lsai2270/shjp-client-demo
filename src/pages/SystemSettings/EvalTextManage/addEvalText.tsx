import React, { useState, useRef, useEffect } from 'react';
import { history, connect, Dispatch } from 'umi';
import lodash from 'lodash';
import htmlFormat from 'html-formatter';
import {
  Button,
  message,
  Modal,
  Row,
  Col,
  Form,
  Input,
  Select,
  Space,
  Cascader,
  Radio,
} from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;
import E from 'wangeditor';
import $ from 'jquery';
import ScrollSelect from '@/components/ScrollSelect';
import {
  templateList,
  getCycleTextById,
  createCycleTextData,
  getTemplate,
  updateCycleTextData,
  TableList,
} from '@/services/systemSetting';
import { ParamsComp } from '@/pages/SystemSettings/ParamsManage';
import { getTreeData, hanldeOnResolveHtml } from '@/tools';
import styles from './index.less';
export default (props: any) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  let editor: any;
  const { id } = history.location.query;
  const operatorArr = ['<', '>', '>=', '<=', '==', '!='];
  const [params, setParams] = useState<any[]>([{}]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formulaIndex, setFormulaIndex] = useState<any>(null);
  const [selected, setSelected] = useState<any>(undefined);
  const [flag, setFlag] = useState(false);
  const [editorObj, setEditorObj] = useState<any>(undefined); //editor实例
  const [templateData, setTemplateData] = useState<any[]>([]);
  const [sectionData, setSectionData] = useState<any[]>([]);
  const [selectedSectionData, setSelectedSectionData] = useState<any[]>([]);
  const [selectedParamsArr, setSelectedParamsArr] = useState<any[]>([]);
  const [selectedParamData, setSelectedParamData] = useState<any>(undefined);
  const [radioValue, setRadioValue] = useState<any>(undefined);
  const [conditions, setConditions] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<any>(true);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    pageSize: 10,
  });
  const [tableLists, setTableLists] = useState<any>([]);
  const [selectedTable, setSelectedTable] = useState<any>(undefined);
  const [tableInfo, setTableInfo] = useState<any>([]);
  const [codeFlag, setCodeFlag] = useState<boolean>(false);

  useEffect(() => {
    editor = new E('#editorContainer');
    editor.config.zIndex = 1;
    // editor.config.menus = [''];
    editor.txt.eventHooks.enterUpEvents.push(() => {
      editor.cmd.do(
        'insertHTML',
        `<p><br></p>
        `,
      );
    });
    editor.create();
    setEditorObj(editor);
    if (id) {
      getCycleTextById(id).then((res) => {
        // console.log(res);
        if (res.code == 200) {
          const newParams = res.data.params.map((item: any, index: number) => {
            delete item._id;
            return {
              paramsType: item.type,
              type: item.paramsType,
              name: item.paramsName,
              params: item.params,
              paramsId: item.paramsId,
            };
          });
          const filters = res.data.filter.map((item: any, index: number) => {
            delete item._id;
            return {
              params: item.params,
              operator: item.operator,
              value: item.value,
            };
          });
          hanldeOnTemplateChange({
            value: res.data.templateId,
            label: res.data.template,
          });
          editor.txt.append(res.data.htmlContent);
          if (res.data?.tableInfo?.length > 0) {
            setTableInfo(res.data.tableInfo);
          }
          form.setFieldsValue({
            name: res.data.name,
            params: newParams,
            // template: {
            //   value: res.data.templateId,
            //   label: res.data.template,
            // },
            content: res.data.htmlContent,
            section: res.data.sectionId.split(','),
          });
          setSelectedSectionData([{ name: res.data.section, _id: res.data.sectionId }]);
          setParams(newParams);
          setConditions(filters);
        }
      });
    }
    hanldeOnGetTableList(pagination);
  }, []);
  useEffect(() => {
    if (params) {
      let newArr = params.filter((item: any) => item.paramsType == '1');
      setSelectedParamsArr(newArr);
    }
  }, [params]);
  /**
   * @name: 新增参数
   */
  const handleOnAddParams = () => {
    setParams([...params, { alis: '' }]);
  };
  /**
   * @name: 删除参数
   * @param {number} index
   */
  const handleOnRemoveParams = (index: number) => {
    let newParams = params.concat([]);
    newParams.splice(index, 1);
    setParams(newParams);
  };
  /** 确认弹窗
   * @name:
   */
  const handleOk = () => {
    setIsModalVisible(false);
    setFlag(false);
    let newParams = params.concat([]);
    // console.log('newParams', newParams);
    let obj = {
      ...newParams[formulaIndex],
      ...selected,
      name: selected.name,
      params: selected.code,
      paramsId: selected._id,
    };
    // if (selected.type == 5) {
    //   obj['isPrefix'] = '1';
    // } else {
    //   obj['isPrefix'] = '0';
    // }
    newParams.splice(formulaIndex, 1, obj);
    setParams(newParams);
    // console.log('newParams', newParams);
    form.setFieldsValue({
      params: newParams,
    });
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setIsModalVisible(false);
    setFlag(false);
  };
  /**
   * @name: 公式选择参数
   */
  const handleOnSelectParams = (index: number) => {
    setTimeout(() => {
      setFlag(true);
    }, 100);
    setIsModalVisible(true);
    setFormulaIndex(index);
  };
  /**
   * @name: 选择参数
   */
  const handleOnSetParams = (paramsData: any) => {
    // console.log('paramsData', paramsData);
    setSelected(paramsData);
  };
  /**
   * @name: 参数设置Value
   */
  const hanldeOnParamsForm = (value: any, index: number, key: string) => {
    let newParams = params.concat([]);
    newParams.splice(index, 1, {
      ...newParams[index],
      [key]: value,
    });
    setParams(newParams);
    form.setFieldsValue({
      params: newParams,
    });
  };
  // 提交
  const handleOnSubmit = async () => {
    const formData = await validateFields();
    // console.log('formData', formData);
    let paramsInfo = {
      name: formData.name,
      template: formData.template.label,
      templateId: formData.template.value,
      section: selectedSectionData.pop().name,
      sectionId: formData.section.toString(),
      params: params.map((item: any, index: number) => {
        return {
          type: item.paramsType,
          params: item.params,
          paramsName: item.name,
          paramsId: item.paramsId,
          paramsType: item.type,
        };
      }),
      tableInfo: lodash.uniq(tableInfo),
      filter: conditions,
      content: hanldeOnResolveHtml(editorObj.txt.html()),
      htmlContent: editorObj.txt.html(),
    };
    console.log(paramsInfo);
    if (id) {
      updateCycleTextData(id, paramsInfo)
        .then((res) => {
          // console.log(res);
          if (res.code == 200) {
            message.success('更新成功!');
            history.push('/systemSettings/evalTextManage');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error('更新接口出错!');
        });
    } else {
      createCycleTextData(paramsInfo)
        .then((res) => {
          // console.log(res);
          if (res.code == 200) {
            form.resetFields(['name', 'template', 'section', 'params']);
            editorObj.txt.html('');
            setParams([]);
            setTableInfo([]);
            setSectionData([]);
            setSelectedParamsArr([]);
            message.success('创建成功!');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error(new Error(err));
        });
    }
  };
  // 获取Project
  const handleOnGetTemplateData = async (params: any) => {
    const res = await templateList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setTemplateData([...templateData, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('获取模版接口出错!');
    }
    return res.data;
  };
  //选择项目
  const hanldeOnTemplateChange = (data: any) => {
    // console.log(data);
    getTemplate(data.value).then((res) => {
      // console.log(res);
      if (res.code == 200) {
        setSectionData(getTreeData(res.data.sectionInfo, '', 'allData'));
      }
    });
    form.setFieldsValue({
      template: data,
    });
  };
  // 选择参数
  const handleSelectedParamsChange = (value: any) => {
    // console.log(value);
    let currentParam = params.filter((item) => item.paramsId == value)[0];
    // console.log(currentParam);
    setSelectedParamData(currentParam);
  };
  // 文本框模版添加
  const handleOnAddSelectedParams = () => {
    if (!selectedParamData) {
      message.warning('请选择参数!');
      return;
    }
    if (!radioValue) {
      message.warning('请选择参数形式!');
      return;
    }
    if (radioValue == 4) {
      if (!selectedTable) {
        message.warning('请选择表格数据!');
        return;
      }
    }
    if (selectedParamData) {
      if (radioValue == '1') {
        editorObj.cmd.do(
          'insertHTML',
          `<input  class="ant-input" style='width:120px'  placeholder=${selectedParamData.name}  name=${selectedParamData.paramsId}_1_2 contentsdata={contentsdata}  handleonsetinput={handleonsetinput} />`,
        );
      } else if (radioValue == '2') {
        if (selectedParamData.dicData) {
          editorObj.cmd.do(
            'insertHTML',
            `<select placeholder="请选择" style="width: 160px" name=${selectedParamData.paramsId} ></select>`,
          );
        } else {
          editorObj.cmd.do(
            'insertHTML',
            `<input  class="ant-input" style='width:120px'  placeholder=${selectedParamData.name}  name=${selectedParamData.paramsId}_1 contentsdata={contentsdata}  handleonsetinput={handleonsetinput} />`,
          );
        }
      } else if (radioValue == '3') {
        editorObj.cmd.do(
          'insertHTML',
          `<div class="imgContainer ${selectedParamData.paramsId} show">
            <div class="imgCompFlex" style="display: flex;">
              <div class="imgInfo">
                <div id=${selectedParamData.paramsId} class="ant-image" style="width: 200px; height: 200px;">
                  <img class="ant-image-img" src="/error.png" style="height: 200px;">
                </div>
              </div>
            </div>
          </div><br>
          <p><br></p>
          `,
        );
      }
      if (radioValue == '4') {
        let thArr = ``;
        selectedTable.header.forEach((item: any) => {
          thArr += `<th class="ant-table-cell">${item.name}</th>`;
        });
        editorObj.cmd.do(
          'insertHTML',
          `<div class="tableContainer ${selectedTable._id}" style='display:flex'>
          <div class="ant-table ant-table-empty">
          <div class="ant-table-container">
          <div class="ant-table-content">
          <table style="table-layout: auto;">
          <colgroup></colgroup>
          <thead class="ant-table-thead">
            <tr>
            ${thArr}
            </tr>
          </thead>
          <tbody class="ant-table-tbody">
          <tr class="ant-table-placeholder">
          <td colspan=${selectedTable?.header?.length} class="ant-table-cell">
          <div class="ant-empty ant-empty-normal"><div class="ant-empty-image"><svg class="ant-empty-img-simple" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1)" fill="none" fill-rule="evenodd"><ellipse class="ant-empty-img-simple-ellipse" cx="32" cy="33" rx="32" ry="7"></ellipse><g class="ant-empty-img-simple-g" fill-rule="nonzero"><path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path><path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" class="ant-empty-img-simple-path"></path></g></g></svg></div><div class="ant-empty-description">暂无数据</div></div>
          </td></tr></tbody></table></div></div></div>
          </div><br>
          <p><br></p>
          `,
        );
        setTableInfo(lodash.uniq([...tableInfo, selectedTable._id]));
      }
      setRadioValue(undefined);
      setSelectedTable(undefined);
      // setConditions([]);
      // setSelectedParamData(undefined);
      form.setFieldsValue({
        content: editorObj.txt.html(),
      });
    }
  };
  const handleOnRadioChange = (value: any) => {
    setRadioValue(value);
    if (value != 4) {
      setSelectedTable(undefined);
    }
  };
  /**
   * @name: 新增条件
   */
  const handleOnAddConditions = () => {
    let newConditionParams = params.filter((item) => item.type == '1');
    setConditions([...conditions, {}]);
  };
  /**
   * @name: 删除参数
   * @param {number} index
   */
  const handleOnRemoveConditions = (index: number) => {
    let newConditions = conditions.concat([]);
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };
  /**
   * @name: 条件设置Value
   */
  const hanldeOnConditionForm = (value: any, index: number, key: string) => {
    let newConditions = conditions.concat([]);
    if (key == 'operator') {
      newConditions.splice(index, 1, {
        ...newConditions[index],
        [key]: operatorArr[value],
      });
    } else {
      newConditions.splice(index, 1, {
        ...newConditions[index],
        [key]: value,
      });
    }
    setConditions(newConditions);
    form.setFieldsValue({
      condition: newConditions,
    });
  };
  const handleOnScrollOptions = (e: any) => {
    const { clientHeight, scrollHeight, scrollTop } = e.target;
    if (loadingStatus) {
      if (scrollHeight < clientHeight + scrollTop + 15) {
        const params = { ...pagination, current: pagination.current + 1 };
        hanldeOnGetTableList(params);
        setLoadingStatus(false);
      }
    }
  };
  const hanldeOnGetTableList = async (params: any) => {
    const res = await TableList(params);
    console.log(res);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setTableLists([...tableLists, ...res.data.data]);
          setPagination(params);
          setLoadingStatus(true);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const hanldeOnSelectedTable = (value: any, option: any) => {
    // console.log(value,'--->',option);
    setSelectedTable(option['data-item']);
  };
  const handleOnBack = () => {
    history.push('/systemSettings/evalTextManage');
  };
  const handleOnShowCode = () => {
    if (codeFlag) {
      let text = $('.w-e-text').text();
      editorObj.txt.html(text);
      setCodeFlag(false);
    } else {
      const html: any = editorObj.txt.html();
      let result = htmlFormat.render(html);
      const str = `<pre><script type='text/html' style='display:block'>${result}</script></pre>`;
      editorObj.txt.text(str);
      setCodeFlag(true);
    }
  };
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <Row className={styles.addFormula}>
          <Col span={24}>
            <Modal
              className={styles.paramsModal}
              title="选择参数"
              width={'60%'}
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              {flag && <ParamsComp handleOnSetParams={handleOnSetParams} />}
            </Modal>
            <Form
              form={form}
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 20 }}
              initialValues={{ keyType: '0' }}
            >
              <Form.Item
                label="名称"
                name="name"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '请输入名称!' }]}
              >
                <Input placeholder="请输入名称!" />
              </Form.Item>
              <Form.Item
                label="关联模版"
                name="template"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '请选择模版!' }]}
              >
                <ScrollSelect
                  handleOnGetData={handleOnGetTemplateData}
                  hanldeOnChange={hanldeOnTemplateChange}
                  // optionData={projectLists}
                  placeholder="请选择模版"
                />
              </Form.Item>
              <Form.Item
                label="关联目录"
                name="section"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '请选择目录!' }]}
              >
                <Cascader
                  fieldNames={{ label: 'name', value: '_id' }}
                  changeOnSelect
                  options={sectionData}
                  onChange={(value, selectedOptions: any) => {
                    setSelectedSectionData(selectedOptions);
                  }}
                  placeholder="请选择"
                />
              </Form.Item>
              <Form.Item
                label="新增参数"
                name="params"
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    参数类型
                  </span>
                  <span className={styles.formulaHead} style={{ width: '320px' }}>
                    参数
                  </span>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    参数code
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    操作
                  </span>
                </div>
                {params.map((item: any, index) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <Select
                        placeholder="请选择!"
                        style={{ width: '200px' }}
                        value={item.paramsType}
                        onChange={(value) => hanldeOnParamsForm(value, index, 'paramsType')}
                      >
                        <Option value="1">形式参数</Option>
                        <Option value="2">条件参数</Option>
                      </Select>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '320px' }}
                        onClick={() => handleOnSelectParams(index)}
                      >
                        {item.name || '请选择参数'}
                      </span>
                      <span className={`${styles.formulaHead}`} style={{ width: '200px' }}>
                        {item.params || '-'}
                      </span>
                      <span className={styles.iconContain}>
                        <MinusCircleOutlined
                          className={styles.removeIcon}
                          onClick={() => handleOnRemoveParams(index)}
                        />
                      </span>
                    </div>
                  );
                })}
                <div>
                  <Button style={{ width: '800px' }} onClick={handleOnAddParams}>
                    添加
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                label="选择参数"
                name="selectedParams"
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <Space>
                  <Select
                    placeholder="请选择"
                    style={{ width: '300px' }}
                    onChange={handleSelectedParamsChange}
                  >
                    {selectedParamsArr.map((item, index) => {
                      return (
                        <Option key={index} value={item.paramsId}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                  <Select
                    placeholder="请选择参数形式"
                    style={{ width: '300px' }}
                    value={radioValue}
                    onChange={handleOnRadioChange}
                  >
                    <Option value="1">输入框</Option>
                    <Option value="2">下拉框</Option>
                    <Option value="3">图片</Option>
                    <Option value="4">表格</Option>
                  </Select>
                  {radioValue == 4 && (
                    <Select
                      placeholder="请选择"
                      style={{ width: '300px' }}
                      onPopupScroll={handleOnScrollOptions}
                      value={selectedTable?._id}
                      onChange={hanldeOnSelectedTable}
                    >
                      {tableLists.map((item: any, index: number) => {
                        return (
                          <Option key={index} data-item={item} value={item._id}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                  <Button type="primary" onClick={handleOnAddSelectedParams}>
                    添加
                  </Button>
                </Space>
              </Form.Item>
              {/* <Row style={{ marginBottom: '10px' }}>
                <Col offset={2}>
                  <Radio.Group onChange={handleOnRadioChange} value={radioValue}>
                    <Space direction="vertical">
                      <Radio value={1}>参数以“输入框”形式添加</Radio>
                      <Radio value={2}>参数以“下拉框”形式添加</Radio>
                      <Radio value={3}>参数以“图片”形式添加</Radio>
                    </Space>
                  </Radio.Group>
                </Col>
              </Row> */}
              <Form.Item
                label="文本框模版"
                name="content"
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <div style={{ width: '800px', position: 'relative' }}>
                  <div className={styles.tools_code}>
                    <Button type="primary" onClick={handleOnShowCode}>
                      {codeFlag ? '预览' : '源码'}
                    </Button>
                  </div>
                  <div id="editorContainer" style={{ width: '800px' }}></div>
                </div>
              </Form.Item>
              <Form.Item
                label="结果过滤"
                name="condition"
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    条件#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '250px' }}>
                    参数
                  </span>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    关系运算符
                  </span>
                  <span className={styles.formulaHead} style={{ width: '230px' }}>
                    对应值
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    操作
                  </span>
                </div>
                {conditions.map((item, index) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '120px' }}
                      >
                        {index + 1}
                      </span>
                      <Input
                        style={{ width: '250px' }}
                        placeholder="请输入!"
                        value={item.params}
                        onChange={(e) => hanldeOnConditionForm(e.target.value, index, 'params')}
                      />
                      <Select
                        placeholder="请选择!"
                        style={{ width: '120px' }}
                        value={item.operator}
                        onChange={(value) => hanldeOnConditionForm(value, index, 'operator')}
                      >
                        <Option value="0">{`<`}</Option>
                        <Option value="1">{`>`}</Option>
                        <Option value="2">{`>=`}</Option>
                        <Option value="3">{`<=`}</Option>
                        <Option value="4">{`==`}</Option>
                        <Option value="5">{`!=`}</Option>
                      </Select>
                      <Input
                        style={{ width: '230px' }}
                        placeholder="请输入!"
                        value={item.value}
                        onChange={(e) => hanldeOnConditionForm(e.target.value, index, 'value')}
                      />
                      <span className={styles.iconContain}>
                        <MinusCircleOutlined
                          className={styles.removeIcon}
                          onClick={() => handleOnRemoveConditions(index)}
                        />
                      </span>
                    </div>
                  );
                })}
                <div>
                  <Button style={{ width: '800px' }} onClick={handleOnAddConditions}>
                    添加
                  </Button>
                </div>
              </Form.Item>
            </Form>
            <Row>
              <Col span={22} offset={2}>
                <Space>
                  <Button onClick={handleOnBack}>取消</Button>
                  <Button type="primary" onClick={handleOnSubmit}>
                    提交
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

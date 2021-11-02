import React, { useState, useRef, useEffect } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Form, Input, Select, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;
import TypeCascader from '../components/TypeCascader';
import {
  createFormula,
  dicTypeCreate,
  updateFormula,
  getFormulaById,
} from '@/services/systemSetting';
import { ParamsComp } from '@/pages/SystemSettings/ParamsManage';
import styles from './index.less';
export default (props: any) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { id } = history.location.query;
  const operatorArr = ['<', '>', '>=', '<=', '==', '!='];
  const [params, setParams] = useState<any[]>([{ alis: '' }]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([{ situation: '1', condition: [], operator: '' }]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formulaIndex, setFormulaIndex] = useState<any>(null);
  const [selected, setSelected] = useState<any>(undefined);
  const [conditionParams, setConditionParams] = useState<any>([]);
  const [formulas, setFormulas] = useState<any[]>([{ situation: '1', value: '', text: '' }]);
  const [flag, setFlag] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [typeCascaderValue, setTypeCascaderValue] = useState<any[]>([]);
  useEffect(() => {
    if (id) {
      getFormulaById(id).then((res) => {
        console.log(res);
        if (res.code == 200) {
          const newParams = res.data.params.map((item: any, index: number) => {
            delete item._id;
            return {
              ...item,
              isPrefix: item.isPrefix + '',
            };
          });
          const newCondition = res.data.condition.map((item: any, index: number) => {
            delete item._id;
            return item;
          });
          const newConditionParams = newParams.filter((item: any) => item.type == '2');
          const newResult = res.data.result.map((item: any, index: number) => {
            delete item._id;
            return item;
          });
          const newFormula = res.data.formula.map((item: any, index: number) => {
            delete item._id;
            return item;
          });
          form.setFieldsValue({
            name: res.data.name,
            belongId: {
              label: res.data.belongName,
              value: res.data.belongId,
            },
            params: newParams,
            condition: newCondition,
            result: newResult,
            formula: newFormula,
            note: res.data.note,
          });

          setParams(newParams);
          setConditions(newCondition);
          setResults(newResult);
          setFormulas(newFormula);
          setConditionParams(newConditionParams);
          setTypeCascaderValue(res.data.belongId.split(','));
        }
      });
    }
  }, []);
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
  /**
   * @name: 新增条件
   */
  const handleOnAddConditions = () => {
    let newConditionParams = params.filter((item) => item.type == '2');
    setConditionParams(newConditionParams);
    setConditions([...conditions, { seq: conditions.length + 1 + '' }]);
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
   * @name: 新增结果
   */
  const handleOnAddResults = () => {
    setResults([
      ...results,
      {
        situation: results.length + 1 + '',
        condition: [],
        operator: '',
      },
    ]);
    setFormulas([
      ...formulas,
      {
        situation: '',
        value: '',
        text: '',
      },
    ]);
  };
  /**
   * @name: 删除结果
   * @param {number} index
   */
  const handleOnRemoveResults = (index: number) => {
    let newResults = results.concat([]);
    newResults.splice(index, 1);
    setResults(newResults);
    let newFormulas = formulas.concat([]);
    newFormulas.splice(index, 1);
    setFormulas(newFormulas);
  };
  /** 确认弹窗
   * @name:
   */
  const handleOk = () => {
    setIsModalVisible(false);
    setFlag(false);
    let newParams = params.concat([]);
    let obj = {
      ...newParams[formulaIndex],
      name: selected.name,
      params: selected.code,
      paramsId: selected._id,
    };
    if (selected.type == 5 || selected.type == 6) {
      obj['isPrefix'] = '1';
    } else {
      obj['isPrefix'] = '0';
    }
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
  /**
   * @name: 条件设置Value
   */
  const hanldeOnConditionForm = (value: any, index: number, key: string) => {
    let newConditions = conditions.concat([]);
    if (key == 'params') {
      let filterConditionParams = conditionParams.filter((item: any) => item.paramsId == value);
      newConditions.splice(index, 1, {
        ...newConditions[index],
        paramsId: filterConditionParams[0]?.paramsId,
        params: filterConditionParams[0]?.params,
        paramsName: filterConditionParams[0]?.name,
      });
    } else if (key == 'operator') {
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
  /**
   * @name: 结果设置Value
   */
  const hanldeOnResultForm = (value: any, index: number, key: string) => {
    let newResults = results.concat([]);
    if (key == 'condition') {
      newResults.splice(index, 1, {
        ...newResults[index],
        [key]: value.map((item: any) => {
          let filterConditionParams = conditions.filter((condition: any) => condition.seq == item);
          console.log('filterConditionParams', filterConditionParams);
          return {
            name: `条件${filterConditionParams[0].seq}`,
            index: filterConditionParams[0].seq,
          };
        }),
      });
    } else if (key == 'operator') {
      newResults.splice(index, 1, {
        ...newResults[index],
        [key]: value == '0' ? '&&' : '||',
      });
    } else {
      newResults.splice(index, 1, {
        ...newResults[index],
        [key]: value,
      });
    }
    setResults(newResults);
    form.setFieldsValue({
      result: newResults,
    });
  };
  // 公式获取
  const handleOnGetFormulaInfo = () => {
    if (results.length > 0) {
      let num = 0;
      results.forEach((item: any) => {
        if (Boolean(item.value)) {
          num++;
        }
      });
      if (num != results.length) {
        message.warning('请先填完善结果中的表达式后进行操作');
        return;
      }
    }
    const newFormulas = formulas.map((item: any, index: number) => {
      console.log('results[index]', results[index]);
      let str = results[index]?.value + '';
      let resultName = '';
      params.forEach((item: any) => {
        if (item.type == 3) {
          resultName = item.name;
        }
        if (item.type == 1) {
          str = str.replace(eval(`/${item.alis}/g`), item.name);
        }
      });
      let combinationText = ``;
      if (results[index]?.condition) {
        results[index].condition.forEach((item1: any, index1: number) => {
          let filterConditions = conditions.filter((item2) => item2.seq == item1.index);
          if (index1 > 0) {
            combinationText += `${results[index].operator}`;
          }
          combinationText += `${filterConditions[0].paramsName} ${filterConditions[0].operator} ${filterConditions[0].value}`;
        });
        item.combination = combinationText;
      }
      item.situation = results[index]?.situation;
      item.value = results[index]?.value;
      item.text = `${resultName} = ${str}`;
      return item;
    });
    setFormulas(newFormulas);
    form.setFieldsValue({
      formula: newFormulas,
    });
  };
  // 提交
  const handleOnSubmit = async () => {
    const formData = await validateFields();
    let params = {
      ...formData,
      belongId: formData.belongId.value,
      belongName: formData.belongId.label,
      condition: conditions,
      note: formData.note || '',
    };
    if (id) {
      updateFormula(params, id)
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            message.success('公式更新成功!');
            history.push('/systemSettings/formulaManage');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error('公式更新接口出错!');
        });
    } else {
      createFormula(params)
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            message.success('公式创建成功!');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error(new Error(err));
        });
    }
  };
  /**
   * @name: 添加分类
   */
  const handleOnAddCategory = () => {
    if (!categoryName) {
      message.warning('请填写类型名称!');
      return;
    }
    if (!categoryCode) {
      message.warning('请填写类型Code!');
      return;
    }
    dicTypeCreate({
      name: categoryName,
      code: categoryCode,
    }).then((res) => {
      console.log(res);
      if (res.code == 200) {
        message.success('新建分类成功');
        setCategoryVisible(true);
      }
    });
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
                label="公式名称"
                name="name"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '请输入公式名称!' }]}
              >
                <Input placeholder="请输入参数名称!" />
              </Form.Item>
              <Form.Item
                label="所属类型"
                name="belongId"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                {categoryVisible && (
                  <div style={{ display: 'flex' }}>
                    <TypeCascader
                      value={typeCascaderValue}
                      onChange={(value: any, selectedOptions: any) => {
                        setTypeCascaderValue(value);
                        form.setFieldsValue({
                          belongId: {
                            label: selectedOptions[selectedOptions.length - 1]?.title,
                            value: value.toString(),
                          },
                        });
                      }}
                    />
                    <Button
                      onClick={() => {
                        setCategoryVisible(false);
                      }}
                    >
                      新建分类
                    </Button>
                  </div>
                )}
                {!categoryVisible && (
                  <div style={{ display: 'flex' }}>
                    <Space>
                      <Input
                        placeholder="请输入类型名称!"
                        value={categoryName}
                        onChange={(e) => {
                          setCategoryName(e.target.value);
                        }}
                      />
                      <Input
                        placeholder="请输入类型Code!"
                        value={categoryCode}
                        onChange={(e) => {
                          setCategoryCode(e.target.value);
                        }}
                      />
                      <a
                        onClick={() => {
                          setCategoryVisible(true);
                        }}
                      >
                        取消
                      </a>
                      <a onClick={handleOnAddCategory}>保存</a>
                    </Space>
                  </div>
                )}
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
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    参数别名
                  </span>
                  <span className={styles.formulaHead} style={{ width: '320px' }}>
                    参数
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
                        value={item.type}
                        onChange={(value) => hanldeOnParamsForm(value, index, 'type')}
                      >
                        <Option value="1">形式参数</Option>
                        <Option value="2">条件参数</Option>
                        <Option value="3">结果参数</Option>
                      </Select>
                      <Input
                        style={{ width: '200px' }}
                        placeholder="请输入别名!"
                        value={item.alis}
                        onChange={(e) => hanldeOnParamsForm(e.target.value, index, 'alis')}
                      />
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '320px' }}
                        onClick={() => handleOnSelectParams(index)}
                      >
                        {item.params || '请选择参数'}
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
                label="新增条件"
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
                        {item.seq}
                      </span>
                      <Select
                        placeholder="请选择!"
                        style={{ width: '250px' }}
                        value={item.paramsId}
                        onChange={(value) => hanldeOnConditionForm(value, index, 'params')}
                      >
                        {conditionParams.map((item: any, index: number) => {
                          return (
                            <Option key={index} value={item.paramsId}>
                              {item.name}
                            </Option>
                          );
                        })}
                      </Select>
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
              <Form.Item
                label="结果"
                name="result"
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    情形#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '250px' }}>
                    满足条件
                  </span>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    逻辑运算符
                  </span>
                  <span className={styles.formulaHead} style={{ width: '230px' }}>
                    表达式或值
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    操作
                  </span>
                </div>
                {results.map((item, index) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '120px' }}
                      >
                        {index + 1}
                      </span>
                      <Select
                        placeholder="请选择!"
                        style={{ width: '250px' }}
                        mode="multiple"
                        value={item.condition.map((item: any) => item.index)}
                        onChange={(value) => {
                          console.log(value);
                          hanldeOnResultForm(value, index, 'condition');
                        }}
                      >
                        {conditions.map((item: any, index: number) => {
                          return <Option key={index} value={item.seq}>{`条件${item.seq}`}</Option>;
                        })}
                      </Select>
                      <Select
                        placeholder="请选择!"
                        style={{ width: '120px' }}
                        value={item.operator ? item.operator : undefined}
                        onChange={(value) => hanldeOnResultForm(value, index, 'operator')}
                      >
                        <Option value="0">{`&&`}</Option>
                        <Option value="1">{`||`}</Option>
                      </Select>
                      <Input
                        style={{ width: '230px' }}
                        placeholder="请输入!"
                        value={item.value}
                        onChange={(e) => hanldeOnResultForm(e.target.value, index, 'value')}
                      />
                      <span className={styles.iconContain}>
                        <MinusCircleOutlined
                          className={styles.removeIcon}
                          onClick={() => handleOnRemoveResults(index)}
                        />
                      </span>
                    </div>
                  );
                })}
                <div>
                  <Button style={{ width: '800px' }} onClick={handleOnAddResults}>
                    添加
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                label="公式"
                name="formula"
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    情形#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '230px' }}>
                    条件组合
                  </span>
                  <span className={styles.formulaHead} style={{ width: '300px' }}>
                    逻辑公式
                  </span>
                  <span className={styles.formulaHead} style={{ width: '380px' }}>
                    文字公式
                  </span>
                  <span
                    className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                    style={{ width: '60px' }}
                    onClick={handleOnGetFormulaInfo}
                  >
                    获取
                  </span>
                </div>
                {formulas.map((item: any, index: number) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '120px' }}
                      >
                        {item.situation || index + 1}
                      </span>
                      <span className={`${styles.formulaHead}`} style={{ width: '230px' }}>
                        {item.combination || '请获取'}
                      </span>
                      {/* <Input style={{ width: '300px' }} placeholder="请输入" />
                      <Input style={{ width: '380px' }} placeholder="请输入" /> */}
                      <span className={`${styles.formulaHead}`} style={{ width: '300px' }}>
                        {item.value || '请获取'}
                      </span>
                      <span className={`${styles.formulaHead}`} style={{ width: '380px' }}>
                        {item.text || '请获取'}
                      </span>
                    </div>
                  );
                })}
              </Form.Item>
              <Form.Item
                label="备注说明"
                name="note"
                // wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <TextArea rows={4} placeholder="请输入" style={{ width: '800px' }} />
              </Form.Item>
              {/* <Form.Item
                label="关联父类"
                name="parent"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <span
                  className={`${styles.formulaHead} ${styles.formulaHeadBg} ${styles.relevance}`}
                >
                  请选择公式
                </span>
              </Form.Item>
              <Form.Item
                label="关联表单"
                name="form"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <span
                  className={`${styles.formulaHead} ${styles.formulaHeadBg} ${styles.relevance}`}
                >
                  请选择表单
                </span>
              </Form.Item>
              <Form.Item
                label="关联模版"
                name="template"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <span
                  className={`${styles.formulaHead} ${styles.formulaHeadBg} ${styles.relevance}`}
                >
                  请选择模版
                </span>
              </Form.Item> */}
            </Form>
            <Row>
              <Col span={22} offset={2}>
                <Space>
                  <Button
                    onClick={() => {
                      history.push('/systemSettings/formulaManage');
                    }}
                  >
                    取消
                  </Button>
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

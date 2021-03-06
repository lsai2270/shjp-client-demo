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
   * @name: ????????????
   */
  const handleOnAddParams = () => {
    setParams([...params, { alis: '' }]);
  };
  /**
   * @name: ????????????
   * @param {number} index
   */
  const handleOnRemoveParams = (index: number) => {
    let newParams = params.concat([]);
    newParams.splice(index, 1);
    setParams(newParams);
  };
  /**
   * @name: ????????????
   */
  const handleOnAddConditions = () => {
    let newConditionParams = params.filter((item) => item.type == '2');
    setConditionParams(newConditionParams);
    setConditions([...conditions, { seq: conditions.length + 1 + '' }]);
  };
  /**
   * @name: ????????????
   * @param {number} index
   */
  const handleOnRemoveConditions = (index: number) => {
    let newConditions = conditions.concat([]);
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };
  /**
   * @name: ????????????
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
   * @name: ????????????
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
  /** ????????????
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
   * @name: ????????????
   */
  const handleCancel = () => {
    setIsModalVisible(false);
    setFlag(false);
  };
  /**
   * @name: ??????????????????
   */
  const handleOnSelectParams = (index: number) => {
    setTimeout(() => {
      setFlag(true);
    }, 100);
    setIsModalVisible(true);
    setFormulaIndex(index);
  };
  /**
   * @name: ????????????
   */
  const handleOnSetParams = (paramsData: any) => {
    // console.log('paramsData', paramsData);
    setSelected(paramsData);
  };
  /**
   * @name: ????????????Value
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
   * @name: ????????????Value
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
   * @name: ????????????Value
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
            name: `??????${filterConditionParams[0].seq}`,
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
  // ????????????
  const handleOnGetFormulaInfo = () => {
    if (results.length > 0) {
      let num = 0;
      results.forEach((item: any) => {
        if (Boolean(item.value)) {
          num++;
        }
      });
      if (num != results.length) {
        message.warning('???????????????????????????????????????????????????');
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
  // ??????
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
            message.success('??????????????????!');
            history.push('/systemSettings/formulaManage');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error('????????????????????????!');
        });
    } else {
      createFormula(params)
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            message.success('??????????????????!');
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
   * @name: ????????????
   */
  const handleOnAddCategory = () => {
    if (!categoryName) {
      message.warning('?????????????????????!');
      return;
    }
    if (!categoryCode) {
      message.warning('???????????????Code!');
      return;
    }
    dicTypeCreate({
      name: categoryName,
      code: categoryCode,
    }).then((res) => {
      console.log(res);
      if (res.code == 200) {
        message.success('??????????????????');
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
              title="????????????"
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
                label="????????????"
                name="name"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '?????????????????????!' }]}
              >
                <Input placeholder="?????????????????????!" />
              </Form.Item>
              <Form.Item
                label="????????????"
                name="belongId"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '?????????????????????!' }]}
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
                      ????????????
                    </Button>
                  </div>
                )}
                {!categoryVisible && (
                  <div style={{ display: 'flex' }}>
                    <Space>
                      <Input
                        placeholder="?????????????????????!"
                        value={categoryName}
                        onChange={(e) => {
                          setCategoryName(e.target.value);
                        }}
                      />
                      <Input
                        placeholder="???????????????Code!"
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
                        ??????
                      </a>
                      <a onClick={handleOnAddCategory}>??????</a>
                    </Space>
                  </div>
                )}
              </Form.Item>
              <Form.Item
                label="????????????"
                name="params"
                rules={[{ required: true, message: '?????????????????????!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    ????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    ????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '320px' }}>
                    ??????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    ??????
                  </span>
                </div>
                {params.map((item: any, index) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <Select
                        placeholder="?????????!"
                        style={{ width: '200px' }}
                        value={item.type}
                        onChange={(value) => hanldeOnParamsForm(value, index, 'type')}
                      >
                        <Option value="1">????????????</Option>
                        <Option value="2">????????????</Option>
                        <Option value="3">????????????</Option>
                      </Select>
                      <Input
                        style={{ width: '200px' }}
                        placeholder="???????????????!"
                        value={item.alis}
                        onChange={(e) => hanldeOnParamsForm(e.target.value, index, 'alis')}
                      />
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '320px' }}
                        onClick={() => handleOnSelectParams(index)}
                      >
                        {item.params || '???????????????'}
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
                    ??????
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                label="????????????"
                name="condition"
                rules={[{ required: false, message: '?????????????????????!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    ??????#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '250px' }}>
                    ??????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    ???????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '230px' }}>
                    ?????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    ??????
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
                        placeholder="?????????!"
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
                        placeholder="?????????!"
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
                        placeholder="?????????!"
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
                    ??????
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                label="??????"
                name="result"
                rules={[{ required: true, message: '?????????????????????!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    ??????#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '250px' }}>
                    ????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    ???????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '230px' }}>
                    ???????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    ??????
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
                        placeholder="?????????!"
                        style={{ width: '250px' }}
                        mode="multiple"
                        value={item.condition.map((item: any) => item.index)}
                        onChange={(value) => {
                          console.log(value);
                          hanldeOnResultForm(value, index, 'condition');
                        }}
                      >
                        {conditions.map((item: any, index: number) => {
                          return <Option key={index} value={item.seq}>{`??????${item.seq}`}</Option>;
                        })}
                      </Select>
                      <Select
                        placeholder="?????????!"
                        style={{ width: '120px' }}
                        value={item.operator ? item.operator : undefined}
                        onChange={(value) => hanldeOnResultForm(value, index, 'operator')}
                      >
                        <Option value="0">{`&&`}</Option>
                        <Option value="1">{`||`}</Option>
                      </Select>
                      <Input
                        style={{ width: '230px' }}
                        placeholder="?????????!"
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
                    ??????
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                label="??????"
                name="formula"
                rules={[{ required: true, message: '?????????????????????!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    ??????#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '230px' }}>
                    ????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '300px' }}>
                    ????????????
                  </span>
                  <span className={styles.formulaHead} style={{ width: '380px' }}>
                    ????????????
                  </span>
                  <span
                    className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                    style={{ width: '60px' }}
                    onClick={handleOnGetFormulaInfo}
                  >
                    ??????
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
                        {item.combination || '?????????'}
                      </span>
                      {/* <Input style={{ width: '300px' }} placeholder="?????????" />
                      <Input style={{ width: '380px' }} placeholder="?????????" /> */}
                      <span className={`${styles.formulaHead}`} style={{ width: '300px' }}>
                        {item.value || '?????????'}
                      </span>
                      <span className={`${styles.formulaHead}`} style={{ width: '380px' }}>
                        {item.text || '?????????'}
                      </span>
                    </div>
                  );
                })}
              </Form.Item>
              <Form.Item
                label="????????????"
                name="note"
                // wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '?????????????????????!' }]}
              >
                <TextArea rows={4} placeholder="?????????" style={{ width: '800px' }} />
              </Form.Item>
              {/* <Form.Item
                label="????????????"
                name="parent"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '?????????????????????!' }]}
              >
                <span
                  className={`${styles.formulaHead} ${styles.formulaHeadBg} ${styles.relevance}`}
                >
                  ???????????????
                </span>
              </Form.Item>
              <Form.Item
                label="????????????"
                name="form"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '?????????????????????!' }]}
              >
                <span
                  className={`${styles.formulaHead} ${styles.formulaHeadBg} ${styles.relevance}`}
                >
                  ???????????????
                </span>
              </Form.Item>
              <Form.Item
                label="????????????"
                name="template"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '?????????????????????!' }]}
              >
                <span
                  className={`${styles.formulaHead} ${styles.formulaHeadBg} ${styles.relevance}`}
                >
                  ???????????????
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
                    ??????
                  </Button>
                  <Button type="primary" onClick={handleOnSubmit}>
                    ??????
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

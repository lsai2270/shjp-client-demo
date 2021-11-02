import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Form, Input, Select, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;
import styles from './index.less';
export default (props: any) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const [params, setParams] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  /**
   * @name: 新增参数
   */
  const handleOnAddParams = () => {
    setParams([...params, {}]);
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
   * @name: 新增结果
   */
  const handleOnAddResults = () => {
    setResults([...results, {}]);
  };
  /**
   * @name: 删除结果
   * @param {number} index
   */
  const handleOnRemoveResults = (index: number) => {
    let newResults = results.concat([]);
    newResults.splice(index, 1);
    setResults(newResults);
  };
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <Row className={styles.projectContainer}>
          <Col span={24}>
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
                name="belongType"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <Select
                  defaultValue="lucy"
                  placeholder="请选择所属类型!"
                  style={{ width: '100%', marginRight: '10px' }}
                >
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="新增参数"
                name="addParams"
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
                      <Select defaultValue="lucy" placeholder="请选择!" style={{ width: '200px' }}>
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                      </Select>
                      <Input style={{ width: '200px' }} placeholder="请输入别名!" />
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '320px' }}
                      >
                        请选择参数
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
                name="addParams1"
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
                    <div className={styles.colGap}>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '120px' }}
                      >
                        {index + 1}
                      </span>
                      <Select defaultValue="lucy" placeholder="请选择!" style={{ width: '250px' }}>
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                      </Select>
                      <Select placeholder="请选择!" style={{ width: '120px' }}>
                        <Option value="0">{`<`}</Option>
                        <Option value="1">{`>`}</Option>
                        <Option value="2">{`>=`}</Option>
                        <Option value="3">{`<=`}</Option>
                        <Option value="4">{`==`}</Option>
                        <Option value="5">{`!=`}</Option>
                      </Select>
                      <Input style={{ width: '230px' }} placeholder="请输入!" />
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
                    <div className={styles.colGap}>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '120px' }}
                      >
                        {index + 1}
                      </span>
                      <Select defaultValue="lucy" placeholder="请选择!" style={{ width: '250px' }}>
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                      </Select>
                      <Select placeholder="请选择!" style={{ width: '120px' }}>
                        <Option value="0">{`&&`}</Option>
                        <Option value="1">{`||`}</Option>
                      </Select>
                      <Input style={{ width: '230px' }} placeholder="请输入!" />
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
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '120px' }}>
                    条件#
                  </span>
                  <span className={styles.formulaHead} style={{ width: '300px' }}>
                    参数别名
                  </span>
                  <span className={styles.formulaHead} style={{ width: '380px' }}>
                    参数
                  </span>
                </div>
                <div className={styles.colGap}>
                  <span
                    className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                    style={{ width: '120px' }}
                  >
                    1
                  </span>
                  <Input style={{ width: '300px' }} placeholder="请输入" />
                  <Input style={{ width: '380px' }} placeholder="请输入" />
                  {/* <span  className={`${styles.formulaHead} ${styles.formulaHeadBg}`} style={{width: '320px'}}>请选择参数</span> */}
                </div>
              </Form.Item>
              <Form.Item
                label="备注说明"
                name="note"
                wrapperCol={{ span: 12 }}
                rules={[{ required: false, message: '请选择所属类型!' }]}
              >
                <TextArea rows={4} placeholder="请输入" />
              </Form.Item>
              <Form.Item
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
              </Form.Item>
            </Form>
            <Row>
              <Col span={22} offset={2}>
                <Space>
                  <Button>取消</Button>
                  <Button type="primary">确定</Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

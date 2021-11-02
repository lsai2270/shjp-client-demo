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
  const [categorys, setCategorys] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  /**
   * @name: 新增参数
   */
  const handleOnAddCategorys = () => {
    setCategorys([...categorys, {}]);
  };
  /**
   * @name: 删除参数
   * @param {number} index
   */
  const handleOnRemoveCategorys = (index: number) => {
    let newCategorys = categorys.concat([]);
    newCategorys.splice(index, 1);
    setCategorys(newCategorys);
  };
  /**
   * @name: 新增条件
   */
  const handleOnAddFormulas = () => {
    setFormulas([...formulas, {}]);
  };
  /**
   * @name: 删除参数
   * @param {number} index
   */
  const handleOnRemoveFormulas = (index: number) => {
    let newFormulas = formulas.concat([]);
    newFormulas.splice(index, 1);
    setFormulas(newFormulas);
  };
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <Row style={{ marginTop: '20px' }}>
          <Col span={24}>
            <Form
              form={form}
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 20 }}
              initialValues={{ keyType: '0' }}
            >
              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>当前模版</span>}
                name="template"
                rules={[{ required: false, message: '' }]}
              >
                <span style={{ fontWeight: 'bold' }}>上海智能医疗示范基地一期模板</span>
              </Form.Item>
              <Form.Item
                label="目录配置"
                name="addParams"
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '320px' }}>
                    涉及章节目录
                  </span>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    字典参数
                  </span>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    对应值
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    操作
                  </span>
                </div>
                {categorys.map((item: any, index) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <Select defaultValue="lucy" placeholder="请选择!" style={{ width: '320px' }}>
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                      </Select>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '200px' }}
                      >
                        请选择字典类型
                      </span>
                      <Input style={{ width: '200px' }} placeholder="请输入" />
                      <span className={styles.iconContain}>
                        <MinusCircleOutlined
                          className={styles.removeIcon}
                          onClick={() => handleOnRemoveCategorys(index)}
                        />
                      </span>
                    </div>
                  );
                })}
                <div>
                  <Button style={{ width: '800px' }} onClick={handleOnAddCategorys}>
                    添加
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                label="公式配置"
                name="addParams1"
                rules={[{ required: true, message: '请选择所属类型!' }]}
              >
                <div className={styles.colGap}>
                  <span className={styles.formulaHead} style={{ width: '320px' }}>
                    涉及公式类型
                  </span>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    字典参数
                  </span>
                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                    对应值
                  </span>
                  <span className={styles.formulaHead} style={{ width: '80px' }}>
                    操作
                  </span>
                </div>
                {formulas.map((item: any, index) => {
                  return (
                    <div className={styles.colGap} key={index}>
                      <Select defaultValue="lucy" placeholder="请选择!" style={{ width: '320px' }}>
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                      </Select>
                      <span
                        className={`${styles.formulaHead} ${styles.formulaHeadBg}`}
                        style={{ width: '200px' }}
                      >
                        请选择字典类型
                      </span>
                      <Input style={{ width: '200px' }} placeholder="请输入" />
                      <span className={styles.iconContain}>
                        <MinusCircleOutlined
                          className={styles.removeIcon}
                          onClick={() => handleOnRemoveFormulas(index)}
                        />
                      </span>
                    </div>
                  );
                })}
                <div>
                  <Button style={{ width: '800px' }} onClick={handleOnAddFormulas}>
                    添加
                  </Button>
                </div>
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

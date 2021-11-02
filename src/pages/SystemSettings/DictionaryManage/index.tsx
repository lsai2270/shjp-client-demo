import React, { useState, useRef, useEffect } from 'react';
import { history, connect, Dispatch } from 'umi';
import {
  Button,
  message,
  Modal,
  Row,
  Col,
  Form,
  Input,
  Radio,
  Table,
  Select,
  Space,
  Cascader,
} from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
import { getTreeData } from '@/tools';
import ScrollSelect from '@/components/ScrollSelect';
import {
  dicTypeList,
  dicDataAll,
  dicDataList,
  dicDataCreateMany,
  dicTypeCreate,
  deleteDicData,
  updateDicData,
} from '@/services/systemSetting';
import styles from './index.less';
export default (props: any) => {
  const { dispatch } = props;
  const [form] = Form.useForm();
  const { validateFields } = form;
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新建字典');
  const [categoryVisible, setCategoryVisible] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [dictionarys, setDictionarys] = useState<any[]>([
    {
      sort: '1',
      value: '',
    },
  ]);
  const [dicTypeLists, setDicTypeLists] = useState<any[]>([]);
  const [dicDataLists, setDicDataLists] = useState<any[]>([]);
  const [requestFlag, setRequestFlag] = useState(true);
  const [childrenTableData, setChildrenTableData] = useState<any[]>([]);
  const [typeCodeValue, setTypeCodeValue] = useState<any>(undefined);
  const [dicDataTreeData, setDicDataTreeData] = useState<any[]>([]);
  useEffect(() => {
    if (modalTitle == '编辑字典') {
      let filterDicType: any = dicTypeLists.filter(
        (item: any) => item.code == currentRow?.typeCode,
      );
      setTypeCodeValue({ value: filterDicType[0]?._id, label: filterDicType[0]?.name });
      if (currentRow.parentId != '0') {
        form.setFieldsValue({
          parentId: [currentRow.parentId],
        });
      }
      form.setFieldsValue({
        typeCode: { value: filterDicType[0]?._id, label: filterDicType[0]?.name },
        name: currentRow.name,
        code: currentRow.code,
        value: '',
        sort: currentRow.sort + '',
      });
    }
  }, [dicTypeLists, currentRow]);
  const columns: any[] = [
    {
      title: '字典名称',
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      // valueType: 'date',
    },
    {
      title: '字典code',
      key: 'code',
      dataIndex: 'code',
      // sorter: true,
      search: false,
    },
    {
      title: '所属类型',
      key: 'designCompany',
      dataIndex: 'designCompany',
      sorter: true,
      // hideInSearch: true,
    },
    {
      title: '备注',
      key: 'designCompany',
      dataIndex: 'designCompany',
      sorter: true,
      search: false,
    },
    // {
    //   title: '创建时间',
    //   key: 'designAt',
    //   dataIndex: 'designAt',
    //   sorter: true,
    //   hideInSearch: true,
    //   valueType: 'date',
    // },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      render: (text: any, record: any) => [
        <a key="1" onClick={() => handleOnEditRow(record)}>
          编辑
        </a>,
        <a key="4" onClick={() => handleOnRemoveRow(record)}>
          删除
        </a>,
      ],
    },
  ];
  // 删除行
  const handleOnRemoveRow = (record: any) => {
    confirm({
      title: '您正在删除字典数据记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>字典数据删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        deleteDicData(record._id).then((res) => {
          if (res.code == 200) {
            actionRef.current?.reloadAndRest?.();
            message.success('删除字典数据成功!');
          }
        });
      },
    });
  };
  // 编辑行
  const handleOnEditRow = (record: any) => {
    console.log('record', record);
    setIsModalVisible(true);
    setModalTitle('编辑字典');
    setCurrentRow(record);
    // confirm({
    //   title: '您正在编辑字典记录。',
    //   icon: <ExclamationCircleOutlined />,
    //   content: (
    //     <span>
    //       <span style={{ color: 'red' }}>编辑字典记录后会对之后的预测产生影响。</span>
    //       <br />
    //       <span>您确定要继续吗?</span>
    //     </span>
    //   ),
    //   onOk() {},
    // });
  };

  /**
   * @name: 新建模版
   */
  const handleOnRouteTo = () => {
    history.push('/createTemplate');
  };
  const handleOnMoreRemove = () => {
    confirm({
      title: '您正在批量删除项目记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>项目删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('selectedRows', selectedRows);
        let params = {
          ids: selectedRows.map((item: any) => item._id),
        };
        // batchDeleteProject(params).then((res) => {
        //   if (res.code == 200) {
        //     setSelectedRows([]);
        //     message.success('批量删除项目成功!');
        //     actionRef.current?.reloadAndRest?.();
        //   }
        // });
      },
    });
  };
  /**
   * @name: 确认弹窗
   */
  const handleOk = async () => {
    const formData = await validateFields();
    if (modalTitle == '新建字典') {
      if (dictionarys.length == 0) {
        message.warning('请先添加字典!');
        return;
      }
      let parentId = form.getFieldValue('parentId');
      let filterDicType = dicTypeLists.filter((item: any) => item._id == formData?.typeCode?.value);
      let params = {
        dicData: dictionarys.map((item: any) => {
          return {
            ...item,
            parentId: parentId && parentId.length > 0 ? parentId[parentId.length - 1] : '0',
            typeCode: filterDicType[0].code,
          };
        }),
      };
      dicDataCreateMany(params)
        .then((res) => {
          // console.log(res);
          if (res.code == 200) {
            message.success('创建字典成功!');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error('创建字典接口出错!');
        });
    } else if (modalTitle == '编辑字典') {
      let parentId = form.getFieldValue('parentId');
      let filterDicType = dicTypeLists.filter((item: any) => item._id == formData?.typeCode?.value);
      let params = {
        ...formData,
        parentId: parentId && parentId.length > 0 ? parentId[parentId.length - 1] : '0',
        typeCode: filterDicType[0].code,
      };
      updateDicData(currentRow._id, params)
        .then((res) => {
          // console.log(res);
          if (res.code == 200) {
            message.success('字典更新成功!');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error('字典更新接口错误!');
        });
    }
    form.resetFields();
    setDicTypeLists([]);
    setIsModalVisible(false);
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setIsModalVisible(false);
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
      // console.log(res);
      if (res.code == 200) {
        message.success('新建分类成功');
        setDicTypeLists([]);
        setTimeout(() => {
          setCategoryVisible(true);
          setCategoryCode('');
          setCategoryName('');
        }, 0);
      }
    });
  };
  /**
   * @name: 添加字典
   */
  const handleOnAddDictionary = () => {
    setDictionarys([
      ...dictionarys,
      {
        sort: '1',
        value: '',
      },
    ]);
  };
  /**
   * @name: 删除字典
   */
  const handleOnRemoveDictionary = (index: number) => {
    let newDictionarys = dictionarys.concat([]);
    newDictionarys.splice(index, 1);
    setDictionarys(newDictionarys);
    form.resetFields([`name${index}`, `code${index}`, `value${index}`, `sort${index}`]);
  };
  // 获取字典
  const handleOnGetDictype = async (params: any) => {
    const res = await dicTypeList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setDicTypeLists([...dicTypeLists, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('获取字典接口出错!');
    }
    return res.data;
  };
  const hanldeOnAddDictionarys = (value: string, key: string, index: number) => {
    const newDictionarys = dictionarys.concat([]);
    newDictionarys.splice(index, 1, {
      ...newDictionarys[index],
      [key]: value,
    });
    setDictionarys(newDictionarys);
  };
  //所属类型选择事件
  const hanldeOnDictypeChange = (value: any) => {
    // console.log(value);
    let filterDicType = dicTypeLists.filter((item: any) => item._id == value.value);
    dicDataAll({
      typeCode: filterDicType[0]?.code,
    }).then((res) => {
      if (res.code == 200) {
        form.resetFields(['parentId']);
        // setDicDataLists(res.data);
        setDicDataTreeData(getTreeData(res.data, '0'));
      }
    });
    form.setFieldsValue({
      typeCode: value,
    });
  };
  const expandedRowRender = (record: any, index: number, indent: any, expanded: boolean) => {
    if (expanded) {
      if (childrenTableData.length > 0) {
        return (
          <ProTable
            rowKey={(record) => record._id}
            columns={columns}
            headerTitle={false}
            search={false}
            options={false}
            dataSource={childrenTableData}
            pagination={false}
          />
        );
      }
    }
  };
  const onExpand = async (expanded: boolean, record: any) => {
    if (expanded) {
      const res = await dicDataAll({
        typeCode: record.code,
      });
      setChildrenTableData(res.data);
    }
  };
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <Row className={styles.projectContainer}>
          <Col span={24}>
            <ProTable
              // headerTitle={intl.formatMessage({
              //   id: 'pages.searchTable.title',
              //   defaultMessage: '',
              // })}
              // expandable={{
              //   indentSize: 30,
              //   onExpand,
              //   expandedRowRender: expandedRowRender,
              // }}
              actionRef={actionRef}
              rowKey={(record: any) => record._id}
              search={{
                span: 5,
              }}
              options={false}
              toolBarRender={() => [
                <Button
                  type="primary"
                  key="1"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIsModalVisible(true);
                    setModalTitle('新建字典');
                  }}
                >
                  新建
                </Button>,
                <Button key="2" onClick={handleOnMoreRemove}>
                  批量删除
                </Button>,
              ]}
              pagination={{
                // showQuickJumper: true,
                pageSize: 10,
              }}
              request={async (params, sorter, filter) => {
                const res = await dicDataList({ ...params, sorter, filter });
                // console.log(res);
                return {
                  data: res.data.data,
                  success: true,
                  total: res.data.count,
                };
              }}
              // dataSource={[]}
              columns={columns}
              rowSelection={{
                onChange: (_, selectedRows) => setSelectedRows(selectedRows),
              }}
            />
            <Modal
              title={modalTitle}
              width={'50%'}
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <Form
                form={form}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 18 }}
                initialValues={{ keyType: '0' }}
              >
                <Form.Item
                  label="所属类型"
                  name="typeCode"
                  wrapperCol={{ span: 12 }}
                  rules={[{ required: true, message: '请选择所属类型!' }]}
                >
                  {categoryVisible && (
                    <div style={{ display: 'flex' }}>
                      <ScrollSelect
                        pageSize={50}
                        value={typeCodeValue}
                        handleOnGetData={handleOnGetDictype}
                        hanldeOnChange={hanldeOnDictypeChange}
                        // optionData={dicTypeLists}
                        placeholder="请选择项目"
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
                  label="关联父字典"
                  name="parentId"
                  wrapperCol={{ span: 12 }}
                  rules={[{ required: false, message: '请选择!' }]}
                >
                  <Cascader
                    fieldNames={{ label: 'title', value: 'key' }}
                    changeOnSelect
                    options={dicDataTreeData}
                    // onChange={(value, selectedOptions) => {
                    //   // console.log(value);
                    //   // console.log(selectedOptions);
                    // }}
                    placeholder="请选择"
                  />
                  {/* <Select placeholder="请选择" style={{ width: '100%' }} labelInValue>
                    {dicDataLists.map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select> */}
                </Form.Item>
                <Form.Item
                  label="字典"
                  // name="name"
                  rules={[{ required: true, message: '请输入参数名称!' }]}
                >
                  {modalTitle == '编辑字典' && (
                    <div className={styles.dictionartItem}>
                      <Space>
                        <Form.Item
                          name={`name`}
                          noStyle={true}
                          rules={[{ required: true, message: '请输入' }]}
                        >
                          <Input placeholder="请输入名称" />
                        </Form.Item>
                        <Form.Item
                          name={`code`}
                          noStyle={true}
                          rules={[{ required: true, message: '请输入' }]}
                        >
                          <Input placeholder="请输入对应Code" />
                        </Form.Item>
                        <Form.Item
                          name={`value`}
                          noStyle={true}
                          rules={[{ required: false, message: '' }]}
                        >
                          <Input placeholder="请输入对应值" />
                        </Form.Item>
                        <Form.Item
                          name={`sort`}
                          noStyle={true}
                          rules={[{ required: false, message: '' }]}
                        >
                          <Input placeholder="请输入orderID" />
                        </Form.Item>
                      </Space>
                    </div>
                  )}
                  {modalTitle == '新建字典' &&
                    dictionarys.map((item, index) => {
                      return (
                        <div className={styles.dictionartItem} key={index}>
                          <Space>
                            <Form.Item
                              name={`name${index}`}
                              noStyle={true}
                              rules={[{ required: true, message: '' }]}
                            >
                              <Input
                                placeholder="请输入名称"
                                onChange={(e) =>
                                  hanldeOnAddDictionarys(e.target.value, 'name', index)
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              name={`code${index}`}
                              noStyle={true}
                              rules={[{ required: true, message: '' }]}
                            >
                              <Input
                                placeholder="请输入对应Code"
                                onChange={(e) =>
                                  hanldeOnAddDictionarys(e.target.value, 'code', index)
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              name={`value${index}`}
                              noStyle={true}
                              rules={[{ required: false, message: '' }]}
                            >
                              <Input
                                placeholder="请输入对应值"
                                onChange={(e) =>
                                  hanldeOnAddDictionarys(e.target.value, 'value', index)
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              name={`sort${index}`}
                              noStyle={true}
                              rules={[{ required: false, message: '' }]}
                            >
                              <Input
                                placeholder="请输入orderID"
                                onChange={(e) =>
                                  hanldeOnAddDictionarys(e.target.value, 'sort', index)
                                }
                              />
                            </Form.Item>
                            <span className={styles.iconContain}>
                              <MinusCircleOutlined
                                className={styles.removeIcon}
                                onClick={() => handleOnRemoveDictionary(index)}
                              />
                            </span>
                          </Space>
                        </div>
                      );
                    })}
                  {modalTitle == '新建字典' && (
                    <div>
                      <Button style={{ width: '100%' }} onClick={handleOnAddDictionary}>
                        添加
                      </Button>
                    </div>
                  )}
                </Form.Item>
              </Form>
            </Modal>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

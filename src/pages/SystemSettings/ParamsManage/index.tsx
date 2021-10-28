import React, { useState, useRef, useEffect } from 'react';
import lodash from 'lodash';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Form, Input, Radio, Select, Space, Upload } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
import TypeCascader from '../components/TypeCascader';
import BaseDataTypeCascader from '../components/TypeCascader/BaseDataComp';

import { getList, deleteProject, batchDeleteProject } from '@/services/projectManage';
import {
  createParams,
  paramsGetList,
  deleteParams,
  updateParams,
  dicTypeCreate,
} from '@/services/systemSetting';

import styles from './index.less';
const ParamsComp = (props: any) => {
  const { dispatch, handleOnSetParams } = props;
  const [form] = Form.useForm();
  const { validateFields } = form;
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [categoryVisible, setCategoryVisible] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [typeCascaderValue, setTypeCascaderValue] = useState<any[]>([]);
  const [dicDataTypeCascaderValue, setDicDataTypeCascaderValue] = useState<any[]>([]);
  const [defaultValue, setDefaultValue] = useState('1');
  const [defaultValueInput, setDefaultValueInput] = useState<any>(undefined);
  const token: any = localStorage.getItem('Authorization');
  let columns: ProColumns<any>[] = [
    {
      title: '参数名称',
      key: 'name',
      dataIndex: 'name',
      // valueType: 'date',
    },
    {
      title: '参数code',
      key: 'code',
      dataIndex: 'code',
    },
    {
      title: '分类名称',
      key: 'belongName',
      dataIndex: 'belongName',
      // valueType: 'date',
      search: false,
    },
    {
      title: '备注',
      key: 'note',
      dataIndex: 'note',
      search: false,
    },
    {
      title: '创建时间',
      key: 'atCreated',
      dataIndex: 'atCreated',
      // sorter: true,
      search: false,
      valueType: 'date',
    },
  ];
  if (history.location.pathname == '/systemSettings/paramsManage') {
    columns.push({
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      render: (text, record) => [
        <a key="1" onClick={() => handleOnEditRow(record)}>
          编辑
        </a>,
        <a key="4" onClick={() => handleOnRemoveRow(record)}>
          删除
        </a>,
      ],
    });
  }
  // 删除行
  const handleOnRemoveRow = (record: any) => {
    confirm({
      title: '您正在删除参数记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>参数记录删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        deleteParams(record._id).then((res) => {
          if (res.code == 200) {
            actionRef.current?.reloadAndRest?.();
            message.success('删除成功!');
          }
        });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };
  // 编辑行
  const handleOnEditRow = (record: any) => {
    setIsModalVisible(true);
    setModalTitle('编辑参数');
    // console.log(record);
    setCurrentRow(record);
    setTypeCascaderValue(record.belongId.split(','));
    form.setFieldsValue({
      ...record,
      isImportanceString: record.isImportanceString ? '1' : '0',
      belongId: {
        label: record.belongName,
        value: record.belongId,
      },
      dicData: {
        label: record.dicData,
        value: record.dicDataId,
      },
    });
  };

  /**
   * @name: 批量删除
   */
  const handleOnMoreRemove = () => {
    confirm({
      title: '您正在批量删除参数记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>参数删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        console.log('selectedRows', selectedRows);
        let params = {
          ids: selectedRows.map((item: any) => item._id),
        };
        batchDeleteProject(params).then((res) => {
          if (res.code == 200) {
            setSelectedRows([]);
            message.success('批量删除项目成功!');
            actionRef.current?.reloadAndRest?.();
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  /**
   * @name: 确认弹窗
   */
  const handleOk = async () => {
    const formData = await validateFields();
    if (modalTitle == '新建参数') {
      let objData = {
        ...formData,
        dataType: 'string',
        isImportanceString: formData.isImportanceString == 0 ? false : true,
        belongId: formData.belongId.value,
        belongName: formData.belongId.label,
      };
      if (formData.dicData) {
        objData = {
          ...objData,
          dicData: formData.dicData.label,
          dicDataId: formData.dicData.value,
        };
      }
      const res = await createParams(objData);
      try {
        if (res.code == 200) {
          message.success('新建参数成功!');
          actionRef.current?.reloadAndRest?.();
        } else {
          message.success(res.msg);
        }
      } catch (e) {
        message.error('新建参数失败!');
      }
    }
    if (modalTitle == '编辑参数') {
      let objData = {
        ...formData,
        isImportanceString: formData.isImportanceString == 0 ? false : true,
        belongId: formData.belongId.value,
        belongName: formData.belongId.label,
      };
      if (formData.dicData) {
        objData = {
          ...objData,
          dicData: formData.dicData.label,
          dicDataId: formData.dicData.value,
        };
      }
      const res = await updateParams(currentRow._id, objData);
      try {
        if (res.code == 200) {
          message.success('更新参数成功!');
          actionRef.current?.reloadAndRest?.();
        } else {
          message.success(res.msg);
        }
      } catch (e) {
        message.error('更新参数失败!');
      }
    }
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
      console.log(res);
      if (res.code == 200) {
        message.success('新建分类成功');
        setCategoryVisible(true);
      }
    });
  };
  const handleOnUploadChange = (info: any) => {
    if (info.file.status !== 'uploading') {
      // console.log(info.file, info.fileList);
    }

    if (info.file.status === 'done') {
      console.log(info);
      setDefaultValueInput(lodash.get(info.file.response.data, 'path'));
      form.setFieldsValue({
        value: lodash.get(info.file.response.data, 'path'),
      });
      message.success('上传成功');
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  return (
    <Row className={styles.projectContainer}>
      <Col span={24}>
        <ProTable
          // headerTitle={intl.formatMessage({
          //   id: 'pages.searchTable.title',
          //   defaultMessage: '',
          // })}
          actionRef={actionRef}
          rowKey={(record: any) => record._id}
          search={{
            span: 5,
          }}
          tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
            <Space size={24}>
              <span>
                已选 <a>{selectedRowKeys.length}</a> 项
              </span>
            </Space>
          )}
          tableAlertOptionRender={() => {
            return (
              <Space size={16}>
                <a
                  onClick={() => {
                    setSelectedRowKeys([]);
                    setSelectedRows([]);
                  }}
                >
                  取消选择
                </a>
              </Space>
            );
          }}
          options={false}
          toolBarRender={() => {
            if (history.location.pathname == '/systemSettings/paramsManage') {
              return [
                <Button
                  type="primary"
                  key="1"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIsModalVisible(true);
                    setModalTitle('新建参数');
                  }}
                >
                  新建参数
                </Button>,
                <Button key="2" onClick={handleOnMoreRemove}>
                  批量删除
                </Button>,
              ];
            } else {
              return [];
            }
          }}
          pagination={{
            // showQuickJumper: true,
            pageSize: 10,
          }}
          request={async (params, sorter, filter) => {
            let paramsInfo: any = {
              ...params,
              sorter,
              filter,
            };
            // if (history.location.pathname.includes('/evalTextManage')) {
            //   paramsInfo.type = '2,5,6';
            // }
            const res = await paramsGetList(paramsInfo);
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
            onChange: (selectedRowKeys, selectedRows) => {
              if (history.location.pathname == '/systemSettings/paramsManage') {
                setSelectedRows(selectedRows);
                setSelectedRowKeys(selectedRowKeys);
              } else {
                // if(selectedRows.length>1){
                //   message.warning('最多只能绑定一个参数!')
                //   return
                // }
                handleOnSetParams(selectedRows[selectedRows.length - 1]);
                setSelectedRows([selectedRows[selectedRows.length - 1]]);
                setSelectedRowKeys([selectedRowKeys[selectedRows.length - 1]]);
              }
            },
            selectedRowKeys: selectedRowKeys,
          }}
        />
        <Modal
          title={modalTitle}
          visible={isModalVisible}
          width={'800px'}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ isImportanceString: '0' }}
          >
            <Form.Item
              label="所属类型"
              name="belongId"
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
              label="关联字典"
              name="dicData"
              rules={[{ required: false, message: '请关联字典!' }]}
            >
              <div>
                <BaseDataTypeCascader
                  value={dicDataTypeCascaderValue}
                  onChange={(value: any, selectedOptions: any) => {
                    setDicDataTypeCascaderValue(value);
                    form.setFieldsValue({
                      dicData: {
                        label: selectedOptions[selectedOptions.length - 1]?.title,
                        value: value.toString(),
                      },
                    });
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item
              label="参数名称"
              name="name"
              rules={[{ required: true, message: '请输入参数名称!' }]}
            >
              <Input placeholder="请输入参数名称!" />
            </Form.Item>
            <Form.Item
              label="参数Code"
              name="code"
              rules={[{ required: true, message: '请输入参数Code!' }]}
            >
              <Input placeholder="请输入参数Code!" />
            </Form.Item>
            {/* <Form.Item
              label="类型"
              name="type1"
              rules={[{ required: true, message: '请选择类型!' }]}
            >
              <Radio.Group>
                <Radio value="1">默认</Radio>
                <Radio value="2">参与初始化过滤</Radio>
              </Radio.Group>
            </Form.Item> */}
            <Form.Item
              label="参数"
              name="type"
              rules={[{ required: true, message: '请输入参数类型!' }]}
            >
              {/* <Input placeholder="请输入参数类型!" /> */}
              <Select placeholder="请选择参数!" style={{ width: '100%', marginRight: '10px' }}>
                <Option value="1">用户输入</Option>
                <Option value="2">数据库</Option>
                <Option value="3">公式结果</Option>
                <Option value="4">关联公式</Option>
                <Option value="5">循环参数(地块)</Option>
                <Option value="6">循环参数</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="参数单位"
              name="unit"
              rules={[{ required: false, message: '请输入参数单位!' }]}
            >
              <Input placeholder="请输入（平方米、人/次等）!" />
            </Form.Item>
            <Form.Item
              label="默认值"
              name="value"
              rules={[{ required: false, message: '请输入!' }]}
            >
              <Space>
                <Select
                  style={{ width: '120px' }}
                  placeholder="请选择"
                  value={defaultValue}
                  onChange={(value) => setDefaultValue(value)}
                >
                  <Option value="1">文字</Option>
                  <Option value="2">图片</Option>
                </Select>
                <Input
                  style={{ width: '278px' }}
                  disabled={defaultValue == '2' ? true : false}
                  value={defaultValueInput}
                  onChange={(e) => {
                    setDefaultValueInput(e.target.value);
                    form.setFieldsValue({
                      value: e.target.value,
                    });
                  }}
                  placeholder="请输入!"
                />
                {defaultValue == '2' && (
                  <Upload
                    name="file"
                    action="/api/v1/file/upload"
                    accept="image/png,image/jpeg,image/bmp"
                    // beforeUpload={handleOnBeforeUpload}
                    headers={{ Authorization: token }}
                    showUploadList={false}
                    onChange={handleOnUploadChange}
                  >
                    <Button type="primary">上传图片</Button>
                  </Upload>
                )}
              </Space>
            </Form.Item>
            <Form.Item
              label="参数备注"
              name="note"
              rules={[{ required: false, message: '请输入参数备注!' }]}
            >
              <Input placeholder="请输入参数备注!" />
            </Form.Item>
            <Form.Item
              label="是否关键类型"
              name="isImportanceString"
              rules={[{ required: false, message: '请选择关键类型!' }]}
            >
              <Radio.Group>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};
export { ParamsComp };
export default (props: any) => {
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <ParamsComp />
      </div>
    </PageContainer>
  );
};

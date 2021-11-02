import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Form, Input, Select } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;

import { batchDeleteProject } from '@/services/projectManage';
import { createTemplate, templateList, deleteTemplate } from '@/services/systemSetting';

import styles from './index.less';
export default (props: any) => {
  const { dispatch } = props;
  const [form] = Form.useForm();
  const { validateFields } = form;
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns: ProColumns<any>[] = [
    {
      title: '模版名称',
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      // valueType: 'date',
    },
    {
      title: '创建人',
      key: 'designCompany',
      dataIndex: 'designCompany',
      sorter: true,
      search: false,
    },
    {
      title: '创建时间',
      key: 'atCreated',
      dataIndex: 'atCreated',
      sorter: true,
      search: false,
      valueType: 'date',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      render: (text, record, index) => {
        if (index != 0) {
          return [
            <a key="1" onClick={() => handleOnEditRow(record)}>
              编辑
            </a>,
            <a key="4" onClick={() => handleOnRemoveRow(record)}>
              删除
            </a>,
          ];
        }
        return [
          <a key="1" onClick={() => handleOnEditRow(record)}>
            编辑
          </a>,
        ];
      },
    },
  ];
  // 删除行
  const handleOnRemoveRow = (record: any) => {
    confirm({
      title: '您正在删除模版记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>模版删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        deleteTemplate(record._id).then((res) => {
          if (res.code == 200) {
            actionRef.current?.reloadAndRest?.();
            message.success('删除模版成功!');
          }
        });
      },
    });
  };
  // 编辑行
  const handleOnEditRow = (record: any) => {
    confirm({
      title: '您正在编辑模版记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>编辑模版会对新的报告记录产生影响。</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        history.push({
          pathname: '/createTemplate',
          query: {
            id: record._id,
            title: record.name,
          },
        });
      },
    });
  };
  /**
   * @name: 新建模版
   */
  const handleOnRouteTo = () => {
    history.push('/createTemplate');
  };
  const handleOnMoreRemove = () => {
    confirm({
      title: '您正在批量删除模版记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>模版删除后，相关信息将无法恢复</span>
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
    createTemplate({
      name: formData.name,
    }).then((res) => {
      console.log(res);
      if (res.code == 200) {
        history.push({
          pathname: '/createTemplate',
          query: {
            id: res.data._id,
            title: res.data.name,
          },
        });
        setIsModalVisible(false);
      }
    });
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setIsModalVisible(false);
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
                  }}
                >
                  新建模版
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
                const res = await templateList({ ...params, sorter, filter });
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
              title="新建模版"
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                initialValues={{ keyType: '0' }}
              >
                <Form.Item
                  label="模版名称"
                  name="name"
                  rules={[{ required: true, message: '请输入模版名称!' }]}
                >
                  <Input placeholder="请输入模版名称!" />
                </Form.Item>
                {/* <Form.Item
                  label="引用模版"
                  name="code"
                  rules={[{ required: false, message: '请选择引用模版!' }]}
                >
                  <Select
                    defaultValue="lucy"
                    placeholder="请选择引用模版!"
                    style={{ width: '100%' }}
                  >
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                  </Select>
                </Form.Item> */}
              </Form>
            </Modal>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

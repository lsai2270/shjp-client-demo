import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Form, Input, Select, Cascader, Upload } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, ExclamationCircleOutlined, InboxOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Dragger } = Upload;
const { Option } = Select;

import { batchDeleteProject } from '@/services/projectManage';
import { createTemplate, templateList, deleteTemplate } from '@/services/systemSetting';
import { createStandard, getStandardList } from '@/services/v2/standard';

import styles from './index.less';
const options = [
  {
    value: 'Z01',
    label: 'Zhejiang',
    children: [
      {
        value: 'Z02',
        label: 'Hangzhou',
      },
    ],
  },
];
export default (props: any) => {
  const { dispatch } = props;
  const [form] = Form.useForm();
  const { validateFields } = form;
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any[]>([]);

  const newToken = localStorage.getItem('Authorization');
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/v1/file/upload',
    headers: { Authorization: `Bearer ${newToken}` },
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        form.setFieldsValue({
          file: info.fileList,
        });
        message.success(`${info.file.name}文件上传成功!`);
      } else if (status === 'error') {
        message.error(`${info.file.name}文件上传出错!`);
      }
      if (status == 'removed') {
        form.resetFields(['file']);
      }
    },
    onDrop(e: any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
  const columns: ProColumns<any>[] = [
    {
      title: '标准名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '所属区域',
      key: 'areaInfo',
      dataIndex: 'areaInfo',
      render: (text: any) => {
        return (
          <span>
            {text.province}-{text.city}
          </span>
        );
      },
    },
    {
      title: '创建人',
      key: 'createdAtBy',
      dataIndex: 'createdAtBy',
      sorter: true,
      search: false,
    },
    {
      title: '创建时间',
      key: 'createdAt',
      dataIndex: 'createdAt',
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
        return [
          <a key="1" onClick={() => handleOnEditRow(record)}>
            编辑
          </a>,
          <a key="4" onClick={() => handleOnRemoveRow(record)}>
            删除
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
    console.log('formData', formData);
    createStandard({
      name: formData.name,
      areaInfo: {
        province: selectedArea[0].label,
        provinceCode: selectedArea[0].value,
        city: selectedArea[1].label,
        cityCode: selectedArea[1].value,
      },
      fileInfo: formData.file.map((item: any) => {
        return {
          fileId: item.response.data._id,
          name: item.response.data.name,
          path: item.response.data.path,
        };
      }),
    }).then((res) => {
      console.log(res);
      if (res.code == 200) {
        setIsModalVisible(false);
        actionRef.current?.reloadAndRest?.();
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
              const res = await getStandardList({ ...params, sorter, filter });
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
          <Modal title="新建" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <Form
              form={form}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              initialValues={{ keyType: '0' }}
            >
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: '请输入名称!' }]}
              >
                <Input placeholder="请输入名称!" />
              </Form.Item>
              <Form.Item
                label="所属区域"
                name="area"
                rules={[{ required: true, message: '请选择!' }]}
              >
                <Cascader
                  options={options}
                  placeholder="请上传"
                  onChange={(value, selectedOptions: any) => {
                    console.log('selectedOptions', selectedOptions);
                    setSelectedArea(selectedOptions);
                  }}
                />
              </Form.Item>
              <Form.Item label="上传" name="file" rules={[{ required: true, message: '请选择!' }]}>
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或将文件拖到这里上传</p>
                  <p className="ant-upload-hint">支持扩展名: .rar,.zip,.doc,.docx,.pdf</p>
                </Dragger>
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Input, Select } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;

import { getList, deleteProject, batchDeleteProject } from '@/services/projectManage';
import { TableList } from '@/services/systemSetting';
import styles from './index.less';
const FormComp = (props: any) => {
  const { dispatch, handleOnSetParams } = props;
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const columns: ProColumns<any>[] = [
    {
      title: '表单名称',
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      // valueType: 'date',
    },
    {
      title: '所属分类',
      key: 'designCompany',
      dataIndex: 'designCompany',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '备注',
      key: 'designCompany',
      dataIndex: 'designCompany',
      sorter: true,
      hideInSearch: true,
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
      render: (text, record) => [
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
      title: '您正在删除项目记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>项目删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        deleteProject(record._id).then((res) => {
          if (res.code == 200) {
            actionRef.current?.reloadAndRest?.();
            message.success('删除项目成功!');
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // 编辑行
  const handleOnEditRow = (record: any) => {
    confirm({
      title: '您正在编辑项目记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>
            要想进行编辑,请先删除本项目对应的流量调查记录和预测记录,项目编辑后再重新调查和预测。
          </span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        if (dispatch) {
          history.push({
            pathname: '/projectManage/editProject',
            query: {
              id: record._id,
            },
          });
          dispatch({
            type: 'projectManageAndEditProject/saveCurrentStep',
            payload: '0',
          });
          dispatch({
            type: 'projectManageAndEditProject/saveCurrentRecord',
            payload: record,
          });
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  /**
   * @name: 新建模版
   */
  const handleOnRouteTo = () => {
    history.push('/systemSettings/formulaManage/addFormula');
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
          options={false}
          toolBarRender={() => [
            // <Button type="primary" key="1" icon={<PlusOutlined />} onClick={handleOnRouteTo}>
            //   新建
            // </Button>,
            // <Button key="2" onClick={handleOnMoreRemove}>
            //   批量删除
            // </Button>,
          ]}
          pagination={{
            // showQuickJumper: true,
            pageSize: 10,
          }}
          request={async (params, sorter, filter) => {
            const res = await TableList({ ...params, sorter, filter });
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
            // onChange: (_, selectedRows) => setSelectedRows(selectedRows),
            onChange: (selectedRowKeys, selectedRows) => {
              if (history.location.pathname == '/systemSettings/formManage') {
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
      </Col>
    </Row>
  );
};
export { FormComp };
export default (props: any) => {
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <FormComp />
      </div>
    </PageContainer>
  );
};

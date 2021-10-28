import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal, Row, Col } from 'antd';
const { confirm } = Modal;
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { getList, deleteProject, batchDeleteProject } from '@/services/v2/project';
// import { StateType } from './EditProject/model';
import styles from './index.less';

interface ProjectManageProps {
  stepData: any;
  current: any;
  dispatch?: Dispatch;
}
const ProjectManage: React.FC<ProjectManageProps> = (props) => {
  const { dispatch } = props;
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const columns: ProColumns<any>[] = [
    {
      title: '项目名称',
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      render: (text, record) => [
        <span style={{ cursor: 'pointer' }} onClick={() => handleOnRecordDetail(record)}>
          {text}
        </span>,
      ],
    },
    {
      title: '设计单位',
      key: 'designCompany',
      dataIndex: 'designCompany',
      sorter: true,
      search: false,
    },
    {
      title: '创建时间',
      key: 'designAt',
      dataIndex: 'designAt',
      sorter: true,
      search: false,
      valueType: 'date',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (text, record) => [
        <a key="1" onClick={() => handleOnRemoveRow(record)}>
          删除
        </a>,
        <a key="2" onClick={() => handleOnEditRow(record)}>
          编辑
        </a>,
        <a
          key="3"
          onClick={() => {
            history.push('/reportManage');
          }}
        >
          交评报告
        </a>,
      ],
    },
  ];
  const handleOnRecordDetail = (record: any) => {
    history.push({
      pathname: '/projects/projectManage/projectDetail',
      query: {
        id: record._id,
      },
    });
  };
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
          // dispatch({
          //   type: 'projectManageAndEditProject/saveCurrentStep',
          //   payload: '0',
          // });
          // dispatch({
          //   type: 'projectManageAndEditProject/saveCurrentRecord',
          //   payload: record,
          // });
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const handleOnRouteTo = () => {
    history.push('/projects/projectManage/addProject');
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
    <PageContainer>
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
              <Button type="primary" key="1" icon={<PlusOutlined />} onClick={handleOnRouteTo}>
                新建项目
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
              const res = await getList({
                ...params,
                sorter,
                filter,
              });
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
        </Col>
      </Row>
    </PageContainer>
  );
};

export default connect(({ projectManageAndEditProject }: { projectManageAndEditProject: any }) => ({
  stepData: projectManageAndEditProject.step,
  current: projectManageAndEditProject.current,
}))(ProjectManage);

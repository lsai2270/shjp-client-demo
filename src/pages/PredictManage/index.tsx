import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Row, Col, Modal } from 'antd';
const { confirm } = Modal;
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
// import UpdateForm, { FormValueType } from './components/UpdateForm';
import {
  getList,
  getDetailById,
  deletePredict,
  create,
  batchDeletePredict,
} from '@/services/predictManage';
import styles from './index.less';
import { StateType } from './EditPredict/model';
function getPostData(record: any) {
  let obj: any = {
    name: record.name + '-副本',
    netId: record.netId,
    projectId: record.projectId,
    projectName: record.projectName,
    quicklywayCapacity: record.quicklywayCapacity,
    expresswayCapacity: record.expresswayCapacity,
    mainRoadCapacity: record.mainRoadCapacity,
    subRoadCapacity: record.subRoadCapacity,
    accessRoadCapacity: record.accessRoadCapacity,
    file: record.file,
    tripDivision: record.tripDivision,
    linkInfo: record.linkInfo.map((link: any) => link._id),
    nodeInfo: record.nodeInfo.map((node: any) => node._id),
    zoneInfo: record.zoneInfo.map((zone: any) => zone._id),
    roadTrafficCurrentStatus: record.roadTrafficCurrentStatus,
    currentOD: record.currentOD,
    currentSaturability: record.currentSaturability.map((item: any) => {
      delete item['_id'];
      return item;
    }),
    assessTypeId: record.assessTypeId,
    assessType: record.assessType,
    assessYear: record.assessYear,
    increaseRate: record.increaseRate,
    // assessTrafficProduction: record.assessTrafficProduction,
    // assessTrafficAtrraction: record.assessTrafficAtrraction,
    plotTraffic: record.plotTraffic,
    spiderDiagram: record.spiderDiagram,
  };
  if (record.spiderDiagramParams) {
    obj.spiderDiagramParams = record.spiderDiagramParams;
  }
  if (record.recentOD) {
    obj.recentOD = record.recentOD;
  }
  if (record.futureOD) {
    obj.futureOD = record.futureOD;
  }
  return obj;
}
interface TableListManageProps {
  stepData: any;
  current: any;
  dispatch?: Dispatch;
}
const TableList: React.FC<TableListManageProps> = (props) => {
  const { dispatch } = props;

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const columns: ProColumns<any>[] = [
    {
      title: '预测名称',
      key: 'name',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: '项目名称',
      key: 'projectName',
      dataIndex: 'projectName',
      sorter: true,
      // hideInSearch: true,
    },
    {
      title: '预测时间',
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
      width: 240,
      render: (_, record) => [
        <a
          key="1"
          onClick={() => {
            handleOnDelete(record);
          }}
        >
          删除
        </a>,
        <a
          key="2"
          onClick={() => {
            handleOnCopeList(record);
          }}
        >
          复制
        </a>,
        <a
          key="3"
          onClick={() => {
            handleOnRePredict(record);
          }}
        >
          重新预测
        </a>,
        <a
          key="4"
          onClick={() => {
            history.push({
              pathname: '/predictManage/predictResult',
              query: {
                id: record._id,
                projectId: record.projectId,
              },
            });
          }}
        >
          预测结果
        </a>,
      ],
    },
  ];
  // 删除
  const handleOnDelete = (record: any) => {
    confirm({
      title: '您正在删除预测记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>
            删除后对应预测结果将同时删除，交评报告如有引用，相应内容也将清空。
          </span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        deletePredict(record._id).then((res) => {
          if (res.code == 200) {
            message.success('预测记录删除成功!');
            actionRef.current?.reloadAndRest?.();
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // 复制
  const handleOnCopeList = (record: any) => {
    confirm({
      title: '您正在复制预测记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>
            此操作将会复制当前记录及其对应的预测结果，生成一条新的记录。
          </span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      async onOk() {
        const res1 = await getDetailById(record._id);
        let params = getPostData(res1.data);
        create(params).then((res) => {
          if (res.code == 200) {
            message.success('复制成功!');
            actionRef.current?.reloadAndRest?.();
          } else {
            message.warning(res.msg);
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // 重新预测
  const handleOnRePredict = (record: any) => {
    confirm({
      title: '您正在重新预测。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>
            重新预测后原有预测结果将更新，交评报告如有引用，相应内容也将同步更新。
          </span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        history.push({
          pathname: '/predictManage/editPredict',
          query: {
            id: record._id,
          },
        });
        // if (dispatch) {
        //   dispatch({
        //     type: 'predictManageAndEditPredict/saveCurrentStep',
        //     payload: '0',
        //   });
        //   dispatch({
        //     type: 'predictManageAndEditPredict/setCurrentPredict',
        //     payload: record,
        //   });
        // }
      },
    });
  };
  // 新建
  const handleOnRouteTo = () => {
    history.push('/predictManage/addPredict');
  };
  // 批量删除
  const handleOnMoreRemove = () => {
    confirm({
      title: '您正在批量删除预测。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>预测删除后，相关信息将无法恢复</span>
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
        batchDeletePredict(params).then((res) => {
          if (res.code == 200) {
            setSelectedRows([]);
            message.success('批量删除预测成功!');
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
      <Row className={styles.predictContainer}>
        <Col span={24}>
          <ProTable
            headerTitle=""
            actionRef={actionRef}
            rowKey={(record) => record._id}
            search={{
              span: 5,
            }}
            options={false}
            toolBarRender={() => [
              <Button type="primary" key="1" icon={<PlusOutlined />} onClick={handleOnRouteTo}>
                新建预测
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
                fields:
                  '-currentSaturability -linkInfo -nodeInfo -recentOD -roadTrafficCurrentStatus -tripDivision -currentOD -zoneInfo',
              });
              // console.log(res);
              return {
                data: res.data.data,
                success: true,
                total: res.data.count,
              };
            }}
            columns={columns}
            rowSelection={{
              onChange: (_, selectedRows) => setSelectedRows(selectedRows),
            }}
            // tableAlertOptionRender={({ onCleanSelected }) => {
            //   return (
            //     <>
            //       <Space size={24}>
            //         <span>
            //           <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
            //             取消选择
            //           </a>
            //         </span>
            //       </Space>
            //       <Space size={24}>
            //         <span>
            //           <a
            //             style={{ marginLeft: 8 }}
            //             onClick={async () => {
            //               await handleRemove(selectedRowsState);
            //               setSelectedRows([]);
            //               actionRef.current?.reloadAndRest?.();
            //             }}
            //           >
            //             <FormattedMessage
            //               id="pages.searchTable.batchDeletion"
            //               defaultMessage="批量删除"
            //             />
            //           </a>
            //         </span>
            //       </Space>
            //     </>
            //   );
            // }}
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default connect(
  ({ predictManageAndEditPredict }: { predictManageAndEditPredict: StateType }) => ({
    current: predictManageAndEditPredict.current,
  }),
)(TableList);

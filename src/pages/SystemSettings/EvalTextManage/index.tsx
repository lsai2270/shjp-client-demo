import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { Button, message, Modal, Row, Col, Input, Select } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
import { cycleTextList, deleteCycleTextList } from '@/services/systemSetting';
import styles from './index.less';
const EvalTextComp = (props: any) => {
  const { dispatch, handleOnSetParams } = props;
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const columns: ProColumns<any>[] = [
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '关联模版',
      key: 'template',
      dataIndex: 'template',
    },
    {
      title: '关联目录',
      key: 'section',
      dataIndex: 'section',
      search: false,
    },
    {
      title: '创建时间',
      key: 'atCreated',
      dataIndex: 'atCreated',
      search: false,
      valueType: 'date',
      width: 120,
    },
  ];
  if (history.location.pathname == '/systemSettings/evalTextManage') {
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
      title: '您正在删除循环文本记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>循环文本记录删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        deleteCycleTextList(record._id).then((res) => {
          if (res.code == 200) {
            actionRef.current?.reloadAndRest?.();
            message.success('删除循环文本成功!');
          }
        });
      },
    });
  };
  // 编辑行
  const handleOnEditRow = (record: any) => {
    confirm({
      title: '您正在编辑循环文本。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>循环文本编辑后,会对报告产生影响。</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        history.push({
          pathname: '/systemSettings/evalTextManage/addEvalText',
          query: {
            id: record._id,
          },
        });
      },
    });
  };

  /**
   * @name: 新建模版
   */
  const handleOnRouteTo = () => {
    history.push('/systemSettings/evalTextManage/addEvalText');
  };
  const handleOnMoreRemove = () => {
    confirm({
      title: '您正在批量删除循环文本记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>循环文本记录删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        console.log('selectedRows', selectedRowKeys);
        let params = {
          ids: selectedRowKeys.map((item: any) => item._id),
        };
        // batchDeleteProject(params).then((res) => {
        //   if (res.code == 200) {
        //     setSelectedRowKeys([]);
        //     message.success('批量删除项目成功!');
        //     actionRef.current?.reloadAndRest?.();
        //   }
        // });
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
            span: history.location.pathname == '/systemSettings/evalTextManage' ? 5 : 8,
          }}
          options={false}
          toolBarRender={() => {
            if (history.location.pathname == '/systemSettings/evalTextManage') {
              return [
                <Button type="primary" key="1" icon={<PlusOutlined />} onClick={handleOnRouteTo}>
                  新建循环文本
                </Button>,
                <Button key="2" onClick={handleOnMoreRemove}>
                  批量删除
                </Button>,
              ];
            }
            return [];
          }}
          pagination={{
            // showQuickJumper: true,
            pageSize: 10,
          }}
          request={async (params, sorter, filter) => {
            const res = await cycleTextList({ ...params, sorter, filter });
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
            // preserveSelectedRowKeys: true,
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              if (history.location.pathname == '/systemSettings/evalTextManage') {
                setSelectedRows(selectedRows);
                setSelectedRowKeys(selectedRowKeys);
              } else {
                handleOnSetParams(selectedRows[selectedRows.length - 1]);
                setSelectedRows([selectedRows[selectedRows.length - 1]]);
                setSelectedRowKeys([selectedRowKeys[selectedRows.length - 1]]);
              }
            },
          }}
        />
      </Col>
    </Row>
  );
};
export { EvalTextComp };
export default (props: any) => {
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>
        <EvalTextComp />
      </div>
    </PageContainer>
  );
};

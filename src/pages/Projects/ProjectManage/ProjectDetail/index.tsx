import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal, Row, Col, Tabs, Drawer } from 'antd';
const { confirm } = Modal;
const { TabPane } = Tabs;
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { getList, deleteProject, batchDeleteProject } from '@/services/projectManage';
// import { StateType } from './EditProject/model';
import styles from './index.less';

import PredictResult from '../../../PredictManage/PredictResult/newResult';
import { StepOne, StepTwo, StepThree, StepFour } from './step';
export default function index() {
  const { id } = history.location.query;
  const [tabsKey, setTabsKey] = useState('1');
  const handelOnTabsChange = (key: any) => {
    setTabsKey(key);
  };
  return (
    <PageContainer title={false}>
      <div className={styles.detailContainer}>
        <Tabs activeKey={tabsKey} onChange={handelOnTabsChange} type="card">
          <TabPane tab="基本信息" key="1">
            <StepOne />
          </TabPane>
          <TabPane tab="周边道路" key="2">
            <div style={{ position: 'relative', height: '75vh' }}>
              <StepTwo />
            </div>
          </TabPane>
          <TabPane tab="周边地铁" key="3">
            <div style={{ position: 'relative', height: '75vh' }}>
              <StepThree />
            </div>
          </TabPane>
          <TabPane tab="周边交叉口" key="4">
            <div style={{ position: 'relative', height: '75vh' }}>
              <StepFour />
            </div>
          </TabPane>
          <TabPane tab="预测" key="5">
            <PredictResult />
          </TabPane>
          <TabPane tab="报告" key="6">
            Content of Tab Pane 3
          </TabPane>
        </Tabs>
      </div>
    </PageContainer>
  );
}

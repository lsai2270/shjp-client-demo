import React, { useState, useRef } from 'react';
import { Tabs } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
const { TabPane } = Tabs;
import StandardComp from './standardComp';
import ParamsComp from './paramsComp';
import styles from './index.less';
export default (props: any) => {
  const [key, setKey] = useState('1');
  const handleOnTabsChange = (key: string) => {
    setKey(key);
  };
  return (
    <PageContainer className={styles.container}>
      <div className={styles.content}>
        <Tabs activeKey={key} type="card" onChange={handleOnTabsChange}>
          <TabPane tab="规范标准" key="1">
            <StandardComp />
          </TabPane>
          <TabPane tab="涉及参数" key="2">
            <ParamsComp />
          </TabPane>
        </Tabs>
      </div>
    </PageContainer>
  );
};

import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
export default () => {
  return (
    <PageContainer className={styles.container}>
      <div className={styles.contentContainer}>研究依据</div>
    </PageContainer>
  );
};

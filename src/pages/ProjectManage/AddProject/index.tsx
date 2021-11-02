import React, { useState, useEffect } from 'react';
import { Card, Steps } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch } from 'umi';
import { StateType } from './model';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import styles from './style.less';

const { Step } = Steps;

interface AddProjectProps {
  dispatch?: Dispatch;
  current: StateType['current'];
}

const getCurrentStepAndComponent = (current?: string) => {
  switch (current) {
    case '1':
      return { step: 1, component: <Step2 /> };
    case '2':
      return { step: 2, component: <Step3 /> };
    case '3':
      return { step: 3, component: <Step4 /> };
    case '4':
      return { step: 4, component: <Step5 /> };
    default:
      return { step: 0, component: <Step1 /> };
  }
};

const AddProject: React.FC<AddProjectProps> = (props) => {
  const { current, dispatch } = props;
  const [stepComponent, setStepComponent] = useState<React.ReactNode>(<Step1 />);
  const [currentStep, setCurrentStep] = useState<number>(0);
  useEffect(() => {
    return () => {
      if (dispatch) {
        dispatch({
          type: 'projectManageAndEditProject/initStepForm',
          payload: '0',
        });
      }
    };
  }, []);
  useEffect(() => {
    const { step, component } = getCurrentStepAndComponent(current);
    setCurrentStep(step);
    setStepComponent(component);
  }, [current]);

  return (
    <PageContainer content="您可以在这里创建一个新项目。">
      <Card bordered={false}>
        <>
          <Steps current={currentStep} className={styles.steps}>
            <Step title="填写项目信息" />
            <Step title="设置周边道路" />
            <Step title="设置周边待建项目" />
            <Step title="选择报告模板" />
            <Step title="完成" />
          </Steps>
          <div className={styles.container}>{stepComponent}</div>
        </>
      </Card>
    </PageContainer>
  );
};

export default connect(
  ({ projectManageAndAddProject }: { projectManageAndAddProject: StateType }) => ({
    current: projectManageAndAddProject.current,
  }),
)(AddProject);

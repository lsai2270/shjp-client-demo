import React, { useState, useEffect } from 'react';
import { Card, Steps } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch, history } from 'umi';
import { StateType } from './model';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import styles from './style.less';
import { getDetailById } from '@/services/predictManage';
const { Step } = Steps;

interface EditPredictProps {
  current: StateType['current'];
  dispatch?: Dispatch;
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

const EditProject: React.FC<EditPredictProps> = ({ current, dispatch }) => {
  const [stepComponent, setStepComponent] = useState<React.ReactNode>(<Step1 />);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const { step, component } = getCurrentStepAndComponent(current);
    setCurrentStep(step);
    setStepComponent(component);
  }, [current]);
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/saveCurrentStep',
        payload: '0',
      });
      const { id } = history.location.query;
      if (id) {
        getDetailById(id).then((res) => {
          if (res.code == 200) {
            dispatch({
              type: 'predictManageAndEditPredict/setCurrentPredict',
              payload: res.data,
            });
          }
        });
      }
    }
    return () => {
      if (dispatch) {
        dispatch({
          type: 'predictManageAndEditPredict/initStepForm',
          payload: '0',
        });
      }
    };
  }, []);
  return (
    <PageContainer content="您可以在此进行交通量或服务水平的预测。">
      <Card bordered={false} style={{ overflow: 'hidden' }} className={styles.addPredictContainer}>
        <>
          <Steps current={currentStep} className={styles.steps}>
            <Step title="设置基础参数" />
            <Step title="设置路网" />
            <Step title="设置现状OD矩阵" />
            <Step title="设置未来OD矩阵" />
            <Step title="完成" />
          </Steps>
          <div className={styles.container}>{stepComponent}</div>
        </>
      </Card>
    </PageContainer>
  );
};

export default connect(
  ({ predictManageAndEditPredict }: { predictManageAndEditPredict: StateType }) => ({
    current: predictManageAndEditPredict.current,
  }),
)(EditProject);

import { Button, Result, Descriptions, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, Dispatch, history } from 'umi';
import { StateType } from '../../model';
import styles from './index.less';

interface Step4Props {
  data?: StateType['step'];
  dispatch?: Dispatch;
}

const Step5: React.FC<Step4Props> = (props) => {
  const { data, dispatch } = props;
  if (!data) {
    return null;
  }
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    let timer = setInterval(() => {
      if (countdown == 0) {
        clearInterval(timer);
        handleClearLocalStorage();
        history.push('/predictManage');
        if (dispatch) {
          dispatch({
            type: 'predictManageAndAddPredict/saveCurrentStep',
            payload: '0',
          });
        }
      }
      let newCountdown = countdown - 1;
      setCountdown(newCountdown);
    }, 1000);
  }, [countdown]);
  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const onFinish = () => {
    handleClearLocalStorage();
    history.push('/predictManage');
    if (dispatch) {
      dispatch({
        type: 'predictManageAndAddPredict/saveCurrentStep',
        payload: '0',
      });
    }
  };
  const handleClearLocalStorage = () => {
    localStorage.removeItem('file');
    localStorage.removeItem('step1Form');
    localStorage.removeItem('step2Form');
    localStorage.removeItem('mapInfo');
  };
  const extra = (
    <>
      <Button type="primary" onClick={onFinish}>
        完成
      </Button>
    </>
  );
  return (
    <Result
      status="success"
      title="预测成功"
      subTitle={`${countdown}秒后自动跳转到预测结果页面.`}
      extra={extra}
      className={styles.result}
    ></Result>
  );
};

export default connect(
  ({ predictManageAndAddPredict }: { predictManageAndAddPredict: StateType }) => ({
    data: predictManageAndAddPredict.step,
  }),
)(Step5);

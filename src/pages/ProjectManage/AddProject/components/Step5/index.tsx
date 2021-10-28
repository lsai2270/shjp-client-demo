import { Button, Result, Descriptions, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, Dispatch, history } from 'umi';
import { StateType } from '../../model';
import styles from './index.less';

interface Step3Props {
  data?: StateType['step'];
  dispatch?: Dispatch;
}

const Step3: React.FC<Step3Props> = (props) => {
  const { data, dispatch } = props;
  if (!data) {
    return null;
  }
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    let timer = setInterval(() => {
      if (countdown == 0) {
        clearInterval(timer);
        history.push('/projectManage');
        if (dispatch) {
          dispatch({
            type: 'projectManageAndAddProject/saveCurrentStep',
            payload: '0',
          });
        }
        return;
      }
      let newCountdown = countdown - 1;
      setCountdown(newCountdown);
      clearInterval(timer);
    }, 1000);
  }, [countdown]);

  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const onFinish = () => {
    history.push('/projectManage');
    if (dispatch) {
      dispatch({
        type: 'projectManageAndAddProject/saveCurrentStep',
        payload: '0',
      });
    }
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
      title="创建成功"
      subTitle={`${countdown}秒后自动跳转到报告编辑页面，建议先进行交通量调查和预测再编写报告`}
      extra={extra}
      className={styles.result}
    ></Result>
  );
};

export default connect(
  ({ projectManageAndAddProject }: { projectManageAndAddProject: StateType }) => ({
    data: projectManageAndAddProject.step,
  }),
)(Step3);

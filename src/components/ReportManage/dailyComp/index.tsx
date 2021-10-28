import React, { useState, useEffect } from 'react';
import { Timeline, message, Empty } from 'antd';
import { connect, Dispatch, history } from 'umi';
import { userLogList } from '@/services/reportManage';
import moment from 'moment';
import styles from './index.less';

export default (props: any) => {
  // const { id, type } = history?.location?.query;
  const { projectId, reflashDaily, hanldeOnGetTemplate } = props;
  const [logsArr, setLogsArr] = useState<any[]>([]);
  const [logsTypes, setLogsTypes] = useState<any>({
    update: '更新',
    create: '创建',
  });
  useEffect(() => {
    handleOnGetLogList();
  }, []);
  useEffect(() => {
    handleOnGetLogList();
  }, [reflashDaily]);
  const handleOnGetLogList = () => {
    userLogList({
      page: 1,
      limit: 100,
      type: 'report',
      projectId: projectId,
      // reportId: id,
    }).then((res) => {
      // console.log(res);
      if (res.code == 200) {
        setLogsArr(res.data.data);
      } else {
        message.warning('日志获取失败!');
      }
    });
  };
  // 跳转
  const handleOnRouter = (item: any) => {
    if (item.reportId) {
      history.push({
        pathname: '/reportManage/create',
        query: {
          id: item.reportId,
          type: item.reportType,
        },
      });
      hanldeOnGetTemplate('init', item.reportId);
      message.success('草稿加载成功!');
    }
  };
  return (
    <div className={styles.container}>
      <h2>日志</h2>
      <div>
        {logsArr.length == 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline>
            {logsArr.map((item: any, index: number) => {
              return (
                <Timeline.Item key={index}>
                  {index < 5 ? (
                    <span className={styles.timeline} onClick={() => handleOnRouter(item)}>
                      {item.reportType == 1 ? '草稿' : '正文'},编写人：{item.userName}
                      {logsTypes[item.action]}于
                      {moment(item.atCreated).format('YYYY-MM-DD hh:mm:ss')}
                    </span>
                  ) : (
                    <>
                      {item.reportType == 1 ? '草稿' : '正文'},编写人：{item.userName}
                      {logsTypes[item.action]}于
                      {moment(item.atCreated).format('YYYY-MM-DD hh:mm:ss')}
                    </>
                  )}
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </div>
    </div>
  );
};

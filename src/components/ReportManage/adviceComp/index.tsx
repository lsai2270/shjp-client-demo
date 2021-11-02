import React, { useState, useEffect } from 'react';
import { Tree, Input, message, Tooltip, Space, Button, Avatar, Image } from 'antd';
const { TextArea } = Input;
import {
  LeftOutlined,
  RightOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import styles from './index.less';
export default () => {
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [AllAdvices, setAllAdvices] = useState<any>([]);
  const [advices, setAdvices] = useState<any>(['测试测试']);
  const [adviceValue, setAdviceValue] = useState('');
  const [adviceVisible, setAdviceVisible] = useState<boolean>(false);
  const [replyValue, setReplyValue] = useState('');
  const [replyVisible, setReplyVisible] = useState<boolean>(false);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  let dataArr = [
    {
      name: '测试测试测试测试测试测试',
      flag: true,
    },
    // {
    //   name: '测试测试测试测试测试测试',
    //   flag: false,
    // },
    // {
    //   name: '测试测试测试测试测试测试',
    //   flag: true,
    // },
    // {
    //   name: '测试测试测试测试测试测试',
    //   flag: true,
    // },
    // {
    //   name: '测试测试测试测试测试测试',
    //   flag: false,
    // },
  ];
  // 前一页
  const handleOnPagePre = () => {
    if (current > 1) {
      setCurrent(current - 1);
    } else {
      message.warning('这已经是第一页了!');
    }
  };
  //后一页
  const handleOnPageBack = () => {
    if (current < total) {
      setCurrent(current + 1);
    } else {
      message.warning('这已经是最后一页了!');
    }
  };
  // 弹窗方法
  const handleOnSetModalVisible = (visible: boolean) => {
    setModalVisible(visible);
  };
  // 添加意见
  const handleOnAddAdvices = () => {
    let newAddvices = advices.concat([]);
    newAddvices.push(adviceValue);
    setAdvices(newAddvices);
    setAdviceValue('');
  };
  // 提交意见
  const handleOnSubmitAddvice = () => {
    let newAllAdvices = AllAdvices.concat([advices]);
    setAllAdvices(newAllAdvices);
    setAdviceVisible(false);
  };
  // 意见回复
  const handleOnReplyAdvices = () => {
    setReplyVisible(false);
    setReplyValue('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headAndConten}>
        <div className={styles.flexBetween}>
          {(advices?.length == 0 || adviceVisible) && (
            <div>
              <h2>审查意见</h2>
            </div>
          )}
          {advices?.length > 0 && !adviceVisible && (
            <>
              <div className={styles.userInfo}>
                <Space>
                  <span>
                    <Avatar
                      size={50}
                      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                      src={
                        <Image src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                      }
                    />
                  </span>
                  <span className={styles.name}>傅首尔</span>
                </Space>
              </div>
              <div style={{ lineHeight: '43px', display: 'flex' }}>
                <span style={{ marginTop: '5px' }}>
                  {current} / {total}
                </span>
                <span style={{ marginTop: '7px' }}>
                  {current != 1 && (
                    <LeftOutlined onClick={handleOnPagePre} className={styles.iconStyle} />
                  )}
                  {current != total && (
                    <RightOutlined onClick={handleOnPageBack} className={styles.iconStyle} />
                  )}
                </span>
              </div>
            </>
          )}
        </div>
        <div className={styles.currentPageTitle}>
          <Space>
            <span>当前章节: </span>
            <span>1.1.2 项目概述</span>
          </Space>
        </div>
        <div className={styles.contentPage}>
          {/* 无数据 */}
          {advices?.length == 0 && !adviceVisible && (
            <div className={styles.nullTips}>
              <h3>很抱歉,暂未查询到相关数据</h3>
            </div>
          )}
          {/* 添加意见 */}
          {adviceVisible && (
            <div className={styles.addAdvice}>
              <ul>
                {advices.map((item: any, index: number) => {
                  return (
                    <li key={index} className={styles.listItem}>
                      <span>
                        {`${index + 1}、${item}`}
                        {/* 1、办公工作人员日出行量计算过程需要细化办公工作人员日出行量计算过程需要细化 */}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <TextArea
                rows={4}
                placeholder="请输入您的审批意见"
                value={adviceValue}
                onChange={(e) => {
                  setAdviceValue(e.target.value);
                }}
              />
              <div style={{ marginTop: '20px' }}>
                <Button
                  onClick={handleOnAddAdvices}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  添加
                </Button>
              </div>
            </div>
          )}
          {/* 意见 */}
          {advices?.length > 0 && !adviceVisible && !replyVisible && !detailVisible && (
            <div
              className={styles.adviceContain}
              onClick={() => {
                setDetailVisible(true);
              }}
            >
              {/* <Space> */}
              <ExclamationCircleFilled className={styles.waringIcon} />
              <span className={styles.adviceContent}>{advices[current - 1]}</span>
              {/* </Space> */}
              <div className={styles.adviceDate}>2020.12.31 13.25.56</div>
            </div>
          )}
          {/* 意见回复详情 */}
          {detailVisible && (
            <div className={styles.replayContain}>
              <div>
                <CheckCircleFilled className={styles.successIcon} />
                <span className={styles.replyContent}>{advices[current - 1]}</span>
                <div className={styles.replyDate}>2020.12.31</div>
              </div>
              <div className={styles.replys}>
                <div>
                  <div>
                    <a>张晓明</a>的回复
                  </div>
                  <div className={styles.replyConentInfo}></div>
                  <div className={styles.replyDate}>2020.12.31</div>
                </div>
              </div>
            </div>
          )}
          {replyVisible && (
            <div style={{ padding: '10px' }}>
              <TextArea
                rows={8}
                placeholder="请输入反馈意见"
                value={replyValue}
                onChange={(e) => {
                  setReplyValue(e.target.value);
                }}
              />
            </div>
          )}
        </div>
      </div>
      {/* 底部按钮 */}
      <div className={styles.footerTools}>
        {advices?.length == 0 && !adviceVisible && (
          <span
            className={styles.btnTitle}
            onClick={() => {
              setAdviceVisible(true);
            }}
          >
            意见录入
          </span>
        )}
        {/* 添加意见按钮 */}
        {adviceVisible && (
          <div className={styles.btnsGroup}>
            <span
              className={styles.cancelBtn}
              onClick={() => {
                setAdviceVisible(false);
                setAdviceValue('');
                // setAdvices([]);
              }}
            >
              取消
            </span>
            <span>|</span>
            <span className={styles.confirmBtn} onClick={handleOnSubmitAddvice}>
              提交
            </span>
          </div>
        )}
        {/* 意见底部按钮 */}
        {advices?.length > 0 && !adviceVisible && !replyVisible && !detailVisible && (
          <div className={styles.btnsGroup}>
            <span
              className={styles.cancelBtn}
              onClick={() => {
                setAdviceVisible(true);
              }}
            >
              意见录入
            </span>
            <span>|</span>
            <span
              className={styles.confirmBtn}
              onClick={() => {
                setReplyVisible(true);
              }}
            >
              回复
            </span>
          </div>
        )}
        {/* 添加意见回复按钮 */}
        {replyVisible && (
          <div className={styles.btnsGroup}>
            <span
              className={styles.cancelBtn}
              onClick={() => {
                setReplyVisible(false);
                setReplyValue('');
              }}
            >
              取消
            </span>
            <span>|</span>
            <span className={styles.confirmBtn} onClick={handleOnReplyAdvices}>
              提交
            </span>
          </div>
        )}
        {detailVisible && (
          <span
            className={styles.btnTitle}
            onClick={() => {
              setDetailVisible(false);
            }}
          >
            返回
          </span>
        )}
      </div>
    </div>
  );
};

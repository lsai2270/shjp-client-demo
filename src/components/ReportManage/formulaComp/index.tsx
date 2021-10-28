import React, { useState, useEffect, useRef } from 'react';
import { history } from 'umi';
import { Tree, Input, message, Tooltip, Space, Modal } from 'antd';
const { Search } = Input;
import {
  LeftOutlined,
  RightOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
  EditOutlined,
} from '@ant-design/icons';
import styles from './index.less';

import FormulaModal from './formulaModal';
import { FormulaComp } from '@/pages/SystemSettings/FormulaManage';
export default (props: any) => {
  const childRef: any = useRef();
  const { id, type } = history?.location?.query;
  const { sectionInfo, setSectionInfo, catalogueKey, projectId, contentsData } = props;
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState<any>(0);
  const [currentCatalogueName, setCurrentCatalogueName] = useState<any>('');
  const [selectedCatalogue, setSelectedCatalogue] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [flag, setFlag] = useState(false);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [formulaInfo, setFormulaInfo] = useState<any>([]);
  const [nextVisible, setNextVisible] = useState(true);

  useEffect(() => {
    if (catalogueKey) {
      // console.log("sectionInfo",sectionInfo);
      let newSectionInfo: any = sectionInfo.filter((item: any) => item._id == catalogueKey);
      console.log('newSectionInfo', newSectionInfo);
      // setCurrentCatalogueName(newSectionInfo[0]?.name);
      setSelectedCatalogue(newSectionInfo[0]);
      setFormulaInfo(newSectionInfo[0]?.formulaInfo);
      setNextVisible(true);
    }
  }, [sectionInfo, catalogueKey]);

  useEffect(() => {
    if (formulaInfo?.length > 0) {
      setTotal(formulaInfo?.length);
      let openModalVisible = true;
      // 判断结果是否有值
      let newFormulaInfo = formulaInfo.map((item: any, index: number) => {
        let resulrParams = item.params.filter((paramItem: any) => paramItem.type == 3);
        resulrParams = resulrParams[0];
        let resultValue: any = '';
        if (resulrParams.isPrefix == '1') {
          let newkey = `${resulrParams.params}_${projectId}_${selectedCatalogue?.plotId}_${selectedCatalogue?.functionalPartitioningBuildArea}`;
          for (const key in contentsData) {
            if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
              const element = contentsData[key];
              if (element.code == newkey) {
                if (type == 1) {
                  resultValue = element?.draftValue ? element?.draftValue[id] : '';
                } else {
                  resultValue = element?.value || '';
                }
              }
            }
          }
        } else {
          if (type == 1) {
            resultValue = contentsData[resulrParams.paramsId]?.draftValue
              ? contentsData[resulrParams.paramsId]?.draftValue[id]
              : '';
          } else if (type == 2) {
            resultValue = contentsData[resulrParams.paramsId]?.value || '';
          }
        }
        // console.log('resultValue------>', resultValue);
        if (!history.location.pathname.includes('/createTemplate')) {
          if (resultValue == '' && openModalVisible && nextVisible) {
            setModalVisible(true);
            setCurrentIndex(index);
            // setTimeout(() => {
            //   updateChildIndex(index);
            // }, 0);
            openModalVisible = false;
            setNextVisible((nextVisible) => {
              return false;
            });
          }
        }
        // console.log("resultValue",resultValue);
        return {
          ...item,
          resultValue,
        };
      });
      setCurrentData(newFormulaInfo);
    } else {
      setTotal(1);
      setCurrentData([]);
    }
  }, [formulaInfo, contentsData]);
  // const updateChildIndex = (index: any) => {
  //   // changeVal就是子组件暴露给父组件的方法
  //   childRef.current.handleOnSetIndex(index);
  // };
  // 前一页
  const handleOnPagePre = () => {
    if (current > 1) {
      setCurrentData(formulaInfo.slice((current - 2) * 5, (current - 1) * 5));
      setCurrent(current - 1);
    } else {
      message.warning('这已经是第一页了!');
    }
  };
  //后一页
  const handleOnPageBack = () => {
    if (current < total) {
      setCurrentData(formulaInfo.slice(current * 5, (current + 1) * 5));
      setCurrent(current + 1);
    } else {
      message.warning('这已经是最后一页了!');
    }
  };
  // 弹窗方法
  const handleOnSetModalVisible = (visible: boolean) => {
    setModalVisible(visible);
  };
  /** 确认弹窗
   * @name:
   */
  const handleOk = () => {
    const newSectionInfo = sectionInfo.map((item: any) => {
      if (item._id == catalogueKey) {
        item.formulaInfo = selectedData;
      }
      return item;
    });
    setSectionInfo(newSectionInfo);
    setFlag(false);
    setIsModalVisible(false);
    setSelectedData([]);
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setFlag(false);
    setIsModalVisible(false);
    setSelectedData([]);
  };
  /**
   * @name: 选择公式
   */
  const handleOnSelected = (selectedData: any[]) => {
    setSelectedData(selectedData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.flexBetween}>
        <div>
          <h2>公式</h2>
        </div>
        <div style={{ lineHeight: '43px', display: 'flex' }}>
          <span style={{ marginRight: '20px' }}>
            {history.location.pathname.includes('/createTemplate') && (
              <a
                onClick={() => {
                  setIsModalVisible(true);
                  setTimeout(() => {
                    setFlag(true);
                  }, 100);
                }}
              >
                关联 {formulaInfo?.length > 0 && `(${formulaInfo?.length})`}
              </a>
            )}
          </span>
          <span>
            {currentIndex + 1} / {total}
          </span>
          <span style={{ marginTop: '2px' }}>
            {/* {current != 1 && (
              <LeftOutlined onClick={handleOnPagePre} className={styles.iconStyle} />
            )}
            {current != total && (
              <RightOutlined onClick={handleOnPageBack} className={styles.iconStyle} />
            )} */}
          </span>
        </div>
      </div>
      <Modal
        className={styles.formulaModal}
        title="选择公式"
        width={'50%'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {flag && <FormulaComp handleOnSelected={handleOnSelected} />}
      </Modal>
      <div>
        <FormulaModal
          title="公式应用"
          visible={modalVisible}
          currentPageData={currentData}
          selectedCatalogue={selectedCatalogue}
          projectId={projectId}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          cRef={childRef}
          handleOnSetVisible={handleOnSetModalVisible}
        />
        <ul className={styles.fomulaBox}>
          {currentData.length == 0 && <li className={styles.noDataformu}>暂无数据</li>}
          {currentData.map((item: any, index: number) => {
            // console.log(item);
            return (
              <li
                key={index}
                className={styles.listItem}
                onClick={() => {
                  // updateChildIndex(index);
                  setModalVisible(true);
                  setCurrentIndex(index);
                }}
              >
                <span>
                  {item?.resultValue && <CheckCircleFilled className={styles.successIcon} />}
                  {!item?.resultValue && (
                    <Tooltip placement="topLeft" title="请完成相关公式录入">
                      <ExclamationCircleFilled className={styles.waringIcon} />
                    </Tooltip>
                  )}
                </span>
                <span className={styles.formulaName}>
                  <Tooltip title={item.name}>
                    <a>
                      {index + 1}、{item.name}
                    </a>
                  </Tooltip>
                </span>
                {!item.resultValue && (
                  <span className={styles.editContain}>
                    <EditOutlined
                      onClick={() => {
                        setModalVisible(true);
                        setCurrentIndex(index);
                      }}
                      className={styles.editIcon}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.currentPageTitle}>
        <Tooltip title={selectedCatalogue?.name}>
          <span className={styles.catalogueTitle}>当前章节: {selectedCatalogue?.name}</span>
        </Tooltip>
      </div>
    </div>
  );
};

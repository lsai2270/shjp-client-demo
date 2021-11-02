import React, { useState, useEffect, useImperativeHandle } from 'react';
import { connect, Dispatch, history } from 'umi';
import { Row, Col, Modal, Button, Space, message, Form, Input, Select } from 'antd';
const { Option } = Select;
import styles from './formulaModal.less';
import lodash from 'lodash';

import {
  calculateFormulaData,
  paramsUpdateData,
  paramsUpdatePatchData,
} from '@/services/reportManage';
interface formulaModalType {
  title: string;
  visible: boolean;
  currentPageData: any;
  handleOnSetVisible: Function;
  contentsData: any;
  reportId: string;
  selectedCatalogue: any;
  dispatch: any;
  cRef: any;
  currentIndex: any;
  setCurrentIndex: any;
  projectId?: string;
}
const formulaModal: React.FC<formulaModalType> = (props) => {
  const [form] = Form.useForm();
  const { id, type } = history?.location?.query;
  const { validateFields } = form;
  const {
    title,
    visible,
    currentPageData,
    contentsData,
    reportId,
    selectedCatalogue,
    dispatch,
    cRef,
    handleOnSetVisible,
    projectId,
    currentIndex,
    setCurrentIndex,
  } = props;
  // const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [currentTitel, setCurrentTitel] = useState<string>('');
  const [currentParams, setCurrentParams] = useState<any>([]);
  const [result, setResult] = useState<any>('');
  const [loadingFlag, setLoadingFlag] = useState<any>(false);

  // const [initForm, setInitForm] = useState<any>({});
  // useImperativeHandle(cRef, () => ({
  //   // handleOnSetIndex 就是暴露给父组件的方法
  //     handleOnSetIndex: (currentIndex: any) => {
  //     console.log("currentIndex",currentIndex);
  //     setCurrent(currentIndex + 1);
  //     let newParams = currentPageData[currentIndex]?.params;
  //     newParams = newParams || [];
  //     handleOnSetInitForm(newParams);
  //     setCurrentParams(newParams);
  //     setCurrentTitel(currentPageData[currentIndex]?.name);
  //   },
  // }));
  useEffect(() => {
    if (currentPageData && currentPageData.length > 0) {
      // console.log('currentPageData[currentIndex]------->', currentPageData[currentIndex]);
      setCurrentTitel(currentPageData[currentIndex]?.name);
      setTotal(currentPageData.length);
      let newParams = currentPageData[currentIndex]?.params;
      if (newParams) {
        handleOnSetInitForm(newParams);
        setCurrentParams(newParams);
      }
    }
  }, [currentPageData, currentIndex]);
  const handleOk = () => {
    setResult('');
    handleOnSetVisible(false);
    setCurrentIndex(0);
    let newParams = currentPageData[0].params;
    if (newParams) {
      handleOnSetInitForm(newParams);
    }
    handleOnSetInitForm(newParams);
    setCurrentParams(newParams);
  };
  // 初始化赋值
  const handleOnSetInitForm = (params: any) => {
    let initFormData = {};
    for (const key in contentsData) {
      if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
        const element = contentsData[key];
        params.forEach((item: any) => {
          if (item.type == 1) {
            if (item.isPrefix == 1) {
              let newkey = `${item.params}_${projectId}_${selectedCatalogue?.plotId}_${selectedCatalogue?.functionalPartitioningBuildArea}`;
              // console.log(newkey);
              if (element.code == newkey) {
                // console.log('element', element);
                if (type == 1) {
                  initFormData[newkey] = element?.draftValue ? element?.draftValue[id] : '';
                } else {
                  initFormData[newkey] = element?.value || '';
                }
              }
            } else {
              if (key == item.paramsId) {
                if (type == 1) {
                  if (!element?.draftValue) {
                    initFormData[key] = '';
                    return;
                  }
                  initFormData[key] = element?.draftValue ? element?.draftValue[id] : '';
                } else {
                  initFormData[key] = element || '';
                }
              }
            }
          }
        });
      }
    }
    form.setFieldsValue(initFormData);
  };
  const handleCancel = () => {
    setCurrentIndex(0);
    setResult('');
    let newParams = currentPageData[0].params;
    handleOnSetInitForm(newParams);
    setCurrentParams(newParams);
    handleOnSetVisible(false);
  };
  const handleOnNext = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTitel(currentPageData[currentIndex].name);
      let newParams = currentPageData[currentIndex].params;
      handleOnSetInitForm(newParams);
      setCurrentParams(newParams);
      setResult('');
    } else {
      message.warning('这已经是最后一页!');
    }
  };
  const handleOnContinue = async () => {
    const values = await validateFields();
    if (currentIndex + 1 < total) {
      setResult('');
      setCurrentIndex(currentIndex + 1);
      setCurrentTitel(currentPageData[currentIndex].name);
      let newParams = currentPageData[currentIndex].params;
      handleOnSetInitForm(newParams);
      setCurrentParams(newParams);
      setResult('');
    } else {
      //   form.submit();
      handleOnSetVisible(false);
      // message.warning('这已经是最后一页!');
    }
  };
  // 计算
  const handleOnCal = () => {
    let formulaId = currentPageData[currentIndex]._id;
    let params = {};
    let paramsInfo: any = [];
    setLoadingFlag(true);
    currentParams.forEach((item: any) => {
      if (item.type != '3') {
        if (item.isPrefix == 1) {
          let newkey = `${item.params}_${projectId}_${selectedCatalogue?.plotId}_${selectedCatalogue?.functionalPartitioningBuildArea}`;
          // console.log(newkey);
          for (const key in contentsData) {
            if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
              const element = contentsData[key];
              if (element.code == newkey) {
                params[item.params] = form.getFieldValue(newkey);
                paramsInfo.push({
                  _id: element.sourceId,
                  value: form.getFieldValue(newkey),
                });
              }
            }
          }
        } else {
          params[item.params] = form.getFieldValue(item.paramsId);
          paramsInfo.push({
            _id: item.paramsId,
            value: form.getFieldValue(item.paramsId),
          });
        }
      }
    });
    // console.log('params', params);
    // 公式计算
    calculateFormulaData(formulaId, { paramInfo: params }).then((res) => {
      // console.log(res);
      setLoadingFlag(false);
      if (res.code == 200) {
        let newContentsData = Object.assign({}, contentsData);
        currentParams.forEach((item: any) => {
          if (item.type == '3') {
            let result;
            if (parseInt(res.data.result.toFixed(2)) < res.data.result.toFixed(2)) {
              form.setFieldsValue({
                [item.paramsId]: res.data.result.toFixed(2),
              });
              result = res.data.result.toFixed(2);
            } else {
              form.setFieldsValue({
                [item.paramsId]: parseInt(res.data.result),
              });
              result = parseInt(res.data.result);
            }
            setResult(result);
            if (item.isPrefix == 1) {
              let newkey = `${item.params}_${projectId}_${selectedCatalogue?.plotId}_${selectedCatalogue?.functionalPartitioningBuildArea}`;
              console.log('newkey', newkey);
              for (const key in contentsData) {
                if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
                  const element = contentsData[key];
                  if (element.code == newkey) {
                    console.log('element', element);
                    paramsInfo.push({
                      _id: element.sourceId,
                      value: result + '',
                    });
                  }
                }
              }
            } else {
              paramsInfo.push({
                _id: item.paramsId,
                value: result + '',
              });
            }
          }
        });
        // console.log("paramsInfo",paramsInfo);
        paramsInfo.forEach((paramsObj: any) => {
          if (type == 1) {
            newContentsData[paramsObj._id] = {
              ...newContentsData[paramsObj._id],
              draftValue: { ...newContentsData[paramsObj._id]?.draftValue },
            };
            newContentsData[paramsObj._id].draftValue[id] = paramsObj.value;
          } else {
            newContentsData[paramsObj._id] = { ...newContentsData[paramsObj._id] };
            newContentsData[paramsObj._id].value = paramsObj.value;
          }
        });
        if (dispatch) {
          dispatch({
            type: 'reportManage/setContentsData',
            payload: newContentsData,
          });
        }
        console.log('paramsInfo', paramsInfo);
        // 更新数据
        paramsUpdatePatchData({ reportId: reportId, draftId: id, paramInfo: paramsInfo }).then(
          (res) => {
            // console.log(res);
            if (res.code == 200) {
              // message.success('暂存成功!');
            }
          },
        );
        message.success('计算成功!');
      } else {
        message.error(res.msg);
      }
    });
  };
  return (
    <Modal
      title={title}
      visible={visible}
      //   cancelText="跳过"
      //   okText="下一步"
      onOk={handleOk}
      width={700}
      onCancel={handleCancel}
      footer={[
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span key={1} className={styles.footerTitle}>
            <h3
              style={{
                textAlign: 'left',
                width: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              项目诱增需求预测（ 公式：{currentIndex + 1}/{total} ）：{currentTitel}
            </h3>
          </span>
          <span key={2} style={{ display: 'flex' }}>
            <Button key="back" onClick={handleOnNext}>
              跳过
            </Button>
            <Button key="submit" type="primary" onClick={handleOnContinue}>
              {currentIndex + 1 == total ? '完成' : '下一步'}
            </Button>
          </span>
        </div>,
      ]}
    >
      <Row style={{ marginBottom: '20px' }}>
        <Col span={4} style={{ textAlign: 'right', marginRight: '10px' }}>
          文字公式:
        </Col>
        <Col span={16}>
          {lodash.get(currentPageData[currentIndex], 'formula')?.map((item: any, index: number) => {
            return <div key={index}>{item.text}</div>;
          })}
        </Col>
      </Row>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        form={form}
        name="formulaModalFrom"
        // initialValues={initForm}
      >
        {/* {currentPageData[currentIndex]?.condition?.length > 0 && (
          <Form.Item
            label="条件情形"
            name="situation"
            rules={[{ required: true, message: '请选择!' }]}
          >
            <Select placeholder="请选择">
              {lodash
                .get(currentPageData[currentIndex], 'result')
                .map((item: any, index: number) => {
                  return (
                    <Option value={item.situation} key={index}>{`情形${item.situation}`}</Option>
                  );
                })}
            </Select>
          </Form.Item>
        )} */}
        {currentParams
          ?.filter((item: any) => item.type != '2')
          ?.map((item: any, index: number) => {
            if (item.type == '3') {
              return (
                <Form.Item
                  key={index}
                  label={item.name}
                  name={item.paramsId}
                  rules={[{ required: true, message: '请输入!' }]}
                >
                  <Button onClick={handleOnCal} loading={loadingFlag}>
                    计算
                  </Button>
                  {result != '' && (
                    <Space>
                      <span style={{ marginLeft: '20px' }}>结果:</span>
                      <span>{result ? result : '0'}</span>
                    </Space>
                  )}
                </Form.Item>
              );
            }
            // return (
            //   <Form.Item
            //     key={index}
            //     label={item.name}
            //     name={item.paramsId}
            //     rules={[{ required: true, message: '请输入!' }]}
            //   >
            //     <Input placeholder={`请输入${item.name}`} />
            //   </Form.Item>
            // );
            if (item.isPrefix == 1) {
              let newkey = `${item.params}_${projectId}_${selectedCatalogue?.plotId}_${selectedCatalogue?.functionalPartitioningBuildArea}`;
              return (
                <Form.Item
                  key={index}
                  label={item.name}
                  name={newkey}
                  rules={[{ required: true, message: '请输入!' }]}
                >
                  <Input placeholder={`请输入${item.name}`} />
                </Form.Item>
              );
            } else {
              return (
                <Form.Item
                  key={index}
                  label={item.name}
                  name={item.paramsId}
                  rules={[{ required: true, message: '请输入!' }]}
                >
                  <Input placeholder={`请输入${item.name}`} />
                </Form.Item>
              );
            }
          })}
      </Form>
      <Row style={{ marginBottom: '20px' }}>
        <Col offset={4} span={16} style={{ color: 'rgba(0,0,0,0.25)' }}>
          {lodash.get(currentPageData[currentIndex], 'note')}
        </Col>
      </Row>
    </Modal>
  );
};
export default connect(({ reportManage }: { reportManage: any }) => ({
  contentsData: reportManage.contentsData,
  reportId: reportManage.reportId,
}))(formulaModal);

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
  currentIndex: any;
  setCurrentIndex: any;
  currentRecord: any;
  setCurrentRecord: any;
}
const formulaModal: React.FC<formulaModalType> = (props) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const {
    title,
    visible,
    currentPageData,
    handleOnSetVisible,
    currentIndex,
    setCurrentIndex,
    currentRecord,
    setCurrentRecord,
  } = props;
  // const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [currentTitel, setCurrentTitel] = useState<string>('');
  const [currentParams, setCurrentParams] = useState<any>([]);
  const [result, setResult] = useState<any>('');
  const [loadingFlag, setLoadingFlag] = useState<any>(false);
  const [indexNum, setIndexNum] = useState<any>(0);

  useEffect(() => {
    if (currentPageData && currentPageData.length > 0) {
      console.log('currentPageData[currentIndex]------->', currentPageData);
      setCurrentTitel(currentPageData[indexNum]?.name);
      setTotal(currentPageData.length);
      let newParams = currentPageData[indexNum]?.params;
      if (newParams) {
        handleOnSetInitForm(newParams);
        setCurrentParams(newParams?.filter((item: any) => item.type != '2'));
      }
    }
  }, [currentPageData, indexNum, currentRecord]);
  const handleOk = () => {
    setResult('');
    handleOnSetVisible(false);
    setIndexNum(0);
    let newParams = currentPageData[0].params;
    if (newParams) {
      handleOnSetInitForm(newParams);
    }
    handleOnSetInitForm(newParams);
    setCurrentParams(newParams?.filter((item: any) => item.type != '2'));
  };
  // 初始化赋值
  const handleOnSetInitForm = (params: any) => {
    let initFormData: any = {};
    params.forEach((item: any) => {
      if (item.type == 1) {
        initFormData[item.paramsId] =
          lodash.get(currentRecord.defaultValue, `${item.params}`) || '';
      }
    });
    form.setFieldsValue(initFormData);
  };
  const handleCancel = () => {
    setIndexNum(0);
    setResult('');
    let newParams = currentPageData[0].params;
    handleOnSetInitForm(newParams);
    setCurrentParams(newParams?.filter((item: any) => item.type != '2'));
    handleOnSetVisible(false);
  };
  const handleOnContinue = async () => {
    const values = await validateFields();
    if (indexNum + 1 < total) {
      setResult('');
      setIndexNum(indexNum + 1);
      setCurrentTitel(currentPageData[indexNum + 1].name);
      let newParams = currentPageData[indexNum + 1].params;
      handleOnSetInitForm(newParams);
      setCurrentParams(newParams?.filter((item: any) => item.type != '2'));
      setResult('');
    } else {
      //   form.submit();
      handleOnSetVisible(false, 'finish');
      setResult('');
      setIndexNum(0);
      // message.warning('这已经是最后一页!');
    }
  };
  // 计算
  const handleOnCal = () => {
    let currentFormula = currentPageData[indexNum];
    let params = {};
    let paramsInfo: any = [];
    setLoadingFlag(true);
    currentParams.forEach((item: any) => {
      if (item.type != '3') {
        params[item.params] = form.getFieldValue(item.paramsId);
        paramsInfo.push({
          params: item.params,
          isPrefix: item.isPrefix + '',
          value: form.getFieldValue(item.paramsId),
        });
      }
    });
    // console.log('params', params);
    // 公式计算
    calculateFormulaData(currentFormula._id, { paramInfo: params }).then((res) => {
      // console.log(res);
      setLoadingFlag(false);
      if (res.code == 200) {
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
            params[item.params] = result + '';
            setResult(result);
            paramsInfo.push({
              params: item.params,
              isPrefix: item.isPrefix + '',
              value: result + '',
            });
          }
        });
        let newCurrentRecord = {
          ...currentRecord,
          defaultValue: {
            ...currentRecord?.defaultValue,
            ...params,
          },
          paramsArr: [...currentRecord?.paramsArr, ...paramsInfo],
        };
        setCurrentRecord(newCurrentRecord);
        // console.log("paramsInfo",paramsInfo)
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
              项目诱增需求预测（ 公式：{indexNum + 1}/{total} ）：{currentTitel}
            </h3>
          </span>
          <span key={2} style={{ display: 'flex' }}>
            <Button key="submit" type="primary" onClick={handleOnContinue}>
              {indexNum + 1 == total ? '完成' : '下一步'}
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
          {lodash.get(currentPageData[indexNum], 'formula')?.map((item: any, index: number) => {
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
        {currentParams?.map((item: any, index: number) => {
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
        })}
      </Form>
      <Row style={{ marginBottom: '20px' }}>
        <Col offset={4} span={16} style={{ color: 'rgba(0,0,0,0.25)' }}>
          {lodash.get(currentPageData[indexNum], 'note')}
        </Col>
      </Row>
    </Modal>
  );
};
export default formulaModal;

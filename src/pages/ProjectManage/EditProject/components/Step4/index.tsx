import { Button, Table, Row, Col, Alert, Form, Input, Select, message } from 'antd';
const { Option } = Select;
import React, { useState, useEffect } from 'react';
import { connect, Dispatch } from 'umi';
import { StateType } from '../../model';
import styles from './index.less';
import ScrollSelect from '@/components/ScrollSelect';
import { templateList } from '@/services/systemSetting';
interface Step4Props {
  stepData: StateType['step'];
  currentRecord: any;
  dispatch?: Dispatch;
}
const formItemLayout = {
  labelCol: {
    span: 4,
    offset: 3,
  },
  wrapperCol: {
    span: 10,
  },
};
const Step4: React.FC<Step4Props> = (props) => {
  const [form] = Form.useForm();
  const { validateFields, getFieldsValue } = form;
  const { stepData, currentRecord, dispatch } = props;
  const [templateLists, setTemplateLists] = useState<any[]>([]);
  useEffect(() => {
    if (Object.keys(currentRecord).length > 0) {
      let initData = {
        template: {
          label: currentRecord.template,
          value: currentRecord.templateId,
        },
        // researchBasis: currentRecord.researchBasis,
        // referenceCase: currentRecord.referenceCase,
      };
      form.setFieldsValue(initData);
    }
  }, []);
  const onPrev = () => {
    if (dispatch) {
      const values = getFieldsValue();
      dispatch({
        type: 'projectManageAndEditProject/saveStepFormData',
        payload: {
          ...stepData,
          // ...values,
        },
      });
      dispatch({
        type: 'projectManageAndEditProject/saveCurrentStep',
        payload: '2',
      });
    }
  };
  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const onValidateForm = async () => {
    const values = await validateFields();
    if (dispatch) {
      dispatch({
        type: 'projectManageAndEditProject/submitStepForm',
        payload: {
          ...stepData,
          step4Form: values,
        },
      });
      // dispatch({
      //   type: 'projectManageAndEditProject/saveCurrentStep',
      //   payload: '4',
      // });
    }
  };
  // ????????????
  const hanldeOnGetTemplates = async (params: any) => {
    const res = await templateList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setTemplateLists([...templateLists, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('????????????????????????!');
    }
    return res.data;
  };
  //????????????????????????
  const hanldeOnTemplateChange = (value: any) => {
    form.setFieldsValue({
      template: value,
    });
  };
  return (
    <Row>
      <Col span={24} className={styles.stepForm}>
        <Alert
          closable
          showIcon
          message="????????????????????????????????????????????????"
          style={{ marginBottom: 24 }}
        />
        <Form
          {...formItemLayout}
          form={form}
          layout="horizontal"
          className={styles.stepForm}
          initialValues={{}}
        >
          <Form.Item
            label="????????????"
            name="template"
            rules={[{ required: false, message: '?????????' }]}
          >
            <ScrollSelect
              handleOnGetData={hanldeOnGetTemplates}
              hanldeOnChange={hanldeOnTemplateChange}
              // optionData={templateLists}
              placeholder="?????????"
            />
          </Form.Item>
          {/* <Form.Item
            label="????????????"
            name="researchBasis"
            rules={[{ required: false, message: '?????????' }]}
          >
            <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="?????????">
              <Option value="1">????????????1</Option>
              <Option value="2">????????????2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="????????????"
            name="referenceCase"
            rules={[{ required: false, message: '?????????' }]}
          >
            <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="?????????">
              <Option value="1">????????????1</Option>
              <Option value="2">????????????2</Option>
            </Select>
          </Form.Item> */}
        </Form>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={onValidateForm}>
              ??????
            </Button>
            <Button onClick={onPrev} style={{ marginLeft: 8 }}>
              ?????????
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default connect(
  ({ projectManageAndEditProject }: { projectManageAndEditProject: StateType }) => ({
    stepData: projectManageAndEditProject.step,
    currentRecord: projectManageAndEditProject.currentRecord,
  }),
)(Step4);

import { Button, Table, Row, Col, Alert, Form, Input, Select, message } from 'antd';
const { Option } = Select;
import React, { useState } from 'react';
import { connect, Dispatch } from 'umi';
import { StateType } from '../../model';
import styles from './index.less';
import ScrollSelect from '@/components/ScrollSelect';
import { templateList } from '@/services/systemSetting';
interface Step4Props {
  stepData?: StateType['step'];
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
  const { stepData, dispatch } = props;
  const [templateLists, setTemplateLists] = useState<any[]>([]);
  console.log('stepData', stepData);
  if (!stepData) {
    return null;
  }
  const onPrev = () => {
    if (dispatch) {
      const values = getFieldsValue();
      dispatch({
        type: 'projectManageAndAddProject/saveStepFormData',
        payload: {
          ...stepData,
          // ...values,
        },
      });
      dispatch({
        type: 'projectManageAndAddProject/saveCurrentStep',
        payload: '2',
      });
    }
  };
  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const onValidateForm = async () => {
    const values = await validateFields();
    if (dispatch) {
      dispatch({
        type: 'projectManageAndAddProject/submitStepForm',
        payload: {
          ...stepData,
          step4Form: values,
        },
      });
      // dispatch({
      //   type: 'projectManageAndAddProject/saveCurrentStep',
      //   payload: '4',
      // });
    }
  };
  // 获取模版
  const hanldeOnGetTemplates = async (params: any) => {
    const res = await templateList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setTemplateLists([...templateLists, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('获取字典接口出错!');
    }
    return res.data;
  };
  //所属类型选择事件
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
          message="请选择交通影响报告所使用的模板。"
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
            label="报告模板"
            name="template"
            rules={[{ required: false, message: '请选择' }]}
          >
            <ScrollSelect
              handleOnGetData={hanldeOnGetTemplates}
              hanldeOnChange={hanldeOnTemplateChange}
              // optionData={templateLists}
              placeholder="请选择"
            />
          </Form.Item>
          {/* <Form.Item
            label="研究依据"
            name="researchBasis"
            rules={[{ required: false, message: '请选择' }]}
          >
            <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="请选择">
              <Option value="1">研究依据1</Option>
              <Option value="2">研究依据2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="参考案例"
            name="referenceCase"
            rules={[{ required: false, message: '请选择' }]}
          >
            <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="请选择">
              <Option value="1">参考依据1</Option>
              <Option value="2">参考依据2</Option>
            </Select>
          </Form.Item> */}
        </Form>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={onValidateForm}>
              完成
            </Button>
            <Button onClick={onPrev} style={{ marginLeft: 8 }}>
              上一步
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default connect(
  ({ projectManageAndAddProject }: { projectManageAndAddProject: StateType }) => ({
    stepData: projectManageAndAddProject.step,
  }),
)(Step4);

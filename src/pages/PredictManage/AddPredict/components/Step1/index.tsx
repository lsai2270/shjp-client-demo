import React, { useEffect, useState, useRef } from 'react';
import {
  Form,
  Button,
  Divider,
  Input,
  Select,
  Table,
  DatePicker,
  Alert,
  Row,
  Col,
  InputNumber,
} from 'antd';
const { TextArea } = Input;
import lodash from 'lodash';
import { connect, Dispatch, history } from 'umi';
import Upload from '@/components/Upload';
import Loading from '@/components/Loading';
import RoadTable from './RoadTable';
import { StateType } from '../../model';
import { getList } from '@/services/projectManage';
import styles from './index.less';
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 6,
    offset: 2,
  },
  wrapperCol: {
    span: 8,
  },
};
interface Step1Props {
  stepData?: StateType['step'];
  current: any;
  dxfData: any;
  dispatch?: Dispatch;
}
const Step1: React.FC<Step1Props> = (props) => {
  const { dispatch, stepData, dxfData, current } = props;
  const [form] = Form.useForm();
  const [uploads, setUploads] = useState<any>([]);
  const [projects, setProjects] = useState<any>([]);

  const [currentProject, setCurrentProject] = useState<any>({});
  const [plotArr, setPlotArr] = useState<any>([]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [plotTripDivision, setPlotTripDivision] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<any>(true);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  // if (!stepData) {
  //   return null;
  // }
  const { validateFields } = form;

  useEffect(() => {
    handleOnGetProject(pagination);
    // console.log('stepData', stepData);
    if (localStorage.getItem('step1Form')) {
      let step1FormData: any = localStorage.getItem('step1Form');
      step1FormData = JSON.parse(step1FormData);
      if (dispatch) {
        dispatch({
          type: 'predictManageAndAddPredict/saveStepFormData',
          payload: {
            step1Form: step1FormData,
          },
        });
        setPlotTripDivision(step1FormData.tripDivision);
        setUploads([step1FormData.file]);
        form.setFieldsValue(step1FormData);
      }
    }
    if (JSON.stringify(stepData.step1Form) != '{}') {
      setUploads([stepData.step1Form.file]);
    }
  }, []);
  useEffect(() => {
    if (projects.length > 0) {
      if (localStorage.getItem('step1Form')) {
        let step1FormData: any = localStorage.getItem('step1Form');
        step1FormData = JSON.parse(step1FormData);
        hanldeOnProject(step1FormData.projectName);
        let file: any = localStorage.getItem('file');
        file = JSON.parse(file);
        // console.log('file', file);
        if (dispatch) {
          dispatch({
            type: 'predictManageAndAddPredict/setDxfData',
            payload: file,
          });
        }
      }
    }
  }, [projects]);
  const handleOnUpload = (file: any) => {
    setUploads(file);
    if (dispatch) {
      dispatch({
        type: 'predictManageAndAddPredict/setDxfData',
        payload: lodash.get(file[0], 'response.data'),
      });
    }
    localStorage.setItem('file', JSON.stringify(lodash.get(file[0], 'response.data')));
    form.setFieldsValue({
      file: file[0],
    });
  };
  const onValidateForm = async () => {
    const values = await validateFields();
    if (dispatch) {
      dispatch({
        type: 'predictManageAndAddPredict/saveStepFormData',
        payload: {
          // ...stepData,
          step1Form: { ...values, tripDivision: plotTripDivision },
        },
      });
      dispatch({
        type: 'predictManageAndAddPredict/saveCurrentStep',
        payload: '1',
      });
      localStorage.setItem(
        'step1Form',
        JSON.stringify({ ...values, tripDivision: plotTripDivision }),
      );
    }
  };
  const handleOnChange = (upload: any) => {
    // console.log(upload);
    var formData: any = new FormData();
    formData.append('file', upload.file);
    console.log(formData);
  };
  let timer: any;
  const handleOnGetProject = async (params: any) => {
    if (localStorage.getItem('step1Form')) {
      if (pagination.current * pagination.pageSize < pagination.total) {
        setLoadingFlag(true);
      }
    }
    const res = await getList(params);
    try {
      if (res.code == 200) {
        if (res?.data?.data?.length > 0) {
          setProjects([...projects, ...res.data.data]);
          setPagination({ ...params, total: res.data.count });
          setLoadingStatus(true);
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => {
            setLoadingFlag(false);
          }, 1000);
          // 上一步
          if (JSON.stringify(stepData.step1Form) != '{}') {
            let newProjects = [...projects, ...res.data.data];
            let currentProject: any = newProjects.filter(
              (pj: any) => pj._id == stepData.step1Form.projectName.value,
            );
            currentProject = currentProject[0];
            // console.log('currentProject', currentProject);
            let formTripDivision = {};
            let newPlotArr = currentProject?.plotInfo?.map((item: any, index: number) => {
              formTripDivision[`tripDivision${index}`] = stepData?.step1Form?.tripDivision[index];
              return {
                code: item.code,
                tripDivision: stepData?.step1Form?.tripDivision[index],
              };
            });
            setPlotArr(newPlotArr);
            form.setFieldsValue(formTripDivision);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleOnScrollOptions = (e: any) => {
    const { clientHeight, scrollHeight, scrollTop } = e.target;
    if (loadingStatus) {
      if (scrollHeight < clientHeight + scrollTop + 15) {
        const params = { ...pagination, current: pagination.current + 1 };
        handleOnGetProject(params);
        setLoadingStatus(false);
      }
    }
  };
  const hanldeOnProject = (value: any) => {
    let newCurrent = projects.filter((item: any) => item._id == value.value);
    if (newCurrent.length == 0) {
      handleOnGetProject({
        current: pagination.current + 1,
        pageSize: 10,
      });
      return;
    }
    newCurrent = newCurrent[0];
    setCurrentProject(newCurrent);
    let newPlotInfo = newCurrent.plotInfo?.map((item: any) => {
      return {
        ...item,
        tripDivision: item.tripDivision?.map((tripItem: any) => {
          let dataObj = {
            plotId: item._id,
            plotCode: item.code,
          };
          tripItem.forEach((item1: any) => {
            let keys = Object.keys(item1);
            // delete item1['functionalPartitioningBuildArea'];
            keys.forEach((key: any) => {
              dataObj[key] = !item1[key] ? '0' : item1[key];
            });
          });
          let total = 0;
          for (const key in dataObj) {
            if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
              const element = dataObj[key];
              let arr = ['rail', 'bus', 'car', 'taxi', 'non-motor', 'walk'];
              if (arr.indexOf(key) != -1) {
                total += Number(element);
              }
            }
          }
          // console.log('total', total);
          dataObj['total'] = total + '';
          return dataObj;
        }),
      };
    });
    setPlotArr(newPlotInfo);
    // console.log('newCurrent--->', newCurrent);
    let plotNum = newCurrent?.plotInfo?.length;
    setPlotTripDivision(newPlotInfo.map((item: any) => item.tripDivision));
    if (dispatch) {
      dispatch({
        type: 'predictManageAndAddPredict/setCurrentProject',
        payload: newCurrent,
      });
    }
  };
  const handleOnUpdateTable = (data: Array<object>, plotDta: any, index: number) => {
    setPlotTripDivision((newPlotTripDivision) => {
      newPlotTripDivision.splice(index, 1, data);
      // console.log('newPlotTripDivision', newPlotTripDivision);
      return newPlotTripDivision;
    });
    // form.setFieldsValue({
    //   [`tripDivision${index}`]: data,
    // });
  };
  return (
    <>
      <Form
        {...formItemLayout}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        // hideRequiredMark
        initialValues={{
          ...stepData.step1Form,
          expresswayCapacity: 1400,
          quicklywayCapacity: 1400,
          mainRoadCapacity: 1000,
          subRoadCapacity: 800,
          accessRoadCapacity: 300,
        }}
      >
        <Alert
          closable
          showIcon
          message={
            <span>
              预测前请确保已进行现状交通量调查，否则将无法进行预测。如您已确定完成调查，请设置基础参数。您可点此
              <a
                onClick={() => {
                  history.push('/predictManage');
                }}
              >
                查看调查情况
              </a>
              。
            </span>
          }
          // action={}
          style={{ marginBottom: 24 }}
        />
        <Loading visible={loadingFlag} />
        <Form.Item label="预测名称" name="name" rules={[{ required: true, message: '请输入' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item
          label="所属项目"
          name="projectName"
          rules={[{ required: true, message: '请输入' }]}
        >
          <Select
            placeholder="请选择"
            labelInValue
            style={{ width: '100%' }}
            onPopupScroll={handleOnScrollOptions}
            onChange={hanldeOnProject}
          >
            {projects.map((item: any, index: number) => {
              return (
                <Option key={index} value={item._id}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        {plotArr.length > 0 &&
          plotArr.map((plot: any, index: number) => {
            return (
              <Form.Item
                key={index}
                label={`${plot.code}地块出行方式配比`}
                name={`tripDivision${index}`}
                wrapperCol={{ span: 14 }}
                rules={[{ required: false, message: '请输入' }]}
              >
                <RoadTable
                  plotInfo={plot}
                  handleOnUpdateTable={(data: any) => handleOnUpdateTable(data, plot, index)}
                />
              </Form.Item>
            );
          })}
        <Form.Item
          label="高速公路单车道通行能力"
          name="expresswayCapacity"
          rules={[{ required: true, message: '请输入' }]}
        >
          <Input placeholder="1200" addonAfter="pcu/h" />
        </Form.Item>
        <Form.Item
          label="快速路单车道通行能力"
          name="quicklywayCapacity"
          rules={[{ required: true, message: '请输入' }]}
        >
          <Input placeholder="800" addonAfter="pcu/h" />
        </Form.Item>
        <Form.Item
          label="主干路单车道通行能力"
          name="mainRoadCapacity"
          rules={[{ required: true, message: '请输入' }]}
        >
          <Input placeholder="600" addonAfter="pcu/h" />
        </Form.Item>
        <Form.Item
          label="次干路单车道通行能力"
          name="subRoadCapacity"
          rules={[{ required: true, message: '请输入' }]}
        >
          <Input placeholder="400" addonAfter="pcu/h" />
        </Form.Item>
        <Form.Item
          label="支路单车道通行能力"
          name="accessRoadCapacity"
          rules={[{ required: true, message: '请输入' }]}
        >
          <Input placeholder="200" addonAfter="pcu/h" />
        </Form.Item>
        <Form.Item
          label="路网图"
          name="file"
          rules={[{ required: true, message: '请上传文件' }]}
          className={styles.uploadItem}
        >
          <Upload
            name="文件上传"
            url="/api/v1/forecast/dxfAnalysis"
            accept=".dxf"
            uploads={uploads}
            handleOnUpload={handleOnUpload}
            // setUploads={setUploads}
          />
          <Row>
            <Col span={12} className={styles.limitName} style={{ color: 'rgba(0,0,0,0.4)' }}>
              支持扩展名:(.dxf)
            </Col>
          </Row>
        </Form.Item>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={onValidateForm}>
              下一步
            </Button>
          </Col>
        </Row>
      </Form>
      <Divider style={{ margin: '40px 0 24px' }} />
      <div className={styles.desc}>
        <h3>说明</h3>
        <h4>带 * 的为必填项</h4>
      </div>
    </>
  );
};

export default connect(
  ({ predictManageAndAddPredict }: { predictManageAndAddPredict: StateType }) => ({
    stepData: predictManageAndAddPredict.step,
    current: predictManageAndAddPredict.current,
    dxfData: predictManageAndAddPredict.dxfData,
  }),
)(Step1);

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
import Loading from '@/components/Loading';
import Upload from '@/components/Upload';
import RoadTable from './RoadTable';
import { StateType } from '../../model';
import { getList } from '@/services/projectManage';
import styles from './index.less';
import Item from 'antd/lib/list/Item';
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
  currentPredict: any;
  dispatch?: Dispatch;
}
const Step1: React.FC<Step1Props> = (props) => {
  const { dispatch, stepData, current, currentPredict } = props;
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
  const [reqStatus, setReqStatus] = useState<any>(true);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  // if (!stepData) {
  //   return null;
  // }
  const { validateFields } = form;

  useEffect(() => {
    handleOnGetProject(pagination);
    // console.log('newProjects', newProjects);
    if (JSON.stringify(stepData.step1Form) != '{}') {
      setUploads([stepData.step1Form.file]);
      return;
    }
    // if (currentPredict && JSON.stringify(currentPredict) != '{}') {
    //   handleOnInitStep1Form();
    // }
  }, []);
  useEffect(() => {
    if (currentPredict && JSON.stringify(currentPredict) != '{}' && projects.length > 0) {
      handleOnInitStep1Form();
    }
  }, [currentPredict, projects]);
  const handleOnUpload = (file: any) => {
    setUploads(file);
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/setDxfData',
        payload: lodash.get(file[0], 'response.data'),
      });
    }
    form.setFieldsValue({
      file: file[0],
    });
  };
  const handleOnInitStep1Form = () => {
    console.log('currentPredict', currentPredict);
    form.setFieldsValue({
      name: currentPredict.name,
      projectName: { label: currentPredict.projectName, value: currentPredict.projectId },
      expresswayCapacity: currentPredict.expresswayCapacity,
      quicklywayCapacity: currentPredict.quicklywayCapacity,
      mainRoadCapacity: currentPredict.mainRoadCapacity,
      subRoadCapacity: currentPredict.subRoadCapacity,
      accessRoadCapacity: currentPredict.accessRoadCapacity,
      file: { ...currentPredict.file, netId: currentPredict.netId },
    });
    // 地块
    let newCurrent = projects.filter((item: any) => item._id == currentPredict.projectId);
    if (newCurrent.length == 0) {
      handleOnGetProject({
        current: pagination.current + 1,
        pageSize: 10,
      });
      return;
    }
    newCurrent = newCurrent[0];
    // console.log('newCurrent', newCurrent);
    if (JSON.stringify(stepData.step1Form) == '{}') {
      let newPlotArr = [];
      let formTripDivision = {};
      if (newCurrent) {
        newPlotArr = lodash.get(newCurrent, 'plotInfo').map((item: any, index: number) => {
          formTripDivision[`tripDivision${index}`] = currentPredict.tripDivision[index];
          return {
            ...item,
            tripDivision: currentPredict.tripDivision[index],
          };
        });
      }
      form.setFieldsValue(formTripDivision);
      setPlotArr(newPlotArr);
    }
    setUploads([currentPredict.file]);
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/setCurrentProject',
        payload: newCurrent,
      });
      dispatch({
        type: 'predictManageAndEditPredict/setDxfData',
        payload: {
          netId: currentPredict.netId,
          links: currentPredict?.linkInfo?.map((link: any) => {
            if (typeof link == 'string') {
              return link;
            }
            let linkData = {
              ...link.data,
              name: { label: link.belong, value: link.belongId },
              roadName: link.roadName,
              startNode: `${link.fromNode.fromNodeId}_${link.fromNode.fromNodeSum}`,
              endNode: `${link.fromNode.toNodeId}_${link.fromNode.toNodeSum}`,
              from: { label: link.fromNode.towardFrom, value: link.fromNode.towardFromCode },
              to: { label: link.fromNode.towardTo, value: link.fromNode.towardToCode },
              roadNum: link.fromNode.laneNumber,
              roadIndex: link.fromNode.laneSeq,
              roadNum1: link.reverseNode.laneNumber,
              roadIndex1: link.reverseNode.laneSeq,
              roadLevel: `${link.levelId}_${link.level}`,
              roadSituation: { label: link.status, value: link.statusId },
              capt: link.fromNode.trafficCapacity,
              capt1: link.reverseNode.trafficCapacity,
              roadTrafficCurrentStatusValue:
                link.fromNode.roadTrafficCurrentStatusValue == 'undefined'
                  ? ''
                  : link.fromNode.roadTrafficCurrentStatusValue,
              roadTrafficCurrentStatusValue1:
                link.reverseNode.roadTrafficCurrentStatusValue == 'undefined'
                  ? ''
                  : link.reverseNode.roadTrafficCurrentStatusValue,
              status: '1',
              data: link.data,
            };
            if (link.status == '未建成') {
              linkData.year = { label: link.buildEndAt, value: link.buildEndAtId };
            }
            return linkData;
          }),
          nodes: currentPredict.nodeInfo?.map((node: any) => {
            let newEnterSetting = node.enterSetting?.map((item: any, index: number) => {
              let currentLink = currentPredict.linkInfo.filter(
                (link: any) => link.data.num == item.linkSum,
              );
              // console.log("item",item);
              // console.log("<currentLink></currentLink>===>",currentLink);
              return {
                entrance: { label: item.enter, value: item.enterId },
                link: `Link${item.linkSum}`,
                linkNode: currentLink[0]?.data || [],
                roadIndex: currentLink[0]?.fromNode?.laneSeq,
                entranceRoadNum: item.enterInfoNum,
                roundRoad: item.turnRoundLane,
                leftRoad: item.leftHandedLane,
                straight: item.straightHandedLane,
                rightRoad: item.rightHandedLane,
              };
            });
            let newSignalGroup = node.signalGroup?.map((item: any) => {
              return {
                no: item.no,
                signalControll: { label: item.signalControllName, value: item.signalControllNo },
                name: item.name,
                greenTimeStart: item.greenTimeStart,
                greenTimeEnd: item.greenTimeEnd,
                amber: item.amber,
              };
            });
            let newlaneTurn = node.laneTurn?.map((item: any) => {
              return {
                no: item.no,
                signalGroup: {
                  label: item.signalGroupName,
                  value: item.signalGroupNo,
                },
                turnStart: [`${item.fromLinkId}_${item.fromLinkSum}`, parseInt(item.fromLinkSeq)],
                turnEnd: [`${item.toLinkId}_${item.toLinkSum}`, parseInt(item.toLinkSeq)],
              };
            });
            return {
              ...node.data,
              ...node,
              signalGroup: newSignalGroup,
              laneTurn: newlaneTurn,
              enterSetting: newEnterSetting,
            };
          }),
        },
      });
    }
  };
  const onValidateForm = async () => {
    const values = await validateFields();
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/saveStepFormData',
        payload: {
          // ...stepData,
          step1Form: { ...values, tripDivision: plotTripDivision },
        },
      });
      dispatch({
        type: 'predictManageAndEditPredict/saveCurrentStep',
        payload: '1',
      });
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
    // console.log(1111);
    if (pagination.current * pagination.pageSize < pagination.total) {
      setLoadingFlag(true);
    }
    const res = await getList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setProjects([...projects, ...res.data.data]);
          setPagination({ ...params, total: res.data.count });
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
            console.log('currentProject', currentProject);
            let formTripDivision = {};
            let newPlotArr = currentProject?.plotInfo?.map((item: any, index: number) => {
              formTripDivision[`tripDivision${index}`] = stepData.step1Form.tripDivision[index];
              return {
                code: item.code,
                tripDivision: stepData.step1Form.tripDivision[index],
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
    if (reqStatus) {
      if (scrollHeight < clientHeight + scrollTop + 15) {
        const params = { ...pagination, current: pagination.current + 1 };
        handleOnGetProject(params);
        setReqStatus(false);
      }
    }
  };
  const hanldeOnProject = (value: any) => {
    let newCurrent = projects.filter((item: any) => item._id == value.value);
    newCurrent = newCurrent[0];
    // console.log('newCurrent', newCurrent);
    setCurrentProject(newCurrent);
    let newPlotInfo = newCurrent.plotInfo.map((item: any) => {
      return {
        ...item,
        tripDivision: item.tripDivision.map((tripItem: any) => {
          let dataObj = {
            plotId: item._id,
            plotCode: item.code,
          };
          tripItem.forEach((item1: any) => {
            let keys = Object.keys(item1);
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
          dataObj['total'] = total + '';
          return dataObj;
        }),
      };
    });
    console.log('newPlotInfo', newPlotInfo);
    setPlotArr(newPlotInfo);
    let plotNum = newCurrent.plotInfo.length;
    setPlotTripDivision(newPlotInfo.map((item: any) => item.tripDivision));
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/setCurrentProject',
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
    form.setFieldsValue({
      [`tripDivision${index}`]: data,
    });
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
        {plotArr &&
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
            <Col span={6} className={styles.limitName} style={{ color: 'rgba(0,0,0,0.4)' }}>
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
  ({ predictManageAndEditPredict }: { predictManageAndEditPredict: StateType }) => ({
    stepData: predictManageAndEditPredict.step,
    current: predictManageAndEditPredict.current,
    currentPredict: predictManageAndEditPredict.currentPredict,
  }),
)(Step1);

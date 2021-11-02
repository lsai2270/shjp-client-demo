import React, { useState, useEffect } from 'react';
import {
  Form,
  Alert,
  Button,
  Card,
  Select,
  Input,
  Table,
  Row,
  Col,
  message,
  Affix,
  DatePicker,
} from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import { PlusOutlined } from '@ant-design/icons';
import { connect, Dispatch } from 'umi';
import moment from 'moment';
import { getTreeData } from '@/tools';
import { StateType } from '../../model';
import styles from './index.less';
import { getDictData } from '@/services/projectManage';

const gridStyleLeft: any = {
  width: '35%',
  // textAlign: 'center',
};
const gridStyleRight: any = {
  width: '65%',
  // textAlign: 'center',
};

const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

interface Step2Props {
  stepData: StateType['step'];
  current: any;
  currentRecord: any;
  dispatch?: Dispatch;
}

const Step2: React.FC<Step2Props> = (props) => {
  const [form] = Form.useForm();
  const { stepData, current, dispatch, currentRecord } = props;
  // if (!stepData) {
  //   return null;
  // }

  const { validateFields, getFieldsValue } = form;
  const [railway, setRailway] = useState([]);
  const [roadWayInfo, setRoadWayInfo] = useState<any>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<any>(undefined);
  const [dictData, setDictData] = useState<any>({});
  const [planningValue, setPlanningValue] = useState<any>(undefined);
  useEffect(() => {
    // console.log('currentRecord', currentRecord);
    //上一步
    if (stepData.step2Form.length > 0) {
      setRoadWayInfo(stepData.step2Form);
      return;
    }
    if (currentRecord && Object.keys(currentRecord).length > 0) {
      console.log(currentRecord.roadWayInfo);
      let initRoadWayInfo = currentRecord.roadWayInfo.map((item: any, index: any) => {
        let dataObj: any = {
          _id: item._id,
          roadName: item.roadName,
          level: { label: item.levelName, value: item.level },
          twoWayNumber: item.twoWayNumber,
          isMedialStrip: { label: item.isMedialStrip, value: item.isMedialStripId },
          divider: {
            label: item.divider,
            value: item.dividerId,
          },
          relativePosition: {
            label: item.relativePosition,
            value: item.relativePositionId,
          },
          isNearBase: item.isNearBase,
          redLineWidth: item.redLineWidth,
          widthOfBelt: item.widthOfBelt,
          planningImplementation: {
            label: item.planningImplementation,
            value: item.planningImplementationId,
          },
          roadFracture: {
            label: item.roadFracture,
            value: item.roadFractureId,
          },
          roadStatus: item.roadStatus || '',
          note: item.roadStatus || '',
        };
        if (
          item.planningImplementation == '尚未按规划实施到位' ||
          item.planningImplementation == '尚未辟通'
        ) {
          dataObj['buildEndAt'] = moment(item.buildEndAt);
          dataObj['buildYear'] = item.buildYear;
        }
        return dataObj;
      });
      setRoadWayInfo(initRoadWayInfo);
    }
    // getDictDataAll();
  }, []);
  useEffect(() => {
    if (JSON.stringify(dictData) == '{}') {
      getDictDataAll();
    }
  }, [current]);
  //下拉框字典
  const getDictDataAll = () => {
    let parentIds = [
      {
        name: '道路等级',
        type: 'dldj',
        parentId: '606ff379843ea2749135ba79',
      },
      {
        name: '机非分隔带情况',
        parentId: '606ff459843ea2749135ba7f',
      },
      // {
      //   name: '有无中央分隔带',
      //   type:'ywzyfgd',
      //   parentId: '606ff5f1843ea2749135ba81',
      // },
      // {
      //   name: '机非分隔情况',
      //   type:'jffgqk',
      //   parentId: '606ff5f1843ea2749135ba82',
      // },
      {
        name: '相对基地位置',
        type: 'xdjdwz',
        parentId: '606ffaed843ea2749135ba90',
      },
      {
        name: '是否临近基地',
        type: 'sfljjd',
        parentId: '606ffaed843ea2749135ba91',
      },
      {
        name: '规划实施情况',
        type: 'ghssqk',
        parentId: '606ff459843ea2749135ba80',
      },
      {
        name: '道路断面形式',
        type: 'dldmxs',
        parentId: '6076aff89ca8d0d819b8fd31',
      },
      {
        name: '建设年限',
        type: 'jsnx',
        parentId: '60768ad7a67748bbc5c764b8',
      },
    ];
    // let parentId = parentIds.map((item)=>item.parentId);
    getDictData({ typeCode: 'baseData' }).then((res) => {
      if (res.code == 200) {
        let treeData = getTreeData(res.data, '0', 'allData');
        // console.log(treeData);
        let newDictData = {};
        parentIds.forEach((item: any) => {
          treeData.forEach((item1: any) => {
            if (item.parentId == item1._id) {
              if (item.parentId == '606ff459843ea2749135ba7f') {
                if (item1.children[0]._id == '606ff5f1843ea2749135ba81') {
                  newDictData['ywzyfgd'] = item1?.children[0]?.children;
                  newDictData['jffgqk'] = item1?.children[1]?.children;
                } else {
                  newDictData['ywzyfgd'] = item1?.children[1]?.children;
                  newDictData['jffgqk'] = item1?.children[0]?.children;
                }
              } else {
                newDictData[item.type] = item1.children;
              }
            }
          });
        });
        // console.log(newDictData);
        setDictData(newDictData);
      }
    });
  };
  const onPrev = () => {
    if (dispatch) {
      // const values = validateFields();
      dispatch({
        type: 'projectManageAndEditProject/saveStepFormData',
        payload: {
          ...stepData,
        },
      });
      dispatch({
        type: 'projectManageAndEditProject/saveCurrentStep',
        payload: '0',
      });
    }
  };
  const onValidateForm = () => {
    if (roadWayInfo.length > 0) {
      let data = roadWayInfo[roadWayInfo.length - 1];
      if (
        !data.roadName ||
        !data.level ||
        !data.twoWayNumber ||
        !data.isMedialStrip ||
        !data.divider ||
        !data.relativePosition ||
        !data.isNearBase ||
        !data.redLineWidth ||
        !data.planningImplementation
      ) {
        message.warning('请先保存新添加的道路信息!');
        return;
      }
    }
    if (dispatch) {
      dispatch({
        type: 'projectManageAndEditProject/saveStepFormData',
        payload: {
          ...stepData,
          step2Form: roadWayInfo,
        },
      });
      dispatch({
        type: 'projectManageAndEditProject/saveCurrentStep',
        payload: '2',
      });
    }
  };
  const columns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '道路名称',
      align: 'center',
      dataIndex: 'roadName',
      key: 'roadName',
    },
    {
      title: '操作',
      dataIndex: 'option',
      key: 'option',
      width: 70,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <a
            onClick={() => {
              let newRoadWayInfo = roadWayInfo.filter(
                (item: any, roadIndex: number) => roadIndex != index,
              );
              setRoadWayInfo(newRoadWayInfo);
            }}
          >
            删除
          </a>
        );
      },
    },
  ];
  const hanldeOnSave = async () => {
    const values = await validateFields();
    let newRoadWayInfo = roadWayInfo.concat([]);
    if (currentRowIndex != undefined) {
      newRoadWayInfo.splice(currentRowIndex, 1, {
        ...newRoadWayInfo[currentRowIndex],
        ...values,
      });
    } else {
      newRoadWayInfo.push({
        ...values,
        roadStatus: values.roadStatus ? values.roadStatus : '',
        note: values.note ? values.note : '',
      });
    }
    form.resetFields();
    setRoadWayInfo(newRoadWayInfo);
  };
  //选中行
  const handleOnTableRow = (event: any, record: any, index: any) => {
    // console.log(record);
    if (index == currentRowIndex) {
      setCurrentRowIndex(undefined);
      form.resetFields();
    } else {
      setCurrentRowIndex(index);
      if (
        record.planningImplementation.label == '尚未按规划实施到位' ||
        record.planningImplementation.label == '尚未辟通'
      ) {
        setPlanningValue(record.planningImplementation.label);
      }
      form.setFieldsValue(record);
    }
    setRowStyle(index);
  };
  const setRowStyle = (index: any) => {
    let nodeElement: any = document.getElementById('nearRoadTable');
    var arr = nodeElement.getElementsByClassName('ant-table-row');
    arr.forEach((eleItem: any, rowIndex: any) => {
      let str = eleItem.getAttribute('class');
      if (index == rowIndex) {
        if (str.indexOf('ant-table-row-selected') != -1) {
          eleItem.classList.remove('ant-table-row-selected');
        } else {
          eleItem.classList.add('ant-table-row-selected');
        }
      } else {
        arr[rowIndex].classList.remove('ant-table-row-selected');
      }
    });
  };
  const hanldeOnPlanning = (seleted: any) => {
    console.log(seleted);
    setPlanningValue(seleted.label);
  };
  //选择日期限制
  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment().endOf('year');
  };
  return (
    <Row>
      <Col span={24} className={styles.stepForm}>
        <Alert
          closable
          showIcon
          message="请设置基地周边道路。请务必添加完善基地周边研究范围内的道路，包括规划中的，否则发起流量调查或预测时可能无法选择某些道路。"
          style={{ marginBottom: 24 }}
        />
        <Card>
          <Card.Grid hoverable={false} style={gridStyleLeft}>
            <span> 道路列表：</span>
          </Card.Grid>
          <Card.Grid hoverable={false} style={gridStyleRight}>
            <Affix offsetTop={60}>
              <Button type="primary" onClick={hanldeOnSave}>
                保存
              </Button>
              <Button
                type="default"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  form.resetFields();
                  setCurrentRowIndex(undefined);
                  if (currentRowIndex != undefined) {
                    setRowStyle(currentRowIndex);
                  }
                }}
              >
                清空
              </Button>
            </Affix>
          </Card.Grid>
          <Card.Grid hoverable={false} style={gridStyleLeft}>
            <Table
              id="nearRoadTable"
              onRow={(record, index) => {
                return {
                  onClick: (event: any) => {
                    handleOnTableRow(event, record, index);
                  },
                };
              }}
              dataSource={roadWayInfo}
              columns={columns}
              pagination={false}
              bordered
            />
          </Card.Grid>
          <Card.Grid hoverable={false} style={gridStyleRight}>
            <Form
              {...formItemLayout}
              form={form}
              layout="vertical"
              // className={styles.stepForm}
              initialValues={{
                level: { value: '606ff3e4843ea2749135ba7e', label: '支路' },
                twoWayNumber: '2',
                isMedialStrip: { label: '设有中央物理隔离', value: '5fec7bc85625c82ca93678ab' },
                divider: { label: '划线隔离', value: '5fec7b875625c82ca93678a9' },
                isNearBase: '否',
                planningImplementation: {
                  label: '已按红线实施完成',
                  value: '5fec7af15625c82ca93678a3',
                },
                roadFracture: {
                  label: '一块板',
                  value: '6076b0459ca8d0d819b8fd32',
                },
                redLineWidth: '40',
                widthOfBelt: '40',
                relativePosition: { value: '606ffbb9843ea2749135ba94', label: '位于基地东侧' },
              }}
            >
              <Form.Item
                label="道路名称(Name)"
                name="roadName"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item
                label="道路等级(TypeNo)"
                name="level"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  labelInValue
                  onChange={(value) => console.log(value)}
                >
                  {dictData['dldj'] &&
                    dictData['dldj'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item
                label="双向车道数"
                name="twoWayNumber"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item
                label="有无中央分隔带"
                name="isMedialStrip"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择" style={{ width: '100%' }} labelInValue>
                  {dictData['ywzyfgd'] &&
                    dictData['ywzyfgd'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item
                label="机非分隔情况"
                name="divider"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择" style={{ width: '100%' }} labelInValue>
                  {dictData['jffgqk'] &&
                    dictData['jffgqk'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item
                label="相对基地位置"
                name="relativePosition"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  labelInValue
                  onChange={(value) => {
                    console.log(value);
                  }}
                >
                  {dictData['xdjdwz'] &&
                    dictData['xdjdwz'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item
                label="是否临近基地"
                name="isNearBase"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {dictData['sfljjd'] &&
                    dictData['sfljjd'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item.name}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item
                label="规划红线宽度"
                name="redLineWidth"
                rules={[{ required: true, message: '请选择' }]}
              >
                {/* <InputNumber placeholder="请输入" min={1} max={100} style={{ width: '95%' }} /> 米 */}
                <Input placeholder="请输入" addonAfter="米" />
              </Form.Item>
              <Form.Item
                label="两侧隔离带宽度"
                name="widthOfBelt"
                rules={[{ required: true, message: '请选择' }]}
              >
                {/* <InputNumber placeholder="请输入" min={1} max={100} style={{ width: '95%' }} /> 米 */}
                <Input placeholder="请输入" addonAfter="米" />
              </Form.Item>
              <Form.Item
                label="道路断面形式"
                name="roadFracture"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  labelInValue
                  onChange={(value) => {
                    console.log(value);
                  }}
                >
                  {dictData['dldmxs'] &&
                    dictData['dldmxs'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item
                label="规划实施情况"
                name="planningImplementation"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  labelInValue
                  onChange={hanldeOnPlanning}
                >
                  {dictData['ghssqk'] &&
                    dictData['ghssqk'].map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
              {planningValue &&
                (planningValue == '尚未按规划实施到位' || planningValue == '尚未辟通') && (
                  <>
                    <Form.Item
                      label="建成年份 "
                      name="buildYear"
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        {dictData['jsnx'] &&
                          dictData['jsnx'].map((item: any, index: number) => {
                            return (
                              <Option key={index} value={item.name}>
                                {item.name}
                              </Option>
                            );
                          })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="年份"
                      name="buildEndAt"
                      rules={[{ required: false, message: '请选择' }]}
                    >
                      <DatePicker
                        disabledDate={disabledDate}
                        picker="year"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </>
                )}

              <Form.Item
                label="道路现状"
                name="roadStatus"
                wrapperCol={{ span: 24 }}
                rules={[{ required: false, message: '请选择' }]}
              >
                <TextArea placeholder="请输入" rows={3} />
              </Form.Item>
              <Form.Item
                label="备注"
                name="note"
                wrapperCol={{ span: 24 }}
                rules={[{ required: false, message: '请选择' }]}
              >
                <TextArea placeholder="请输入" rows={3} />
              </Form.Item>
            </Form>
          </Card.Grid>
        </Card>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={onValidateForm}>
              下一步
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
  ({ projectManageAndEditProject }: { projectManageAndEditProject: StateType }) => ({
    stepData: projectManageAndEditProject.step,
    current: projectManageAndEditProject.current,
    currentRecord: projectManageAndEditProject.currentRecord,
  }),
)(Step2);

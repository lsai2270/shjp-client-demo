import {
  Button,
  Table,
  Row,
  Col,
  Alert,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  DatePicker,
  Cascader,
  message,
} from 'antd';
const { Option } = Select;
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { connect, Dispatch } from 'umi';
import { getTreeData } from '@/tools';
import { StateType } from '../../model';
import styles from './index.less';
import { getDictData } from '@/services/projectManage';
import { AnyKindOfDictionary } from 'lodash';
import Item from 'antd/lib/list/Item';

interface Step3Props {
  stepData: StateType['step'];
  current: any;
  dispatch?: Dispatch;
}
const formItemLayout = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 12,
  },
};
const Step3: React.FC<Step3Props> = (props) => {
  const [form] = Form.useForm();
  const [tripForm] = Form.useForm();
  const { validateFields, getFieldsValue } = form;
  const { stepData, current, dispatch } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [dictData, setDictData] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<any>(undefined);
  const [tripTableData, setTripTableData] = useState<any>([
    {
      rail: 0,
      bus: 0,
      car: 0,
      taxi: 0,
      'non-motor': 0,
      walk: 0,
      total: 0,
    },
  ]);
  const [resultTableData, setResultTableData] = useState<any[]>([]); //结果数据
  const [modalTitle, setModalTitle] = useState<any>('设置');
  const [selectedNature, setSelectedNature] = useState<any[]>([]);
  const [rowIndex, setRowIndex] = useState<any>(undefined);

  useEffect(() => {
    //上一步
    if (Object.keys(stepData.step3Form).length > 0) {
      form.setFieldsValue(stepData.step3Form);
      setTableData(stepData.step3Form.tableData);
      setResultTableData(stepData.step3Form.tableData);
    }
    // console.log('stepData', stepData);
    getDictDataAll();
  }, []);

  //下拉框字典
  const getDictDataAll = () => {
    let parentIds = [
      {
        name: '按功能划分建筑面积',
        type: 'gnhfjzmj',
        parentId: '6066f305621189002f1bc6d0',
      },
      {
        name: '建设年限',
        type: 'jsnx',
        parentId: '60768ad7a67748bbc5c764b8',
      },
      {
        name: '日单向出行率',
        type: 'rdxcxl',
        parentId: '606bda40fd9436946e70efbe',
      },
      {
        name: '高峰小时系数',
        type: 'zgfxsxs',
        parentId: '606c0102fd9436946e70f028',
      },
      {
        name: '人群分类',
        type: 'rqfl',
        parentId: '606bd542fd9436946e70efab',
      },
      {
        name: '载客系数',
        type: 'zkxs',
        parentId: '606c0290fd9436946e70f02a',
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
              newDictData[item.type] = item1.children;
            }
          });
        });
        // console.log(newDictData);
        setDictData(newDictData);
      }
    });
  };
  // 获取高峰小时系数,日出行系数
  const handleOnGetParamsRatio = (data: any, index: number) => {
    console.log(data);
    let newTableData = tableData.concat([]);
    let formData: any = {
      [`trafficProductionRate${index}`]: 50,
      [`trafficAtrractionRate${index}`]: 50,
    };
    dictData['rdxcxl'].forEach((item: any) => {
      let selectedPlanningArea = stepData.step1Form.selectedPlanningArea;
      if (selectedPlanningArea[selectedPlanningArea.length - 1].code == item.defaultValue) {
        item.children.forEach((item1: any) => {
          if (item1.code == data[data.length - 1].code) {
            formData[`dayOfTravelRate${index}`] = item1.defaultValue;
          }
        });
      }
    });
    dictData['zgfxsxs'].forEach((item: any) => {
      if (item.code == data[data.length - 1].code) {
        formData[`peakHoursCoefficient${index}`] = item.defaultValue;
      }
    });
    dictData['rqfl'].forEach((item: any) => {
      if (item.code == data[0].code) {
        let zkxsData = dictData['zkxs'].filter(
          (item1: any) => item1.code == item?.children[0]?.code,
        );
        formData[`guestsCoefficient${index}`] = zkxsData[0]?.defaultValue || '1';
      }
    });
    newTableData.splice(index, 1, {
      ...newTableData[index],
      dayOfTravelRate: formData[`dayOfTravelRate${index}`],
      peakHoursCoefficient: formData[`peakHoursCoefficient${index}`],
      guestsCoefficient: formData[`guestsCoefficient${index}`] || '1',
      trafficProductionRate: '50',
      trafficAtrractionRate: '50',
      nature: data,
    });
    setTableData(newTableData);
    form.setFieldsValue(formData);
  };
  const columns: any = [
    {
      title: '地块编号',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 160,
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`name` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <Input
              placeholder="请输入"
              onChange={(e) => {
                handleOnSetTableData(e.target.value, index, 'name');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '用地性质',
      dataIndex: 'nature',
      key: 'nature',
      width: 220,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`nature` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <Cascader
              fieldNames={{ label: 'name', value: '_id' }}
              // changeOnSelect
              options={dictData['gnhfjzmj']}
              onChange={(value, selectedOptions: any) => {
                // console.log('selectedOptions',selectedOptions);
                handleOnGetParamsRatio(selectedOptions, index);
                // setSelectedNature(selectedOptions);
              }}
              placeholder="请选择"
            />
            {/* <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              labelInValue
              onChange={(value) => {
                handleOnSetTableData(value, index, 'nature');
              }}
            >
              {natureData.map((item: any, index: number) => {
                  return (
                    <Option key={index} value={item.value}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select> */}
          </Form.Item>
        );
      },
    },
    {
      title: '建筑面积(平方米)',
      align: 'center',
      dataIndex: 'buildArea',
      key: 'buildArea',
      width: 160,
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`buildArea` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <InputNumber
              placeholder="请输入"
              min={0}
              onChange={(value) => {
                handleOnSetTableData(value, index, 'buildArea');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '日出行比率',
      align: 'center',
      dataIndex: 'dayOfTravelRate',
      key: 'dayOfTravelRate',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`dayOfTravelRate` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <InputNumber
              placeholder="请输入"
              min={0}
              onChange={(value) => {
                handleOnSetTableData(value, index, 'dayOfTravelRate');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '高峰小时系数',
      align: 'center',
      dataIndex: 'peakHoursCoefficient',
      key: 'peakHoursCoefficient',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`peakHoursCoefficient` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <InputNumber
              placeholder="请输入"
              min={0}
              onChange={(value) => {
                handleOnSetTableData(value, index, 'peakHoursCoefficient');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '载客系数',
      align: 'center',
      dataIndex: 'guestsCoefficient',
      key: 'guestsCoefficient',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`guestsCoefficient` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <InputNumber
              placeholder="请输入"
              min={0}
              onChange={(value) => {
                handleOnSetTableData(value, index, 'guestsCoefficient');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '产生比率(%)',
      align: 'center',
      dataIndex: 'trafficProductionRate',
      key: 'trafficProductionRate',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`trafficProductionRate` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <InputNumber
              placeholder="请输入"
              min={0}
              onChange={(value) => {
                handleOnSetTableData(value, index, 'trafficProductionRate');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '吸引比率(%)',
      align: 'center',
      dataIndex: 'trafficAtrractionRate',
      key: 'trafficAtrractionRate',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`trafficAtrractionRate` + index}
            rules={[{ required: true, message: '请选择' }]}
            wrapperCol={{ span: 24 }}
          >
            <InputNumber
              placeholder="请输入"
              min={0}
              onChange={(value) => {
                handleOnSetTableData(value, index, 'trafficAtrractionRate');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '建成年限',
      align: 'center',
      dataIndex: 'buildYear',
      key: 'buildYear',
      width: 260,
      render: (text: any, record: object, index: number) => {
        return (
          <div style={{ display: 'flex' }}>
            <Form.Item
              label=""
              name={`buildYear` + index}
              rules={[{ required: true, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <Select
                style={{ width: '100%' }}
                placeholder="请选择"
                labelInValue
                onChange={(value) => {
                  handleOnSetTableData(value, index, 'buildYear');
                }}
              >
                {dictData['jsnx'] &&
                  dictData['jsnx'].map((item: any, index: number) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              label=""
              name={`buildEndAt` + index}
              rules={[{ required: false, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <DatePicker
                disabledDate={disabledDate}
                picker="year"
                onChange={(date, dateString) => {
                  handleOnSetTableData(dateString, index, 'buildEndAt');
                }}
              />
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: '出行方式',
      align: 'center',
      width: 70,
      dataIndex: 'tripDivision',
      key: 'tripDivision',
      render: (text: any, record: any, index: number) => {
        // console.log(record);
        return (
          <a
            onClick={async () => {
              const formData = await validateFields();
              if (
                Number(record.trafficProductionRate) + Number(record.trafficAtrractionRate) !=
                100
              ) {
                message.warning('吸引比率与产生比率之和应等于100!');
                return;
              }
              setIsModalVisible(true);
              setModalTitle('设置');
              setCurrentIndex(index);
              setTimeout(() => {
                tripForm.setFieldsValue({
                  plotCode: record.name,
                });
                if (record?.tripDivision) {
                  tripForm.setFieldsValue(record?.tripDivision);
                }
              }, 200);
            }}
          >
            设置
          </a>
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 70,
      dataIndex: 'action',
      key: 'action',
      render: (text: any, record: object, index: number) => {
        return (
          <a
            onClick={() => {
              handleOnDelete(index);
            }}
          >
            删除
          </a>
        );
      },
    },
  ];
  const columns1: any = [
    {
      title: '地块编号',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '用地性质',
      dataIndex: 'nature',
      key: 'nature',
      width: 160,
      align: 'center',
      render: (text: any) => {
        let name = '';
        text.forEach((item: any, textIndex: number) => {
          if (textIndex == 0) {
            name += item.name + '/';
          } else {
            name += item.name;
          }
        });
        return <span>{name}</span>;
      },
    },
    {
      title: '建筑面积(平方米)',
      align: 'center',
      dataIndex: 'buildArea',
      key: 'buildArea',
    },
    {
      title: '日出行量(Ptrip/d)',
      align: 'center',
      dataIndex: 'residentTrips',
      key: 'residentTrips',
    },
    {
      title: '高峰小时系数',
      align: 'center',
      dataIndex: 'peakHoursCoefficient',
      key: 'peakHoursCoefficient',
    },
    {
      title: '交通产生量(pcu/h)',
      align: 'center',
      dataIndex: 'trafficProduction',
      key: 'trafficProduction',
      render: (text: any, record: object, index: number) => {
        return (
          <InputNumber
            placeholder="请输入"
            min={0}
            value={text}
            onChange={(value) => {
              let newResultTableData = resultTableData.concat([]);
              newResultTableData.splice(index, 1, {
                ...newResultTableData[index],
                trafficProduction: value + '',
              });
              setResultTableData(newResultTableData);
            }}
          />
        );
      },
    },
    {
      title: '交通吸引量(pcu/h)',
      align: 'center',
      dataIndex: 'trafficAtrraction',
      key: 'trafficAtrraction',
      render: (text: any, record: object, index: number) => {
        return (
          <InputNumber
            placeholder="请输入"
            min={0}
            value={text}
            onChange={(value) => {
              let newResultTableData = resultTableData.concat([]);
              newResultTableData.splice(index, 1, {
                ...newResultTableData[index],
                trafficAtrraction: value + '',
              });
              setResultTableData(newResultTableData);
            }}
          />
        );
      },
    },
    {
      title: '建成年限',
      align: 'center',
      dataIndex: 'buildYear',
      key: 'buildYear',
    },
    {
      title: '出行方式',
      align: 'center',
      width: 70,
      dataIndex: 'tripDivision',
      key: 'tripDivision',
      render: (text: any, record: any, index: number) => {
        return (
          <a
            onClick={() => {
              // console.log(record);
              setModalTitle('查看');
              setRowIndex(index);
              setIsModalVisible(true);
            }}
          >
            查看
          </a>
        );
      },
    },
  ];
  const tripColumns: any[] = [
    {
      title: '轨道交通(%)',
      align: 'center',
      dataIndex: 'rail',
      key: 'rail',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`rail`}
            style={{ marginBottom: '0' }}
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入"
              onChange={(value) => hanldeOnTripChange(value, 'rail')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '公交(%)',
      align: 'center',
      dataIndex: 'bus',
      key: 'bus',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`bus`}
            style={{ marginBottom: '0' }}
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入"
              onChange={(value) => hanldeOnTripChange(value, 'bus')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '汽车(%)',
      align: 'center',
      dataIndex: 'car',
      key: 'car',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`car`}
            style={{ marginBottom: '0' }}
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入"
              onChange={(value) => hanldeOnTripChange(value, 'car')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '出租车(%)',
      align: 'center',
      dataIndex: 'taxi',
      key: 'taxi',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`taxi`}
            style={{ marginBottom: '0' }}
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入"
              onChange={(value) => hanldeOnTripChange(value, 'taxi')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '非机动车(%)',
      align: 'center',
      dataIndex: 'non-motor',
      key: 'non-motor',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`non-motor`}
            style={{ marginBottom: '0' }}
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入"
              onChange={(value) => hanldeOnTripChange(value, 'non-motor')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '步行(%)',
      align: 'center',
      dataIndex: 'walk',
      key: 'walk',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`walk`}
            style={{ marginBottom: '0' }}
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入"
              onChange={(value) => hanldeOnTripChange(value, 'walk')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '总计(%)',
      dataIndex: 'total',
      key: 'total',
      width: 90,
      render: (text: any, record: any, index: any) => {
        return <a>{text}</a>;
      },
    },
  ];
  const tripColumns1: any[] = [
    {
      title: '轨道交通(%)',
      align: 'center',
      dataIndex: 'rail',
      key: 'rail',
    },
    {
      title: '公交(%)',
      align: 'center',
      dataIndex: 'bus',
      key: 'bus',
    },
    {
      title: '汽车(%)',
      align: 'center',
      dataIndex: 'car',
      key: 'car',
    },
    {
      title: '出租车(%)',
      align: 'center',
      dataIndex: 'taxi',
      key: 'taxi',
    },
    {
      title: '非机动车(%)',
      align: 'center',
      dataIndex: 'non-motor',
      key: 'non-motor',
    },
    {
      title: '步行(%)',
      align: 'center',
      dataIndex: 'walk',
      key: 'walk',
    },
    {
      title: '总计(%)',
      dataIndex: 'total',
      key: 'total',
      width: 90,
      render: (text: any, record: any, index: any) => {
        return <a>{text}</a>;
      },
    },
  ];
  const hanldeOnTripChange = (value: any, key: string) => {
    let newTripTableData = tripTableData.concat([]);
    let total = 0;
    for (const key1 in newTripTableData[0]) {
      if (Object.prototype.hasOwnProperty.call(newTripTableData[0], key1)) {
        const element = newTripTableData[0][key1];
        if (key1 != 'total' && key1 != key) {
          total += element;
        }
      }
    }
    if (value + total > 100) {
      message.warning('出行方式总计不能大于100%');
      tripForm.setFieldsValue({
        [key]: newTripTableData[0][key],
      });
    } else {
      newTripTableData.splice(0, 1, {
        ...newTripTableData[0],
        [key]: value,
        total: total + value,
      });
      setTripTableData(newTripTableData);
    }
  };
  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment().endOf('year');
  };
  const handleOnSetTableData = (value: any, index: number, key: any) => {
    let newTableData = tableData.concat([]);
    if (key == 'buildYear') {
      newTableData.splice(index, 1, {
        ...newTableData[index],
        buildYear: value.label,
        buildYearId: value.value,
      });
    } else {
      newTableData.splice(index, 1, {
        ...newTableData[index],
        [key]: value + '',
      });
    }
    setTableData(newTableData);
  };
  const handleOnDelete = (tableIndex: number) => {
    // console.log(tableIndex);
    let newTableData = tableData.filter((item: object, index: number) => index != tableIndex);
    setTableData(newTableData);
  };
  const onPrev = () => {
    if (dispatch) {
      // const values = getFieldsValue();
      dispatch({
        type: 'projectManageAndAddProject/saveStepFormData',
        payload: {
          ...stepData,
        },
      });
      dispatch({
        type: 'projectManageAndAddProject/saveCurrentStep',
        payload: '1',
      });
    }
  };
  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const onValidateForm = async () => {
    const values = await validateFields();
    if (tableData.length != 0 && resultTableData.length == 0) {
      message.warning('请先计算后进行此操作!');
      return;
    }
    if (dispatch) {
      dispatch({
        type: 'projectManageAndAddProject/saveStepFormData',
        payload: {
          ...stepData,
          step3Form: { ...values, tableData: resultTableData },
        },
      });
      dispatch({
        type: 'projectManageAndAddProject/saveCurrentStep',
        payload: '3',
      });
    }
  };
  //添加出行方式确认
  const handleOk = async () => {
    if (modalTitle == '设置') {
      const formData: any = tripForm.validateFields();
      if (tripTableData[0].total != 100) {
        message.warning('出行方式总计应等于100%');
        return;
      }
      let newTableData = tableData.concat([]);
      newTableData.splice(currentIndex, 1, {
        ...newTableData[currentIndex],
        tripDivision: [
          {
            ...tripTableData[0],
            plotCode: newTableData[currentIndex].name,
          },
        ],
      });
      setTableData(newTableData);
      setTripTableData([
        {
          rail: 0,
          bus: 0,
          car: 0,
          taxi: 0,
          'non-motor': 0,
          walk: 0,
          total: 0,
        },
      ]);
      setCurrentIndex(undefined);
    }
    tripForm.resetFields();
    setRowIndex(undefined);
    setIsModalVisible(false);
  };
  //取消添加出行方式
  const handleCancel = () => {
    tripForm.resetFields();
    setCurrentIndex(undefined);
    setRowIndex(undefined);
    setIsModalVisible(false);
  };
  // 添加周边待建项目
  const handleOnAddNearProject = () => {
    // console.log(tableData);
    if (tableData?.length > 0) {
      if (!tableData[tableData.length - 1].tripDivision) {
        message.warning('请先添加当前周边待建地块的出行方式后才能添加新的周边待建地块!');
        return;
      }
    }
    setTableData([...tableData, { type: '2' }]);
  };
  // 计算结果
  const handleOnCalResult = async () => {
    const formData = await form.validateFields();
    if (tableData.length > 0) {
      if (!tableData[tableData.length - 1].tripDivision) {
        message.warning('请先添加当前周边待建地块的出行方式后才能添加新的周边待建地块!');
        return;
      }
    } else {
      message.warning('请先添加当前周边待建地块后才能计算!');
      return;
    }
    let newResultTableData = tableData.map((item: any) => {
      let residentTrips = Math.ceil(item.buildArea * item.dayOfTravelRate * 2);
      // let trafficProduction = residentTrips*item.peakHoursCoefficient*(item.trafficProductionRate/100)*((item.tripDivision[0].car+item.tripDivision[0].taxi)/100);
      // let trafficAtrraction = residentTrips*item.peakHoursCoefficient*(item.trafficAtrractionRate/100)*((item.tripDivision[0].car+item.tripDivision[0].taxi)/100);
      let carProduction = Math.ceil(
        (residentTrips *
          item.peakHoursCoefficient *
          (item.trafficProductionRate / 100) *
          (item.tripDivision[0].car / 100)) /
          item.guestsCoefficient,
      );
      let carAtrraction = Math.ceil(
        (residentTrips *
          item.peakHoursCoefficient *
          (item.trafficAtrractionRate / 100) *
          (item.tripDivision[0].car / 100)) /
          item.guestsCoefficient,
      );
      let taxiProduction = Math.ceil(
        (residentTrips *
          item.peakHoursCoefficient *
          (item.trafficProductionRate / 100) *
          (item.tripDivision[0].taxi / 100)) /
          item.guestsCoefficient,
      );
      let taxiAtrraction = Math.ceil(
        (residentTrips *
          item.peakHoursCoefficient *
          (item.trafficAtrractionRate / 100) *
          (item.tripDivision[0].taxi / 100)) /
          item.guestsCoefficient,
      );
      return {
        ...item,
        residentTrips: residentTrips + '', //出行量
        trafficProduction: carProduction + taxiProduction + '', // 交通产生量
        trafficAtrraction: carAtrraction + taxiAtrraction + '', // 交通吸引量
        carProduction: carProduction + '', // car产生量
        carAtrraction: carAtrraction + '', // car吸引量
        taxiProduction: taxiProduction + '', // taxi产生量
        taxiAtrraction: taxiAtrraction + '', // taxi吸引量
      };
    });
    setResultTableData(newResultTableData);
    form.setFieldsValue({
      result: newResultTableData,
    });
  };
  return (
    <Row>
      <Col span={24} className={styles.stepForm}>
        <Alert closable showIcon message="请设置周边待建项目。" style={{ marginBottom: 24 }} />
        <Row>
          <Col span={24} className={styles.step3Form}>
            <Modal
              title={`${modalTitle}出行方式`}
              visible={isModalVisible}
              width={865}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              {modalTitle == '设置' && (
                <Form layout="vertical" labelCol={{ span: 3 }} form={tripForm} name="tripForm">
                  <Form.Item name="plotCode" label="地块编号" rules={[{ required: true }]}>
                    <Input disabled />
                  </Form.Item>
                  <Form.Item label="出行方式划分" rules={[{ required: true }]}>
                    <Table
                      dataSource={tripTableData}
                      columns={tripColumns}
                      pagination={false}
                      bordered
                    />
                  </Form.Item>
                </Form>
              )}
              {modalTitle == '查看' && (
                <Table
                  dataSource={resultTableData[rowIndex]?.tripDivision}
                  columns={tripColumns1}
                  pagination={false}
                  bordered
                />
              )}
            </Modal>
            <Form
              {...formItemLayout}
              form={form}
              layout="horizontal"
              className={styles.stepForm}
              initialValues={{}}
            >
              <Form.Item label="周边待建项目" rules={[{ required: false, message: '' }]}>
                <Button type="primary" onClick={handleOnCalResult}>
                  计算
                </Button>
              </Form.Item>
              <Row style={{ marginTop: '20px' }}>
                <Col span={23} offset={1}>
                  <Table dataSource={tableData} columns={columns} pagination={false} bordered />
                </Col>
              </Row>
              <Row className={styles.addTable}>
                <Col offset={1} span={23}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                    onClick={handleOnAddNearProject}
                  >
                    添加
                  </Button>
                </Col>
              </Row>
              <Form.Item
                name="result"
                label="计算结果"
                rules={[{ required: false, message: '请先计算!' }]}
              ></Form.Item>
              <Row>
                <Col span={23} offset={1}>
                  <Table
                    dataSource={resultTableData}
                    columns={columns1}
                    pagination={false}
                    bordered
                  />
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
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
  ({ projectManageAndAddProject }: { projectManageAndAddProject: StateType }) => ({
    stepData: projectManageAndAddProject.step,
    current: projectManageAndAddProject.current,
  }),
)(Step3);

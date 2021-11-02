import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  Form,
  Button,
  Card,
  Select,
  Input,
  Table,
  Row,
  Col,
  Tabs,
  message,
  Affix,
  Cascader,
} from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import lodash from 'lodash';
import { PlusOutlined, CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import styles from '../index.less';
import { getComparisonIndex, getTwoPointDirection, getTreeData } from '@/tools';
import { getDictData } from '@/services/projectManage';
import { createNode } from '@/services/predictManage';
const gridStyleLeft: any = {
  width: '30%',
  // textAlign: 'center',
};
const gridStyleRight: any = {
  width: '70%',
  // textAlign: 'center',
};
const columns: any = [
  {
    title: '节点',
    dataIndex: 'nodeName',
    key: 'nodeName',
    align: 'center',
    render: (text: any, record: any, index: number) => {
      return <span>Node{record.num}</span>;
    },
  },
  {
    title: '交叉路',
    align: 'center',
    dataIndex: 'intersection',
    key: 'intersection',
    render: (text: any, record: any, index: number) => {
      return <span>{record.crossRoadName || `-`}</span>;
    },
  },
  {
    title: '是否交叉口',
    align: 'center',
    dataIndex: 'crossroad',
    key: 'crossroad',
    render: (text: any, record: any, index: number) => {
      return <span>{record.crossFlag ? '是' : '否'}</span>;
    },
  },
  {
    title: '设置状态',
    dataIndex: 'status',
    key: 'status',
    width: 90,
    align: 'center',
    render: (text: any, record: any, index: number) => {
      if (record.status) {
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      } else {
        return <a>待设置</a>;
      }
    },
  },
];
const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};
const comparisonOptionsArr = [
  '东进口.左转',
  '东进口.直行',
  // '东进口.右转',
  '南进口.左转',
  '南进口.直行',
  // '南进口.右转',
  '西进口.左转',
  '西进口.直行',
  // '西进口.右转',
  '北进口.左转',
  '北进口.直行',
  // '北进口.右转',
];
function getPostData(values: any, currentNode: any, currentProject: any) {
  // console.log('values', values);
  // console.log('currentNode', currentNode);
  // console.log('currentProject', currentProject);
  let obj: any = {
    _id: currentNode._id,
    name: 'Node' + currentNode.num,
    sum: currentNode.num + '',
    bId: currentNode.bId,
    projectId: currentProject._id,
    projectName: currentProject.name,
    type: currentNode.isConnector ? 'connector' : 'node',
    isIntersection: currentNode.crossFlag ? '1' : '0',
    isConnector: currentNode.isConnector ? true : false,
  };
  if (values.zone) {
    obj.zoneName = values.zone.label;
    obj.zoneId = values.zone.value;
  }
  if (currentNode.crossFlag) {
    obj.crosswayFrom = currentNode.crossRoadName.split('/')[0];
    obj.crosswayTo = currentNode.crossRoadName.split('/')[1];
    obj.crosswayType = values.crosswayType.label;
    obj.crosswayTypeId = values.crosswayType.value;
    obj.enterSetting = currentNode.entrance.map((item: any) => {
      return {
        enterId: item.entrance.value,
        enter: item.entrance.label,
        road: item.road,
        linkId: item.linkNode.bId,
        linkSum: item.linkNode.num + '',
        enterInfoNum: item.entranceRoadNum + '',
        turnRoundLane: item.roundRoad,
        leftHandedLane: item.leftRoad,
        straightHandedLane: item.straight,
        rightHandedLane: item.rightRoad,
      };
    });
    obj.signalControll = currentNode.signalControll;
    obj.signalGroup = currentNode.signalGroup.map((item: any) => {
      return {
        no: item.no,
        signalControllNo: item.signalControll.value + '',
        signalControllName: item.signalControll.label,
        name: item.name,
        greenTimeStart: item.greenTimeStart,
        greenTimeEnd: item.greenTimeEnd,
        amber: item.amber,
      };
    });
    obj.laneTurn = currentNode.laneTurn.map((item: any) => {
      return {
        no: item.no,
        signalGroupNo: item.signalGroup.value,
        signalGroupName: item.signalGroup.label,
        fromLinkId: item.turnStart[0].split('_')[0],
        fromLinkSum: item.turnStart[0].split('_')[1],
        fromLinkSeq: item.turnStart[1] + '',
        toLinkId: item.turnEnd[0].split('_')[0],
        toLinkSum: item.turnEnd[0].split('_')[1],
        toLinkSeq: item.turnEnd[1] + '',
      };
    });
    obj.canalization = values.canalization;
    obj.broaden = values.broaden;
    obj.isComparisonImg = values.isComparisonImg;
    obj.isChannelizationImg = values.isChannelizationImg;
    obj.phasePositionSetting = currentNode.phasePositionSetting;
    if (values.isComparisonImg == '是') {
      let num = currentNode.phasePositionSetting.length - 1;
      obj.signalControllType = getComparisonIndex(num) + '相位';
    } else {
      obj.signalControllType = '无信控';
    }
    return obj;
  }
  return obj;
}
const NodesComp: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { nodesData, linksData, setNodesData, zonesData, currentProject } = props;

  const [entrance, setEntrance] = useState<any[]>([]);
  const [allSignalControll, setAllSignalControll] = useState<any>([]);
  const [signalControll, setSignalControll] = useState<any>([]);
  const [signalGroup, setSignalGroup] = useState<any[]>([]);
  const [laneTurn, setLaneTurn] = useState<any>([]);
  const [linksArr, setLinksArr] = useState<any>([]);
  const [linkNode, setlinkNode] = useState<any>({});
  const [currentRowIndex, setCurrentRowIndex] = useState<any>(undefined);
  const [dictData, setDictData] = useState<any>({});
  const [linkForlanTurn, setLinkForlanTurn] = useState<any>([]);
  const [linkForlanTurnEnd, setLinkForlanTurnEnd] = useState<any>([]);
  const [gateValue, setGateValue] = useState<any>('');
  const [requiredFlag, setRequiredFlag] = useState<any>(true);
  const [nodeFlag, setNodeFlag] = useState<any>(true);
  const [messageFlag, setMessageFlag] = useState<any>(true);
  const [isComparisonFlag, setIsComparisonFlag] = useState<any>(false);
  const [comparisonArr, setComparisonArr] = useState<any[]>([]); // 相位
  const [initComparisonArr, setInitComparisonArr] = useState<any[]>([]); //不受限制相位
  const [selectedComparisonArr, setSelectedComparisonArr] = useState<any[]>([{}]); //已经选择的相位
  const [allComparisonDirection, setAllComparisonDirection] = useState<any[]>([{}]); //相位转向node
  useImperativeHandle(ref, () => ({
    setCurrentNode: (node: any, index: number) => {
      handleOnTableRow(node, index);
    },
  }));
  useEffect(() => {
    getDictDataAll();
  }, []);
  useEffect(() => {
    // handleOnWindowMessage();
  }, [nodesData, currentRowIndex, dictData]);
  const signalColumns: any = [
    {
      title: '序号',
      dataIndex: 'no',
      key: 'no',
      width: 80,
      align: 'center',
      // render: (text: any, record: object, index: number) => {
      //   return <span>{index + 1}</span>;
      // },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`signalControllName` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input
              placeholder="请输入"
              onChange={(e: any) => {
                handleOnUpdateSignalControll(e.target.value, index, 'name');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '周期时长(s)',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`cycleTime` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input
              placeholder="请输入"
              onChange={(e: any) => {
                handleOnUpdateSignalControll(e.target.value, index, 'cycleTime');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 70,
      dataIndex: 'action',
      key: 'action',
      render: (text: any, record: any, index: number) => {
        return (
          <a
            onClick={() => {
              let i = 0;
              signalGroup.forEach((item: any) => {
                if (item.signalControll.label == record.name) {
                  i++;
                }
              });
              if (i != 0) {
                message.warning('请先删除所有引用了此信号控制机的信号灯组后再进行删除操作!');
                return;
              }
              let newSignalControll = signalControll.filter(
                (item1: any, index1: any) => index != index1,
              );
              setSignalControll(newSignalControll);
              let newAllSignalControll = allSignalControll.filter(
                (item1: any, index1: any) => item1.no != record.no,
              );
              setAllSignalControll(newAllSignalControll);
            }}
          >
            删除
          </a>
        );
      },
    },
  ];
  const groupColumns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '信号控制机',
      dataIndex: 'signalControll',
      key: 'signalControll',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`signalControll` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select
              placeholder="请选择"
              labelInValue
              onChange={(value: any) => {
                handleOnUpdateSignalGroup(value, index, 'signalControll');
              }}
            >
              {signalControll.map((item: any, inKey: number) => {
                return (
                  <Option key={inKey} value={item.no}>
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`name` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input
              placeholder="请输入"
              onChange={(e: any) => {
                handleOnUpdateSignalGroup(e.target.value, index, 'name');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '绿灯开始时间(s)',
      dataIndex: 'greenTimeStart',
      key: 'greenTimeStart',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`greenTimeStart` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input
              placeholder="请输入"
              onChange={(e: any) => {
                handleOnUpdateSignalGroup(e.target.value, index, 'greenTimeStart');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '绿灯结束时间(s)',
      dataIndex: 'greenTimeEnd',
      key: 'greenTimeEnd',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`greenTimeEnd` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input
              placeholder="请输入"
              onChange={(e: any) => {
                handleOnUpdateSignalGroup(e.target.value, index, 'greenTimeEnd');
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '黄灯持续时间(s)',
      dataIndex: 'amber',
      key: 'amber',
      align: 'center',
    },
    {
      title: '操作',
      align: 'center',
      width: 70,
      dataIndex: 'action',
      key: 'action',
      render: (text: any, record: any, index: number) => {
        return (
          <a
            onClick={() => {
              let i = 0;
              laneTurn.forEach((item: any) => {
                if (item.signalGroup.label == record.name) {
                  i++;
                }
              });
              if (i != 0) {
                message.warning('请先删除所有引用了此信号灯组的车道转向后再进行删除操作!');
                return;
              }
              let newSignalGroup = signalGroup.filter((item1, index1) => index != index1);
              setSignalGroup(newSignalGroup);
            }}
          >
            删除
          </a>
        );
      },
    },
  ];
  const laneColumns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '信号灯组',
      dataIndex: 'signalGroup',
      key: 'signalGroup',
      width: 200,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <Form.Item
            label=""
            name={`signalGroup` + index}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select
              placeholder="请选择"
              labelInValue
              onChange={(value: any) => {
                handleOnUpdateLaneTurn(value, index, 'signalGroup');
              }}
            >
              {signalGroup.map((item: any, inKey: number) => {
                return (
                  <Option key={inKey} value={item.no}>
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: '转向',
      dataIndex: 'turn',
      key: 'turn',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return (
          <>
            <Form.Item
              label=""
              name={`turnStart` + index}
              rules={[{ required: true, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
              style={{ display: 'inline-block' }}
            >
              <Cascader
                options={linkForlanTurn}
                style={{ width: '220px' }}
                onChange={(value: any) => {
                  handleOnUpdateLaneTurn(value, index, 'turnStart');
                }}
                placeholder="请选择"
              />
            </Form.Item>
            <span
              style={{
                display: 'inline-block',
                height: '32px',
                lineHeight: '32px',
                margin: '0 5px',
              }}
            >
              —
            </span>
            <Form.Item
              label=""
              name={`turnEnd` + index}
              rules={[{ required: true, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
              style={{ display: 'inline-block' }}
            >
              <Cascader
                options={linkForlanTurnEnd}
                style={{ width: '220px' }}
                onChange={(value: any) => {
                  handleOnUpdateLaneTurn(value, index, 'turnEnd');
                }}
                placeholder="请选择"
              />
            </Form.Item>
          </>
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 70,
      dataIndex: 'action',
      key: 'action',
      render: (text: any, record: any, index: number) => {
        return (
          <a
            onClick={() => {
              let newLaneTurn = laneTurn.filter((item1: any, index1: any) => index != index1);
              setLaneTurn(newLaneTurn);
            }}
          >
            删除
          </a>
        );
      },
    },
  ];
  // 进口道设置
  const elColumns: any = [
    {
      title: '进口',
      dataIndex: 'entrance',
      key: 'entrance',
      align: 'center',
      width: 120,
      render: (text: any, record: object, index: number) => {
        return (
          <>
            <Form.Item
              label=""
              name={`entrance` + index}
              rules={[{ required: true, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder="请输入"
                labelInValue
                onChange={(value: any) => {
                  handleOnUpdateEntrance(value, index, 'entrance');
                }}
              >
                {dictData['jckjk'] &&
                  dictData['jckjk'].map((item: any, index: number) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </>
        );
      },
    },
    {
      title: '对应路段',
      dataIndex: 'link',
      key: 'link',
      align: 'center',
      width: 120,
    },
    {
      title: '车道数',
      align: 'center',
      dataIndex: 'entranceRoadNum',
      key: 'entranceRoadNum',
      width: 60,
    },
    {
      title: '掉头车道',
      align: 'center',
      dataIndex: 'roundRoad',
      key: 'roundRoad',
      width: 120,
      render: (text: any, record: any, index: number) => {
        return (
          <>
            <Form.Item
              label=""
              name={`roundRoad` + index}
              rules={[{ required: false, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder="请选择"
                mode="multiple"
                allowClear
                onChange={(value: any) => {
                  handleOnUpdateEntrance(value, index, 'roundRoad');
                }}
              >
                {record.roundRoadIndex &&
                  record.roundRoadIndex.map((item: string, index: number) => {
                    return (
                      <Option key={index} value={item}>
                        {item}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </>
        );
      },
    },
    {
      title: '左转车道',
      align: 'center',
      dataIndex: 'leftRoad',
      key: 'leftRoad',
      width: 120,
      render: (text: any, record: any, index: number) => {
        return (
          <>
            <Form.Item
              label=""
              name={`leftRoad` + index}
              rules={[{ required: false, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder="请选择"
                mode="multiple"
                allowClear
                onChange={(value: any) => {
                  handleOnUpdateEntrance(value, index, 'leftRoad');
                }}
              >
                {record.leftRoadIndex &&
                  record.leftRoadIndex.map((item: string, index: number) => {
                    return (
                      <Option key={index} value={item}>
                        {item}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </>
        );
      },
    },
    {
      title: '直行车道',
      align: 'center',
      dataIndex: 'straight',
      key: 'straight',
      width: 120,
      render: (text: any, record: any, index: number) => {
        return (
          <>
            <Form.Item
              label=""
              name={`straight` + index}
              rules={[{ required: false, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder="请选择"
                mode="multiple"
                allowClear
                onChange={(value: any) => {
                  handleOnUpdateEntrance(value, index, 'straight');
                }}
              >
                {record.straightRoadIndex &&
                  record.straightRoadIndex.map((item: string, index: number) => {
                    return (
                      <Option key={index} value={item}>
                        {item}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </>
        );
      },
    },
    {
      title: '右转车道',
      align: 'center',
      dataIndex: 'rightRoad',
      key: 'rightRoad',
      width: 120,
      render: (text: any, record: any, index: number) => {
        return (
          <>
            <Form.Item
              label=""
              name={`rightRoad` + index}
              rules={[{ required: false, message: '请选择' }]}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder="请选择"
                mode="multiple"
                allowClear
                onChange={(value: any) => {
                  handleOnUpdateEntrance(value, index, 'rightRoad');
                }}
              >
                {record.rightRoadIndex &&
                  record.rightRoadIndex.map((item: string, index: number) => {
                    return (
                      <Option key={index} value={item}>
                        {item}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </>
        );
      },
    },
  ];
  const hanldeOnSave = async () => {
    if (currentRowIndex == undefined) {
      message.warning('请先选中Node后,进行保存!');
      return;
    }
    // if (nodesData[currentRowIndex].status) {
    //   setCurrentRowIndex(undefined);
    //   return;
    // }
    const values = await validateFields();
    // console.log('values', values);
    let newNodesData = nodesData.concat([]);
    let obj: any = {
      ...newNodesData[currentRowIndex],
      values: {
        ...values,
      },
      status: 1,
      entrance: entrance,
      signalGroup: signalGroup,
      signalControll: signalControll,
      laneTurn: laneTurn,
      phasePositionSetting: comparisonArr.concat(initComparisonArr),
    };
    if (nodesData[currentRowIndex]?.status == 1 && nodesData[currentRowIndex].isConnector) {
      obj.zoneId = values.zone.value;
      obj.zoneName = values.zone.label;
    }
    if (gateValue == '1') {
      let currentZones = zonesData.filter((item: any) => item._id == values.zone.value);
      currentZones = currentZones[0];
      obj.zoneNum = currentZones.sum;
    }
    newNodesData.splice(currentRowIndex, 1, obj);
    let postData = getPostData(values, newNodesData[currentRowIndex], currentProject);
    postData.data = nodesData[currentRowIndex];
    // console.log('postData', postData);
    createNode(postData)
      .then((res) => {
        // console.log(res);
        if (res.code == 200) {
          form.resetFields();
          setRowStyle(currentRowIndex);
          setCurrentRowIndex(undefined);
          setNodesData(newNodesData);
          setEntrance([]);
          setLaneTurn([]);
          setSignalControll([]);
          setSignalGroup([]);
          //相位
          setInitComparisonArr([]);
          setComparisonArr([]);
          setSelectedComparisonArr([]);
          message.success('保存成功');
        } else {
          message.error('保存失败');
        }
      })
      .catch((err) => {
        message.error('保存失败');
      });
  };
  const handleOnWindowMessage = () => {
    window.onmessage = (e: any) => {
      // console.log('get data from visum net viewer:', e.data);
      nodesData.forEach((node: any, index: number) => {
        if (node.bId == e.data.id) {
          handleOnTableRow(node, index);
        }
      });
    };
  };
  //选中行
  const handleOnTableRow = (record: any, index: any) => {
    setRowStyle(index);
    console.log('record', record);
    if (index == currentRowIndex) {
      setCurrentRowIndex(undefined);
      setLinksArr([]);
      form.resetFields();
    } else {
      form.resetFields();
      if (record.status == 1) {
        form.setFieldsValue(record.values);
        setSignalControll(record.signalControll);
        setSignalGroup(record.signalGroup);
        setLaneTurn(record.laneTurn);
        setEntrance(record.enterSetting);
        if (record.crossFlag) {
          if (record.isIntersection == '1') {
            let params = {};
            params[`crosswayType`] = { label: record.crosswayType, value: record.crosswayTypeId };
            record.enterSetting.forEach((item: any, index: number) => {
              params[`entrance${index}`] = item.entrance;
              params[`link${index}`] = item.link;
              params['entranceRoadNum'] = item.entranceRoadNum;
              params[`roundRoad${index}`] = item.roundRoad;
              params[`leftRoad${index}`] = item.leftRoad;
              params[`straight${index}`] = item.straight;
              params[`rightRoad${index}`] = item.rightRoad;
            });
            record.signalControll.forEach((item: any, index: number) => {
              params[`signalControllName${index}`] = item.name;
              params[`cycleTime${index}`] = item.cycleTime;
            });
            record.signalGroup.forEach((item: any, index: number) => {
              params[`signalControll${index}`] = item.signalControll;
              params[`name${index}`] = item.name;
              params[`greenTimeStart${index}`] = item.greenTimeStart;
              params[`greenTimeEnd${index}`] = item.greenTimeEnd;
              params[`amber${index}`] = item.amber;
            });

            record.laneTurn.forEach((item: any, index: number) => {
              params[`signalGroup${index}`] = item.signalGroup;
              params[`turnStart${index}`] = item.turnStart;
              params[`turnEnd${index}`] = item.turnEnd;
            });
            form.setFieldsValue({
              ...params,
              canalization: record.canalization,
              broaden: record.broaden,
              isChannelizationImg: record.isChannelizationImg,
              isComparisonImg: record.isComparisonImg,
            });
          }
        }
      }
      // if (nodesData[index] && nodesData[index].crossFlag) {
      let nodeForLinks = linksData.filter(
        (link: any) => nodesData[index].linkIds.indexOf(link.bId) != -1,
      );
      // console.log('nodeForLinks', nodeForLinks);
      let i = 0;
      nodeForLinks.forEach((item: any) => {
        if (item.startNode) {
          i++;
        }
      });
      if (i == nodeForLinks.length) {
        setCurrentRowIndex(index);
      } else {
        setCurrentRowIndex(undefined);
        message.warning('请先设置完所有link后,再进行此操作!');
        return;
      }
      let newLinkForlanTurnEnd: any = [];
      let entranceNameArr: any = [];
      let newLinkForlanTurn = nodeForLinks.map((item: any) => {
        // let roadIndexArr = item.roadIndex.concat(item.roadIndex1);
        let roadIndexArr = item.roadIndex1;
        let nodeIndex: any = undefined; //
        let nodeIndex1: any = undefined;
        item.nodes.forEach((node: any, index1: number) => {
          if (node.num == record.num) {
            nodeIndex = index1;
          } else {
            nodeIndex1 = index1;
          }
        });
        const entranceName: any = getTwoPointDirection(
          item.points[nodeIndex],
          item.points[nodeIndex1],
          'entrance',
        );
        entranceNameArr.push(entranceName);
        newLinkForlanTurnEnd.push({
          value: `${item._id}_${item.num}`,
          label: `${item.name.label}${entranceName.slice(0, 1)}段`,
          children: item.roadIndex.map((item1: any, index: number) => {
            return {
              value: index + 1,
              label: item1,
            };
          }),
        });
        return {
          value: `${item._id}_${item.num}`,
          label: `${item.name.label}${entranceName.slice(0, 1)}段`,
          children: roadIndexArr.map((item1: any, index: number) => {
            return {
              value: index + 1 + Number(item.roadNum),
              label: item1,
            };
          }),
        };
      });
      setLinkForlanTurnEnd(newLinkForlanTurnEnd);
      setLinkForlanTurn(newLinkForlanTurn);
      setLinksArr(nodeForLinks);
      if (record.entrance) {
        setEntrance(record.entrance);
      } else {
        // console.log("nodeForLinks",nodeForLinks);
        let formData: any = {};
        // console.log(record);
        let entranceArr = nodeForLinks.map((item: any, index: number) => {
          let nodeIndex: any = undefined; //
          let nodeIndex1: any = undefined;
          item.nodes.forEach((node: any, index1: number) => {
            if (node.num == record.num) {
              nodeIndex = index1;
            } else {
              nodeIndex1 = index1;
            }
          });
          const entranceName: any = getTwoPointDirection(
            item.points[nodeIndex],
            item.points[nodeIndex1],
            'entrance',
          );
          let entranceObj = dictData['jckjk'].filter((item1: any) => item1.name == entranceName);
          // formData[`link${index}`] = item.bId;
          let dataObj = {
            entrance: { value: entranceObj[0]._id, label: entranceObj[0].name },
            link: `${item.name.label}${entranceName.slice(0, 1)}段`,
            linkNode: item,
            road: item.name.label,
            entranceRoadNum: item.roadNum1,
            // roadIndex: item.roadIndex1,
          };
          if (item.roadNum1 == 1) {
            if (item.roadNum != 0) {
              dataObj['roundRoad'] = item.roadIndex1;
              dataObj['roundRoadIndex'] = item.roadIndex1;
            }
            if (entranceName == '东进口') {
              if (entranceNameArr.includes('西进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '西进口') {
              if (entranceNameArr.includes('东进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '南进口') {
              if (entranceNameArr.includes('北进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '北进口') {
              if (entranceNameArr.includes('南进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
          }
          if (item.roadNum1 == 2) {
            if (item.roadNum != 0) {
              dataObj['roundRoad'] = [item.roadIndex1[0]];
              dataObj['roundRoadIndex'] = item.roadIndex1;
            }
            if (entranceName == '东进口') {
              if (entranceNameArr.includes('西进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '西进口') {
              if (entranceNameArr.includes('东进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '南进口') {
              if (entranceNameArr.includes('北进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '北进口') {
              if (entranceNameArr.includes('南进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
          }
          if (item.roadNum1 >= 3) {
            let newRoadIndex1 = item.roadIndex1.concat([]);
            newRoadIndex1.splice(0, 1);
            newRoadIndex1.splice(newRoadIndex1.length - 1, 1);
            if (item.roadNum != 0) {
              dataObj['roundRoad'] = [item.roadIndex1[0]];
              dataObj['roundRoadIndex'] = item.roadIndex1;
            }
            if (entranceName == '东进口') {
              if (entranceNameArr.includes('西进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '西进口') {
              if (entranceNameArr.includes('东进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '南进口') {
              if (entranceNameArr.includes('北进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
            if (entranceName == '北进口') {
              if (entranceNameArr.includes('南进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
              }
            }
          }
          // console.log("dataObj",dataObj);
          return dataObj;
        });
        let newEntranceArr: any = [];
        entranceArr.forEach((item: any) => {
          if (item.entrance.label == '东进口') {
            newEntranceArr.push(item);
          }
        });
        entranceArr.forEach((item: any) => {
          if (item.entrance.label == '南进口') {
            newEntranceArr.push(item);
          }
        });
        entranceArr.forEach((item: any) => {
          if (item.entrance.label == '西进口') {
            newEntranceArr.push(item);
          }
        });
        entranceArr.forEach((item: any) => {
          if (item.entrance.label == '北进口') {
            newEntranceArr.push(item);
          }
        });
        newEntranceArr.forEach((item: any, index: number) => {
          let formData: any = {};
          formData[`entrance${index}`] = item.entrance;
          if (item.roundRoad) {
            formData[`roundRoad${index}`] = item.roundRoad;
          }
          if (item.leftRoad) {
            formData[`leftRoad${index}`] = item.leftRoad;
          }
          if (item.straight) {
            formData[`straight${index}`] = item.straight;
          }
          if (item.rightRoad) {
            formData[`rightRoad${index}`] = item.rightRoad;
          }
          if (record.status != 1) {
            form.setFieldsValue(formData);
          }
        });
        // console.log("newEntranceArr",newEntranceArr);
        setEntrance(newEntranceArr);
        setIsComparisonFlag(false);
        form.setFieldsValue({
          ...formData,
          // signalControllName0: 'sc1',
          // cycleTime0: '120',
          // signalControll0: { value: 1, label: 'sc1' },
          // name0: 'sg1',
          // greenTimeStart0: '0',
          // greenTimeEnd0: '20',
          // 'amber0': "3"
        });
      }
      if (record.status != 1) {
        if (nodesData[index].crossFlag) {
          let num = allSignalControll.length + 1 + '';
          setSignalControll([
            {
              no: num,
              name: 'sc' + num,
              cycleTime: '120',
            },
          ]);
          setSignalGroup([
            {
              no: '1',
              signalControll: { value: '1', label: 'sc1' },
              name: 'sg1',
              greenTimeStart: '0',
              greenTimeEnd: '20',
              amber: '3',
            },
          ]);
          setLaneTurn([
            {
              no: '1',
            },
          ]);
        }
      }
      if (nodesData[index] && nodesData[index].isConnector) {
        setGateValue('1');
        form.setFieldsValue({
          zone: {
            value: record.zoneId,
            label: record.zoneName,
          },
        });
      } else {
        setGateValue('0');
      }
      if (record.status == 1) {
        if (record.isComparisonImg == '是') {
          setIsComparisonFlag(true);
          let newinitComparisonArr =
            record.phasePositionSetting[record.phasePositionSetting.length - 1];
          setInitComparisonArr([newinitComparisonArr]);
          setComparisonArr(
            record.phasePositionSetting.slice(0, record.phasePositionSetting.length - 1),
          );
        } else {
          setIsComparisonFlag(false);
        }
      }
    }
  };
  const setRowStyle = (index: number) => {
    let nodeElement: any = document.getElementById('nodeLists');
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
  //下拉框字典
  const getDictDataAll = () => {
    let parentIds = [
      {
        name: '交叉口类型',
        type: 'jcklx',
        parentId: '60703101843ea2749135bac1',
      },
      {
        name: '交叉口进口',
        type: 'jckjk',
        parentId: '608115ccdc75f61295d3307f',
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
              if (item.type == 'dkssyt' || item.type == 'agnhfjzmj') {
                newDictData[item.type] = item1.children.map((item2: any) => {
                  return {
                    ...item2,
                    disabled: true,
                    checkable: false,
                  };
                });
              } else {
                newDictData[item.type] = item1.children;
              }
            }
          });
        });
        console.log(newDictData);
        setDictData(newDictData);
      }
    });
  };
  const handleOnUpdateSignalControll = (value: string, index: number, key: string) => {
    let newSignalControll = signalControll.concat([]);
    newSignalControll.splice(index, 1, {
      ...newSignalControll[index],
      [key]: value,
    });
    setSignalControll(newSignalControll);
  };
  //
  const handleOnUpdateSignalGroup = (value: string, index: number, key: string) => {
    let newSignalGroup = signalGroup.concat([]);
    newSignalGroup.splice(index, 1, {
      ...newSignalGroup[index],
      [key]: value,
    });
    setSignalGroup(newSignalGroup);
  };
  const handleOnUpdateLaneTurn = (value: string, index: number, key: string) => {
    let newLaneTurn = laneTurn.concat([]);
    newLaneTurn.splice(index, 1, {
      ...newLaneTurn[index],
      [key]: value,
    });
    setLaneTurn(newLaneTurn);
  };
  const handleOnUpdateEntrance = (value: any, index: number, key: string) => {
    // console.log(value);
    let newEntrance = entrance.concat([]);
    if (key == 'entrance') {
      let entranceNameArr: any[] = [];
      let formData: any = {};
      linksArr.forEach((item: any) => {
        let nodeIndex: any = undefined; //
        let nodeIndex1: any = undefined;
        item.nodes.forEach((node: any, index1: number) => {
          if (node.num == nodesData[currentRowIndex].num) {
            nodeIndex = index1;
          } else {
            nodeIndex1 = index1;
          }
        });
        const entranceName: any = getTwoPointDirection(
          item.points[nodeIndex],
          item.points[nodeIndex1],
          'entrance',
        );
        entranceNameArr.push(entranceName);
        let dataObj = {
          ...newEntrance[index],
          link: `${item.name.label}${entranceName.slice(0, 1)}段`,
          linkNode: item,
          entranceRoadNum: item.roadNum1,
          roadIndex: item.roadIndex1,
        };
        if (value.label == entranceName) {
          if (item.roadNum1 == 1) {
            if (item.roadNum != 0) {
              dataObj['roundRoad'] = item.roadIndex1;
              dataObj['roundRoadIndex'] = item.roadIndex1;
              formData[`roundRoad${index}`] = item.roadIndex1;
            }
            if (entranceName == '东进口') {
              if (entranceNameArr.includes('西进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = item.roadIndex1;
              }
            }
            if (entranceName == '西进口') {
              if (entranceNameArr.includes('东进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = item.roadIndex1;
              }
            }
            if (entranceName == '南进口') {
              if (entranceNameArr.includes('北进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = item.roadIndex1;
              }
            }
            if (entranceName == '北进口') {
              if (entranceNameArr.includes('南进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['leftRoad'] = item.roadIndex1;
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = item.roadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['rightRoad'] = item.roadIndex1;
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = item.roadIndex1;
              }
            }
          }
          if (item.roadNum1 == 2) {
            if (item.roadNum != 0) {
              dataObj['roundRoad'] = [item.roadIndex1[0]];
              dataObj['roundRoadIndex'] = item.roadIndex1;
              formData[`roundRoad${index}`] = [item.roadIndex1[0]];
            }
            if (entranceName == '东进口') {
              if (entranceNameArr.includes('西进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = [item.roadIndex1[1]];
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[1]];
              }
            }
            if (entranceName == '西进口') {
              if (entranceNameArr.includes('东进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = [item.roadIndex1[1]];
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[1]];
              }
            }
            if (entranceName == '南进口') {
              if (entranceNameArr.includes('北进口')) {
                dataObj['straight'] = item.roadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = [item.roadIndex1[1]];
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[1]];
              }
            }
            if (entranceName == '北进口') {
              if (entranceNameArr.includes('南进口')) {
                dataObj['straight'] = [item.roadIndex1[1]];
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = [item.roadIndex1[1]];
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[1]];
              }
            }
          }
          if (item.roadNum1 >= 3) {
            let newRoadIndex1 = item.roadIndex1.concat([]);
            newRoadIndex1.splice(0, 1);
            newRoadIndex1.splice(newRoadIndex1.length - 1, 1);
            if (item.roadNum != 0) {
              dataObj['roundRoad'] = [item.roadIndex1[0]];
              dataObj['roundRoadIndex'] = item.roadIndex1;
              formData[`roundRoad${index}`] = [item.roadIndex1[0]];
            }
            if (entranceName == '东进口') {
              if (entranceNameArr.includes('西进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = newRoadIndex1;
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[item.roadIndex1.length - 1]];
              }
            }
            if (entranceName == '西进口') {
              if (entranceNameArr.includes('东进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = newRoadIndex1;
              }
              if (entranceNameArr.includes('北进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('南进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[item.roadIndex1.length - 1]];
              }
            }
            if (entranceName == '南进口') {
              if (entranceNameArr.includes('北进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = newRoadIndex1;
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[item.roadIndex1.length - 1]];
              }
            }
            if (entranceName == '北进口') {
              if (entranceNameArr.includes('南进口')) {
                dataObj['straight'] = newRoadIndex1;
                dataObj['straightRoadIndex'] = item.roadIndex1;
                formData[`straight${index}`] = newRoadIndex1;
              }
              if (entranceNameArr.includes('东进口')) {
                dataObj['leftRoad'] = [item.roadIndex1[0]];
                dataObj['leftRoadIndex'] = item.roadIndex1;
                formData[`leftRoad${index}`] = [item.roadIndex1[0]];
              }
              if (entranceNameArr.includes('西进口')) {
                dataObj['rightRoad'] = [item.roadIndex1[item.roadIndex1.length - 1]];
                dataObj['rightRoadIndex'] = item.roadIndex1;
                formData[`rightRoad${index}`] = [item.roadIndex1[item.roadIndex1.length - 1]];
              }
            }
          }
          newEntrance.splice(index, 1, dataObj);
        }
      });
      if (!entranceNameArr.includes(value.label)) {
        message.warning('该交叉口没有该进口方向!');
        form.setFieldsValue({
          [`entrance${index}`]: newEntrance[index].entrance,
        });
      }
      newEntrance.splice(index, 1, {
        ...newEntrance[index],
        [key]: value,
      });
      form.setFieldsValue(formData);
    } else {
      newEntrance.splice(index, 1, {
        ...newEntrance[index],
        [key]: value,
      });
    }
    // console.log('newEntrance', newEntrance);
    setEntrance(newEntrance);
  };
  //相位添加
  const handleOnAddComparison = () => {
    setComparisonArr([...comparisonArr, {}]);
  };
  //相位删除
  const handleOnRemoveComparison = (index: number) => {
    let newComparisonArr = comparisonArr.concat([]);
    newComparisonArr.splice(index, 1);
    setComparisonArr(newComparisonArr);
  };
  // 相位设置数据
  const handleOnSetComparion = (value: any) => {
    // console.log(entrance);
    let i = 0;
    entrance.forEach((item) => {
      if (item.entrance) {
        i++;
      }
    });
    if (i != entrance.length) {
      message.warning('请先完善进出口道路设置!');
      if (value == '是') {
        form.setFieldsValue({
          isComparisonImg: '否',
        });
      }
      return;
    }
    if (signalGroup.length == 0) {
      message.warning('请先添加红绿灯设置!');
      if (value == '是') {
        form.setFieldsValue({
          isComparisonImg: '否',
        });
      }
      return;
    }
    let laneTurnStatus = false;
    laneTurn.forEach((item: any) => {
      if (!item.signalGroup || !item.turnStart || !item.turnEnd) {
        laneTurnStatus = true;
      }
    });
    if (laneTurnStatus) {
      if (value == '是') {
        form.setFieldsValue({
          isComparisonImg: '否',
        });
      }
      message.warning('请先完善车道转向!');
      return;
    }
    if (value == '是') {
      setIsComparisonFlag(true);
    } else {
      setIsComparisonFlag(false);
    }
    if (value == '是') {
      // let entranceArr = entrance.map((item: any) => item.entrance.label);
      // console.log(entranceArr);
      let newComparisonArr: any[] = [];
      let objArr: any = {};
      let noLimitComparisonArr: any[] = [];
      // 相位每个转向的node
      let newAllComparisonDirection: any[] = [];
      // console.log('entrance', entrance);
      // console.log('laneTurn', laneTurn);
      function setComparion(item: any, entranceName: string, num: number, num1: number) {
        if (item.leftRoad && item.straight) {
          if (item.leftRoad[0] == item.straight[0]) {
            objArr[`leftAndstraight${num == 0 ? '' : num}`] =
              objArr[`leftAndstraight${num == 0 ? '' : num}`] || [];
            objArr[`leftAndstraight${num == 0 ? '' : num}`].push(
              ...[
                {
                  phasePositionName: entranceName + '.左转',
                  ...handleGetComparionDirection(entranceName, ['左转'], entrance),
                },
                {
                  phasePositionName: entranceName + '.直行',
                  ...handleGetComparionDirection(entranceName, ['直行'], entrance),
                },
              ],
            );
          } else {
            objArr[`leftRoad${num1 == 0 ? '' : num1}`] =
              objArr[`leftRoad${num1 == 0 ? '' : num1}`] || [];
            objArr[`straight${num1 == 0 ? '' : num1}`] =
              objArr[`straight${num1 == 0 ? '' : num1}`] || [];
            objArr[`leftRoad${num1 == 0 ? '' : num1}`].push({
              phasePositionName: entranceName + '.左转',
              ...handleGetComparionDirection(entranceName, ['左转'], entrance),
            });
            objArr[`straight${num1 == 0 ? '' : num1}`].push({
              phasePositionName: entranceName + '.直行',
              ...handleGetComparionDirection(entranceName, ['直行'], entrance),
            });
          }
        } else if (item.leftRoad || item.straight) {
          if (item.leftRoad) {
            objArr[`leftRoad${num1 == 0 ? '' : num1}`] =
              objArr[`leftRoad${num1 == 0 ? '' : num1}`] || [];
            objArr[`leftRoad${num1 == 0 ? '' : num1}`].push({
              phasePositionName: entranceName + '.左转',
              ...handleGetComparionDirection(entranceName, ['左转'], entrance),
            });
          }
          if (item.straight) {
            objArr[`straight${num1 == 0 ? '' : num1}`] =
              objArr[`straight${num1 == 0 ? '' : num1}`] || [];
            objArr[`straight${num1 == 0 ? '' : num1}`].push({
              phasePositionName: entranceName + '.直行',
              ...handleGetComparionDirection(entranceName, ['直行'], entrance),
            });
          }
        }
      }
      entrance.forEach((item: any, number) => {
        // if(entrance)
        if (item.entrance.label == '东进口') {
          setComparion(item, '东进口', 0, 0);
        }
        if (item.entrance.label == '西进口') {
          setComparion(item, '西进口', 1, 0);
        }
        if (item.entrance.label == '南进口') {
          setComparion(item, '南进口', 2, 1);
        }
        if (item.entrance.label == '北进口') {
          setComparion(item, '北进口', 3, 1);
        }
        // 不受限制相位
        if (item.rightRoad) {
          if (item.entrance.label == '东进口') {
            noLimitComparisonArr.push({
              phasePositionName: '东进口.右转',
              ...handleGetComparionDirection('东进口', ['右转'], entrance),
            });
          }
          if (item.entrance.label == '西进口') {
            noLimitComparisonArr.push({
              phasePositionName: '西进口.右转',
              ...handleGetComparionDirection('西进口', ['右转'], entrance),
            });
          }
          if (item.entrance.label == '南进口') {
            noLimitComparisonArr.push({
              phasePositionName: '南进口.右转',
              ...handleGetComparionDirection('南进口', ['右转'], entrance),
            });
          }
          if (item.entrance.label == '北进口') {
            noLimitComparisonArr.push({
              phasePositionName: '北进口.右转',
              ...handleGetComparionDirection('北进口', ['右转'], entrance),
            });
          }
        }
      });
      let newSelectedComparsion = [];
      let breakFlag = false;
      let roadName = '';
      for (const key in objArr) {
        if (Object.prototype.hasOwnProperty.call(objArr, key)) {
          const element = objArr[key];
          // console.log('element----->', element);
          element.forEach((dirItem: any) => {
            if (dirItem.greenTightTime == 'null') {
              breakFlag = true;
              roadName = dirItem.fromAndToRoadName;
            }
          });
          if (breakFlag) {
            break;
          }
          newSelectedComparsion.push(...element);
          newComparisonArr.push({
            direction: element,
          });
        }
      }
      if (breakFlag) {
        message.warning(`请先添加${roadName}的转向!`);
        setIsComparisonFlag(false);
        form.setFieldsValue({
          isComparisonImg: '否',
        });
        return;
      }
      newComparisonArr = newComparisonArr.map((item: any, index: number) => {
        return {
          ...item,
          phasePosition: `第${getComparisonIndex(index + 1)}相位`,
        };
      });
      // console.log(newComparisonArr);
      // 不受限制相位
      setInitComparisonArr([
        {
          phasePosition: '不受限制相位',
          direction: noLimitComparisonArr,
        },
      ]);
      console.log('newComparisonArr', newComparisonArr);
      // 相位
      setComparisonArr(newComparisonArr);
      // 已选择相位
      setSelectedComparisonArr(newSelectedComparsion);
      form.setFieldsValue({
        phasePositionSetting: newComparisonArr.concat(noLimitComparisonArr),
      });
    }
  };
  // 相位node 节点
  const handleGetComparionDirection = (direction: string, type: any[], entrances: any[]) => {
    let directionNodes: any = {};
    let entranceItem: any = entrances.filter((item: any) => item.entrance.label == direction);
    entranceItem = entranceItem[0];
    // 获取相位节点数据
    function getDirectionNodes(nodes: any, item: any, roadType: string) {
      let greenTightTime: any = null;
      laneTurn.forEach((laneItem: any) => {
        if (laneItem?.turnStart[0]?.includes(entranceItem.linkNode._id)) {
          if (laneItem?.turnEnd[0]?.includes(item.linkNode._id)) {
            signalGroup.forEach((signalItem: any) => {
              if (signalItem.no == laneItem.signalGroup.value) {
                greenTightTime =
                  Number(signalItem.greenTimeEnd) - Number(signalItem.greenTimeStart);
              }
            });
          }
        }
      });
      let nodesNum = entranceItem?.linkNode?.nodes?.map((node: any) => node.num);
      nodes.forEach((nodeItem: any, nodeIndex: number) => {
        let index1 = nodesNum.indexOf(nodeItem.num);
        if (index1 != -1) {
          let vianodeno = nodesNum.splice(index1, 1);
          directionNodes = {
            from_node: nodesNum[0] + '',
            via_node: vianodeno[0] + '',
            to_node: nodes[nodes.length - nodeIndex - 1].num + '',
            lanesNumber: getLanesNumber(),
            greenTightTime: greenTightTime + '',
          };
          if (!greenTightTime) {
            directionNodes['fromAndToRoadName'] = `${entranceItem.link}/${item.link}`;
          }
        }
      });
      function getLanesNumber() {
        let num = 0;
        let roadTypeArr = ['straight', 'leftRoad', 'rightRoad', 'roundRoad'];
        let roads = entranceItem[roadType];
        if (entranceItem) {
          const newroadTypeArr = roadTypeArr.filter((item: any) => item != roadType);
          roads.forEach((item: any) => {
            let i = 0;
            newroadTypeArr.forEach((type: any) => {
              if (entranceItem[type] && entranceItem[type]?.indexOf(item) != -1) {
                i++;
              }
            });
            if (i == 0) {
              num++;
            } else {
              num += Math.floor((1 / (i + 1)) * 100) / 100;
            }
          });
        }
        return num;
      }
    }
    if (direction == '东进口') {
      entrances.forEach((item) => {
        let nodes = item?.linkNode?.nodes;
        if (type.includes('直行')) {
          if (item.entrance.label == '西进口') {
            getDirectionNodes(nodes, item, 'straight');
          }
        }
        if (type.includes('左转')) {
          if (item.entrance.label == '南进口') {
            getDirectionNodes(nodes, item, 'leftRoad');
          }
        }
        if (type.includes('右转')) {
          if (item.entrance.label == '北进口') {
            getDirectionNodes(nodes, item, 'rightRoad');
          }
        }
      });
    }
    if (direction == '南进口') {
      entrances.forEach((item) => {
        let nodes = item?.linkNode?.nodes;
        if (type.includes('直行')) {
          if (item.entrance.label == '北进口') {
            getDirectionNodes(nodes, item, 'straight');
          }
        }
        if (type.includes('左转')) {
          if (item.entrance.label == '西进口') {
            getDirectionNodes(nodes, item, 'leftRoad');
          }
        }
        if (type.includes('右转')) {
          if (item.entrance.label == '东进口') {
            getDirectionNodes(nodes, item, 'rightRoad');
          }
        }
      });
    }
    if (direction == '西进口') {
      entrances.forEach((item) => {
        let nodes = item?.linkNode?.nodes;
        if (type.includes('直行')) {
          if (item.entrance.label == '东进口') {
            getDirectionNodes(nodes, item, 'straight');
          }
        }
        if (type.includes('左转')) {
          if (item.entrance.label == '北进口') {
            getDirectionNodes(nodes, item, 'leftRoad');
          }
        }
        if (type.includes('右转')) {
          if (item.entrance.label == '南进口') {
            getDirectionNodes(nodes, item, 'rightRoad');
          }
        }
      });
    }
    if (direction == '北进口') {
      entrances.forEach((item) => {
        let nodes = item?.linkNode?.nodes;
        if (type.includes('直行')) {
          if (item.entrance.label == '南进口') {
            getDirectionNodes(nodes, item, 'straight');
          }
        }
        if (type.includes('左转')) {
          if (item.entrance.label == '东进口') {
            getDirectionNodes(nodes, item, 'leftRoad');
          }
        }
        if (type.includes('右转')) {
          if (item.entrance.label == '西进口') {
            getDirectionNodes(nodes, item, 'rightRoad');
          }
        }
      });
    }
    // console.log("directionNodes===>",directionNodes);
    return directionNodes;
  };
  //
  const handleOnSetComparsion = (value: any, index: number) => {
    console.log('value', value);
    let newComparisonArr = comparisonArr.concat([]);
    let i = 0;
    value.forEach((item: any) => {
      if (selectedComparisonArr.includes(item)) {
        i++;
      }
    });
    if (i > 0) {
      message.warning('已经添加过的相位不能重复添加!');
      return;
    }
    newComparisonArr.splice(index, 1, {
      ...newComparisonArr[index],
      direction: value.map((item: any) => {
        let objArr = item.split('.');
        return {
          phasePositionName: item,
          ...handleGetComparionDirection(objArr[0], [objArr[1]], entrance),
        };
      }),
    });
    setComparisonArr(newComparisonArr);
  };
  return (
    <Card>
      <Card.Grid hoverable={false} style={gridStyleLeft}>
        <div>节点列表：</div>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleRight}>
        <Affix offsetTop={120}>
          <Button type="primary" onClick={hanldeOnSave}>
            保存
          </Button>
        </Affix>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleLeft}>
        <Table
          id="nodeLists"
          onRow={(record, index) => {
            return {
              onClick: (event: any) => {
                handleOnTableRow(record, index);
              },
            };
          }}
          dataSource={nodesData}
          columns={columns}
          pagination={false}
          scroll={{ y: 700 }}
          bordered
        />
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleRight}>
        {/* {currentRowIndex != undefined && ( */}
        {true && (
          <Form
            {...formItemLayout}
            form={form}
            layout="horizontal"
            // className={styles.stepForm}
            initialValues={{
              isChannelizationImg: '否',
              isComparisonImg: '否',
              canalization: '各进口道均进行渠化设置',
              broaden: '交叉口处无展宽',
            }}
          >
            <Row style={{ height: '50px', lineHeight: '50px' }}>
              <Col style={{ width: '115px' }}>是否交叉口:</Col>
              <Col span={20}>
                {lodash.get(nodesData[currentRowIndex], 'crossFlag') ? '是' : '否'}
              </Col>
            </Row>
            <Row style={{ height: '35px', lineHeight: '35px' }}>
              <Col style={{ width: '115px' }}>是否小区出入口:</Col>
              <Col span={1}>{gateValue == '1' ? '是' : '否'}</Col>
              <Col span={10}>
                {gateValue == '1' && (
                  <Form.Item label="" name="zone" rules={[{ required: true, message: '请选择' }]}>
                    <Select
                      placeholder="选择小区"
                      style={{ width: '200px', marginLeft: '10px' }}
                      labelInValue
                    >
                      {zonesData &&
                        zonesData.map((zone: any, index: number) => {
                          return <Option value={zone._id}>{zone.name}</Option>;
                        })}
                    </Select>
                  </Form.Item>
                )}
              </Col>
            </Row>
            <div style={{ display: 'flex' }}></div>
            {lodash.get(nodesData[currentRowIndex], 'crossFlag') && (
              <>
                <Row style={{ height: '50px', lineHeight: '50px' }}>
                  <Col style={{ width: '115px' }}>交叉路:</Col>
                  <Col span={10}>{lodash.get(nodesData[currentRowIndex], 'crossRoadName')}</Col>
                </Row>
                <Form.Item
                  label="交叉口类型"
                  name="crosswayType"
                  labelAlign="left"
                  labelCol={{ span: 3 }}
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Select placeholder="请选择" style={{ width: '200px' }} labelInValue>
                    {dictData['jcklx'] &&
                      dictData['jcklx'].map((item: any, index: number) => {
                        return (
                          <Option key={index} value={item._id}>
                            {item.name}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </>
            )}
            {lodash.get(nodesData[currentRowIndex], 'crossFlag') && (
              <>
                <Row style={{ height: '50px', lineHeight: '50px', zIndex: 10 }}>
                  <Col span={12}>进口车道设置(车道编号方法-沿着驶进交叉口的方向从左至右):</Col>
                </Row>
                <Row style={{ marginBottom: '20px' }}>
                  <Col span={24} className={styles.includeRodeTable}>
                    <Table
                      dataSource={entrance}
                      columns={elColumns}
                      size="small"
                      pagination={false}
                      bordered
                    />
                  </Col>
                </Row>
                <Form.Item
                  label="渠化情况"
                  name="canalization"
                  labelAlign="left"
                  labelCol={{ span: 3 }}
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item
                  label="展宽情况"
                  name="broaden"
                  labelAlign="left"
                  labelCol={{ span: 3 }}
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                {lodash.get(nodesData[currentRowIndex], 'crossFlag') && (
                  <>
                    <Row style={{ height: '50px', lineHeight: '50px', zIndex: 10 }}>
                      <Col span={3}>信号控制机:</Col>
                      <Col span={21}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setSignalControll([
                              ...signalControll,
                              { no: allSignalControll.length + 1 + '' },
                            ]);
                            setAllSignalControll([
                              ...allSignalControll,
                              { no: allSignalControll.length + 1 + '' },
                            ]);
                          }}
                        >
                          添加
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className={styles.includeRodeTable}>
                        <Table
                          dataSource={signalControll}
                          columns={signalColumns}
                          size="small"
                          pagination={false}
                          bordered
                        />
                      </Col>
                    </Row>
                    <Row style={{ height: '50px', lineHeight: '50px' }}>
                      <Col span={3}>信号灯组:</Col>
                      <Col span={21}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setSignalGroup([
                              ...signalGroup,
                              { no: signalGroup.length + 1 + '', amber: '3' },
                            ]);
                          }}
                        >
                          添加
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className={styles.includeRodeTable}>
                        <Table
                          dataSource={signalGroup}
                          columns={groupColumns}
                          size="small"
                          pagination={false}
                          bordered
                        />
                      </Col>
                    </Row>
                    <Row style={{ height: '50px', lineHeight: '50px' }}>
                      <Col span={3}>车道转向:</Col>
                      <Col span={21}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setLaneTurn([...laneTurn, { no: laneTurn.length + 1 + '' }]);
                          }}
                        >
                          添加
                        </Button>
                      </Col>
                    </Row>
                    <Row style={{ marginBottom: '20px' }}>
                      <Col span={24} className={styles.includeRodeTable}>
                        <Table
                          dataSource={laneTurn}
                          columns={laneColumns}
                          size="small"
                          pagination={false}
                          bordered
                        />
                      </Col>
                    </Row>
                    <Form.Item
                      label="是否需要输出交叉口渠化图"
                      name="isChannelizationImg"
                      labelAlign="left"
                      labelCol={{ span: 5 }}
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      <Select
                        placeholder="请选择"
                        style={{ width: '120px', marginLeft: '10px' }}
                        onChange={(value: string) => {}}
                      >
                        <Option value="是">是</Option>
                        <Option value="否">否</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="是否需要输出交叉口流量及服务水平对比图"
                      name="isComparisonImg"
                      labelCol={{ span: 8 }}
                      labelAlign="left"
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      <Select
                        placeholder="请选择"
                        style={{ width: '120px' }}
                        onChange={(value: any) => {
                          handleOnSetComparion(value);
                        }}
                      >
                        <Option value="是">是</Option>
                        <Option value="否">否</Option>
                      </Select>
                    </Form.Item>
                    {isComparisonFlag && (
                      <Form.Item
                        label="相位设置"
                        name="phasePositionSetting"
                        labelCol={{ span: 3 }}
                        labelAlign="left"
                        style={{ flexDirection: 'column' }}
                        rules={[{ required: true, message: '请选择' }]}
                      >
                        <Row>
                          <Col>
                            <div className={styles.colGap}>
                              <span className={styles.formulaHead} style={{ width: '200px' }}>
                                相位
                              </span>
                              <span className={styles.formulaHead} style={{ width: '500px' }}>
                                转向交通
                              </span>
                              <span className={styles.formulaHead} style={{ width: '100px' }}>
                                操作
                              </span>
                            </div>
                            {comparisonArr.map((item: any, index) => {
                              let valueArr = item?.direction.map(
                                (item1: any) => item1?.phasePositionName,
                              );
                              return (
                                <div className={styles.colGap} key={index}>
                                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                                    {item?.phasePosition}
                                  </span>
                                  <Select
                                    placeholder="请选择!"
                                    style={{ width: '500px' }}
                                    mode="multiple"
                                    allowClear
                                    value={valueArr}
                                    onChange={(value) => handleOnSetComparsion(value, index)}
                                  >
                                    {comparisonOptionsArr.map((item, index) => {
                                      return (
                                        <Option key={index} value={item}>
                                          {item}
                                        </Option>
                                      );
                                    })}
                                  </Select>
                                  {index != 0 && (
                                    <span className={styles.iconContain}>
                                      <MinusCircleOutlined
                                        className={styles.removeIcon}
                                        onClick={() => handleOnRemoveComparison(index)}
                                      />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {initComparisonArr.map((item: any, index) => {
                              let valueArr = item?.direction.map(
                                (item1: any) => item1?.phasePositionName,
                              );
                              return (
                                <div className={styles.colGap} key={index}>
                                  <span className={styles.formulaHead} style={{ width: '200px' }}>
                                    {item?.phasePosition}
                                  </span>
                                  <Select
                                    placeholder="请选择!"
                                    style={{ width: '500px' }}
                                    mode="multiple"
                                    allowClear
                                    value={valueArr}
                                    // onChange={(value) => hanldeOnParamsForm(value, index, 'type')}
                                  >
                                    <Option value="东进口.右转">东进口.右转</Option>
                                    <Option value="西进口.右转">西进口.右转</Option>
                                    <Option value="南进口.右转">南进口.右转</Option>
                                    <Option value="北进口.右转">北进口.右转</Option>
                                  </Select>
                                </div>
                              );
                            })}
                            <div>
                              <Button style={{ width: '800px' }} onClick={handleOnAddComparison}>
                                添加
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form.Item>
                    )}
                  </>
                )}
              </>
            )}
          </Form>
        )}
      </Card.Grid>
    </Card>
  );
};
export default forwardRef(NodesComp);

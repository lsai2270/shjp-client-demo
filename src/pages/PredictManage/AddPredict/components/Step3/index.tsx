import {
  Button,
  Table,
  Row,
  Col,
  Alert,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  message,
} from 'antd';
const { Option } = Select;
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { connect, Dispatch } from 'umi';
import { StateType } from '../../model';
import styles from './index.less';
import lodash from 'lodash';
import { getAllLinks, tflowfuzzy, procedureRes } from '@/services/predictManage';
import {
  generateTurns,
  generateDMDMatrix,
  generagePA,
  getTreeData,
  getCapprt,
  getServiceLevel,
} from '@/tools';
import { getDictData } from '@/services/projectManage';
import Loading from '@/components/Loading';
interface Step3Props {
  state: any;
  dispatch?: Dispatch;
}
const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 12,
  },
};
let years: any = [];
let year = new Date().getFullYear();
for (let i = year; i <= year + 10; i++) {
  years.push(i);
}
const tFlowDatas = [
  {
    params: 'Max. correction factor',
    key: 'MaxCorrectionFactor',
    value: '',
  },
  {
    params: 'Cancel if  change <',
    key: 'CanceIfChange',
    value: '',
  },
  {
    params: 'Number of iterations',
    key: 'NumberOfIterations',
    value: '',
  },
  {
    params: 'Estimated number of trips',
    key: 'EstimatedNumberOfTrips',
    value: '',
  },
  {
    params: 'Alpha level',
    key: 'AlphaLevel',
    value: '',
  },
];
function getRoadWayDirection(link: any, type: string) {
  if (type == 'straight') {
    if (lodash.get(link, 'from.label') == '东' || lodash.get(link, 'from.label') == '西')
      return `${lodash.get(link, 'from.label')}-${lodash.get(link, 'to.label')}`;
  }
}
const Step3: React.FC<Step3Props> = (props) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const {
    state: { step, currentProject, dxfData },
    dispatch,
  } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [tFlowData, setTFlowData] = useState<any>(tFlowDatas);
  const [railWayData, setRailWayData] = useState<any>([]); //路段交通流量
  const [linksArr, setLinksArr] = useState<any>([]); //路段
  const [dictData, setDictData] = useState<any>({});
  const [odData, setOdData] = useState<any>([]); //路段
  const [paramsData, setParamsData] = useState<any>({});
  const [linkServiceLevel, setLinkServiceLevel] = useState<any>([]); //路状饱和度
  const [odIndex, setOdIndex] = useState<any>(undefined);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  const [zoneNum, setZoneNum] = useState<any>([]); //现状zoneNum

  // if (!step) {
  //   return null;
  // }
  useEffect(() => {
    if (JSON.stringify(step.step3Form) != '{}') {
      console.log('step', step);
      form.setFieldsValue(step.step3Form);
      setOdData(step.step3Form.odData);
      setParamsData(step.step3Form.paramsData);
      setLinkServiceLevel(step.step3Form.currentSaturability);
      setRailWayData(step.step3Form.roadTrafficCurrentStatus);
    }
    console.log(currentProject);
    console.log(step);
    console.log(dxfData);

    getDictDataAll();
    // if (document) {
    //   let ele: any = document.getElementById('contentEdit');
    //   if (ele) {
    //     ele.contentEditable = true;
    //   }
    // }
  }, []);
  const columns: any = [
    {
      title: '道路',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '路段名',
      align: 'center',
      dataIndex: 'lane',
      key: 'lane',
    },
    // {
    //   title: '交通量（产生）',
    //   align: 'center',
    //   dataIndex: 'trafficProduction',
    //   key: 'trafficProduction',
    // },
    // {
    //   title: '交通量（吸引）',
    //   align: 'center',
    //   dataIndex: 'trafficAtrraction',
    //   key: 'trafficAtrraction',
    // },
    {
      title: '方向',
      align: 'center',
      dataIndex: 'direction',
      key: 'direction',
    },
    {
      title: '交通量',
      align: 'center',
      dataIndex: 'trafficTotal',
      key: 'trafficTotal',
    },
    {
      title: '通行能力',
      align: 'center',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: '饱和度',
      align: 'center',
      dataIndex: 'saturability',
      key: 'saturability',
    },
    {
      title: '服务水平',
      align: 'center',
      dataIndex: 'serviceLevel',
      key: 'serviceLevel',
      // render: (text: any, record: object, index: number) => {
      //   return (
      //     <Form.Item
      //       label=""
      //       name={`serviceLevel` + index}
      //       wrapperCol={{ span: 24 }}
      //       rules={[{ required: true, message: '请输入' }]}
      //     >
      //       <Input
      //         placeholder="请输入"
      //         onChange={(e: any) => {
      //           let newTableData = linkServiceLevel.concat([]);
      //           newTableData.splice(index, 1, {
      //             ...newTableData[index],
      //             serviceLevel: e.target.value,
      //           });
      //           setLinkServiceLevel(newTableData);
      //         }}
      //       />
      //     </Form.Item>
      //   );
      // },
    },
  ];
  const groupColumns: any = [
    {
      title: '道路',
      dataIndex: 'road',
      key: 'road',
      align: 'center',
      render: (text: any, record: any, index: number) => {
        return (
          <Form.Item
            label=""
            name={`roadwayName` + record?.id}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select
              placeholder="请选择"
              labelInValue
              onChange={(value: any) => {
                handleOnSetRailwayTableRow(value, index, 'roadwayName');
                // handleOnSetRailwayTableRow(value.value, index, 'roadwayId');
              }}
            >
              {currentProject.roadWayInfo &&
                currentProject.roadWayInfo.map((item: any, index: number) => {
                  return (
                    <Option key={index} value={item._id}>
                      {item.roadName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: '路段',
      dataIndex: 'railway',
      key: 'railway',
      align: 'center',
      render: (text: any, record: any, index: number) => {
        return (
          <Form.Item
            label=""
            name={`link` + record?.id}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select
              placeholder="请选择"
              labelInValue
              onChange={(value: any) => {
                handleOnSetRailwayTableRow(value, index, 'linkName');
                // handleOnSetRailwayTableRow(value.value, index, 'linkId');
              }}
            >
              {record &&
                record.linksArr &&
                record.linksArr.map((item: any, index: number) => {
                  return (
                    <Option key={index} value={item._id}>
                      {/* {`Link${item.num}`} */}
                      {item.roadName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: '交通量现状观测值（单位：pcu/h）',
      dataIndex: 'greenTimeStart',
      key: 'greenTimeStart',
      align: 'center',
      render: (text: any, record: any, index: number) => {
        return (
          <>
            <Row style={{ marginBottom: '5px' }}>
              <Col span={4} className={styles.step3_LineHeight}>
                {lodash.get(record.currentLink, 'from') &&
                  `${lodash.get(record.currentLink, 'from.label')}-${lodash.get(
                    record.currentLink,
                    'to.label',
                  )}`}
              </Col>
              <Col span={20}>
                <Form.Item
                  label=""
                  name={`eastToWest` + record?.id}
                  wrapperCol={{ span: 24 }}
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Input
                    placeholder="请输入"
                    onChange={(e) => {
                      handleOnSetRailwayTableRow(e.target.value, index, 'eastToWest');
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={4} className={styles.step3_LineHeight}>
                {lodash.get(record.currentLink, 'to') &&
                  `${lodash.get(record.currentLink, 'to.label')}-${lodash.get(
                    record.currentLink,
                    'from.label',
                  )}`}
              </Col>
              <Col span={20}>
                <Form.Item
                  label=""
                  name={`westToEast` + record?.id}
                  wrapperCol={{ span: 24 }}
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Input
                    placeholder="请输入"
                    onChange={(e) => {
                      handleOnSetRailwayTableRow(e.target.value, index, 'westToEast');
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
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
        // console.log(record);
        return (
          <a
            onClick={() => {
              let newLinkInfo = step.step2Form.linkInfo.concat([]);
              newLinkInfo.forEach((link: any) => {
                if (link._id == record.linkId) {
                  delete link['eastToWest'];
                  delete link['westToEast'];
                  form.resetFields([
                    `roadwayName${record?.id}`,
                    `link${record?.id}`,
                    `eastToWest${record?.id}`,
                    `westToEast${record?.id}`,
                  ]);
                }
              });
              // console.log('newLinkInfo',newLinkInfo);
              if (dispatch) {
                dispatch({
                  type: 'predictManageAndAddPredict/saveStepFormData',
                  payload: {
                    ...step,
                    step2Form: {
                      ...step.step2Form,
                      linkInfo: newLinkInfo,
                    },
                  },
                });
              }
              let newRailWayData = railWayData.filter((item1: any, index1: any) => index != index1);
              console.log('newRailWayData', newRailWayData);
              setRailWayData(newRailWayData);
            }}
          >
            删除
          </a>
        );
      },
    },
  ];
  const handleOnSetRailwayTableRow = (value: any, index: any, key: string) => {
    let newRailWayData = railWayData.concat([]);
    if (key == 'roadwayName') {
      let newLinksArr = step.step2Form.linkInfo.filter((link: any) => {
        return link.name.label == value.label;
      });
      newRailWayData.splice(index, 1, {
        ...newRailWayData[index],
        roadwayName: value.label,
        roadwayId: value.value,
        linksArr: newLinksArr,
      });
    } else if (key == 'linkName') {
      let currentLink = step.step2Form.linkInfo.filter((item: any) => item._id == value.value);
      newRailWayData.splice(index, 1, {
        ...newRailWayData[index],
        linkName: value.label,
        linkId: value.value,
        currentLink: currentLink[0],
      });
    } else {
      newRailWayData.splice(index, 1, {
        ...newRailWayData[index],
        [key]: value,
      });
      let newLinkInfo = step.step2Form.linkInfo.concat([]);
      newLinkInfo.forEach((link: any) => {
        if (link._id == newRailWayData[index].linkId) {
          link[key] = value;
        }
      });
      console.log('newLinkInfo', newLinkInfo);
      if (dispatch) {
        dispatch({
          type: 'predictManageAndAddPredict/saveStepFormData',
          payload: {
            ...step,
            step2Form: {
              ...step.step2Form,
              linkInfo: newLinkInfo,
            },
          },
        });
      }
    }
    form.setFieldsValue({
      roadTrafficCurrentStatus: newRailWayData,
    });
    setRailWayData(newRailWayData);
  };
  const tFlowColumns: any = [
    {
      title: '参数',
      dataIndex: 'params',
      key: 'params',
      align: 'center',
    },
    {
      title: '取值',
      dataIndex: 'setValue',
      key: 'setValue',
      align: 'center',
      render: (text: any, record: any, index: number) => {
        return (
          <Form.Item
            label=""
            name={record.key}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input
              placeholder="请输入"
              onChange={(e) => {
                let params = form.getFieldValue('TFlowFuzzyParams');
                form.setFieldsValue({
                  TFlowFuzzyParams: { ...params, [record.key]: e.target.value },
                });
              }}
            />
          </Form.Item>
        );
      },
    },
  ];
  const onPrev = () => {
    if (dispatch) {
      // const values = getFieldsValue();
      // dispatch({
      //   type: 'predictManageAndAddPredict/saveStepFormData',
      //   payload: {
      //     ...data,
      //     ...values,
      //   },
      // });
      dispatch({
        type: 'predictManageAndAddPredict/saveCurrentStep',
        payload: '1',
      });
    }
  };
  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const onValidateForm = async () => {
    const values = await validateFields();
    if (dispatch) {
      dispatch({
        type: 'predictManageAndAddPredict/saveStepFormData',
        payload: {
          // ...step,
          step3Form: {
            ...values,
            odData: odData,
            paramsData: paramsData,
            roadTrafficCurrentStatus: railWayData,
            currentSaturability: linkServiceLevel,
          },
        },
      });
      dispatch({
        type: 'predictManageAndAddPredict/saveCurrentStep',
        payload: '3',
      });
    }
  };
  //下拉框字典
  const getDictDataAll = () => {
    let newDictData = {};
    let parentIds = [
      {
        name: '道路等级',
        type: 'dldj',
        parentId: '606ff379843ea2749135ba79',
      },
    ];
    // let parentId = parentIds.map((item)=>item.parentId);
    getDictData({ typeCode: 'baseData' }).then((res) => {
      if (res.code == 200) {
        let treeData = getTreeData(res.data, '0', 'allData');
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
  const hanldeOnCal = () => {
    setLoadingFlag(true);
    let filteLinks = step.step2Form.linkInfo.filter((link: any) => {
      return link.roadSituation.label == '已建成';
    });
    let filterNodes = step.step2Form.nodeInfo.filter((node: any) => {
      let returnFlag = false;
      step.step2Form.linkInfo.forEach((link: any) => {
        if (link.roadSituation.label == '已建成') {
          link.nodes.forEach((linkN: any) => {
            if (linkN.bId == node.bId) {
              returnFlag = true;
            }
          });
        }
      });
      // let currentZoneData: any = step.step2Form.zoneInfo.filter(
      //   (zone: any) => zone.sum == node.zoneNum,
      // );
      // if (node.isConnector && currentZoneData?.belong != '基地') {
      //   returnFlag = false;
      // }
      return returnFlag;
    });

    let turnsArr = generateTurns({
      nodes: filterNodes,
      links: filteLinks,
    });

    console.log('turnsArr', turnsArr);
    // connector
    let connectors = filterNodes.filter((item: any) => {
      let currentZoneData: any = step.step2Form.zoneInfo.filter(
        (zone: any) => zone.sum == item.zoneNum,
      );
      if (Boolean(currentZoneData)) {
        if (currentZoneData[0]?.belong) {
          return item.isConnector && currentZoneData[0]?.belong == '其他';
        } else if (currentZoneData[0]?.level) {
          return item.isConnector && currentZoneData[0].level?.label == '其他';
        }
      }
    });
    // console.log('connectors', connectors);
    let connectorsArr: any[] = [];
    connectors.forEach((connt: any) => {
      connectorsArr.push({
        zoneNum: connt.zoneNum,
        nodeNum: connt.num,
        direction: 'O',
      });
      connectorsArr.push({
        zoneNum: connt.zoneNum,
        nodeNum: connt.num,
        direction: 'D',
      });
    });
    // 信号控制
    let signalControls: any[] = [];
    let nodesToSCJ: any[] = [];
    let signalGroups: any[] = [];
    let lanes: any[] = [];
    let laneTurns: any[] = [];
    let signalGroupsToLaneTurns: any[] = [];
    let nodePositionXArr: any = [];
    let nodePositionYArr: any = [];

    filterNodes.forEach((node: any) => {
      nodePositionXArr.push(node.position.x);
      nodePositionYArr.push(node.position.y);
      if (node.signalControll && node.signalControll.length > 0) {
        node.signalControll.forEach((sc: any) => {
          nodesToSCJ.push({
            nodeNum: node.num,
            scNum: Number(sc.no),
          });
          signalControls.push({
            num: Number(sc.no),
            code: 'SignalControl',
            name: sc.name,
            signalizationType: 'SIGNALIZATIONSIGNALGROUPBASED',
            cycleTime: Number(sc.cycleTime),
          });
        });
      }
      if (node.signalGroup && node.signalGroup.length > 0) {
        let linksArr = filteLinks.filter((link: any) => node.linkIds.indexOf(link.bId) != -1);
        linksArr.forEach((link: any) => {
          if (link.endNode.indexOf(`_${node.num}`) != -1) {
            link.roadIndex.forEach((lane: any, index: number) => {
              lanes.push({
                nodeNum: node.num,
                linkNum: link.num,
                num: index + 1,
                appType: 0,
              });
            });
            link.roadIndex1.forEach((lane: any, index: number) => {
              lanes.push({
                nodeNum: node.num,
                linkNum: link.num,
                num: index + 1 + link.roadIndex.length,
                appType: 1,
              });
            });
          } else {
            link.roadIndex1.forEach((lane: any, index: number) => {
              lanes.push({
                nodeNum: node.num,
                linkNum: link.num,
                num: index + 1,
                appType: 0,
              });
            });
            link.roadIndex.forEach((lane: any, index: number) => {
              lanes.push({
                nodeNum: node.num,
                linkNum: link.num,
                num: index + 1 + link.roadIndex1.length,
                appType: 1,
              });
            });
          }
        });

        node.signalGroup.forEach((sg: any) => {
          if (node.laneTurn && node.laneTurn.length > 0) {
            node.laneTurn.forEach((lt: any) => {
              if (lodash.get(lt, 'turnStart[0]')) {
                signalGroupsToLaneTurns.push({
                  nodeNum: node.num,
                  fromLinkNum: Number(lodash.get(lt, 'turnStart[0]').split('_')[1]),
                  fromLaneNum: lt.turnStart[1],
                  toLinkNum: Number(lodash.get(lt, 'turnEnd[0]').split('_')[1]),
                  toLaneNum: lt.turnEnd[1],
                  sgNum: sg.no,
                });
              }
            });
          }
          signalGroups.push({
            scNum: Number(sg.signalControll.value),
            num: Number(sg.no),
            name: sg.name,
            gtStart: Number(sg.greenTimeStart),
            gtEnd: Number(sg.greenTimeEnd),
            amber: Number(sg.amber),
          });
        });
      }
      // console.log(node);

      if (node.laneTurn && node.laneTurn.length > 0) {
        node.laneTurn.forEach((lt: any) => {
          if (lodash.get(lt, 'turnStart[0]')) {
            laneTurns.push({
              nodeNum: node.num,
              fromLinkNum: Number(lodash.get(lt, 'turnStart[0]').split('_')[1]),
              fromLaneNum: lt.turnStart[1],
              toLinkNum: Number(lodash.get(lt, 'turnEnd[0]').split('_')[1]),
              toLaneNum: lt.turnEnd[1],
            });
          }
        });
      }
    });

    let newZones = step.step2Form.zoneInfo.filter((zone: any) => {
      if (zone.level) {
        return zone.level.label == '其他';
      }
      if (zone.belong) {
        return zone.belong == '其他';
      }
    });

    let minPositionX = Math.min.apply(null, nodePositionXArr);
    let maxPositionX = Math.max.apply(null, nodePositionXArr);
    let minPositionY = Math.min.apply(null, nodePositionYArr);
    let maxPositionY = Math.max.apply(null, nodePositionYArr);

    let newZonesMatrix = newZones.map((zone: any) => {
      return parseInt(zone.sum);
    });
    setZoneNum(newZonesMatrix.sort((a: any, b: any) => a - b));
    console.log('newZonesMatrix', newZonesMatrix);
    if (newZones.length == 0) {
      message.error('其他类型的小区为空!');
      return;
    }
    let filterZones = newZones.map((zone: any) => {
      return {
        num: parseInt(zone.sum),
        code: '',
        name: zone.name,
        x: (minPositionX + maxPositionX) / 2,
        y: (minPositionY + maxPositionY) / 2,
      };
    });
    let links: any[] = [];
    filteLinks.map((link: any) => {
      console.log('link====>', link);
      let linkObj: any = {
        num: link.num,
        toNodeNum: parseInt(link.endNode?.split('_')[1]),
        fromNodeNum: parseInt(link.startNode?.split('_')[1]),
        name: 'Link' + link.num,
        typeNum: parseInt(link.roadLevel?.split('_')[1]),
        numLanes: parseInt(link.roadNum),
        capprt: link.capt,
        length: link.length,
        fromNodeOrientation: link.from?.value,
        toNodeOrientation: link.to?.value,
      };

      if (link.roadTrafficCurrentStatusValue) {
        linkObj.addVal1 = Math.ceil(link.roadTrafficCurrentStatusValue);
        linkObj.addVal2 = Math.ceil(link.roadTrafficCurrentStatusValue * 0.3);
      }
      links.push(linkObj);
      let linkObj1: any = {
        num: link.num,
        toNodeNum: parseInt(link.startNode?.split('_')[1]),
        fromNodeNum: parseInt(link.endNode?.split('_')[1]),
        name: 'Link' + link.num,
        typeNum: parseInt(link.roadLevel?.split('_')[1]),
        numLanes: parseInt(link.roadNum1),
        capprt: link.capt1,
        length: link.length,
        fromNodeOrientation: link.to?.value,
        toNodeOrientation: link.from?.value,
      };
      if (link.roadTrafficCurrentStatusValue1) {
        linkObj1.addVal1 = Math.ceil(link.roadTrafficCurrentStatusValue1);
        linkObj1.addVal2 = Math.ceil(link.roadTrafficCurrentStatusValue1 * 0.3);
      }
      links.push(linkObj1);
    });
    let params = {
      dmd: {
        matrix: generateDMDMatrix(newZonesMatrix),
      },
      net: {
        nodes: filterNodes.map((node: any) => {
          return {
            num: node.num,
            controlType: 0,
            position: {
              ...node.position,
              z: 0,
            },
          };
        }),
        zones: filterZones,
        linkTypes: dictData['dldj'].map((link: any) => {
          return {
            num: parseInt(link.defaultValue),
            name: link.name,
            capprt: parseInt(getCapprt(parseInt(link.defaultValue), step.step1Form)),
          };
        }),
        links: links,
        turns: turnsArr,
        connectors: connectorsArr,
        signalizedJunctions: signalControls,
        nodesToSCJ: nodesToSCJ,
        signalGroups: signalGroups,
        lanes: lanes,
        laneTurns: laneTurns,
        signalGroupsToLaneTurns: signalGroupsToLaneTurns,
      },
    };
    console.log(params);
    setParamsData(params);
    tflowfuzzy(params)
      .then((res) => {
        // console.log(res);
        if (res.code == 200) {
          handleOnGetTFResult(res.data.procedureResId);
        } else {
          setLoadingFlag(false);
          message.error(res.msg);
        }
      })
      .catch((err) => {
        setLoadingFlag(false);
        message.error('矩阵反推接口出错!');
      });
  };
  let procedureResNum = 0;
  const handleOnGetTFResult = async (id: string) => {
    const res = await procedureRes(id);
    try {
      if (res.code == 200) {
        setLoadingFlag(false);
        message.success('计算成功!');
        setOdData(res.data.tflowFuzzyResult);
        form.setFieldsValue({
          currentOD: res.data.tflowFuzzyResult,
        });
        handleOnResolveDataForService(res.data.linkServiceLevel);
      } else {
        if (procedureResNum < 30) {
          setTimeout(() => {
            handleOnGetTFResult(id);
            procedureResNum++;
          }, 10000);
        } else {
          setLoadingFlag(false);
          message.warning('计算失败!');
          procedureResNum = 0;
        }
      }
    } catch (e) {
      message.error('计算出错!');
    }
  };
  // capPrT: 2400
  // fromNodeNo: 1
  // linkNum: 1
  // toNodeNo: 2
  // volVehPrTAP: 0
  const handleOnResolveDataForService = (linkService: any) => {
    // console.log('linkService', linkService);
    if (linkService) {
      let newLinkInfo = step.step2Form.linkInfo.concat([]);
      newLinkInfo.forEach((link: any) => {
        let startNodeNum = link.startNode.split('_')[1];
        linkService.forEach((lk: any) => {
          if (link.num == lk.linkNum) {
            lk.roadName = link.roadName;
            lk.name = link.name.label;
            if (lk.fromNodeNo == startNodeNum) {
              lk.direction = `${link.from.label}到${link.to.label}`;
            } else {
              lk.direction = `${link.to.label}到${link.from.label}`;
            }
          }
        });
      });
      let newlinkService = linkService.map((item: any) => {
        let saturability = item.volVehPrTAP / item.capPrT;
        if (item.capPrT == 0) {
          saturability = 0;
        }
        return {
          name: item.name,
          lane: item.roadName,
          direction: item.direction,
          capacity: item.capPrT,
          trafficTotal: item.volVehPrTAP.toFixed(2),
          saturability: saturability == 0 ? 0 : saturability.toFixed(2),
          serviceLevel: getServiceLevel(saturability),
        };
      });
      console.log('linkService', linkService);
      form.setFieldsValue({
        currentSaturability: newlinkService,
      });
      setLinkServiceLevel(newlinkService);
    }
  };
  const getZoneName = (zoneNum: any) => {
    if (zoneNum) {
      let filterZone = step.step2Form.zoneInfo.filter((zone: any) => zone.sum == zoneNum);
      return filterZone[0].name;
    }
  };
  return (
    <Row>
      <Col span={18} className={styles.stepForm}>
        <Alert
          closable
          showIcon
          message="设置现状OD矩阵及相关参数。"
          style={{ marginBottom: 24 }}
        />
        <Row>
          <Col span={21} offset={1}>
            {/* <div className={styles.input} id="contentEdit"></div> */}
            <Form
              {...formItemLayout}
              form={form}
              layout="horizontal"
              // className={styles.stepForm}
              initialValues={{}}
            >
              {/* <Form.Item
                label="路段交通量现状（单位:pcu/h）"
                name="roadTrafficCurrentStatus"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setRailWayData([...railWayData, { id: railWayData.length + 1 }]);
                    form.setFieldsValue({
                      roadTrafficCurrentStatus: [...railWayData, {}],
                    });
                  }}
                >
                  新增
                </Button>
              </Form.Item> */}
              {/* <Row style={{ margin: '20px' }} className={styles.step3Form}>
                <Col span={20} offset={5}>
                  <Table
                    dataSource={railWayData}
                    columns={groupColumns}
                    size="small"
                    pagination={false}
                    bordered
                  />
                </Col>
              </Row> */}
              {/* <Form.Item
                label="TFlowFuzzy参数设置"
                name="TFlowFuzzyParams"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Table
                  className={styles.step3Form}
                  dataSource={tFlowData}
                  columns={tFlowColumns}
                  size="small"
                  pagination={false}
                  bordered
                />
              </Form.Item> */}

              <Form.Item
                label="现状OD矩阵"
                name="currentOD"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Button type="primary" onClick={hanldeOnCal}>
                  现状OD矩阵反推
                </Button>
              </Form.Item>
              {/* loading */}
              <Loading visible={loadingFlag} />
              <Row style={{ marginBottom: '20px' }}>
                <Col span={18} offset={5}>
                  {odData && odData.length > 0 && (
                    <table className={styles.odtable}>
                      <tbody>
                        <tr>
                          <td>
                            {odData &&
                              odData.length > 0 &&
                              `${odData[0].length}✖️${odData[0].length}`}
                          </td>
                          <td></td>
                          <td></td>
                          {odData.length > 0 &&
                            odData.map((row: any, index: number) => {
                              return <td key={index}>{zoneNum[index]}</td>;
                            })}
                        </tr>
                        <tr>
                          <td></td>
                          <td>Name</td>
                          <td></td>
                          {odData.length > 0 &&
                            odData.map((row: any, index: number) => {
                              return <td key={index}>{getZoneName(zoneNum[index])}</td>;
                            })}
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td>Sum</td>
                          {odData.length > 0 &&
                            odData.map((row: any, index: number) => {
                              let rowSum: any = 0;
                              odData.forEach((item1: any) => {
                                item1.forEach((item2: any, index2: number) => {
                                  if (item2 && index == index2) {
                                    rowSum += Math.ceil(item2);
                                  }
                                });
                              });
                              return <td key={index}>{rowSum}</td>;
                            })}
                        </tr>
                        {odData.length > 0 &&
                          odData.map((row: any, index: number) => {
                            let rowSum: any = 0;
                            row.forEach((item: any) => {
                              if (item) {
                                rowSum += Math.ceil(item);
                              }
                            });
                            return (
                              <tr key={index}>
                                <td>{zoneNum[index]}</td>
                                <td>{getZoneName(zoneNum[index])}</td>
                                <td>{rowSum}</td>
                                {row.map((record: any, index1: number) => {
                                  let newRecord = Math.ceil(record);
                                  return (
                                    <td
                                      onDoubleClick={() => {
                                        setOdIndex(`${index}${index1}`);
                                      }}
                                      key={index1}
                                    >
                                      {odIndex && odIndex == `${index}${index1}` ? (
                                        <InputNumber
                                          min={0}
                                          value={newRecord}
                                          style={{ width: '80px' }}
                                          onBlur={() => {
                                            setOdIndex(undefined);
                                          }}
                                          onChange={(value) => {
                                            let newOdData = odData.concat([]);
                                            newOdData[index][index1] = value;
                                            setOdData(newOdData);
                                          }}
                                        />
                                      ) : (
                                        newRecord
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </Col>
              </Row>
              <Form.Item
                label="路段现状饱和度"
                name="currentSaturability"
                wrapperCol={{ span: 18 }}
                rules={[{ required: true, message: '请输入' }]}
              >
                <Table
                  dataSource={linkServiceLevel}
                  columns={columns}
                  size="small"
                  pagination={false}
                  scroll={{ y: 500 }}
                  bordered
                />
              </Form.Item>
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
  ({ predictManageAndAddPredict }: { predictManageAndAddPredict: StateType }) => ({
    state: predictManageAndAddPredict,
  }),
)(Step3);

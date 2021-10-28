import {
  Button,
  Table,
  Row,
  Col,
  Alert,
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  InputNumber,
  message,
  DatePicker,
} from 'antd';
const { Option } = Select;
import React, { useState, useEffect } from 'react';
import { connect, Dispatch } from 'umi';
import lodash from 'lodash';
import moment from 'moment';
import FormulaModal from './formulaModal';
import { StateType } from '../../model';
import styles from './index.less';
import Loading from '@/components/Loading';
import { getDictData } from '@/services/projectManage';
import { getAllLinks, prtassignment, getFlowbundle } from '@/services/predictManage';
import { templateList } from '@/services/systemSetting';
import {
  generateDMDMatrix,
  generateTurns,
  generateFutureMatrix,
  generagePA,
  changeOdToDmdMatrix,
  getCapprt,
  getTreeData,
  getServiceLevel,
} from '@/tools';

// 产生/吸引量
function getPlotTraffic(data: any[]) {
  let result = lodash.groupBy(data, 'plotId');
  let keys = Object.keys(result);
  let groupResultArr = keys.map((item: any, index: number) => {
    const element = result[item];
    let totalAttraction = 0;
    let totalProduction = 0;
    element.forEach((item) => {
      totalAttraction += Number(item.peakHourAttract);
      totalProduction += Number(item.peakHourProduct);
    });
    return {
      num: index + 1 + '',
      plotCode: element[0].plotCode,
      plotId: element[0].plotId,
      atrraction: totalAttraction + '',
      production: totalProduction + '',
    };
  });
  return groupResultArr;
}
function getTemFormaluParamsResult(data: any[]) {
  let result = lodash.groupBy(data, 'plotId');
  let keys = Object.keys(result);
  let groupResultArr = keys.map((item: any, index: number) => {
    const element = result[item];
    let arr = element.map((item) => {
      return {
        plotId: item.plotId,
        plotCode: item.plotCode,
        functionalPartitioningBuildArea: item.functionalPartitioningBuildArea,
        functionalPartitioningBuildAreaName: item.functionalPartitioningBuildAreaName,
        peakHourProduct: item.peakHourProduct,
        peakHourAttract: item.peakHourAttract,
        paramsArr: item.paramsArr,
      };
    });
    return arr;
  });
  return groupResultArr;
}
interface Step4Props {
  stepData?: StateType['step'];
  current: any;
  currentProject: any;
  currentPredict: any;
  dispatch?: Dispatch;
}
const formItemLayout = {
  labelCol: {
    span: 7,
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
const Step4: React.FC<Step4Props> = (props) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { stepData, current, currentProject, currentPredict, dispatch } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [dictData, setDictData] = useState<any>({});
  const [assessType, setAssessType] = useState<any>(undefined);

  const [bgData, setBgData] = useState<any>([]);
  const [spData, setSpData] = useState<any>([]);
  const [bgIndex, setBgIndex] = useState<any>(undefined);
  const [spIndex, setSpIndex] = useState<any>(undefined);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  const [progress, setProgress] = useState<any>(0);
  const [bgZoneNum, setBgZoneNum] = useState<any[]>([]);
  const [spZoneNum, setSpZoneNum] = useState<any[]>([]);
  const [assessTrafficTableData, setAssessTrafficTableData] = useState<any[]>([]);
  const [plotTraffic, setPlotTraffic] = useState<any[]>([]);
  // 公式相关
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formulaInfo, setFormulaInfo] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<any>(undefined);
  const [currentRecord, setCurrentRecord] = useState<any>({});
  // if (!stepData) {
  //   return null;
  // }
  useEffect(() => {
    // console.log(stepData);
    console.log(currentProject);
    if (JSON.stringify(stepData.step4Form) != '{}') {
      // console.log('stepData', stepData);
      form.setFieldsValue(stepData.step4Form);
    } else {
      if (currentPredict && JSON.stringify(currentPredict) != '{}') {
        handleOnInitStep4Form();
      }
    }
    getDictDataAll();
    handleInitTripDivision();
  }, []);
  const assessTrafficColumns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 70,
      render: (text: any, record: object, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '地块名称',
      align: 'center',
      dataIndex: 'plotCode',
      key: 'plotCode',
    },
    {
      title: '按建筑物功能',
      align: 'center',
      dataIndex: 'functionalPartitioningBuildAreaName',
      key: 'functionalPartitioningBuildAreaName',
    },
    {
      title: '交通产生量',
      align: 'center',
      dataIndex: 'peakHourProduct',
      key: 'peakHourProduct',
      render: (text: any, record: any, index: number) => {
        return (
          <Input
            placeholder="请输入"
            value={text}
            onChange={(e) => {
              let newAssessTrafficTableData = assessTrafficTableData.concat([]);
              newAssessTrafficTableData.splice(index, 1, {
                ...newAssessTrafficTableData[index],
                peakHourProduct: e.target.value,
              });
              setAssessTrafficTableData(newAssessTrafficTableData);
              setPlotTraffic(getPlotTraffic(newAssessTrafficTableData));
            }}
          />
        );
      },
    },
    {
      title: '交通吸引量',
      align: 'center',
      dataIndex: 'peakHourAttract',
      key: 'peakHourAttract',
      render: (text: any, record: any, index: number) => {
        return (
          <Input
            placeholder="请输入"
            value={text}
            onChange={(e) => {
              let newAssessTrafficTableData = assessTrafficTableData.concat([]);
              newAssessTrafficTableData.splice(index, 1, {
                ...newAssessTrafficTableData[index],
                peakHourAttract: e.target.value,
              });
              setAssessTrafficTableData(newAssessTrafficTableData);
              setPlotTraffic(getPlotTraffic(newAssessTrafficTableData));
            }}
          />
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
              handleOnCalTraffic(record, index);
            }}
          >
            计算
          </a>
        );
      },
    },
  ];
  const handleOnCalTraffic = (record: any, index: number) => {
    // console.log(record, index);
    templateList({
      current: 1,
      pageSize: 20,
      sectionInfoType: 2,
      sectionInfoValue: record?.functionalPartitioningBuildAreaName,
      id: currentProject.templateId,
    }).then((res) => {
      if (res.code == 200) {
        let newSectionInfo = lodash.get(res.data.data[0], 'sectionInfo');
        console.log('newSectionInfo====>', newSectionInfo);
        if (newSectionInfo.length != 0) {
          let newFormulaInfo: any[] = [];
          newSectionInfo.forEach((item: any) => {
            newFormulaInfo.push(...item.formulaInfo);
          });
          setFormulaInfo(newFormulaInfo);
          setCurrentIndex(index);
          setCurrentRecord({
            ...record,
            defaultValue: {
              ...record.defaultValue,
              ...currentProject?.temFormaluParamsDefault[
                `${record.plotId}_${record.functionalPartitioningBuildArea}`
              ],
            },
          });
          setTimeout(() => {
            setIsModalVisible(true);
          }, 200);
        }
      }
    });
  };
  const handleInitTripDivision = () => {
    // 如果预测第一步出行方式有新增/删除需修改
    let newTripDivisionObj = {};
    let newAssessTrafficTableData: any[] = [];
    stepData?.step1Form?.tripDivision?.forEach((item: any) => {
      let groupByData = lodash.groupBy(item, 'functionalPartitioningBuildAreaName');
      for (const key in groupByData) {
        if (Object.prototype.hasOwnProperty.call(groupByData, key)) {
          const element = groupByData[key];
          newTripDivisionObj[
            `${element[0].plotId}__${element[0].functionalPartitioningBuildArea}`
          ] = element;
          if (currentPredict?.temFormaluParamsResult?.length == 0) {
            newAssessTrafficTableData.push({
              plotCode: element[0].plotCode,
              plotId: element[0].plotId,
              functionalPartitioningBuildArea: element[0].functionalPartitioningBuildArea,
              functionalPartitioningBuildAreaName: element[0].functionalPartitioningBuildAreaName,
              paramsArr: [],
              data: element,
            });
          }
        }
      }
    });
    currentPredict.temFormaluParamsResult?.forEach((item: any) => {
      item.forEach((item1: any) => {
        let paramsObj = {};
        item1.paramsArr?.forEach((paramsItem: any) => {
          paramsObj[paramsItem.params] = paramsItem.value;
        });
        if (newTripDivisionObj[`${item1.plotId}__${item1.functionalPartitioningBuildArea}`]) {
          newAssessTrafficTableData.push({
            plotCode: item1.plotCode,
            plotId: item1.plotId,
            functionalPartitioningBuildArea: item1.functionalPartitioningBuildArea,
            functionalPartitioningBuildAreaName: item1.functionalPartitioningBuildAreaName,
            data: newTripDivisionObj[`${item1.plotId}__${item1.functionalPartitioningBuildArea}`],
            peakHourAttract: item1.peakHourAttract,
            peakHourProduct: item1.peakHourProduct,
            paramsArr: item1.paramsArr,
            defaultValue: paramsObj,
          });
        } else {
          let element =
            newTripDivisionObj[`${item1.plotId}__${item1.functionalPartitioningBuildArea}`];
          newAssessTrafficTableData.push({
            plotCode: element[0].plotCode,
            plotId: element[0].plotId,
            functionalPartitioningBuildArea: element[0].functionalPartitioningBuildArea,
            functionalPartitioningBuildAreaName: element[0].functionalPartitioningBuildAreaName,
            paramsArr: [],
            data: element,
          });
        }
      });
    });
    // console.log("newAssessTrafficTableData",newAssessTrafficTableData);
    setAssessTrafficTableData(newAssessTrafficTableData);
  };
  const handleOnInitStep4Form = () => {
    // console.log('currentPredict', currentPredict);
    let params = {
      assessType: { label: currentPredict.assessType, value: currentPredict.assessTypeId },
      assessYear: moment(currentPredict.assessYear),
      increaseRate: currentPredict.increaseRate,
      // assessTrafficProduction: currentPredict.assessTrafficProduction,
      // assessTrafficAtrraction: currentPredict.assessTrafficAtrraction,
    };
    // currentPredict.plotTraffic.forEach((item: any, index: number) => {
    //   params[`production${index}`] = item.production;
    //   params[`atrraction${index}`] = item.atrraction;
    // });
    // setAssessTrafficTableData(currentPredict.plotTraffic);
    params['OD'] = [['222']];
    form.setFieldsValue(params);
    if (currentPredict.assessType == '近期') {
      setBgData(currentPredict.recentOD?.background);
      setSpData(currentPredict.recentOD?.superposition);
    } else {
      setBgData(currentPredict.futureOD?.background);
      setSpData(currentPredict.futureOD?.superposition);
    }
    setPlotTraffic(currentPredict.plotTraffic);
    setAssessType((assessType: any) => {
      return currentPredict.assessType;
    });
    hanldeOnCal('init');
  };
  const handleOnDelete = (tableIndex: number) => {
    // console.log(tableIndex);
    let newTableData = tableData.filter((item: object, index: number) => index != tableIndex);
    setTableData(newTableData);
  };
  const onPrev = () => {
    if (dispatch) {
      // const values = getFieldsValue();
      // dispatch({
      //   type: 'predictManageAndEditPredict/saveStepFormData',
      //   payload: {
      //     ...data,
      //     ...values,
      //   },
      // });
      dispatch({
        type: 'predictManageAndEditPredict/saveCurrentStep',
        payload: '2',
      });
    }
  };
  const handleOnGetParams = (type: string) => {
    let filteLinks: any[] = [];
    let filterNodes = [];
    let newZones = [];
    if (assessType == '近期') {
      filteLinks = stepData.step2Form.linkInfo.filter((link: any) => {
        return link.roadSituation.label == '已建成' || lodash.get(link, 'year.label') == assessType;
      });

      filterNodes = stepData.step2Form.nodeInfo.filter((node: any) => {
        let returnFlag = false;
        stepData.step2Form.linkInfo.forEach((link: any) => {
          if (
            link.roadSituation.label == '已建成' ||
            lodash.get(link, 'year.label') == assessType
          ) {
            link.nodes.forEach((linkN: any) => {
              if (linkN.bId == node.bId) {
                returnFlag = true;
              }
            });
          }
        });
        return returnFlag;
      });
    } else {
      filteLinks = stepData.step2Form.linkInfo;
      filterNodes = stepData.step2Form.nodeInfo;
    }
    if (type == 'bg') {
      newZones = stepData.step2Form.zoneInfo.filter((zone: any) => {
        if (zone.level) {
          if (zone?.plot || zone?.plotInfo) {
            let filterPlot = currentProject.nearPlotProjectInfo.filter(
              (nearP: any) => zone?.plot == nearP._id || zone?.plotInfo == nearP._id,
            );
            if (filterPlot.length > 0) {
              return filterPlot[0]?.buildYear == assessType ? true : false;
            }
          }
          return zone.level.label == '其他';
        }
        if (zone.belong) {
          return zone.belong == '其他';
        }
      });
    } else {
      newZones = stepData.step2Form.zoneInfo.filter((zone: any) => {
        if (zone?.plot || zone?.plotInfo) {
          let filterPlot = currentProject.nearPlotProjectInfo.filter(
            (nearP: any) => zone?.plot == nearP._id || zone?.plotInfo == nearP._id,
          );
          if (filterPlot.length > 0) {
            return filterPlot[0]?.buildYear == assessType ? true : false;
          }
        }
        return true;
      });
    }
    let turnsArr = generateTurns({
      nodes: filterNodes,
      links: filteLinks,
    });

    // console.log('turnsArr', turnsArr);
    // connector
    let connectors = filterNodes.filter((item: any) => {
      if (type == 'bg') {
        let currentZoneData: any = stepData.step2Form.zoneInfo.filter((zone: any) => {
          if (item.zoneNum) {
            return zone.sum == item.zoneNum;
          }
          if (item.zoneId) {
            return zone._id == item.zoneId;
          }
        });
        item.zoneNum = currentZoneData[0]?.sum;
        if (currentZoneData[0]?.plot || currentZoneData[0]?.plotInfo) {
          let filterPlot = currentProject?.nearPlotProjectInfo.filter((nearP: any) => {
            if (currentZoneData[0]?.plot) {
              return currentZoneData[0]?.plot == nearP._id;
            }
            if (currentZoneData[0]?.plotInfo) {
              return currentZoneData[0]?.plotInfo == nearP._id;
            }
          });
          if (filterPlot && filterPlot.length > 0) {
            return filterPlot[0]?.buildYear == assessType ? true : false;
          }
          if (currentZoneData[0]?.level) {
            return item.isConnector && lodash.get(currentZoneData[0], 'level.label') != '基地';
          } else if (currentZoneData[0]?.belong) {
            return item.isConnector && lodash.get(currentZoneData[0], 'belong') != '基地';
          }
        } else if (currentZoneData[0]?.belong) {
          return item.isConnector && currentZoneData[0]?.belong != '基地';
        } else if (currentZoneData[0]?.level) {
          return item.isConnector && currentZoneData[0].level?.label != '基地';
        }
      } else if (type == 'sp') {
        let currentZoneData: any = stepData.step2Form.zoneInfo.filter((zone: any) => {
          if (item.zoneNum) {
            return zone.sum == item.zoneNum;
          }
          if (item.zoneId) {
            return zone._id == item.zoneId;
          }
        });
        item.zoneNum = currentZoneData[0]?.sum;
        if (currentZoneData[0]?.plot || currentZoneData[0]?.plotInfo) {
          let filterPlot = currentProject.nearPlotProjectInfo.filter(
            (nearP: any) =>
              currentZoneData[0]?.plot == nearP._id || currentZoneData[0]?.plotInfo == nearP._id,
          );
          if (filterPlot.length > 0) {
            return filterPlot[0]?.buildYear == assessType ? true : false;
          }
          return true;
        }
        return item.isConnector;
      }
    });
    console.log('connectors====>', connectors);
    let connectorsArr: any[] = [];
    // let newZoneNum:any = []
    connectors.forEach((connt: any) => {
      // newZoneNum.push(connt.zoneNum);
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
    // if(type=='bg'){
    //   setTimeout(() => {
    //     setBgZoneNum(newZoneNum);
    //   }, 0);
    // }else{
    //   setTimeout(()=>{
    //     setSpZoneNum(newZoneNum);
    //   },0)
    // }
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
          if (node.laneTurn.length > 0) {
            node.laneTurn.forEach((lt: any) => {
              if (lodash.get(lt, 'turnStart')) {
                signalGroupsToLaneTurns.push({
                  nodeNum: node.num,
                  fromLinkNum: Number(lt.turnStart[0]?.split('_')[1]),
                  fromLaneNum: lt.turnStart[1],
                  toLinkNum: Number(lt.turnEnd[0]?.split('_')[1]),
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
          if (lodash.get(lt, 'turnStart')) {
            laneTurns.push({
              nodeNum: node.num,
              fromLinkNum: Number(lt.turnStart[0]?.split('_')[1]),
              fromLaneNum: lt.turnStart[1],
              toLinkNum: Number(lt.turnEnd[0]?.split('_')[1]),
              toLaneNum: lt.turnEnd[1],
            });
          }
        });
      }
    });
    let minPositionX = Math.min.apply(null, nodePositionXArr);
    let maxPositionX = Math.max.apply(null, nodePositionXArr);
    let minPositionY = Math.min.apply(null, nodePositionYArr);
    let maxPositionY = Math.max.apply(null, nodePositionYArr);
    console.log('minPositionX===>', minPositionX);
    console.log('maxPositionX===>', maxPositionX);
    console.log('minPositionY===>', minPositionY);
    console.log('maxPositionY===>', maxPositionY);
    console.log('(minPositionX + maxPositionX) / 2', (minPositionX + maxPositionX) / 2);
    console.log('(minPositionY + maxPositionY) / 2', (minPositionY + maxPositionY) / 2);

    let newZonesMatrix = newZones.map((zone: any) => {
      return parseInt(zone.sum);
    });
    let links: any[] = [];
    filteLinks.map((link: any) => {
      let linkObj: any = {
        num: link.num,
        toNodeNum: parseInt(link.endNode?.split('_')[1]),
        fromNodeNum: parseInt(link.startNode?.split('_')[1]),
        name: 'Link' + link.num,
        typeNum: parseInt(link.roadLevel?.split('_')[1]),
        numLanes: parseInt(link.roadNum),
        capprt: link.capt,
        length: link.length,
        fromNodeOrientation: link.from.value,
        toNodeOrientation: link.to.value,
      };

      if (link.eastToWest) {
        linkObj.addVal1 = Math.ceil(link.eastToWest);
        linkObj.addVal2 = Math.ceil(link.eastToWest * 0.1);
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
        fromNodeOrientation: link.to.value,
        toNodeOrientation: link.from.value,
      };
      if (link.westToEast) {
        linkObj1.addVal1 = Math.ceil(link.westToEast);
        linkObj1.addVal2 = Math.ceil(link.westToEast * 0.1);
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
        zones: newZones.map((zone: any) => {
          return {
            num: parseInt(zone.sum),
            code: '',
            name: zone.name,
            x: (minPositionX + maxPositionX) / 2,
            y: (minPositionY + maxPositionY) / 2,
          };
        }),
        linkTypes: dictData['dldj']?.map((link: any) => {
          return {
            num: parseInt(link.defaultValue),
            name: link.name,
            capprt: parseInt(getCapprt(parseInt(link.defaultValue), stepData.step1Form)),
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
    return params;
  };
  // const { payAccount, receiverAccount, receiverName, amount } = data;
  const handleOnSubmit = async () => {
    const values = await validateFields();
    setLoadingFlag(true);
    let initbgParams: any = handleOnGetParams('bg');
    let params = Object.assign({}, initbgParams);
    let newBgZoneNum = params?.net?.zones.map((item: any) => item.num);
    let flowLevel: any[] = [];
    newBgZoneNum = bgZoneNum.length > 0 ? bgZoneNum : newBgZoneNum;
    // 背景饱和度图
    params.dmd.matrix = changeOdToDmdMatrix(bgData, newBgZoneNum);
    params.resType = 0;
    const res = await prtassignment(params);

    try {
      if (res.code == 200) {
        // console.log(res);
        setProgress(20);
        // message.success('背景矩阵生成成功!');
      } else {
        message.error(res.msg);
        setLoadingFlag(false);
        return;
      }
    } catch (error) {
      message.error('背景饱和度图生成错误!');
      setLoadingFlag(false);
      return;
    }
    // 背景流量图
    params.resType = 1;
    const res3 = await prtassignment(params);
    try {
      if (res3.code == 200) {
        setProgress(40);
      } else {
        message.error(res3.msg);
        setLoadingFlag(false);
        return;
      }
    } catch (error) {
      message.error('背景流量图生成错误!');
      setLoadingFlag(false);
      return;
    }
    let initSpParams: any = handleOnGetParams('sp');
    let params1 = Object.assign({}, initSpParams);
    let newSpZoneNum = params1?.net?.zones.map((item: any) => item.num);
    newSpZoneNum = spZoneNum.length > 0 ? spZoneNum : newSpZoneNum;
    // 叠加饱和度图
    params1.dmd.matrix = changeOdToDmdMatrix(spData, newSpZoneNum);
    params1.resType = 0;
    const res1 = await prtassignment(params1);
    try {
      if (res1.code == 200) {
        setProgress(60);
        // message.success('叠加矩阵生成成功!');
      } else {
        message.error(res1.msg);
        setLoadingFlag(false);
        return;
      }
    } catch (error) {
      message.error('叠加饱和度图生成错误!');
      setLoadingFlag(false);
      return;
    }
    // 叠加流量图
    params1.resType = 1;
    const res4 = await prtassignment(params1);
    try {
      if (res4.code == 200) {
        setProgress(80);
      } else {
        message.error(res4.msg);
        setLoadingFlag(false);
        return;
      }
    } catch (error) {
      message.error('叠加流量图生成错误!');
      setLoadingFlag(false);
      return;
    }
    let params2 = Object.assign({}, initSpParams);
    params2.dmd.matrix = changeOdToDmdMatrix(spData, newSpZoneNum);
    let filterZones = stepData.step2Form.zoneInfo.filter((zone: any) => {
      if (zone.level) {
        return zone.level.label == '基地';
      }
      if (zone.belong) {
        return zone.belong == '基地';
      }
    });
    params2.zoneNum = Number(filterZones[0].sum);
    const res2 = await getFlowbundle(params2);
    console.log('res.data?.linkServiceLevel', res.data.linkServiceLevel);
    try {
      if (res2.code == 200) {
        setProgress(100);
        flowLevel = res.data?.linkServiceLevel?.map((linkItem: any, index: number) => {
          let currentLink = stepData.step2Form.linkInfo.filter(
            (item: any) => item.num == linkItem.linkNum,
          );
          let backgroundSaturability = linkItem.volVehPrTAP / linkItem.capPrT;
          if (linkItem.capPrT == 0) {
            backgroundSaturability = 0;
          }
          let superpositionSaturability =
            lodash.get(res4.data.linkServiceLevel[index], 'volVehPrTAP') /
            lodash.get(res4.data.linkServiceLevel[index], 'capPrT');
          if (lodash.get(res4.data.linkServiceLevel[index], 'capPrT') == 0) {
            superpositionSaturability = 0;
          }
          return {
            linkNum: linkItem.linkNum + '',
            fromNodeNo: linkItem.fromNodeNo + '',
            toNodeNo: linkItem.toNodeNo + '',
            name: currentLink[0].name.label,
            lane: currentLink[0].roadName,
            direction: `${currentLink[0].from.label}到${currentLink[0].to.label}`,
            backgroundCapPrt: linkItem.capPrT + '',
            backgroundVolVehPrTAP: Math.ceil(linkItem.volVehPrTAP) + '',
            backgroundVolCapRatioPrTAP: linkItem.volCapRatioPrTAP + '',
            backgroundServiceLevel: getServiceLevel(backgroundSaturability),
            superpositionCapPrt: lodash.get(res4.data.linkServiceLevel[index], 'capPrT') + '',
            superpositionVolVehPrTAP:
              Math.ceil(lodash.get(res4.data.linkServiceLevel[index], 'volVehPrTAP')) + '',
            superpositionVolCapRatioPrTAP:
              lodash.get(res4.data.linkServiceLevel[index], 'volCapRatioPrTAP') + '',
            superpositionServiceLevel: getServiceLevel(superpositionSaturability),
          };
        });
        // console.log(res2);
        // message.success('蛛网图生成成功!');
        if (dispatch) {
          dispatch({
            type: 'predictManageAndEditPredict/submitStepForm',
            payload: {
              ...stepData,
              step4Form: {
                ...values,
                flowLevel: flowLevel,
                plotTraffic: plotTraffic,
                temFormaluParamsResult: getTemFormaluParamsResult(assessTrafficTableData),
                bgData: bgData,
                spData: spData,
                spiderDiagram: res2.data,
                spiderDiagramParams: params2,
                backgroundResultImg: res.data.path,
                backgroundFlowResultImg: res3.data.path,
                backgroundFlowPrtassignmentResourceId: res3.data.resourceId,
                backgroundFlowVerName: res3.data.versionFile,
                backgroundResultParams: params,
                backgroundPrtassignmentResourceId: res.data.resourceId,
                backgroundVerName: res.data.versionFile,
                superpositionResultImg: res1.data.path,
                superpositionFlowResultImg: res4.data.path,
                superpositionFlowPrtassignmentResourceId: res4.data.resourceId,
                superpositionFlowVerName: res4.data.versionFile,
                superpositionResultParams: params1,
                superpositionPrtassignmentResourceId: res1.data.resourceId,
                superpositionVerName: res1.data.versionFile,
              },
            },
          });
        }
      }
    } catch (e) {
      message.error('蛛网图生成错误!');
      setLoadingFlag(false);
      return;
    }
    setLoadingFlag(false);
    setProgress(0);
  };
  const hanldeOnCal = async (type?: any) => {
    if (!type) {
      const formData = await validateFields();
    }
    let bgZoneNum: any = [];
    let spZoneNum: any = [];
    let nearBgZoneNum: any = [];
    let nearSpZoneNum: any = [];
    let jidiZoneNum: any = [];
    stepData.step2Form.zoneInfo.forEach((zone: any) => {
      if (zone?.level?.label == '其他') {
        bgZoneNum.push(parseInt(zone.sum));
        spZoneNum.push(parseInt(zone.sum));
      }
      if (zone?.belong == '其他') {
        bgZoneNum.push(parseInt(zone.sum));
        spZoneNum.push(parseInt(zone.sum));
      }
    });
    let PAData = generagePA(stepData.step3Form.odData);
    // console.log('PAData', PAData);
    let zoneA: any[] = [];
    let zoneP: any[] = [];
    let newAssessType = form.getFieldValue('assessType');
    // console.log('newAssessType', newAssessType);
    if (newAssessType.label == '近期') {
      zoneA = [];
      zoneP = [];
      let newtPlotProjectInfo = currentProject.nearPlotProjectInfo.filter(
        (nearP: any) => nearP.buildYear == '近期',
      );
      newtPlotProjectInfo.forEach((np: any) => {
        stepData.step2Form.zoneInfo.forEach((zone: any) => {
          if (zone?.plot == np._id || zone?.plotInfo == np._id) {
            nearBgZoneNum.push(parseInt(zone.sum));
            nearSpZoneNum.push(parseInt(zone.sum));
          }
        });
        zoneP.push(parseInt(np.trafficProduction));
        zoneA.push(parseInt(np.trafficAtrraction));
      });
    } else {
      zoneA = [];
      zoneP = [];
      let newtPlotProjectInfo = currentProject.nearPlotProjectInfo.filter(
        (nearP: any) => nearP.buildYear == '远期',
      );
      newtPlotProjectInfo.forEach((np: any) => {
        stepData.step2Form.zoneInfo.forEach((zone: any) => {
          if (zone?.plot == np._id) {
            nearBgZoneNum.push(parseInt(zone.sum));
            nearSpZoneNum.push(parseInt(zone.sum));
          }
        });
        zoneP.push(parseInt(np.trafficProduction));
        zoneA.push(parseInt(np.trafficAtrraction));
      });
    }
    stepData.step2Form.zoneInfo.forEach((zone: any) => {
      if (zone?.level?.label == '基地' || zone?.belong == '基地') {
        // spZoneNum.push(parseInt(zone.sum));
        jidiZoneNum.push(parseInt(zone.sum));
      }
    });
    // console.log('bgZoneNum', bgZoneNum);
    // console.log('spZoneNum', spZoneNum);
    setBgZoneNum(bgZoneNum.sort((a: any, b: any) => a - b).concat(nearBgZoneNum));
    setSpZoneNum(
      spZoneNum
        .sort((a: any, b: any) => a - b)
        .concat(nearSpZoneNum)
        .concat(jidiZoneNum),
    );
    let rate = form.getFieldValue('increaseRate');
    rate = rate / 100 + 1;
    let baseP = plotTraffic.map((item: any) => item.production);
    let baseA = plotTraffic.map((item: any) => item.atrraction);
    console.log("form.getFieldValue('assessYear')", form.getFieldValue('assessYear'));
    console.log('moment(currentProject.buildYear).year()', moment(currentProject.buildYear).year());
    let pow =
      moment(form.getFieldValue('assessYear')).year() - moment(currentProject.buildYear).year();
    if (pow < 0) {
      message.warning('请输入大于当前年份的时间!');
      return;
    }
    if (type == 'init') {
      return;
    }
    // console.log('stepData.step3Form.odData', stepData.step3Form.odData);
    // console.log('zoneA', zoneA);
    // console.log('zoneP', zoneP);
    // console.log('pow', pow);
    // console.log('baseA', baseA);
    // console.log('baseP', baseP);
    const calData: any = generateFutureMatrix(
      stepData.step3Form.odData,
      zoneA,
      zoneP,
      rate,
      pow,
      baseA,
      baseP,
    );
    // console.log('calData', calData);
    setBgData(calData?.backgroundResult);
    setSpData(calData?.superpositionResult);
    form.setFieldsValue({
      OD: [['222']],
    });
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
      {
        name: '建设年限',
        type: 'jsnx',
        parentId: '60768ad7a67748bbc5c764b8',
      },
      {
        name: '载客系数',
        type: 'zkxs',
        parentId: '606c0290fd9436946e70f02a',
      },
    ];
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
        setDictData(newDictData);
      }
    });
  };
  const handleOnChange = (value: any) => {
    setAssessType(value.label);
  };
  const handleOnSetModalVisible = (value: boolean, type?: string) => {
    if (type == 'finish') {
      console.log('currentRecord===>', currentRecord);
      let newCurrentRecord = { ...currentRecord };
      let attraction = 0;
      let production = 0;
      newCurrentRecord.data.forEach((item: any) => {
        if (item.personType != '商业工作人员') {
          let zkxsData = dictData['zkxs'].filter((item1: any) => item1.code == item.personTypeCode);
          const residentTrips = Number(zkxsData[0].defaultValue);
          // console.log('zkxsData===>', zkxsData);
          //高峰小时吸引交通量
          let peakHourAttract;
          let peakHourProduct;
          if (item.personType == '住宅人员') {
            peakHourAttract = newCurrentRecord.defaultValue['housePeakHourAttract'];
            peakHourProduct = newCurrentRecord.defaultValue['housePeakHourProduct'];
          } else if (item.personType == '商业顾客') {
            peakHourAttract = newCurrentRecord.defaultValue['businessCustomerPeakHourAttract'];
            peakHourProduct = newCurrentRecord.defaultValue['businessCustomerPeakHourProduct'];
          } else if (item.personType == '顾客（访客）') {
            peakHourAttract = newCurrentRecord.defaultValue['servicePeakHourProduct'];
            peakHourProduct = newCurrentRecord.defaultValue['servicePeakHourProduct'];
          } else if (item.personType == '办公工作人员') {
            peakHourAttract = newCurrentRecord.defaultValue['officerPeakHourAttract'];
            peakHourProduct = newCurrentRecord.defaultValue['officerPeakHourProduct'];
          } else if (item.personType == '办公访客') {
            peakHourAttract = newCurrentRecord.defaultValue['officeVisitorPeakHourAttract'];
            peakHourProduct = newCurrentRecord.defaultValue['officeVisitorPeakHourProduct'];
          } else if (item.personType == '访客（病人/家属）') {
            // peakHourAttract = newCurrentRecord.defaultValue['hospitalPeakHourAttract'];
            // peakHourProduct = newCurrentRecord.defaultValue['hospitalPeakHourProduct'];
            peakHourAttract = newCurrentRecord.defaultValue['hospitalDailyPA'];
            peakHourProduct = newCurrentRecord.defaultValue['hospitalDailyPA'];
          } else if (item.personType == '学校人员') {
            peakHourAttract = newCurrentRecord.defaultValue['schoolPeakHourAttract'];
            peakHourProduct = newCurrentRecord.defaultValue['schoolPeakHourProduct'];
          }
          let carProduction = Math.ceil((peakHourProduct * (item.car / 100)) / residentTrips);
          let carAtrraction = Math.ceil((peakHourAttract * (item.car / 100)) / residentTrips);
          let taxiProduction = Math.ceil((peakHourProduct * (item.taxi / 100)) / residentTrips);
          let taxiAtrraction = Math.ceil((peakHourAttract * (item.taxi / 100)) / residentTrips);
          production += carProduction + taxiProduction;
          attraction += carAtrraction + taxiAtrraction;
        }
      });
      newCurrentRecord.peakHourAttract = attraction + '';
      newCurrentRecord.peakHourProduct = production + '';
      console.log('newCurrentRecord===>', newCurrentRecord);
      let newAssessTrafficTableData = assessTrafficTableData.concat();
      newAssessTrafficTableData.splice(currentIndex, 1, newCurrentRecord);
      setPlotTraffic(getPlotTraffic(newAssessTrafficTableData));
      setAssessTrafficTableData(newAssessTrafficTableData);
      setCurrentIndex(undefined);
      setCurrentRecord({});
      setIsModalVisible(false);
      let i = 0;
      newAssessTrafficTableData.forEach((item: any) => {
        if (item.peakHourAttract) {
          i++;
        }
      });
      if (i == newAssessTrafficTableData.length) {
        form.setFieldsValue({ plotTraffic: newAssessTrafficTableData });
      }
    } else {
      setIsModalVisible(value);
    }
  };
  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment(currentProject.buildYear).endOf('year');
  };
  const getZoneName = (zoneNum: any) => {
    if (zoneNum) {
      let filterZone = stepData.step2Form.zoneInfo.filter((zone: any) => zone.sum == zoneNum);
      return filterZone[0].name;
    }
  };
  return (
    <Row>
      <Col span={18} className={styles.stepForm}>
        <Alert closable showIcon message="请设置OD矩阵及相关参数。" style={{ marginBottom: 24 }} />
        <Row>
          <Col span={21} offset={1} className={styles.step3Form}>
            <Loading visible={loadingFlag} progress={progress} />
            <FormulaModal
              title="公式应用"
              visible={isModalVisible}
              currentPageData={formulaInfo}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              // formulaInfoDeafault={formulaInfoDeafault}
              // handleOnSetFormulaInfo={handleOnSetFormulaInfo}
              currentRecord={currentRecord}
              setCurrentRecord={setCurrentRecord}
              handleOnSetVisible={handleOnSetModalVisible}
            />
            <Form
              {...formItemLayout}
              form={form}
              layout="horizontal"
              // className={styles.stepForm}
              initialValues={{
                'OD-Type': '1',
              }}
            >
              <Form.Item label="评价年">
                <Form.Item
                  name="assessType"
                  // wrapperCol={{ span: 24 }}
                  rules={[{ required: true, message: '请输入' }]}
                  style={{ display: 'inline-flex' }}
                >
                  <Select
                    placeholder="请选择"
                    labelInValue
                    style={{ width: '100px' }}
                    onChange={handleOnChange}
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
                  name="assessYear"
                  // wrapperCol={{ span: 24 }}
                  style={{ display: 'inline-flex' }}
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <DatePicker
                    placeholder="请选择"
                    picker="year"
                    disabledDate={disabledDate}
                    style={{ width: '100%' }}
                  />
                  {/* <Input placeholder="请输入" addonAfter="年" /> */}
                </Form.Item>
              </Form.Item>
              <Form.Item
                label="背景交通量年增长率"
                name="increaseRate"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="请输入"
                  style={{ width: '30%' }}
                  formatter={(value) => (value == '' ? '' : `${value}%`)}
                  parser={(value: any) => value.replace('%', '')}
                />
              </Form.Item>
              <Form.Item
                label="评价年基地高峰小时交通量（单位:pcu/h）"
                name="plotTraffic"
                rules={[{ required: false, message: '请输入' }]}
              >
                <Table
                  dataSource={assessTrafficTableData}
                  columns={assessTrafficColumns}
                  pagination={false}
                  bordered
                />
              </Form.Item>
              <Form.Item
                label="评价年OD矩阵"
                name="OD"
                rules={[{ required: false, message: '请输入' }]}
              >
                <Button type="primary" onClick={hanldeOnCal}>
                  计算
                </Button>
              </Form.Item>
              {bgData && bgData.length > 0 && (
                <Row style={{ marginBottom: '10px' }}>
                  <Col span={17} offset={7}>
                    <h4>背景OD矩阵(单位: pcu/h)</h4>
                    <div className={styles.tableContainer}>
                      <table className={styles.odtable}>
                        <tbody>
                          <tr>
                            <td>
                              {bgData.length > 0 && `${bgData[0].length}✖️${bgData[0].length}`}
                            </td>
                            <td></td>
                            <td></td>
                            {bgData.length > 0 &&
                              bgData.map((row: any, index: number) => {
                                return <td key={index}>{bgZoneNum[index]}</td>;
                              })}
                          </tr>
                          <tr>
                            <td></td>
                            <td>Name</td>
                            <td></td>
                            {bgData.length > 0 &&
                              bgData.map((row: any, index: number) => {
                                return <td key={index}>{getZoneName(bgZoneNum[index])}</td>;
                              })}
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                            <td>Sum</td>
                            {bgData.length > 0 &&
                              bgData.map((row: any, index: number) => {
                                let rowSum: any = 0;
                                bgData.forEach((item1: any) => {
                                  item1.forEach((item2: any, index2: number) => {
                                    if (item2 && index == index2) {
                                      rowSum += parseFloat(item2);
                                    }
                                  });
                                });
                                if (parseInt(rowSum) < parseFloat(rowSum)) {
                                  rowSum = rowSum.toFixed(2);
                                }
                                return <td key={index}>{rowSum}</td>;
                              })}
                          </tr>
                          {bgData.length > 0 &&
                            bgData.map((row: any, index: number) => {
                              let rowSum: any = 0;
                              row.forEach((item: any) => {
                                if (item) {
                                  rowSum += parseFloat(item);
                                }
                              });
                              if (parseInt(rowSum) < parseFloat(rowSum)) {
                                rowSum = rowSum.toFixed(2);
                              }
                              return (
                                <tr key={index}>
                                  <td>{bgZoneNum[index]}</td>
                                  <td>{getZoneName(bgZoneNum[index])}</td>
                                  <td>{rowSum}</td>
                                  {row.map((record: any, index1: number) => {
                                    return (
                                      <td
                                        onDoubleClick={() => {
                                          setBgIndex(`${index}${index1}`);
                                        }}
                                        key={index1}
                                      >
                                        {bgIndex && bgIndex == `${index}${index1}` ? (
                                          <InputNumber
                                            min={0}
                                            value={record}
                                            style={{ width: '80px' }}
                                            onBlur={() => {
                                              setBgIndex(undefined);
                                            }}
                                            onChange={(value) => {
                                              let newBgData = bgData.concat([]);
                                              newBgData[index][index1] = value;
                                              setBgData(newBgData);
                                            }}
                                          />
                                        ) : (
                                          record
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* <Table
                    dataSource={tableData}
                    columns={columns}
                    size="small"
                    pagination={false}
                    bordered
                  /> */}
                  </Col>
                </Row>
              )}
              {spData && spData.length > 0 && (
                <Row>
                  <Col span={17} offset={7}>
                    <h4>叠加OD矩阵(单位: pcu/h)</h4>
                    <div className={styles.tableContainer}>
                      <table className={styles.odtable}>
                        <tbody>
                          <tr>
                            <td>
                              {spData.length > 0 && `${spData[0].length}✖️${spData[0].length}`}
                            </td>
                            <td></td>
                            <td></td>
                            {spData.length > 0 &&
                              spData.map((row: any, index: number) => {
                                return <td key={index}>{spZoneNum[index]}</td>;
                              })}
                          </tr>
                          <tr>
                            <td></td>
                            <td>Name</td>
                            <td></td>
                            {spData.length > 0 &&
                              spData.map((row: any, index: number) => {
                                return <td key={index}>{getZoneName(spZoneNum[index])}</td>;
                              })}
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                            <td>Sum</td>
                            {spData.length > 0 &&
                              spData.map((row: any, index: number) => {
                                let rowSum: any = 0;
                                spData.forEach((item1: any) => {
                                  item1.forEach((item2: any, index2: number) => {
                                    if (item2 && index == index2) {
                                      rowSum += parseFloat(item2);
                                    }
                                  });
                                });

                                if (parseInt(rowSum) < parseFloat(rowSum)) {
                                  rowSum = rowSum.toFixed(2);
                                }
                                return <td key={index}>{rowSum}</td>;
                              })}
                          </tr>
                          {spData.length > 0 &&
                            spData.map((row: any, index: number) => {
                              let rowSum: any = 0;
                              row.forEach((item: any) => {
                                if (item) {
                                  rowSum += parseFloat(item);
                                }
                              });
                              if (parseInt(rowSum) < parseFloat(rowSum)) {
                                rowSum = rowSum.toFixed(2);
                              }
                              return (
                                <tr key={index}>
                                  <td>{spZoneNum[index]}</td>
                                  <td>{getZoneName(spZoneNum[index])}</td>
                                  <td>{rowSum}</td>
                                  {row.map((record: any, index1: number) => {
                                    return (
                                      <td
                                        onDoubleClick={() => {
                                          setSpIndex(`${index}${index1}`);
                                        }}
                                        key={index1}
                                      >
                                        {spIndex && spIndex == `${index}${index1}` ? (
                                          <InputNumber
                                            min={0}
                                            value={record}
                                            style={{ width: '80px' }}
                                            onBlur={() => {
                                              setSpIndex(undefined);
                                            }}
                                            onChange={(value) => {
                                              let newSpData = spData.concat([]);
                                              newSpData[index][index1] = value;
                                              setSpData(newSpData);
                                            }}
                                          />
                                        ) : (
                                          record
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </Col>
                </Row>
              )}
            </Form>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={handleOnSubmit}>
              预测/评价
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
  ({ predictManageAndEditPredict }: { predictManageAndEditPredict: StateType }) => ({
    stepData: predictManageAndEditPredict.step,
    current: predictManageAndEditPredict.current,
    currentProject: predictManageAndEditPredict.currentProject,
    currentPredict: predictManageAndEditPredict.currentPredict,
  }),
)(Step4);

import React, { useEffect, useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import AMapLoader from '@amap/amap-jsapi-loader';
import {
  EditOutlined,
  UpOutlined,
  DoubleRightOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import {
  message,
  Button,
  Space,
  Input,
  Select,
  Form,
  TreeSelect,
  Checkbox,
  Row,
  Col,
  Drawer,
} from 'antd';
const { Option } = Select;
const { Search } = Input;
const { SHOW_PARENT } = TreeSelect;
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2686590_idaxqb07swi.js',
});
// import projectData from './data';
import $ from 'jquery';
import lodash from 'lodash';
import { getTreeData } from '@/tools';
import { getDictData } from '@/services/projectManage';

import { Step1Comp, Step2Comp, Step3Comp, Step4Comp, Step5Comp } from './StepComp';
// import { getMapSurround, getRoads } from '@/services/v2/baseCitybit';
import { getProjectById } from '@/services/v2/project';
import { getAllRoads, getMapSurround } from '@/services/v2/map';
import styles from './index.less';

declare let AMapUI: any;
declare let Loca: any;
declare let window: any;

export default (): React.ReactNode => {
  // let AMap: any;
  // let map: any;
  // let distCluster:any; //区域划分聚合
  // let mouseTool: any;
  const [form] = Form.useForm();
  let crossFlag: boolean = false;
  let crossLnglat: any = undefined;
  let mapOverLays: any[] = [];
  let baseFlag: boolean = false; //基地
  let baseData: any = undefined;
  let currentCrossNodes: any[] = [];
  let currentPlotData: any = undefined; // 当前路段交叉口节点经纬度 ex: 'lng,lat'
  let mouseToolData: any = []; // 记录道路绘制的点
  let uploadRoadsData: any[] = []; // 基础道路要更新的道路
  const [map, setMap] = useState<any>(undefined);
  const [AMap, setAMap] = useState<any>(undefined);
  const [placeSearch, setPlaceSearch] = useState<any>(undefined);
  const stepTitles = [
    '添加基地地块',
    '添加规划地块',
    '添加规划道路',
    '小区出入口关联路网',
    '预测设置',
  ];
  // const [loca, setLoca] = useState<any>(undefined);
  const [tileVisible, setTileVisible] = useState<any>(false);
  const [roadVisible, setRoadVisible] = useState<any>(false); // 路段显示
  const [nodeVisible, setNodeVisible] = useState<any>(false); // 路段显示
  const [mouseTool, setMouseTool] = useState<any>(undefined);
  const [distCluster, setDistCluster] = useState<any>(undefined); // 区域划分
  const [mouseToolFlag, setMouseToolFlag] = useState<any>(false); // 鼠标划线工具
  const [drawPlotFlag, setDrawPlotFlag] = useState<any>(false); // 绘制地块
  const [drawConnectorFlag, setDrawConnectorFlag] = useState<any>(false); // 鼠标Connector
  // 数据
  const [searchValue, setSearchValue] = useState<any>(undefined); // 搜索
  const [dictData, setDictData] = useState<any>({}); // 字典数据
  const [tabsVisible, setTabsVisible] = useState<any>(false); // 右侧 tabs显示
  const [stepNum, setStepNum] = useState<number>(1);
  const [stepToolsFlag, setStepToolsFlag] = useState<boolean>(true);
  const [plotInfoData, setPlotInfoData] = useState<any>([]); //地块数据
  const [plotRecordDataIndex, setPlotRecordDataIndex] = useState<any>(undefined);
  const [plotRecordData, setPlotRecordData] = useState<any>(undefined);
  const [tabsMaxViewFlag, setTabsMaxViewFlag] = useState<boolean>(true);
  const [linksData, setLinksData] = useState<any[]>([]); // 路段数据
  const [nodesData, setNodesData] = useState<any[]>([]); // 节点数据
  const [roadData, setRoadData] = useState<any[]>([]); // 道路数据
  const [currentLinkData, setCurrentLinkData] = useState<any>(undefined); // 当前选择路段数据
  // const [currentRoadData, setCurrentRoadData] = useState<any>(undefined); // 当前选择道路数据
  const [projectData, setProjectData] = useState<any>(undefined); // 项目数据

  const [currentRoadIndex, setCurrentRoadIndex] = useState<any>(undefined); // 当前选择道路index
  const [roadLinksData, setRoadLinksData] = useState<any[]>([]); // 道路-路段数据
  const [linksVisible, setLinksVisible] = useState<boolean>(true); // 路段显示
  const [roadsVisible, setRoadsVisible] = useState<boolean>(true); // 道路显示
  const [connectorsData, setConnectorsData] = useState<any[]>([]); // 道路显示
  const tabStepRef: any = useRef();
  tabStepRef.current = stepNum;
  // const [baseData,setBaseData] = useState<any>(undefined);        //基地数据
  useEffect(() => {
    if (stepNum == 1 && tabsVisible) {
      let plotInfo: any = localStorage.getItem('plotInfo');
      if (plotInfo) {
        plotInfo = JSON.parse(plotInfo);
        setPlotInfoData(plotInfo);
        handleOnPlotLayerAdd(plotInfo, 'render');
        setTabsMaxViewFlag(false);
      }
    }
  }, [stepNum, tabsVisible]);
  useEffect(() => {
    handleOnMapInit();
    // getDictDataAll();
    return () => {
      mouseTool?.close();
    };
  }, []);
  useEffect(() => {
    if (map && AMap) {
      handleOnSearch();
      // handleOnDistrictCluster();
      handleOnDrawRoadLineLayer(); // 道路图层
      handleOnDrawLineLayer(); // 路段图层
      handleOnDrawPointLayer(); // 节点图层
      handleOnDrawPlotLayer(); // 地块图层
      handleOnDrawConnectorLayer(); //connector图层
      handleOnDrawLabelLayer(); // 文字图层
      handleOnMouseTool(); // 绘制工具
      handleOnMapEvent(); // 地图事件
    }
  }, [map, AMap]);
  useEffect(() => {
    if (currentLinkData && window.drawConnectorFlag) {
      // console.log('currentLinkData', currentLinkData);
      // console.log('plotRecordData', plotRecordData);
      // console.log('roadData', roadData);
      // console.log('--------------------');
      let filterRoadData = roadData.filter((item: any) => item.id == currentLinkData.roadId);
      setConnectorsData([
        ...connectorsData,
        {
          key: connectorsData.length + 1,
          plotName: plotRecordData.plotType,
          road: filterRoadData[0].roadName,
          linkRoad: filterRoadData[0].roadName + '路段',
        },
      ]);
    }
  }, [currentLinkData]);
  // 获取合围范围
  // const hanldeOnGetSurround = async (params?: any) => {
  //   const res = await getMapSurround({
  //     lngLat: {
  //       x: 121.474859,
  //       y: 31.236986,
  //     },
  //   });
  //   const { roadInfo } = res.data.project;

  //   // const res = await getProjectById('6114f39635d20a376f96e764');
  //   // const res = await getProjectById('6150264e10613c032a9a7185'); // 黄浦区
  //   // const { roadInfo } = res.data;
  //   let labelsData: any[] = [];
  //   let nodesData: any = [];
  //   let linksData: any = [];
  //   let newRoadInfo: any = {};

  //   roadInfo.forEach((item: any) => {
  //     // labelsData.push({
  //     //   id: item.name,
  //     //   type: 'roadName',
  //     //   center: item.nodes[Math.floor(item.nodes.length / 2)],
  //     // });
  //     let newLinksData = item.linkInfo.map((link: any, linkIndex: number) => {
  //       nodesData.push({
  //         ...link.nodeInfo[0],
  //         center: { lng: link.nodeInfo[0].longitude, lat: link.nodeInfo[0].latitude },
  //       });
  //       nodesData.push({
  //         ...link.nodeInfo[link.nodeInfo.length - 1],
  //         center: {
  //           lng: link.nodeInfo[link.nodeInfo.length - 1].longitude,
  //           lat: link.nodeInfo[link.nodeInfo.length - 1].latitude,
  //         },
  //       });
  //       return {
  //         ...link,
  //         name: item.roadName,
  //         lnglat: link.nodeInfo.map((node: any) => ({ lng: node.longitude, lat: node.latitude })),
  //       };
  //     });
  //     linksData.push(...newLinksData);
  //     newRoadInfo[`${item._id}`] = item;
  //   });
  //   // console.log('nodesData-------->', nodesData);
  //   nodesData = lodash.uniqBy(nodesData, 'nodeBId');
  //   // console.log('nodesData===>', nodesData);
  //   handleOnClearMapLayers();
  //   handleOnLineLayerAdd(linksData);
  //   handleOnPointsLayerAdd(nodesData, 'initpoint');
  //   window.roadInfoObj = newRoadInfo;
  //   console.log('window.roadInfoObj===>', window.roadInfoObj);
  //   setProjectData(res.data);
  //   // handleOnLabelLayerAdd(labelsData, 'link');
  // };
  const hanldeOnGetSurround = async (params?: any) => {
    const res = await getAllRoads({ adcode: 310114 });
    const roadInfos = res.data.data;
    let labelsData: any[] = [];
    let nodesData: any = [];
    let linksData: any = [];
    let newRoadInfo: any = {};

    roadInfos.forEach((item: any) => {
      let newLinksData = item.links.map((link: any, linkIndex: number) => {
        nodesData.push({
          ...link.nodes[0],
          sum: nodesData.length + 1,
          center: { lng: link.nodes[0].longitude, lat: link.nodes[0].latitude },
        });
        nodesData.push({
          ...link.nodes[link.nodes.length - 1],
          sum: nodesData.length + 1,
          center: {
            lng: link.nodes[link.nodes.length - 1].longitude,
            lat: link.nodes[link.nodes.length - 1].latitude,
          },
        });
        return {
          ...link,
          name: item.name,
          lnglat: link.nodes.map((node: any) => ({ lng: node.longitude, lat: node.latitude })),
        };
      });
      linksData.push(...newLinksData);
      newRoadInfo[`${item._id}`] = item;
    });
    console.log('nodesData-------->', nodesData);
    // nodesData = lodash.uniqBy(nodesData, 'nodeBId');
    // console.log('nodesData===>', nodesData);
    handleOnClearMapLayers();
    handleOnLineLayerAdd(linksData);
    handleOnPointsLayerAdd(nodesData, 'initpoint');
    // window.roadInfoObj = newRoadInfo;
    // console.log('window.roadInfoObj===>', window.roadInfoObj);
    // setProjectData(res.data);
    // handleOnLabelLayerAdd(labelsData, 'link');
  };
  // 高德地图初始化
  const handleOnMapInit = async () => {
    let newAMap = await AMapLoader.load({
      key: '4955c78df7d0a30f197174e5af1809a9', // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '1.4.16', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: [
        'AMap.MarkerClusterer',
        'AMap.MouseTool',
        'AMap.PlaceSearch',
        'AMap.Autocomplete',
        'AMap.ToolBar',
      ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      AMapUI: {
        // 是否加载 AMapUI，缺省不加载
        version: '1.1', // AMapUI 缺省 1.1
        plugins: ['overlay/SimpleInfoWindow', 'misc/PoiPicker', 'overlay/SimpleMarker'], // 需要加载的 AMapUI ui插件
      },
      Loca: {
        // 是否加载 Loca， 缺省不加载
        version: '1.3.2', // Loca 版本，缺省 1.3.2
      },
    });
    // console.log('newAMap', newAMap);
    // console.log('Loca', Loca);
    try {
      let newMap = new newAMap.Map('container', {
        center: [121.476334, 31.2383715], //中心点坐标
        zoom: 14, //默认地图缩放级别,
        // zoomEnable: false,
        // dragEnable: false,
        // scrollWheel: false,
        zIndex: 10,
        mapStyle: 'amap://styles/whitesmoke', //设置地图的显示样式
      });
      newMap.addControl(new newAMap.ToolBar());
      window.map = newMap;
      setMap(() => newMap);
      setAMap(() => newAMap);
      // setLoca(()=>newLoca);
    } catch (e) {
      message.error('地图初始化失败!');
    }
  };
  // 搜索
  const handleOnSearch = () => {
    var auto = new AMap.Autocomplete({ input: 'mapSearch' });
    var newPlaceSearch = new AMap.PlaceSearch({
      map: map,
    }); //构造地点查询类
    setPlaceSearch(newPlaceSearch);
    auto.on('select', (e: any) => {
      // console.log('e', e);
      newPlaceSearch.setCity(e.poi.adcode);
      newPlaceSearch.search(e.poi.name); //关键字查询查询
      setTabsVisible(true);
      setSearchValue(e.poi.name);
      window.tabsVisible = true;
    }); //注册监听，当选中某条记录时会触发
    newPlaceSearch.on('complete', (res: any) => {
      // console.log("complete===>",res);
      setTimeout(() => {
        map.clearMap();
      }, 0);
    });
  };
  // 地图事件
  const handleOnMapEvent = () => {
    map.on('click', function (ev: any) {
      setTimeout(() => {
        if (window.mouseToolFlag && !crossFlag) {
          var newCircle = new AMap.CircleMarker({
            map: map,
            center: [ev.lnglat.lng, ev.lnglat.lat], // 圆心位置
            radius: 15, //半径 //500
            strokeColor: '#F33', //线颜色
            strokeOpacity: 1, //线透明度
            strokeWeight: 1, //线粗细度
            fillColor: '#ee2200', //填充颜色
            fillOpacity: 1, //填充透明度
            // cursor: 'pointer',
            zIndex: 10,
          });
          mouseToolData.push(ev.lnglat);
          mapOverLays.push(newCircle);
          map.add(newCircle);
        }
        crossFlag = false;
      }, 100);
      if (!baseData && window.tabsVisible) {
        let simpleMarker = new AMapUI.SimpleMarker({
          //普通文本
          iconStyle: {
            src: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
            style: {
              width: '45px',
              height: '60px',
            },
          },
          iconLabel: {
            innerHTML: '<div>基地</div>',
            style: {
              marginTop: '10px',
              color: '#fff', //设置文字颜色
            },
          },
          map: map,
          position: [ev.lnglat.lng, ev.lnglat.lat],
          draggable: true,
          cursor: 'move',
          zIndex: 10,
        });
        simpleMarker.on('dragend', (ev: any) => {
          // console.log('marker_ev',ev);
          baseData = ev.lnglat;
        });
        baseData = ev.lnglat;
      }
    });
    map.on('rightclick', function (ev: any) {
      if (window.mouseToolFlag) {
        map.remove(mapOverLays);
        mapOverLays = [];
        if (mouseToolData.length == 1) {
          mouseToolData = [];
          uploadRoadsData = [];
        }
      }
    });
    map.on('dblclick', function (ev: any) {
      if (window.mouseToolFlag) {
        map.remove(mapOverLays);
        mapOverLays = [];
        if (mouseToolData.length == 1) {
          mouseToolData = [];
          uploadRoadsData = [];
        }
      }
    });
  };
  // 节点选中样式
  const handleOnPointLayerSelectedStyle = (event: any) => {
    let pointsData = event.target._dataSet.getData();
    pointsData.forEach((item: any) => {
      if (item._id == event.rawData._id) {
        if (item.checked) {
          item.checked = false;
        } else {
          item.checked = true;
        }
      } else {
        item.checked = false;
      }
    });
    event.target.setData(pointsData, {
      type: 'json',
      lnglat: 'center',
    });
    event.target.render();
  };
  // 节点图层
  const handleOnDrawPointLayer = () => {
    let data: any[] = [];
    // 点类型图层
    const pointLayer = new Loca.PointLayer({
      map: map,
      name: 'pointLayer',
      zIndex: 4,
      eventSupport: true,
    });
    // console.log("newPointsLayer===>",newPointsLayer);
    pointLayer.setData(data, {
      type: 'json',
      lnglat: 'center',
    });
    pointLayer.setOptions({
      style: {
        radius: 15,
        color: (res: any) => {
          if (res.value.checked) {
            return 'green';
          }
          return '#ff0000';
        },
      },
      selectStyle: {
        radius: 15,
        color: 'green',
        cursor: 'pointer',
      },
    });
    pointLayer.render();
    // 绑定事件
    pointLayer.on('click', function (event: any) {
      // console.log('Click target: ', event.target) // 触发click事件的元素
      // console.log('Event type: ', event.type) // 事件名称
      // console.log('Raw Event: ', event.originalEvent) // 原始DomEvent事件
      console.log('point Raw data: ', event.rawData); // 触发元素对应的原始数据
      // console.log('LngLat: ', event.lnglat) // 元素所在经纬度
      if (stepNum == 5) {
        handleOnPointLayerSelectedStyle(event);
      }
      crossFlag = true;
      crossLnglat = event.rawData.center;
    });
  };
  // 道路图层
  const handleOnDrawRoadLineLayer = () => {
    // 创建折线
    var path: any[] = [];
    // 点类型图层
    const roadLineLayer = new Loca.LineLayer({
      map: map,
      name: 'roadLineLayer',
      eventSupport: true,
      zIndex: 2,
    });
    roadLineLayer.setData(path, {
      type: 'json',
      lnglat: 'lnglat',
    });
    roadLineLayer.setOptions({
      style: {
        borderWidth: 10,
        color: (res: any) => {
          if (res.value.checked) {
            return 'green';
          }
          return '#ff0000';
        },
      },
      // selectStyle: {
      //   color: 'green',
      //   cursor: 'pointer',
      // },
    });
    roadLineLayer.render();
    // 绑定事件
    roadLineLayer.on('click', (event: any) => {
      // console.log('Click target: ', event); // 触发click事件的元素
      // console.log('Event type: ', event.type) // 事件名称
      // console.log('Raw Event: ', event.originalEvent) // 原始DomEvent事件
      console.log('Raw data: ', event.rawData); // 触发元素对应的原始数据
      // console.log('LngLat: ', event.lnglat) // 元素所在经纬度
      let layers = map.getLayers();
      let linkLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
      let linksdata = linkLayer._dataSet.getData();
      // console.log("linksdata",linksdata);
      let data = event.target._dataSet.getData();
      data.forEach((item: any, index: number) => {
        if (item.id == event.rawData.id) {
          if (item.checked) {
            delete item.checked;
            // setCurrentRoadData(undefined);
            setRoadLinksData([]);
            setCurrentRoadIndex(undefined);
          } else {
            let filterLinksData = linksdata.filter((link: any) => link.roadId == item.id);
            let roadLinksData = filterLinksData.map((link: any) => {
              let lngLatData = link.lnglat.map((lngLat: any) => {
                if (Array.isArray(lngLat)) {
                  return lngLat;
                }
                return [lngLat.lng, lngLat.lat];
              });
              var dis = AMap.GeometryUtil.distanceOfLine(lngLatData);
              return {
                ...link,
                name: `Link${link.id}`,
                distance: Math.ceil(dis) / 1000,
              };
            });
            // console.log("roadLinksData",roadLinksData);
            setRoadLinksData(roadLinksData);
            item.checked = true;
            // setCurrentRoadData(event.rawData);
            setCurrentRoadIndex(index);
          }
        }
      });
      event.target.setData(data, {
        type: 'json',
        lnglat: 'lnglat',
      });
      event.target.render();
    });
  };
  // 路段图层
  const handleOnDrawLineLayer = () => {
    // 创建折线
    var data: any[] = [];
    // 点类型图层
    const lineLayer = new Loca.LineLayer({
      map: map,
      name: 'lineLayer',
      zIndex: 3,
      eventSupport: true,
    });
    // console.log("lineLayer===>",lineLayer);
    lineLayer.setData(data, {
      type: 'json',
      lnglat: 'lnglat',
    });
    lineLayer.setOptions({
      style: {
        borderWidth: 10,
        color: (res: any) => {
          if (res.value.checked) {
            return 'green';
          }
          return '#ff0000';
        },
      },
      selectStyle: {
        color: 'green',
        cursor: 'pointer',
      },
    });
    lineLayer.render();
    // 绑定事件
    lineLayer.on('click', (event: any) => {
      // console.log('Click target: ', event); // 触发click事件的元素
      // console.log('Event type: ', event.type) // 事件名称
      // console.log('Raw Event: ', event.originalEvent) // 原始DomEvent事件
      // console.log('Raw data: ', event.rawData); // 触发元素对应的原始数据
      // console.log('LngLat: ', event.lnglat) // 元素所在经纬度
      const objPixel = new AMap.Pixel(event.originalEvent.x, event.originalEvent.y - 48);
      const newLngLat = map.containerToLngLat(objPixel);
      const { lnglat, roadId } = event.rawData;
      // const currentRoadData = window.roadInfoObj[roadId];

      let linesData = event.target._dataSet.getData();

      /*设置样式字段*/
      linesData.forEach((item: any) => {
        if (item._id == event.rawData._id) {
          if (item.checked) {
            item.checked = false;
            setCurrentLinkData(undefined);
          } else {
            if (!window.drawConnectorFlag && !window.mouseToolFlag) {
              item.checked = true;
            }
            setCurrentLinkData(event.rawData);
          }
        } else {
          item.checked = false;
        }
      });
      event.target.setData(linesData, {
        type: 'json',
        lnglat: 'lnglat',
      });
      event.target.render();
      /*-----------------------*/
      let updateLinkInfo: any[] = [];
      if (window.drawConnectorFlag || window.mouseToolFlag) {
        let newLnglatArr = [...lnglat, newLngLat].sort((a: any, b: any) => a.lng - b.lng);
        let arrIndex: any = null;
        let startArr: any = [];
        newLnglatArr.forEach((item: any, index: number) => {
          if (item.lng == newLngLat.lng && item.lat == newLngLat.lat) {
            startArr = newLnglatArr.splice(0, index + 1);
          }
        });
        linesData.forEach((item: any, index: number) => {
          if (item._id == event.rawData._id) {
            let startObj = {
              ...item,
              roadId,
              lnglat: startArr,
            };
            linesData.splice(index, 1, startObj);
            updateLinkInfo.push(startObj);
          }
        });
        let endObj = {
          roadId,
          lnglat: [{ lng: newLngLat.lng, lat: newLngLat.lat }, ...newLnglatArr],
        };
        linesData.push(endObj);
        updateLinkInfo.push(endObj);
      }
      // console.log('linesData==========>', linesData);
      // 链接connector与小区
      if (window.drawConnectorFlag && tabStepRef.current == 3) {
        // console.log("currentPlotData",currentPlotData);
        if (currentPlotData) {
          let linesArr = [currentPlotData.center, [newLngLat.lng, newLngLat.lat]];
          handleOnConnectorLayerAdd(linesArr);
          handleOnLineLayerAdd(linesData);
          handleOnPointsLayerAdd({ lng: newLngLat.lng, lat: newLngLat.lat }, 'connector');
        }
      }
      currentCrossNodes.push(`${newLngLat.lng},${newLngLat.lat}`);
      // if (window.mouseToolFlag) {
      //   // handleOnLineLayerAdd(linesData);
      //   uploadRoadsData.push({
      //     roadInfo: currentRoadData,
      //     updateLinkInfo: updateLinkInfo,
      //     linkId: event.rawData._id,
      //   });
      //   // console.log('uploadRoadsData===>', uploadRoadsData);
      // }
    });
  };
  // 文字图层
  const handleOnDrawLabelLayer = () => {
    var data: any[] = [];
    var labelLayer = new Loca.LabelsLayer({
      map: map,
      data: data,
      name: 'labelLayer',
      eventSupport: false,
      zIndex: 4,
    });
    labelLayer.setData(data, {
      type: 'json',
      lnglat: 'center',
    });
    labelLayer.setOptions({
      style: {
        direction: 'center',
        offset: [0, -3],
        text: function (data: any) {
          console.log('labelValue===>', data);
          return data.value.labelValue;
        },
        fontSize: 16,
        fillColor: '#fff',
        strokeColor: '#fff',
        strokeWidth: 0,
        opacity: 1,
      },
    });
    labelLayer.set('data', data);
    labelLayer.render();
  };
  // 地块图层 polygon
  const handleOnDrawPlotLayer = () => {
    let data: any[] = [];
    var plotLayer = new Loca.PolygonLayer({
      map: map,
      name: 'plotLayer',
      eventSupport: true,
      zIndex: 1,
    });
    plotLayer.setData(data, {
      type: 'json',
      lnglat: 'lnglat',
    });
    plotLayer.setOptions({
      style: {
        color: (res: any) => {
          // console.log('res', res);
          if (res.value.checked) {
            return 'blue';
          }
          if (res.value.status == 1) {
            return 'green';
          }
          return '#e25b0c';
        },
        borderColor: '#e25b0c',
        borderWidth: 1,
        strokeWidth: 1,
        opacity: 0.75,
      },
    });
    plotLayer.render();
    plotLayer.on('click', (event: any) => {
      console.log('Click target: ', event); // 触发click事件的元素
      // console.log('Event type: ', event.type) // 事件名称
      // console.log('Raw Event: ', event.originalEvent) // 原始DomEvent事件
      console.log('Raw data: ', event.rawData); // 触发元素对应的原始数据
      // console.log('LngLat: ', event.lnglat) // 元素所在经纬度
      let plotsData = event.target._dataSet.getData();
      // if (event.rawData.type == 1) {
      //   message.warning('请选择规划地块!');
      //   return;
      // }
      if (tabStepRef.current == 2 && event.rawData.plotType != '规划地块') {
        message.warning('请选择规划地块!');
        return;
      }
      if (tabStepRef.current == 1 && event.rawData.plotType != '基地地块') {
        message.warning('请选择基地地块!');
        return;
      }
      currentPlotData = event.rawData;
      /*设置选中样式*/
      plotsData.forEach((item: any, index: number) => {
        if (item.plotId == event.rawData.plotId) {
          if (item.checked) {
            item.checked = false;
            // setPlotRecordData(undefined);
            setPlotRecordDataIndex(undefined);
            if (window.drawConnectorFlag || window.mouseToolFlag) {
              setCurrentLinkData(undefined);
            }
            currentPlotData = undefined;
            if (item.status == 1) {
              handleOnStep1SetFieldsValue(event.rawData, 'reset');
            }
          } else {
            if (item.status == 1) {
              handleOnStep1SetFieldsValue(event.rawData, 'init');
            }
            item.checked = true;
            // setPlotRecordData(currentPlotData);
            setPlotRecordDataIndex(index);
          }
        } else {
          item.checked = false;
        }
      });
      event.target.setData(plotsData, {
        type: 'json',
        lnglat: 'lnglat',
      });
      event.target.render();
      /*--------------------*/
    });
  };
  // connector 关系图层
  const handleOnDrawConnectorLayer = () => {
    const connectorLayer = new Loca.LinkLayer({
      map: map,
      name: 'connectorLayer',
    });
    connectorLayer.setOptions({
      style: {
        // width: 10,
        borderWidth: 1,
        opacity: '0.8',
        color: '#ff0000',
      },
    });
    connectorLayer.render();
  };
  // conector关系添加
  const handleOnConnectorLayerAdd = (data: any) => {
    const layers = map.getLayers();
    let connectorLayer = layers.filter((item: any) => item.get('name') == 'connectorLayer')[0];
    let connectorsData = connectorLayer._dataSet.getData() || [];
    connectorsData.push({
      lnglat: data,
    });
    connectorLayer.setData(connectorsData, {
      // type: 'json',
      lnglat: 'lnglat',
    });
    connectorLayer.set('data', connectorsData);
    connectorLayer.render();
  };
  // plotLayer地块新增
  const handleOnPlotLayerAdd = (data: any, dataType?: string) => {
    const layers = map.getLayers();
    let plotLayer = layers.filter((item: any) => item.get('name') == 'plotLayer')[0];
    let labelData = data.map((item: any) => {
      return {
        ...item,
        labelValue: item.name,
      };
    });
    if (dataType) {
      plotLayer.setData(data, {
        lnglat: 'lnglat',
      });
      plotLayer.render();
      handleOnLabelLayerAdd(labelData, 'polygon', 'render');
      return;
    }

    let plotsData = plotLayer._dataSet.getData();
    const minLng: any = lodash.minBy(data, 'lng');
    const maxLng: any = lodash.maxBy(data, 'lng');
    const minLat: any = lodash.minBy(data, 'lat');
    const maxLat: any = lodash.maxBy(data, 'lat');
    // 地块中心点
    const newLngLat: any = [(minLng.lng + maxLng.lng) / 2, (minLat.lat + maxLat.lat) / 2];
    plotsData.push({
      plotId: plotsData.length + 1,
      lnglat: data,
      name: `地块${plotsData.length + 1}`,
      center: newLngLat,
      plotType: window.baseFlag == 'base' ? '基地地块' : '规划地块',
    });
    setPlotInfoData(plotsData);
    plotLayer.setData(plotsData, {
      // type: 'json',
      lnglat: 'lnglat',
    });
    plotLayer.render();
    handleOnLabelLayerAdd({ labelValue: `地块${plotsData.length}`, center: newLngLat }, 'polygon');
  };
  // labelLayer新增
  const handleOnLabelLayerAdd = (data: any, type: string, dataType?: string) => {
    // console.log('labelData==========>', data);
    let layers = map.getLayers();
    let newLabelLayer = layers.filter((item: any) => item.get('name') == 'labelLayer')[0];
    // console.log('newLabelLayer', newLabelLayer);
    let labelsData = newLabelLayer.w.data;
    let filterLayers = layers.filter((item: any) => item.get('name') != 'labelLayer');
    // console.log('filterLayers===>',filterLayers);
    // console.log('labelsData===>', labelsData);
    let newdata = [];
    if (type == 'points') {
      let filterPlotData = labelsData.filter((item: any) => item.type != 'pointLabel');
      newdata = data.map((item: any) => {
        if (Array.isArray(item.center)) {
          return item;
        } else {
          return {
            ...item,
            center: [item.center.lng, item.center.lat],
          };
        }
      });
      newdata.push(...filterPlotData);
    } else if (type == 'polygon') {
      if (dataType) {
        newdata = data;
      } else {
        newdata = [
          ...labelsData,
          {
            type: 'plotLabel',
            labelValue: data.labelValue,
            center: data.center,
          },
        ];
      }
    } else if (type == 'link') {
      newdata = [...labelsData, ...data];
    }
    // console.log('newdata', newdata);
    // if (!dataType) {
    //   return;
    // }
    map.setLayers(filterLayers);
    var labelLayer = new Loca.LabelsLayer({
      map: map,
      data: newdata,
      eventSupport: false,
      name: 'labelLayer',
      zIndex: 4,
    });
    labelLayer.set('data', newdata);
    labelLayer.setData(newdata, {
      type: 'json',
      lnglat: 'center',
    });
    labelLayer.setOptions({
      style: {
        direction: 'center',
        offset: [0, -3],
        text: function (data: any) {
          return data.value.labelValue;
        },
        fontSize: 16,
        fillColor: (data: any) => {
          if (data.value.type == 'roadName') {
            return '#1890ff';
          }
          return '#fff';
        },
        strokeColor: '#fff',
        strokeWidth: 0,
        opacity: 1,
      },
    });
    labelLayer.render();
  };
  // lineLayer路段新增
  const handleOnLineLayerAdd = (data: any[]) => {
    // console.log('lineData===>', data);
    let layers = map.getLayers();
    let lineLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    lineLayer.setData(data, {
      // type: 'json',
      lnglat: 'lnglat',
    });
    lineLayer.render();
  };
  // 道路新增
  const handleOnRoadLineLayerAdd = (data: any[]) => {
    let layers = map.getLayers();
    let lineLayer = layers.filter((item: any) => item.get('name') == 'roadLineLayer')[0];
    let linesData = lineLayer._dataSet.getData();
    let idNum = linesData.length;
    handleOnMapLinesLayerAdd(data, idNum);
    linesData.push({
      id: linesData.length + 1,
      lnglat: data,
    });
    setRoadData(linesData);
    lineLayer.setData(linesData, {
      // type: 'json',
      lnglat: 'lnglat',
    });
    lineLayer.render();
  };
  // pointsLayer新增
  const handleOnPointsLayerAdd = (data: any, type?: string) => {
    // console.log('data===>', data);
    //获取pointLayer,重新渲染数据
    let layers = map.getLayers();
    let newPointsLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    let pointsData = newPointsLayer._dataSet.getData();
    if (Array.isArray(data)) {
      if (type == 'initpoint') {
        data.forEach((item: any, index) => {
          let pointObj: any = {
            ...item,
            labelValue: item.sum,
            center: item.center,
            type: 'pointLabel',
          };
          pointsData.push(pointObj);
        });
      } else {
        data.forEach((item: any, index) => {
          if (
            index == 0 ||
            index == data.length - 1 ||
            currentCrossNodes.includes(`${item.lng},${item.lat}`)
          ) {
            let pointObj: any = {
              id: pointsData.length + 1,
              labelValue: pointsData.length + 1,
              center: item,
              isConnector: type == 'connector' ? true : false,
            };
            if (currentCrossNodes.includes(`${item.lng},${item.lat}`)) {
              pointObj.crossFlag = true;
            }
            pointsData.push(pointObj);
          }
        });
      }
    } else {
      let pointObj: any = {
        id: pointsData.length + 1,
        labelValue: pointsData.length + 1,
        center: data,
        isConnector: type == 'connector' ? true : false,
      };
      if (currentCrossNodes.includes(`${data.lng},${data.lat}`)) {
        pointObj.crossFlag = true;
      }
      pointsData.push(pointObj);
    }
    newPointsLayer.setData(pointsData, {
      type: 'json',
      lnglat: 'center',
    });
    newPointsLayer.render();
    // label
    handleOnLabelLayerAdd(pointsData, 'points');
  };
  // 地图划线工具
  const handleOnMouseTool = () => {
    let newMouseTool = new AMap.MouseTool(map);
    // console.log('newMouseTool===>',newMouseTool);
    setMouseTool(newMouseTool);
    // 绘制结束事件
    newMouseTool.on('draw', (e: any) => {
      console.log('绘制====>', e);
      console.log(e.obj.getPath());
      map.remove(e.obj);
      // 绘制线段完成后回调
      if (e.obj.CLASS_NAME == 'AMap.Polyline') {
        let pointsArr = e.obj.getPath();
        if (uploadRoadsData.length > 0) {
          console.log('uploadRoadsData', uploadRoadsData);
          // handleOnLineLayerAdd(linesData);
        }
        if (crossLnglat) {
          let node: any;
          if (Math.abs(pointsArr[0].lng - crossLnglat.lng) <= 0.0001) {
            node = pointsArr[pointsArr.length - 1];
            pointsArr.splice(0, 1, crossLnglat);
          } else {
            node = pointsArr[0];
            pointsArr.splice(pointsArr.length - 1, 1, crossLnglat);
          }
          crossFlag = false;
          crossLnglat = undefined;
          handleOnPointsLayerAdd(node);
        } else {
          // handleOnMapPointsLayerAdd(pointsArr);
          handleOnPointsLayerAdd(pointsArr);
        }
        handleOnRoadLineLayerAdd(e.obj.getPath());
      }
      // 绘制地块
      if (e.obj.CLASS_NAME == 'AMap.Polygon') {
        handleOnPlotLayerAdd(e.obj.getPath());
        if (window.baseFlag) {
          setTabsMaxViewFlag(false);
        }
      }
    });
  };
  // mouseTool添加点
  const handleOnMapPointsLayerAdd = (data: any) => {
    if (window.mouseToolFlag) {
      handleOnPointsLayerAdd(data);
    }
  };
  // mouseTool结束后添加路段
  const handleOnMapLinesLayerAdd = (data: any, idNum: number) => {
    if (window.mouseToolFlag) {
      let layers = map.getLayers();
      let newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
      let linesData = newLinesLayer._dataSet.getData();
      // 处理交叉口点的路段
      if (currentCrossNodes.length > 0) {
        // console.log("data",data);
        let indexArr: any[] = [];
        data.forEach((item: any, index: number) => {
          if (currentCrossNodes.includes(`${item.lng},${item.lat}`)) {
            if (index != 0 && index != data.length - 1) {
              indexArr.push(index);
            }
          }
        });
        // console.log("indexArr",indexArr);
        // 交叉口的点index
        if (indexArr.length > 0) {
          let start = 0;
          linesData.push({
            id: linesData.length + 1,
            roadId: idNum + 1,
            lnglat: data.slice(start, indexArr[0] + 1),
          });
          for (let i = 0; i < indexArr.length; i++) {
            start = indexArr[i];
            if (i + 1 == indexArr.length) {
              linesData.push({
                id: linesData.length + 1,
                roadId: idNum + 1,
                lnglat: data.slice(start, data.length),
              });
            } else {
              linesData.push({
                id: linesData.length + 1,
                roadId: idNum + 1,
                lnglat: data.slice(start, indexArr[i + 1] + 1),
              });
            }
          }
        } else {
          linesData.push({
            id: linesData.length + 1,
            roadId: idNum + 1,
            lnglat: data,
          });
        }
        console.log('linesData=====>', linesData);
        handleOnLineLayerAdd(linesData);
        return;
      }
      linesData.push({
        id: linesData.length + 1,
        sum: linesData.length + 1,
        lnglat: data,
        roadId: idNum + 1,
      });
      handleOnLineLayerAdd(linesData);
    }
  };
  // 地图背景显示/隐藏
  const handleOnMapTile = () => {
    if (tileVisible) {
      setTileVisible(false);
      map.setFeatures(['bg', 'point', 'road', 'building']);
      distCluster.show();
      return;
    }
    setTileVisible(true);
    map.setFeatures([]);
    distCluster.hide();
  };
  // 绘制路段
  const handleOnMouseDrawPolyline = (type?: string) => {
    if (mouseToolFlag || type) {
      window.mouseToolFlag = false;
      setMouseToolFlag(false);
      mouseTool.close(true);
      return;
    }
    currentCrossNodes = [];
    window.mouseToolFlag = true;
    setMouseToolFlag(true);
    mouseTool.polyline({
      strokeColor: 'red',
      strokeWeight: 5,
      strokeStyle: 'solid',
      lineCap: 'round',
      //同Polyline的Option设置
    });
  };
  // 路段显隐
  const handleOnMapLinkLayer = () => {
    let layers = map.getLayers();
    let newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    if (roadVisible) {
      newLinesLayer.show();
      newLinesLayer._config.eventSupport = true;
      newLinesLayer.render();
      setRoadVisible(false);
      return;
    }
    newLinesLayer.hide();
    newLinesLayer._config.eventSupport = false;
    newLinesLayer.render();
    setRoadVisible(true);
  };
  // 道路显隐
  const handleOnMapRoadLayer = () => {
    let layers = map.getLayers();
    let newLinesLayer = layers.filter((item: any) => item.get('name') == 'roadLineLayer')[0];
    if (!roadsVisible) {
      newLinesLayer.show();
      newLinesLayer._config.eventSupport = true;
      newLinesLayer.render();
      setRoadsVisible(true);
      return;
    }
    newLinesLayer.hide();
    newLinesLayer._config.eventSupport = false;
    newLinesLayer.render();
    setRoadsVisible(false);
  };
  // 节点显隐
  const handleOnMapNodeLayer = () => {
    let layers = map.getLayers();
    let newPointsLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    let newLabelLayer = layers.filter((item: any) => item.get('name') == 'labelLayer')[0];
    if (nodeVisible) {
      newPointsLayer.show();
      newLabelLayer.show();
      newPointsLayer._config.eventSupport = true;
      newPointsLayer.render();
      setNodeVisible(false);
      return;
    }
    newLabelLayer.hide();
    newPointsLayer.hide();
    newPointsLayer._config.eventSupport = false;
    newPointsLayer.render();
    setNodeVisible(true);
  };
  // 获取所有点
  const handleOnGetAllPoints = () => {
    let layers = map.getLayers();
    let newPointsLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    let pointsData = newPointsLayer.get('data');
    console.log('pointsData=====>', pointsData);
  };
  // 获取所有线
  const handleOnGetAllLines = () => {
    let layers = map.getLayers();
    let newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    let linesData = newLinesLayer.get('data');
    console.log('linesData====>', linesData);
  };
  // 获取文字标注
  const handleOnGetAllLabels = () => {
    let layers = map.getLayers();
    let newLabelLayer = layers.filter((item: any) => item.get('name') == 'labelLayer')[0];
    let lalelsData = newLabelLayer.get('data');
    console.log('lalelsData====>', lalelsData);
  };
  // 获取地块数量
  const handleOnGetAllPlot = () => {
    let layers = map.getLayers();
    let plotLayer = layers.filter((item: any) => item.get('name') == 'plotLayer')[0];
    let plotsData = plotLayer.get('data');
    console.log('plotsData====>', plotsData);
  };
  // 开始绘制地块
  const handleOnDrawPlot = () => {
    if (drawPlotFlag) {
      setDrawPlotFlag(false);
      mouseTool.close(true);
      return;
    }
    setDrawPlotFlag(true);
    mouseTool.polygon({
      strokeColor: 'red',
      strokeWeight: 5,
      strokeStyle: 'solid',
      // lineCap: 'round',
      //同Polyline的Option设置
    });
  };
  // 绘制Connector关联小区
  const handleOnDrawConnector = () => {
    if (drawConnectorFlag) {
      setDrawConnectorFlag(false);
      window.drawConnectorFlag = false;
      return;
    }
    window.drawConnectorFlag = true;
    setDrawConnectorFlag(true);
  };
  //下拉框字典
  const getDictDataAll = () => {
    let parentIds = [
      // {
      //   name: '所属行政区',
      //   type: 'ssxzq',
      //   parentId: '606c33c676426f003c7039e1',
      // },
      {
        name: '启动阈值所属区域',
        type: 'qdfzssqy',
        parentId: '606d10a0621189002f1bc7ed',
      },
      // {
      //   name: '静态判别所属区域',
      //   type: 'jtpbssqy',
      //   parentId: '606d1ab7baf2e30043bd3bfd',
      // },
      // {
      //   name: '充电桩车位判别所属区域',
      //   type: 'cdzcwpbssqy',
      //   parentId: '606d241c41bcccaa247dc0ec',
      // },
      {
        name: '控规用地性质',
        type: 'kgydxz',
        parentId: '606d275341bcccaa247dc0f4',
      },
      {
        name: '按功能划分建筑面积（建筑物分类)',
        type: 'agnhfjzmj',
        parentId: '6066f305621189002f1bc6d0',
      },
      // {
      //   name: '所属规划区域（地区分类）',
      //   type: 'ssghqy',
      //   parentId: '6066f17276426f003c7039dc',
      // },
      // {
      //   name: '项目研究时段',
      //   type: 'xmyjsd',
      //   parentId: '607696f3a67748bbc5c764bb',
      // },
      {
        name: '地块所属业态',
        type: 'dkssyt',
        parentId: '607ea7ebbe59b58b9807b4ab',
      },
      {
        name: '住宅按户均面积分类',
        type: 'zzahjmjfl',
        parentId: '607eb051be59b58b9807b4c2',
      },
      // 预测
      {
        name: '道路等级',
        type: 'dldj',
        parentId: '606ff379843ea2749135ba79',
      },
      {
        name: '建成情况',
        type: 'jcqk',
        parentId: '608115ccdc75f61295d3307d',
      },
      {
        name: '建设年限',
        type: 'jsnx',
        parentId: '60768ad7a67748bbc5c764b8',
      },
      {
        name: '方向',
        type: 'fx',
        parentId: '608115ccdc75f61295d3307e',
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
  // 搜索
  const handleOnSearchBase = (value: any) => {
    console.log(value);
    if (!placeSearch) {
      return;
    }
    placeSearch.setCity('310101');
    placeSearch.search(value);
    setTabsVisible(true);
    setSearchValue(value);
    window.tabsVisible = true;
  };
  // 获取link,node,进行设置,
  const handleOnSetData = () => {
    const layers = map.getLayers();
    const newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    const newPointLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    let newLinksData = newLinesLayer.get('data');
    let newNodesData = newPointLayer.get('data');
    setLinksData(newLinksData);
    setNodesData(newNodesData);
  };
  // tabs 下一步
  const handleOnTabsNext = () => {
    // if (stepNum == 1 && plotInfoData.length == 0) {
    //   message.warning('请至少绘制一个基地地块!');
    //   return;
    // }
    if (drawPlotFlag) {
      setDrawPlotFlag(false);
      mouseTool.close(true);
    }
    if (stepNum == 1) {
      hanldeOnGetSurround();
    }
    if (stepNum == 3) {
      handleOnMapRoadLayer();
    } else {
      handleOnMouseDrawPolyline('close');
    }
    if (stepNum == 4) {
      handleOnSetData();
    }
    setStepNum(stepNum + 1);
  };
  // tabs 上一步
  const handleOnTabsPrevious = () => {
    if (drawPlotFlag) {
      setDrawPlotFlag(false);
      mouseTool.close(true);
    }
    if (stepNum == 3) {
      handleOnMapRoadLayer();
    } else {
      handleOnMouseDrawPolyline('close');
    }
    setStepNum(stepNum - 1);
  };
  // step 地图操作
  const handleOnStepClick = (type: any) => {
    // 绘制基地地块
    if (type == 1) {
      handleOnDrawPlot();
      window.baseFlag = true;
    }
    //绘制规划地块
    if (type == 2) {
      handleOnDrawPlot();
      window.baseFlag = false;
    }
    //绘制规划道路
    if (type == 3) {
      handleOnMouseDrawPolyline();
    }
    if (type == 4) {
      handleOnDrawConnector();
    }
    let statusObj = map.getStatus();
    if (type == 6) {
      setStepToolsFlag(true);
      mouseTool.close(true);
      // if (statusObj.dragEnable) {
      //   map.setStatus({
      //     ...statusObj,
      //     dragEnable: false,
      //   });
      // } else {
      //   map.setStatus({
      //     ...statusObj,
      //     dragEnable: true,
      //   });
      // }
    } else {
      setStepToolsFlag(false);
      // map.setStatus({
      //   ...statusObj,
      //   dragEnable: false,
      // });
    }
  };

  // 清除图层内容
  const handleOnClearMapLayers = () => {
    const layers = map.getLayers();
    const newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    const newPointLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    const newLabelLayer = layers.filter((item: any) => item.get('name') == 'labelLayer')[0];
    const newPlotLayer = layers.filter((item: any) => item.get('name') == 'plotLayer')[0];

    newLinesLayer.setData([]);
    newLinesLayer.set('data', []);
    newLinesLayer.render();

    newPointLayer.setData([]);
    newPointLayer.set('data', []);
    newPointLayer.render();

    newLabelLayer.setData([]);
    newLabelLayer.set('data', []);
    newLabelLayer.render();

    // newPlotLayer.setData([]);
    // newPlotLayer.set("data",[]);
    // newPlotLayer.render();
  };
  // 清除路段
  const handleOnClearPolylines = () => {
    let layers = map.getLayers();
    let newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    newLinesLayer.setData([]);
    newLinesLayer.render();
  };
  // 显示道路/路段
  const hanndleOnCheckedChange = (type: string) => {
    let layers = map.getLayers();
    let newRoadLinesLayer = layers.filter((item: any) => item.get('name') == 'roadLineLayer')[0];
    if (type == 'link') {
      handleOnMapLinkLayer();
      if (linksVisible) {
        setLinksVisible(false);
        // newRoadLinesLayer._config.eventSupport = false;
        // newRoadLinesLayer.render();
        return;
      }
      // newRoadLinesLayer._config.eventSupport = true;
      // newRoadLinesLayer.render();
      setLinksVisible(true);
    }
    if (type == 'road') {
      handleOnMapRoadLayer();
    }
  };
  // step1 init
  const handleOnStep1SetFieldsValue = (data: any, type: string) => {
    if (type == 'init') {
      let objData: any = {
        code: data.code,
        plotPartitioning: data.plotPartitioning.map((item: any) => {
          return {
            value: item.id,
            label: item.name,
          };
        }),
      };
      data.plotPartitioning.forEach((item: any) => {
        objData[`area_${item.code}`] = item.area;
      }),
        form.setFieldsValue(objData);
    } else {
      form.resetFields();
    }
  };
  // 更新路段
  const hanldeOnUpdateRoad = () => {};
  return (
    <PageContainer pageHeaderRender={false} className={styles.homePage}>
      {!tabsVisible && (
        <div className={styles.searchContain}>
          <Space>
            <Select defaultValue="上海市" placeholder="请选择" style={{ width: '160px' }}>
              <Option value="上海市">上海市</Option>
            </Select>
            <Select labelInValue placeholder="启动阈值所属区域" style={{ width: '220px' }}>
              {dictData['qdfzssqy'] &&
                dictData['qdfzssqy'].map((item: any, index: number) => {
                  return (
                    <Option key={index} value={`${item._id}_${item.code}`}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
            {/* <Input id="mapSearch"  placeholder="新建项目具体地址" autoComplete="off" style={{ width: '330px' }}/> */}
            <Search
              id="mapSearch"
              value={searchValue}
              placeholder="请输入"
              autoComplete="off"
              style={{ width: '330px' }}
              enterButton
              onSearch={handleOnSearchBase}
            />
          </Space>
          <Space style={{ padding: '5px' }}>
            <span style={{ color: '#f00' }}>*</span>
            <span>
              启动阈值所属区域，来源
              <a>《上海市建设项目交通影响评价技术标准》（DG/TJ08-2165-2015）</a>
            </span>
          </Space>
        </div>
      )}
      {(stepNum == 3 || stepNum == 4) && (
        <div style={{ position: 'absolute', left: '80px', top: '20px', zIndex: 3 }}>
          <Space direction="vertical">
            <Checkbox checked={linksVisible} onChange={() => hanndleOnCheckedChange('link')}>
              路段
            </Checkbox>
            <Checkbox checked={roadsVisible} onChange={() => hanndleOnCheckedChange('road')}>
              道路
            </Checkbox>
          </Space>
        </div>
      )}
      {/* <div style={{ position: 'absolute', left: 0, top: '0', zIndex: 3 }}>
        <Space direction="vertical">
          <div>
            <Space>
              <Button type="primary" onClick={handleOnMouseDrawPolyline}>
                {mouseToolFlag ? '结束' : '开始'}绘制路段
              </Button>
              <Button type="primary" onClick={handleOnDrawPlot}>
                {drawPlotFlag ? '结束' : '开始'}绘制地块
              </Button>
              <Button type="primary" onClick={handleOnDrawConnector}>
                {drawConnectorFlag ? '结束' : '开始'}绘制Connector
              </Button>
              <Button type="primary" onClick={handleOnClearPolylines}>
                清除路段
              </Button>
            </Space>
          </div>
          <div>
            <Space>
              <Button type="primary" onClick={handleOnMapTile}>
                图层{tileVisible ? '显示' : '隐藏'}
              </Button>
              <Button type="primary" onClick={handleOnMapLinkLayer}>
                路段{roadVisible ? '显示' : '隐藏'}
              </Button>
              <Button type="primary" onClick={handleOnMapNodeLayer}>
                节点{nodeVisible ? '显示' : '隐藏'}
              </Button>
              <Button type="primary" onClick={handleOnGetAllPoints}>
                获取点
              </Button>
              <Button type="primary" onClick={handleOnGetAllLines}>
                获取线
              </Button>
              <Button type="primary" onClick={handleOnGetAllLabels}>
                获取label
              </Button>
              <Button type="primary" onClick={handleOnGetAllPlot}>
                获取地块
              </Button>
            </Space>
          </div>
        </Space>
      </div> */}
      {tabsVisible && stepNum < 5 && (
        <>
          <div className={styles.tabsContain}>
            <div className={styles.title}>
              <h1>
                <Space>
                  <span>
                    {stepNum}/5: {stepTitles[stepNum - 1]}
                  </span>
                  {!tabsMaxViewFlag && (
                    <UpOutlined
                      className={styles.tabMinIcon}
                      onClick={() => {
                        setTabsMaxViewFlag(true);
                      }}
                    />
                  )}
                </Space>
              </h1>
            </div>

            {!tabsMaxViewFlag && (
              <>
                <div className={styles.content}>
                  <Form
                    name=""
                    form={form}
                    layout="vertical"
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    // initialValues={{ remember: true }}
                  >
                    {stepNum == 1 && (
                      <Step1Comp
                        plotRecordDataIndex={plotRecordDataIndex}
                        setPlotRecordDataIndex={setPlotRecordDataIndex}
                        plotInfoData={plotInfoData}
                        setPlotInfoData={setPlotInfoData}
                        dictData={dictData}
                        form={form}
                      />
                    )}
                    {stepNum == 2 && (
                      <Step2Comp
                        plotRecordDataIndex={plotRecordDataIndex}
                        setPlotRecordDataIndex={setPlotRecordDataIndex}
                        plotInfoData={plotInfoData}
                        setPlotInfoData={setPlotInfoData}
                        dictData={dictData}
                        form={form}
                      />
                    )}
                    {stepNum == 3 && (
                      <Step3Comp
                        // currentRoadData={currentRoadData}
                        // setCurrentRoadData={setCurrentRoadData}
                        currentRoadIndex={currentRoadIndex}
                        setCurrentRoadIndex={setCurrentRoadIndex}
                        roadLinksData={roadLinksData}
                        setRoadLinksData={setRoadLinksData}
                        roadData={roadData}
                        setRoadData={setRoadData}
                        dictData={dictData}
                        form={form}
                      />
                    )}
                    {stepNum == 4 && <Step4Comp connectorsData={connectorsData} />}
                  </Form>
                </div>
                <div className={styles.footer}>
                  <Space>
                    {stepNum != 1 && <Button onClick={handleOnTabsPrevious}>上一步</Button>}
                    {stepNum != 5 && (
                      <Button type="primary" onClick={handleOnTabsNext}>
                        下一步
                      </Button>
                    )}
                  </Space>
                </div>
              </>
            )}
            {tabsMaxViewFlag && (
              <div>
                <DoubleRightOutlined
                  className={styles.tabMaxIcon}
                  onClick={() => setTabsMaxViewFlag(false)}
                />
              </div>
            )}
          </div>
          <div className={styles.toolsContainer}>
            <div>
              {stepNum == 1 && (
                <Button
                  type={stepToolsFlag ? 'default' : 'primary'}
                  icon={<EditOutlined />}
                  onClick={() => handleOnStepClick(1)}
                >
                  绘制基地地块
                </Button>
              )}
              {stepNum == 2 && (
                <Button
                  type={stepToolsFlag ? 'default' : 'primary'}
                  icon={<EditOutlined />}
                  onClick={() => handleOnStepClick(2)}
                >
                  绘制规划地块
                </Button>
              )}
              {stepNum == 3 && (
                <Button
                  type={stepToolsFlag ? 'default' : 'primary'}
                  icon={<EditOutlined />}
                  onClick={() => handleOnStepClick(3)}
                >
                  绘制规划道路
                </Button>
              )}
              {stepNum == 4 && (
                <Button
                  type={stepToolsFlag ? 'default' : 'primary'}
                  icon={<EditOutlined />}
                  onClick={() => handleOnStepClick(4)}
                >
                  小区关联路网
                </Button>
              )}
              <Button
                type={!stepToolsFlag ? 'default' : 'primary'}
                icon={<IconFont type="icon-pointer" />}
                onClick={() => handleOnStepClick(6)}
              >
                移动地图
              </Button>
            </div>
          </div>
        </>
      )}
      {stepNum == 5 && (
        <Step5Comp
          linksData={linksData}
          setLinksData={setLinksData}
          nodesData={nodesData}
          setNodesData={setNodesData}
          dictData={dictData}
          stepNum={stepNum}
          setStepNum={setStepNum}
        />
      )}
      <div id="container" className={styles.mapContainer}></div>
    </PageContainer>
  );
};

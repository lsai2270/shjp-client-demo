import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import AMapLoader from '@amap/amap-jsapi-loader';
import { message, Button, Space, Input } from 'antd';
import projectData from './data';
import $ from 'jquery';
import lodash from 'lodash';
import { history, useIntl, FormattedMessage } from 'umi';
import styles from './Welcome.less';

declare let AMapUI: any;
declare let Loca: any;
declare let window: any;

export default (): React.ReactNode => {
  // let AMap: any;
  // let map: any;
  // let distCluster:any; //区域划分聚合
  // let mouseTool: any;
  let crossFlag: boolean = false;
  let crossLnglat: any = [];
  let mapOverLays: any[] = [];
  let currentCrossNodes: any[] = [];
  let currentPlotData: any = undefined; // 当前路段交叉口节点经纬度 ex: 'lng,lat'
  const [map, setMap] = useState<any>(undefined);
  const [AMap, setAMap] = useState<any>(undefined);
  // const [loca, setLoca] = useState<any>(undefined);
  const [tileVisible, setTileVisible] = useState<any>(false);
  const [roadVisible, setRoadVisible] = useState<any>(false); // 路段显示
  const [nodeVisible, setNodeVisible] = useState<any>(false); // 路段显示
  const [mouseTool, setMouseTool] = useState<any>(undefined);
  const [distCluster, setDistCluster] = useState<any>(undefined);
  const [mouseToolFlag, setMouseToolFlag] = useState<any>(false); // 鼠标划线工具
  const [drawPlotFlag, setDrawPlotFlag] = useState<any>(false); // 绘制地块
  const [drawConnectorFlag, setDrawConnectorFlag] = useState<any>(false); // 鼠标Connector
  // const [currentPlotData, setCurrentPlotData] = useState<any>(undefined);        // 鼠标Connector

  useEffect(() => {
    handleOnMapInit();
  }, []);
  useEffect(() => {
    if (map && AMap) {
      // handleOnSearch();
      handleOnDistrictCluster();
      // handleOnDrawLineLayer();  // 路段图层
      // handleOnDrawPointLayer(); // 节点图层
      // handleOnDrawLabelLayer(); // 文字图层
      // handleOnDrawPlotLayer(); // 地块图层
      // handleOnDrawConnectorLayer(); //connector图层
      // handleOnMouseTool(); // 绘制工具
      // handleOnMapEvent(); // 地图事件
    }
  }, [map, AMap]);
  // useEffect(()=>{
  //   if(mouseToolFlag){
  //     mouseTool.on('draw', function (e: any) {
  //       // console.log('绘制line====>', e);
  //       // console.log(e.obj.getPath());
  //       map.remove(e.obj);
  //       // map.off('click',handleOnMapPointsLayerAdd);
  //       // map.on('click', handleOnMapPointsLayerAdd);
  //       handleOnMapLinesLayerAdd(e.obj.getPath());
  //     });
  //     map.on('click', handleOnMapPointsLayerAdd);
  //   }
  // },[mouseToolFlag])
  // 高德地图初始化
  const handleOnMapInit = async () => {
    let newAMap = await AMapLoader.load({
      key: '4955c78df7d0a30f197174e5af1809a9', // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '1.4.16', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.MarkerClusterer', 'AMap.MouseTool', 'AMap.PlaceSearch', 'AMap.Autocomplete'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      AMapUI: {
        // 是否加载 AMapUI，缺省不加载
        version: '1.1', // AMapUI 缺省 1.1
        plugins: ['overlay/SimpleInfoWindow', 'misc/PoiPicker'], // 需要加载的 AMapUI ui插件
      },
      Loca: {
        // 是否加载 Loca， 缺省不加载
        version: '1.3.2', // Loca 版本，缺省 1.3.2
      },
    });
    console.log('newAMap', newAMap);
    // console.log('Loca', Loca);
    try {
      let newMap = new newAMap.Map('container', {
        center: [121.456646, 31.241171], //中心点坐标
        zoom: 12, //默认地图缩放级别,
        mapStyle: 'amap://styles/whitesmoke', //设置地图的显示样式
      });
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
    var placeSearch = new AMap.PlaceSearch({
      map: map,
    }); //构造地点查询类
    auto.on('select', (e: any) => {
      placeSearch.setCity(e.poi.adcode);
      placeSearch.search(e.poi.name); //关键字查询查询
    }); //注册监听，当选中某条记录时会触发
  };
  // 地图事件
  const handleOnMapEvent = () => {
    map.on('click', function (ev: any) {
      if (window.mouseToolFlag) {
        var newCircle = new AMap.Circle({
          map: map,
          center: [ev.lnglat.lng, ev.lnglat.lat], // 圆心位置
          radius: 500, //半径 //500
          strokeColor: '#F33', //线颜色
          strokeOpacity: 1, //线透明度
          strokeWeight: 1, //线粗细度
          fillColor: '#ee2200', //填充颜色
          fillOpacity: 1, //填充透明度
          // cursor: 'pointer',
          zIndex: 200,
        });
        mapOverLays.push(newCircle);
        map.add(newCircle);
      }
    });
    map.on('rightclick', function (ev: any) {
      if (window.mouseToolFlag) {
        map.remove(mapOverLays);
        mapOverLays = [];
      }
    });
    map.on('dblclick', function (ev: any) {
      if (window.mouseToolFlag) {
        map.remove(mapOverLays);
        mapOverLays = [];
      }
    });
  };
  // 区域下项目点击事件
  const handleOnPointsClick = (ev: any, point: any) => {
    // console.log('ev', ev);
    // console.log("point",point);
    const { dataItem } = point.data;
    // const position = ev.originalEvent.pos;
    // const { data } = ev.clusterData[0];
    const infoWindow = new AMapUI.SimpleInfoWindow({
      position: dataItem.lngLat,
      offset: new AMap.Pixel(0, -20),
      infoTitle: dataItem.name,
      infoBody: `<p class="my-desc">${dataItem.name}${dataItem.range}</p>`,
    });
    infoWindow.open(map);
  };
  //区划划分聚合
  const handleOnDistrictCluster = () => {
    function initPage(DistrictCluster: any, PointSimplifier: any, $: any) {
      var pointSimplifierIns = new PointSimplifier({
        map: map, //所属的地图实例
        zIndex: 3,
        autoSetFitView: false, //禁止自动更新地图视野
        getPosition: function (item: any) {
          return item.position;
        },
        getHoverTitle: function (dataItem: any, idx: any) {
          return '';
          return idx + ': ' + dataItem.dataItem;
        },
        renderOptions: {
          //点的样式
          pointStyle: {
            content: PointSimplifier.Render.Canvas.getImageContent(
              '//webapi.amap.com/theme/v1.3/markers/b/mark_bs.png',
            ),
            width: 20,
            height: 32,
            // fillStyle: 'rgba(153, 0, 153, 0.38)'
          },
          //鼠标hover时的title信息
          hoverTitleStyle: {
            position: 'top',
          },
          pointHoverStyle: {
            strokeStyle: 'rgba(0,0,0,0)',
          },
        },
      });
      pointSimplifierIns.on('pointClick', handleOnPointsClick);
      let newDistCluster = new DistrictCluster({
        zIndex: 2,
        map: map, //所属的地图实例
        // topAdcodes: ['310000'],
        topAdcodes: [
          '310101',
          '310109',
          '310110',
          '310113',
          '310114',
          '310118',
          '310117',
          '310116',
          '310112',
          '310120',
          '310115',
          '310104',
          '310105',
          '310107',
          '310106',
          '310151',
        ],
        getPosition: function (item: any) {
          if (!item) {
            return null;
          }
          return [parseFloat(item.lngLat[0]), parseFloat(item.lngLat[1])];
          var parts = item.split(',');
          //返回经纬度
          return [parseFloat(parts[0]), parseFloat(parts[1])];
        },
      });
      setDistCluster(newDistCluster);
      var currentAdcode: any = null;
      newDistCluster.on('clusterMarkerClick', function (e: any, feature: any) {
        // console.log("e==>",e);
        // console.log("feature==>",feature);
        currentAdcode = feature.adcode;
        // console.log('currentAdcode',currentAdcode);
        // //获取该节点的聚合信息
        newDistCluster.getClusterRecord(currentAdcode, function (error: any, result: any) {
          // console.log("result",result);
          //currentAdcode已经更新，有新的点击
          if (result.adcode !== currentAdcode) {
            return;
          }
          //设置数据
          pointSimplifierIns.setData(result.dataItems);
        });
      });
      //监听区划面的点击
      // distCluster.on('featureClick', function(e:any, feature:any) {
      //   currentAdcode = feature.properties.adcode;
      //   console.log('currentAdcode',currentAdcode);
      //   //获取该节点的聚合信息
      //   distCluster.getClusterRecord(currentAdcode, function(error:any, result:any) {
      //     //currentAdcode已经更新，有新的点击
      //     if (result.adcode !== currentAdcode) {
      //         return;
      //     }
      //     //设置数据
      //     pointSimplifierIns.setData(result.dataItems);
      //   })
      // });
      newDistCluster.on('renderFinish', function (e: any, result: any) {
        var features = result.features, //当前绘制的features
          currentAdcodeExists = false;
        for (var i = 0, len = features.length; i < len; i++) {
          if (currentAdcode === features[i].properties.adcode) {
            currentAdcodeExists = true;
            break;
          }
        }
        if (!currentAdcodeExists) {
          //如果当前adcode没有绘制，清除？
          pointSimplifierIns.setData(null);
        }
      });
      window.distCluster = newDistCluster;
      function refresh() {
        var zoom = map.getZoom();
        //获取 pointStyle
        var pointStyle = pointSimplifierIns.getRenderOptions().pointStyle;
        //根据当前zoom调整点的尺寸
        pointStyle.width = pointStyle.height = 2 * Math.pow(1.2, map.getZoom() - 3);
        // var zoom = map.getZoom();
        // if (zoom < 10) {
        //   pointSimplifierIns.hide();
        // } else {
        //   pointSimplifierIns.show();
        // }
      }
      // map.on('zoomend', function() {
      //   refresh();
      // });
      // refresh();
      newDistCluster.setData(projectData);
      // $('<div id="loadingTip">加载数据，请稍候...</div>').appendTo(document.body);
      // $.get('https://a.amap.com/amap-ui/static/data/10w.txt', function(csv:any) {
      //     $('#loadingTip').remove();
      //     var data = csv.split('\n');
      //     distCluster.setData(data);
      // });
    }
    //加载相关组件
    AMapUI.load(
      ['ui/geo/DistrictCluster', 'ui/misc/PointSimplifier', 'lib/$'],
      function (DistrictCluster: any, PointSimplifier: any, $: any) {
        //启动页面
        initPage(DistrictCluster, PointSimplifier, $);
      },
    );
  };
  // 节点图层
  const handleOnDrawPointLayer = () => {
    let data = [
      {
        center: [121.134529, 31.215641],
        id: 1,
      },
      {
        center: [121.534529, 31.215641],
        id: 2,
      },
    ];
    // 点类型图层
    const pointLayer = new Loca.PointLayer({
      map: map,
      data: data,
      name: 'pointLayer',
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
        color: '#ff0000',
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
    });
    // 解绑事件
    // pointLayer.off('click');
  };
  // 路段图层
  const handleOnDrawLineLayer = () => {
    // 创建折线
    var path = [
      {
        id: 1,
        lnglat: [
          [121.134529, 31.215641],
          [121.534529, 31.215641],
        ],
      },
    ];
    // 点类型图层
    const lineLayer = new Loca.LineLayer({
      map: map,
      name: 'lineLayer',
      data: path,
      eventSupport: true,
    });
    // console.log("lineLayer===>",lineLayer);
    lineLayer.setData(path, {
      type: 'json',
      lnglat: 'lnglat',
    });
    lineLayer.setOptions({
      style: {
        borderWidth: 10,
        color: '#ff0000',
      },
      selectStyle: {
        color: 'green',
        cursor: 'pointer',
      },
    });
    lineLayer.render();
    // 绑定事件
    lineLayer.on('click', (event: any) => {
      console.log('Click target: ', event); // 触发click事件的元素
      // console.log('Event type: ', event.type) // 事件名称
      // console.log('Raw Event: ', event.originalEvent) // 原始DomEvent事件
      console.log('Raw data: ', event.rawData); // 触发元素对应的原始数据
      // console.log('LngLat: ', event.lnglat) // 元素所在经纬度
      let objPixel = new AMap.Pixel(event.originalEvent.x, event.originalEvent.y - 48);
      let newLngLat = map.containerToLngLat(objPixel);
      const { lnglat, id } = event.rawData;
      let linesData = event.target.get('data');
      linesData.forEach((item: any, index: number) => {
        if (item.id == id) {
          linesData.splice(index, 1, {
            ...linesData[index],
            lnglat: [lnglat[0], [newLngLat.lng, newLngLat.lat]],
          });
        }
      });
      linesData.push({
        id: linesData.length + 1,
        lnglat: [[newLngLat.lng, newLngLat.lat], lnglat[1]],
      });
      // console.log("linesData==========>",linesData);
      // lineLayer新增
      // window.crossFlag = true;
      // window.crossLnglat = [newLngLat.lng,newLngLat.lat]
      // 链接connector与小区
      if (window.drawConnectorFlag) {
        // console.log("currentPlotData",currentPlotData);
        if (currentPlotData) {
          let linesArr = [currentPlotData.center, [newLngLat.lng, newLngLat.lat]];
          handleOnConnectorLayerAdd(linesArr);
          handleOnLineLayerAdd(linesData);
          handleOnPointsLayerAdd({ lng: newLngLat.lng, lat: newLngLat.lat });
        }
      }
      currentCrossNodes.push(`${newLngLat.lng},${newLngLat.lat}`);
      if (window.mouseToolFlag && mapOverLays.length > 0) {
        handleOnLineLayerAdd(linesData);
      }
      // pointsLayer新增
      // handleOnPointsLayerAdd([newLngLat.lng,newLngLat.lat])
    });
    // 解绑事件
    // pointLayer.off('click');
  };
  // 文字图层
  const handleOnDrawLabelLayer = () => {
    var data = [
      {
        id: 1,
        center: [121.134529, 31.215641],
      },
      {
        id: 2,
        center: [121.534529, 31.215641],
      },
    ];
    var labelLayer = new Loca.LabelsLayer({
      map: map,
      data: data,
      name: 'labelLayer',
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
          return data.value.id;
        },
        fontSize: 16,
        fillColor: '#fff',
        strokeColor: '#fff',
        strokeWidth: 0,
        opacity: 1,
      },
    });
    labelLayer.render();
  };
  // 地块图层 polygon
  const handleOnDrawPlotLayer = () => {
    let data: any[] = [];
    var plotLayer = new Loca.PolygonLayer({
      map: map,
      data,
      name: 'plotLayer',
      eventSupport: true,
    });
    plotLayer.setData(data, {
      type: 'json',
      lnglat: 'lnglat',
    });
    plotLayer.setOptions({
      style: {
        color: 'blue',
        borderColor: 'black',
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
      currentPlotData = event.rawData;
    });
  };
  // connector 关系图层
  const handleOnDrawConnectorLayer = () => {
    //
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
  const handleOnConnectorLayerAdd = (data: any) => {
    const layers = map.getLayers();
    let connectorLayer = layers.filter((item: any) => item.get('name') == 'connectorLayer')[0];
    let connectorsData = connectorLayer.get('data') || [];
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
  const handleOnPlotLayerAdd = (data: any) => {
    const layers = map.getLayers();
    let plotLayer = layers.filter((item: any) => item.get('name') == 'plotLayer')[0];
    let plotsData = plotLayer.get('data');
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
    });
    plotLayer.setData(plotsData, {
      // type: 'json',
      lnglat: 'lnglat',
    });
    plotLayer.set('data', plotsData);
    plotLayer.render();
    handleOnLabelLayerAdd({ id: `地块${plotsData.length + 1}`, center: newLngLat }, 'polygon');
  };
  // labelLayer新增
  const handleOnLabelLayerAdd = (data: any, type: string) => {
    // console.log("labelData==========>",data);
    let layers = map.getLayers();
    let newLabelLayer = layers.filter((item: any) => item.get('name') == 'labelLayer')[0];
    let labelsData = newLabelLayer.get('data');
    let filterLayers = layers.filter((item: any) => item.get('name') != 'labelLayer');
    // console.log('filterLayers===>',filterLayers);
    let newdata = [];
    if (type == 'points') {
      let filterPlotData = labelsData.filter((item: any) => item.type == 'plotLabel');
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
      newdata = [
        ...labelsData,
        {
          type: 'plotLabel',
          id: data.id,
          center: data.center,
        },
      ];
    }
    map.setLayers(filterLayers);
    var labelLayer = new Loca.LabelsLayer({
      map: map,
      data: data,
      name: 'labelLayer',
    });

    labelLayer.setData(newdata, {
      type: 'json',
      lnglat: 'center',
    });

    labelLayer.setOptions({
      style: {
        direction: 'center',
        offset: [0, -3],
        text: function (data: any) {
          return data.value.id;
        },
        fontSize: 16,
        fillColor: '#fff',
        strokeColor: '#fff',
        strokeWidth: 0,
        opacity: 1,
      },
    });
    labelLayer.set('data', newdata);
    labelLayer.render();
  };
  // lineLayer新增
  const handleOnLineLayerAdd = (data: any[]) => {
    let layers = map.getLayers();
    let lineLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    lineLayer.setData(data, {
      // type: 'json',
      lnglat: 'lnglat',
    });
    lineLayer.set('data', data);
    lineLayer.render();
  };
  // pointsLayer新增
  const handleOnPointsLayerAdd = (data: any) => {
    console.log('data===>', data);
    //获取pointLayer,重新渲染数据
    let layers = map.getLayers();
    let newPointsLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    let pointsData = newPointsLayer.get('data');
    if (Array.isArray(data)) {
      data.forEach((item: any, index) => {
        if (
          index == 0 ||
          index == data.length - 1 ||
          currentCrossNodes.includes(`${item.lng},${item.lat}`)
        ) {
          let pointObj: any = {
            id: pointsData.length + 1,
            center: item,
          };
          if (currentCrossNodes.includes(`${item.lng},${item.lat}`)) {
            pointObj.crossFlag = true;
          }
          pointsData.push(pointObj);
        }
      });
    } else {
      let pointObj: any = {
        id: pointsData.length + 1,
        center: data,
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
    // newPointsLayer.setOptions({
    //   style: {
    //     radius: 10,
    //     color: '#ff0000',
    //     cursor:'pointer'
    //   },
    //   selectStyle: {
    //     radius: 10,
    //     color: 'green'
    //   }
    // });
    newPointsLayer.set('data', pointsData);
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
    newMouseTool.on('draw', function (e: any) {
      console.log('绘制====>', e);
      console.log(e.obj.getPath());
      map.remove(e.obj);
      // 绘制线段完成后回调
      if (e.obj.CLASS_NAME == 'AMap.Polyline') {
        let pointsArr = e.obj.getPath();
        handleOnMapPointsLayerAdd(pointsArr);
        handleOnMapLinesLayerAdd(e.obj.getPath());
      }
      // 绘制地块
      if (e.obj.CLASS_NAME == 'AMap.Polygon') {
        handleOnPlotLayerAdd(e.obj.getPath());
      }
    });
  };
  // mouseTool添加点
  const handleOnMapPointsLayerAdd = (data: any) => {
    if (window.mouseToolFlag) {
      handleOnPointsLayerAdd(data);
    }
  };
  // mouseTool结束后添加线
  const handleOnMapLinesLayerAdd = (data: any) => {
    if (window.mouseToolFlag) {
      let layers = map.getLayers();
      let newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
      let linesData = newLinesLayer.get('data');
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
            lnglat: data.slice(start, indexArr[0] + 1),
          });
          for (let i = 0; i < indexArr.length; i++) {
            start = indexArr[i];
            if (i + 1 == indexArr.length) {
              linesData.push({
                id: linesData.length + 1,
                lnglat: data.slice(start, data.length),
              });
            } else {
              linesData.push({
                id: linesData.length + 1,
                lnglat: data.slice(start, indexArr[i + 1] + 1),
              });
            }
          }
        } else {
          linesData.push({
            id: linesData.length + 1,
            lnglat: data,
          });
        }
        // for (let i = 0; i < data.length-1; i++) {
        //   linesData.push({
        //     id: linesData.length+1,
        //     lnglat: data.slice(i,i+2)
        //   })
        // }
        // window.crossFlag = false;
        // window.crossLnglat = [];
        console.log('linesData=====>', linesData);
        handleOnLineLayerAdd(linesData);
        return;
      }
      linesData.push({
        id: linesData.length + 1,
        lnglat: data,
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
  const handleOnMouseToolClick = () => {
    if (mouseToolFlag) {
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
  const handleOnMapRoadLayer = () => {
    let layers = map.getLayers();
    let newLinesLayer = layers.filter((item: any) => item.get('name') == 'lineLayer')[0];
    if (roadVisible) {
      newLinesLayer.show();
      setRoadVisible(false);
      return;
    }
    newLinesLayer.hide();
    setRoadVisible(true);
  };
  // 节点显隐
  const handleOnMapNodeLayer = () => {
    let layers = map.getLayers();
    let newPointsLayer = layers.filter((item: any) => item.get('name') == 'pointLayer')[0];
    let newLabelLayer = layers.filter((item: any) => item.get('name') == 'labelLayer')[0];
    if (nodeVisible) {
      newPointsLayer.show();
      newLabelLayer.show();
      setNodeVisible(false);
      return;
    }
    newLabelLayer.hide();
    newPointsLayer.hide();
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
  const handleOnDrawConnector = () => {
    if (drawConnectorFlag) {
      setDrawConnectorFlag(false);
      window.drawConnectorFlag = false;
      return;
    }
    window.drawConnectorFlag = true;
    setDrawConnectorFlag(true);
  };
  const handleOnRouteTo = () => {
    history.push('/projects/projectManage/addProject');
  };
  return (
    <PageContainer pageHeaderRender={false} className={styles.homePage}>
      {/* <div style={{ position: 'absolute', left: 0, top: '0', zIndex: 3 }}>
        <Input id="mapSearch"  placeholder="请输入" autoComplete="off" />
        <Space direction="vertical">
          <div>
            <Space>
              <Button type="primary" onClick={handleOnMouseToolClick}>
                {mouseToolFlag ? '结束' : '开始'}绘制路段
              </Button>
              <Button type="primary" onClick={handleOnDrawPlot}>
                {drawPlotFlag ? '结束' : '开始'}绘制地块
              </Button>
              <Button type="primary" onClick={handleOnDrawConnector}>
                {drawConnectorFlag ? '结束' : '开始'}绘制Connector
              </Button>
            </Space>
          </div>
          <div>
            <Space>
              <Button type="primary" onClick={handleOnMapTile}>
                图层{tileVisible ? '显示' : '隐藏'}
              </Button>
              <Button type="primary" onClick={handleOnMapRoadLayer}>
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
      <div className={styles.addProject} onClick={handleOnRouteTo}>
        新建
        <br />
        项目
      </div>
      <div id="container" className={styles.mapContainer}></div>
    </PageContainer>
  );
};

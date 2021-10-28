import { message } from 'antd';
import { Effect, Reducer } from 'umi';
import __ from 'lodash';
import { create, updatePredictById } from '@/services/predictManage';
function getPostData(data: any) {
  console.log('data', data);
  let obj: any = {
    // ...data.step1Form,
    name: data.step1Form.name,
    projectName: data.step1Form.projectName.label,
    projectId: data.step1Form.projectName.value,
    file: {
      id: __.get(data, 'step1Form.file.response.data._id') || data.step1Form.file?.id,
      name: __.get(data, 'step1Form.file.name') || data.step1Form.file?.name,
    },
    netId: __.get(data, 'step1Form.file.response.data.netId') || data.step1Form.file?.netId,
    tripDivision: data.step1Form.tripDivision,
    expresswayCapacity: data.step1Form.expresswayCapacity + '',
    quicklywayCapacity: data.step1Form.quicklywayCapacity + '',
    mainRoadCapacity: data.step1Form.mainRoadCapacity + '',
    subRoadCapacity: data.step1Form.subRoadCapacity + '',
    accessRoadCapacity: data.step1Form.accessRoadCapacity + '',
    ...data.step2Form,
    linkInfo: data.step2Form.linkInfo.map((item: any) => {
      return item._id;
    }),
    nodeInfo: data.step2Form.nodeInfo.map((item: any) => {
      return item._id;
    }),
    zoneInfo: data.step2Form.zoneInfo.map((item: any) => {
      return item._id;
    }),
    // connectorInfo: data.step2Form.linkInfo.map((item: any) => {
    //   return item._id;
    // }),
    // TFlowFuzzyParams: data.step3Form.TFlowFuzzyParams,
    currentOD: data.step3Form.currentOD,
    currentSaturability: data.step3Form.currentSaturability,
    // roadTrafficCurrentStatus: data.step3Form.roadTrafficCurrentStatus.map((item: any) => {
    //   delete item['currentLink'];
    //   delete item['linksArr'];
    //   delete item['id'];
    //   return item;
    // }),
    // ...data.step4Form,
    assessType: data.step4Form.assessType.label,
    assessTypeId: data.step4Form.assessType.value,
    assessYear: data.step4Form.assessYear,
    increaseRate: data.step4Form.increaseRate + '',
    plotTraffic: data.step4Form.plotTraffic,
    temFormaluParamsResult: data.step4Form.temFormaluParamsResult,
    spiderDiagram: data.step4Form.spiderDiagram,
    spiderDiagramParams: JSON.stringify(data.step4Form.spiderDiagramParams),
  };
  if (obj.assessType == '近期') {
    obj.recentOD = {
      background: data.step4Form.bgData,
      superposition: data.step4Form.spData,
      backgroundResultImg: data.step4Form.backgroundResultImg,
      backgroundFlowPrtassignmentResourceId: data.step4Form.backgroundFlowPrtassignmentResourceId,
      backgroundFlowVerName: data.step4Form.backgroundFlowVerName,
      backgroundFlowResultImg: data.step4Form.backgroundFlowResultImg,
      backgroundPrtassignmentResourceId: data.step4Form.backgroundPrtassignmentResourceId,
      backgroundVerName: data.step4Form.backgroundVerName,
      superpositionResultImg: data.step4Form.superpositionResultImg,
      superpositionFlowResultImg: data.step4Form.superpositionFlowResultImg,
      superpositionFlowPrtassignmentResourceId:
        data.step4Form.superpositionFlowPrtassignmentResourceId,
      superpositionFlowVerName: data.step4Form.superpositionFlowVerName,
      superpositionPrtassignmentResourceId: data.step4Form.superpositionPrtassignmentResourceId,
      superpositionVerName: data.step4Form.superpositionVerName,
      backgroundResultParams: JSON.stringify(data.step4Form.backgroundResultParams),
      superpositionResultParams: JSON.stringify(data.step4Form.superpositionResultParams),
      flowLevel: data.step4Form.flowLevel,
    };
  } else {
    obj.futureOD = {
      background: data.step4Form.bgData,
      superposition: data.step4Form.spData,
      backgroundResultImg: data.step4Form.backgroundResultImg,
      backgroundFlowResultImg: data.step4Form.backgroundFlowResultImg,
      backgroundFlowPrtassignmentResourceId: data.step4Form.backgroundFlowPrtassignmentResourceId,
      backgroundFlowVerName: data.step4Form.backgroundFlowVerName,
      backgroundPrtassignmentResourceId: data.step4Form.backgroundPrtassignmentResourceId,
      backgroundVerName: data.step4Form.backgroundVerName,
      superpositionResultImg: data.step4Form.superpositionResultImg,
      superpositionFlowResultImg: data.step4Form.superpositionFlowResultImg,
      superpositionFlowPrtassignmentResourceId:
        data.step4Form.superpositionFlowPrtassignmentResourceId,
      superpositionFlowVerName: data.step4Form.superpositionFlowVerName,
      superpositionPrtassignmentResourceId: data.step4Form.superpositionPrtassignmentResourceId,
      superpositionVerName: data.step4Form.superpositionVerName,
      backgroundResultParams: JSON.stringify(data.step4Form.backgroundResultParams),
      superpositionResultParams: JSON.stringify(data.step4Form.superpositionResultParams),
      flowLevel: data.step4Form.flowLevel,
    };
  }
  return obj;
}
export interface StateType {
  current: string;
  dxfData: any;
  currentProject: any;
  currentPredict: any;
  step?: any;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    submitStepForm: Effect;
  };
  reducers: {
    saveStepFormData: Reducer<any>;
    saveCurrentStep: Reducer<any>;
    initStepForm: Reducer<any>;
    setCurrentProject: Reducer<any>;
    setCurrentPredict: Reducer<any>;
    setDxfData: Reducer<any>;
  };
}

const Model: ModelType = {
  namespace: 'predictManageAndEditPredict',
  state: {
    current: '0',
    dxfData: {},
    currentProject: {},
    currentPredict: {},
    step: {
      step1Form: {},
      step2Form: {},
      step3Form: {},
      step4Form: {},
    },
  },

  effects: {
    *submitStepForm({ payload }, { call, put, select }) {
      let newData = getPostData(payload);
      console.log('newData', newData);
      let id = yield select((_: any) => _.predictManageAndEditPredict.currentPredict._id);
      try {
        let res = yield call(updatePredictById, { id, params: newData });
        if (res.code == 200) {
          yield put({
            type: 'initStepForm',
            payload: '4',
          });
          message.success('重新编辑预测成功!');
        } else {
          message.error('请求出错!');
        }
      } catch (e) {
        message.error('请求出错!');
      }
    },
  },

  reducers: {
    saveCurrentStep(state, { payload }) {
      return {
        ...state,
        current: payload,
      };
    },

    saveStepFormData(state, { payload }) {
      // console.log('payload', payload);
      // console.log('---------------');
      return {
        ...state,
        step: {
          ...state.step,
          ...payload,
        },
      };
    },
    initStepForm(state, { payload }) {
      return {
        current: payload,
        dxfData: {},
        currentProject: {},
        currentPredict: {},
        step: {
          step1Form: {},
          step2Form: {},
          step3Form: {},
          step4Form: {},
        },
      };
    },
    setCurrentProject(state, { payload }) {
      return {
        ...state,
        currentProject: payload,
      };
    },
    setCurrentPredict(state, { payload }) {
      return {
        ...state,
        currentPredict: payload,
      };
    },
    setDxfData(state, { payload }) {
      // console.log("payload",JSON.stringify(payload));

      localStorage.setItem('payload', JSON.stringify(payload));
      // localStorage.setItem('nodes',payload.nodes);
      return {
        ...state,
        dxfData: payload,
      };
    },
  },
};

export default Model;

import { message } from 'antd';
import { Effect, Reducer } from 'umi';
import __ from 'lodash';
import { create, updateProject } from '@/services/projectManage';
function getPostData(data: any) {
  console.log('data', data);

  for (const key in data.step1Form) {
    if (data.step1Form.hasOwnProperty(key)) {
      var reg = /\d/;
      if (reg.test(key)) {
        delete data.step1Form[key];
      }
    }
  }
  let step1FormData = {
    ...data.step1Form,
    plotNumber: data.step1Form.plotNumber + '',
    administrativeRegion: data.step1Form.administrativeRegion.label,
    administrativeRegionId: data.step1Form.administrativeRegion.value,
    regulatoryPlanningLandId: data.step1Form.regulatoryPlanningLand?.toString(),
    regulatoryPlanningLand: data.step1Form.selectedRegulatoryPlanningLand
      .map((item: any) => item.name)
      ?.toString(),
    regulatoryPlanningLandCode: data.step1Form.selectedRegulatoryPlanningLand
      .map((item: any) => item.code)
      ?.toString(),
    planningAreaId: data.step1Form.planningArea.toString(),
    planningArea: data.step1Form.selectedPlanningArea.map((item: any) => item.name)?.toString(),
    planningAreaCode: data.step1Form.selectedPlanningArea.map((item: any) => item.code)?.toString(),
    zoneBit: data.step1Form.zoneBitSelectedOptions.map((item: any) => item.name)?.toString(),
    zoneBitId: data.step1Form.zoneBit?.toString(),
    startThresholdArea: data.step1Form.startThresholdArea.label,
    startThresholdAreaId: data.step1Form.startThresholdArea?.value?.split('_')[0],
    startThresholdAreaCode: data.step1Form.startThresholdArea?.value?.split('_')[1],
    staticDistinguishArea: data.step1Form.staticDistinguishArea.label,
    staticDistinguishAreaId: data.step1Form.staticDistinguishArea.value.split('_')[0],
    staticDistinguishAreaCode: data.step1Form.staticDistinguishArea.value.split('_')[1],
    chargingPileDistinguishArea: data.step1Form.chargingPileDistinguishArea.label,
    chargingPileDistinguishAreaId: data.step1Form.chargingPileDistinguishArea.value,
    studyPhase: data.step1Form.studyPhase.label,
    studyPhaseId: data.step1Form.studyPhase.value,
  };
  delete step1FormData['selectedPlanningArea'];
  delete step1FormData['selectedRegulatoryPlanningLand'];
  delete step1FormData['zoneBitSelectedOptions'];
  return {
    ...step1FormData,
    roadWayInfo: data.step2Form.map((item: any) => {
      return {
        ...item,
        level: item.level.value,
        levelName: item.level.label,
        divider: item.divider.label,
        dividerId: item.divider.value,
        relativePosition: item.relativePosition.label,
        relativePositionId: item.relativePosition.value,
        planningImplementation: item.planningImplementation.label,
        planningImplementationId: item.planningImplementation.value,
        isMedialStripId: item.isMedialStrip.value,
        isMedialStrip: item.isMedialStrip.label,
        roadFracture: item.roadFracture.label,
        roadFractureId: item.roadFracture.value,
      };
    }),
    nearPlotProjectInfo: data.step3Form.tableData,
    template: data.step4Form.template.label,
    templateId: data.step4Form.template.value,
  };
}
export interface StateType {
  current: string;
  currentRecord: Object;
  step?: any;
}

export interface ModelType {
  namespace: string;
  state: any;
  effects: {
    submitStepForm: Effect;
  };
  reducers: {
    saveStepFormData: Reducer<any>;
    saveCurrentStep: Reducer<any>;
    initStepForm: Reducer<any>;
    saveCurrentRecord: Reducer<any>;
  };
}

const Model: ModelType = {
  namespace: 'projectManageAndEditProject',

  state: {
    current: '0',
    currentRecord: {},
    step: {
      step1Form: {},
      step2Form: [],
      step3Form: {},
      step4Form: {},
    },
  },

  effects: {
    *submitStepForm({ payload }, { call, put, select }) {
      let newData = getPostData(payload);
      let id = yield select((_: any) => _.projectManageAndEditProject.currentRecord._id);
      try {
        let res = yield call(updateProject, { id, params: newData });
        if (res.code == 200) {
          yield put({
            type: 'initStepForm',
            payload: '4',
          });
          message.success('编辑项目成功!');
        } else {
          message.error(res?.msg);
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
        step: {
          step1Form: {},
          step2Form: [],
          step3Form: {},
          step4Form: {},
        },
      };
    },
    saveCurrentRecord(state, { payload }) {
      return {
        ...state,
        currentRecord: payload,
      };
    },
  },
};

export default Model;

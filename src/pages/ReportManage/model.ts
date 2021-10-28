import { message } from 'antd';
import { Effect, Reducer } from 'umi';
import __ from 'lodash';
export interface StateType {
  contentsData: any;
  reportId: string;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    submitStepForm: Effect;
  };
  reducers: {
    setContentsData: Reducer<any>;
    initStepForm: Reducer<any>;
    setReportId: Reducer<any>;
  };
}

const Model: ModelType = {
  namespace: 'reportManage',
  state: {
    contentsData: {},
    reportId: '',
  },

  effects: {
    *submitStepForm({ payload }, { call, put, select }) {},
  },

  reducers: {
    setContentsData(state, { payload }) {
      return {
        ...state,
        contentsData: payload,
      };
    },
    setReportId(state, { payload }) {
      return {
        ...state,
        reportId: payload,
      };
    },
    initStepForm(state, { payload }) {
      return {
        contentsData: {},
      };
    },
  },
};

export default Model;

import { message } from 'antd';
import { Effect, Reducer } from 'umi';
import lodash from 'lodash';
export interface StateType {
  currentProject: any;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    submitStepForm: Effect;
  };
  reducers: {
    setCurrentProject: Reducer<any>;
  };
}

const Model: ModelType = {
  namespace: 'projects',
  state: {
    currentProject: {},
  },
  effects: {
    *submitStepForm({ payload }, { call, put }) {},
  },
  reducers: {
    setCurrentProject(state, { payload }) {
      return {
        ...state,
        currentProject: payload,
      };
    },
  },
};

export default Model;

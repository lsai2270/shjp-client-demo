/*
 * @Author: your name
 * @Date: 2021-03-01 11:50:03
 * @LastEditTime: 2021-03-01 11:51:38
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /shjp-client/src/pages/SystemSettings/CreateTemplate/model.ts
 */
import { message } from 'antd';
import { Effect, Reducer } from 'umi';
import __ from 'lodash';
export interface StateType {
  contentsData: any;
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
  };
}

const Model: ModelType = {
  namespace: 'createTemplate',
  state: {
    contentsData: {},
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
    initStepForm(state, { payload }) {
      return {
        contentsData: {},
      };
    },
  },
};

export default Model;

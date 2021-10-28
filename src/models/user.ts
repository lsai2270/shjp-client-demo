// import { message } from 'antd';
import { Effect, Reducer } from 'umi';

import { query as queryUsers } from '@/services/user';
// import { accountInfo } from '@/services/v2/user'

export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userid?: string;
  unreadCount?: number;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { put }) {
      // const res = yield call(accountInfo);
      // try {
      //   if (res.code === 200) {
      //     yield put({
      //       type: 'saveCurrentUser',
      //       payload: res.data,
      //     });
      //   }
      // } catch (e) {
      //   message.error('获取用户信息失败!');
      // }
      const userInfo: any = localStorage.getItem('userInfo');
      yield put({
        type: 'saveCurrentUser',
        payload: JSON.parse(userInfo),
      });
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;

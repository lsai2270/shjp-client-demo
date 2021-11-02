import { stringify } from 'querystring';
import { history, Reducer, Effect } from 'umi';

import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';
// import { accountLogin } from '@/services/login';
import { accountLogin } from '@/services/v2/auth';
// import {setCookie} from '@/tools'
export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}
export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const res = yield call(accountLogin, {
        username: payload.userName,
        password: payload.password,
      });
      // document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // setCookie('Authorization',res.data.token,7);

      // console.log(res);
      // const response = {
      //   status: 'ok',
      //   type: 'account',
      //   currentAuthority: 'user',
      // };

      // Login successfully
      if (res.code === 200) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'ok',
            type: 'account',
            currentAuthority: 'user',
          },
        });
        message.success('登录成功！');
        localStorage.setItem('Authorization', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data.user));
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
          }
        }
        history.replace(redirect || '/');
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      localStorage.removeItem('Authorization');
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority('admin');
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};

export default Model;

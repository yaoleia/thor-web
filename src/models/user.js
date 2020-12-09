import { getCurrent, putCurrent } from '@/services/user';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
    isLoading: false,
  },
  effects: {
    *putCurrent({ payload }, { call, put }) {
      const resp = yield call(putCurrent, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: resp,
      });
    },

    *getCurrent(_, { call, put }) {
      const response = yield call(getCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },

    changeLoading(state, action) {
      return { ...state, isLoading: action.payload };
    },
  },
};
export default UserModel;

import { queryModel } from '@/services/model';

const ModelModel = {
  namespace: 'model',
  state: {
    models: [],
  },
  effects: {
    *fetch(_, { call, put }) {
      const resp = yield call(queryModel);
      yield put({
        type: 'queryList',
        payload: Array.isArray(resp.data) ? resp.data : [],
      });
    },
  },
  reducers: {
    queryList(state, action) {
      return { ...state, models: action.payload };
    },
  },
};
export default ModelModel;

import { queryModel, addModel, removeModel, updateModel } from '@/services/model';

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
    *addModel({ payload }, { call, put, select }) {
      const resp = yield call(addModel, payload);
      const list = yield select(({ model: { models } }) => {
        models.unshift(resp);
        return [...models];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *removeModel({ payload }, { call, put, select }) {
      yield call(removeModel, payload);
      const list = yield select(({ model }) =>
        model.models.filter(({ uid }) => !payload.includes(uid)),
      );
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *updateModel({ payload }, { call, put, select }) {
      const resp = yield call(updateModel, payload);
      if (!resp) return;
      const list = yield select(({ model: { models } }) => {
        const preModel = models.find(({ uid }) => uid === resp.uid);
        Object.assign(preModel, resp);
        return [...models];
      });
      yield put({
        type: 'queryList',
        payload: list,
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

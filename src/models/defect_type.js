import {
  queryDefectType,
  addDefectType,
  removeDefectType,
  updateDefectType,
} from '@/services/defect_type';

const TypeModel = {
  namespace: 'defect_type',
  state: {
    types: [],
  },
  effects: {
    *fetch(_, { call, put }) {
      const resp = yield call(queryDefectType);
      if (!resp) return;
      yield put({
        type: 'queryList',
        payload: Array.isArray(resp.data) ? resp.data : [],
      });
    },
    *add({ payload }, { call, put }) {
      yield call(addDefectType, payload);
      const resp = yield call(queryDefectType);
      yield put({
        type: 'queryList',
        payload: Array.isArray(resp.data) ? resp.data : [],
      });
    },

    *remove({ payload }, { call, put, select }) {
      yield call(removeDefectType, payload);
      const list = yield select(({ defect_type }) =>
        defect_type.types.filter(({ uid }) => !payload.includes(uid)),
      );
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *update({ payload }, { call, put, select }) {
      const resp = yield call(updateDefectType, payload);
      if (!resp || !resp.uid) return;
      const list = yield select(({ defect_type: { types } }) => {
        const preType = types.find(({ uid }) => uid === resp.uid);
        Object.assign(preType, resp);
        return [...types];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },
  },
  reducers: {
    queryList(state, action) {
      return { ...state, types: action.payload };
    },
  },
};
export default TypeModel;

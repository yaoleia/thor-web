import { queryPattern, addPattern, removePattern, updatePattern } from '@/services/pattern';

const PatternModel = {
  namespace: 'pattern',
  state: {
    patterns: [],
  },
  effects: {
    *fetch(_, { call, put }) {
      const resp = yield call(queryPattern);
      yield put({
        type: 'queryList',
        payload: Array.isArray(resp.data) ? resp.data : [],
      });
    },
    *add({ payload }, { call, put, select }) {
      const resp = yield call(addPattern, payload);
      const list = yield select(({ pattern: { patterns } }) => {
        patterns.unshift(resp);
        return [...patterns];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *remove({ payload }, { call, put, select }) {
      yield call(removePattern, payload);
      const list = yield select(({ pattern }) =>
        pattern.patterns.filter(({ uid }) => !payload.includes(uid)),
      );
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *update({ payload }, { call, put, select }) {
      const resp = yield call(updatePattern, payload);
      if (!resp) return;
      const list = yield select(({ pattern: { patterns } }) => {
        const prePattern = patterns.find(({ uid }) => uid === resp.uid);
        Object.assign(prePattern, resp);
        return [...patterns];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },
  },
  reducers: {
    queryList(state, action) {
      return { ...state, patterns: action.payload };
    },
  },
};
export default PatternModel;

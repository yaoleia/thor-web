import {
  queryDevice,
  bindDevicePattern,
  addDevice,
  updateDevice,
  removeDevice,
} from '@/services/device';

const DeviceModel = {
  namespace: 'device',
  state: {
    devices: [],
    current: {},
  },
  effects: {
    *fetch(_, { call, put }) {
      const resp = yield call(queryDevice);
      yield put({
        type: 'queryList',
        payload: Array.isArray(resp.data) ? resp.data : [],
      });
    },
    *add({ payload }, { call, put, select }) {
      const resp = yield call(addDevice, payload);
      const list = yield select(({ device: { devices } }) => {
        devices.unshift(resp);
        return [...devices];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *remove({ payload }, { call, put, select }) {
      yield call(removeDevice, payload);
      const list = yield select(({ device }) =>
        device.devices.filter(({ uid }) => !payload.includes(uid)),
      );
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *update({ payload }, { call, put, select }) {
      const resp = yield call(updateDevice, payload);
      if (!resp) return;
      const list = yield select(({ device: { devices } }) => {
        const preDevice = devices.find(({ uid }) => uid === resp.uid);
        Object.assign(preDevice, resp);
        return [...devices];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *bind({ payload }, { call, put, select }) {
      const resp = yield call(bindDevicePattern, payload);
      if (!resp) return;
      const { device, pattern } = resp;
      if (!device || !device.uid) return;
      if (device && pattern) {
        device.pattern = pattern;
      }
      const list = yield select(({ device: { devices } }) => {
        const preDevice = devices.find((d) => d.uid === device.uid);
        Object.assign(preDevice, device);
        return [...devices];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },
  },
  reducers: {
    queryList(state, { payload: devices }) {
      let device = devices.find((d) => d.uid === localStorage.currentDevice);
      if (!device) {
        device = devices[0] || {};
        localStorage.currentDevice = device.uid || '';
      }
      return { ...state, devices, current: device };
    },
    setCurrent(state, { payload }) {
      localStorage.currentDevice = payload.uid || '';
      return { ...state, current: payload };
    },
  },
};
export default DeviceModel;

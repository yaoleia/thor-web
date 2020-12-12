import {
  queryDevice,
  bindDeviceModel,
  addDevice,
  updateDevice,
  removeDevice,
} from '@/services/device';

const DeviceModel = {
  namespace: 'device',
  state: {
    devices: [],
  },
  effects: {
    *fetch(_, { call, put }) {
      const resp = yield call(queryDevice);
      yield put({
        type: 'queryList',
        payload: Array.isArray(resp.data) ? resp.data : [],
      });
    },
    *addModel({ payload }, { call, put, select }) {
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

    *removeModel({ payload }, { call, put, select }) {
      yield call(removeDevice, payload);
      const list = yield select(({ device }) =>
        device.devices.filter(({ uid }) => !payload.includes(uid)),
      );
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *updateModel({ payload }, { call, put, select }) {
      const resp = yield call(updateDevice, payload);
      const list = yield select(({ device: { devices } }) => {
        const index = devices.findIndex(({ uid }) => uid === payload.uid);
        devices.splice(index, 1, resp);
        return [...devices];
      });
      yield put({
        type: 'queryList',
        payload: list,
      });
    },

    *bindModel({ payload }, { call, put }) {
      const resp = yield call(bindDeviceModel, payload);
      if (!resp) return;
      const { device, style } = resp;
      if (!device || !device.uid) return;
      if (device && style) {
        device.style = style;
      }
      yield put({
        type: 'bind',
        payload: device,
      });
    },
  },
  reducers: {
    queryList(state, { payload: devices }) {
      return { ...state, devices };
    },
    bind({ devices }, { payload }) {
      const device = devices.find((d) => d.uid === payload.uid);
      Object.assign(device, payload);
      return { devices: [...devices] };
    },
  },
};
export default DeviceModel;

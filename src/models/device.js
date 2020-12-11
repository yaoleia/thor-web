import {
  queryDevice,
  bindDeviceModel,
  // addDevice,
  // updateDevice,
  // removeDevice,
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
    // TODO: 用法错误
    // *addModel({ payload }, { call }) {
    //   const resp = yield call(addDevice, payload);
    //   if (!resp) return;
    // },

    // *removeModel({ payload }, { call }) {
    //   const resp = yield call(removeDevice, payload);
    //   if (!resp) return;
    // },

    // *updateModel({ payload }, { call }) {
    //   const resp = yield call(updateDevice, payload);
    //   if (!resp) return;
    // },

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

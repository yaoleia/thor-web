import { queryDevice, bindDeviceModel } from '@/services/device';

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
    *bindModel({ payload }, { call, put }) {
      const resp = yield call(bindDeviceModel, payload);
      const { device, style } = resp;
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

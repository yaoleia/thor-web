import {
  queryDevice,
  bindDeviceModel,
  addDevice,
  updateDevice,
  removeDevice,
} from '@/services/device';
import { message } from 'antd';
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

    *addModel({ payload }, { call }) {
      const resp = yield call(addDevice, payload);
      if (!resp) return;
      message.success('创建成功，即将刷新');
    },

    *removeModel({ payload }, { call }) {
      const resp = yield call(removeDevice, payload);
      if (!resp) return;
      message.success('删除成功，即将刷新');
    },

    *updateModel({ payload }, { call }) {
      const resp = yield call(updateDevice, payload);
      if (!resp) return;
      message.success('更新成功，即将刷新');
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

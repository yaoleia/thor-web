import request from '@/utils/request';

export async function queryDevice(params) {
  return request('/api/device', {
    params,
  });
}

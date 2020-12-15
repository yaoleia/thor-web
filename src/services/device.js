import request from '@/utils/request';

export async function queryDevice(params) {
  return request('/api/device', {
    params,
  });
}
export async function removeDevice(params) {
  return request(`/api/device/${params}`, {
    method: 'DELETE',
  });
}
export async function addDevice(params) {
  return request('/api/device', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateDevice(params) {
  return request(`/api/device/${params.uid}`, {
    method: 'PUT',
    data: { ...params, method: 'update' },
  });
}

export async function bindDevicePattern(params) {
  return request('/api/device/style', {
    method: 'POST',
    data: params,
  });
}

import request from '@/utils/request';

export async function bindDeviceModel(params) {
  return request('/api/device/style', {
    method: 'POST',
    data: params,
  });
}
export async function queryModel(params) {
  return request('/api/style', {
    params,
  });
}
export async function removeModel(params) {
  return request(`/api/style/${params}`, {
    method: 'DELETE',
  });
}
export async function addModel(params) {
  return request('/api/style', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateModel(params) {
  return request(`/api/style/${params.uid}`, {
    method: 'PUT',
    data: { ...params },
  });
}
export async function queryDevice(params) {
  return request('/api/device', {
    params,
  });
}
export async function removeRule(params) {
  return request(`/api/device/${params}`, {
    method: 'DELETE',
  });
}
export async function addRule(params) {
  return request('/api/device', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateRule(params) {
  return request(`/api/device/${params.uid}`, {
    method: 'PUT',
    data: { ...params, method: 'update' },
  });
}

import request from '@/utils/request';

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

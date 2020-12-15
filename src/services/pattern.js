import request from '@/utils/request';

export async function queryPattern(params) {
  return request('/api/style', {
    params,
  });
}
export async function removePattern(params) {
  return request(`/api/style/${params}`, {
    method: 'DELETE',
  });
}
export async function addPattern(params) {
  return request('/api/style', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updatePattern(params) {
  return request(`/api/style/${params.uid}`, {
    method: 'PUT',
    data: { ...params },
  });
}

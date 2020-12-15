import request from '@/utils/request';

export async function queryPattern(params) {
  return request('/api/pattern', {
    params,
  });
}
export async function removePattern(params) {
  return request(`/api/pattern/${params}`, {
    method: 'DELETE',
  });
}
export async function addPattern(params) {
  return request('/api/pattern', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updatePattern(params) {
  return request(`/api/pattern/${params.uid}`, {
    method: 'PUT',
    data: { ...params },
  });
}

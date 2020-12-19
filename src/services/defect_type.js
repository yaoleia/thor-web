import request from '@/utils/request';

export async function queryDefectType(params) {
  return request('/api/defect/type', {
    params,
  });
}
export async function removeDefectType(params) {
  return request(`/api/defect/type/${params}`, {
    method: 'DELETE',
  });
}
export async function addDefectType(params) {
  return request('/api/defect/type', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateDefectType(params) {
  return request(`/api/defect/type/${params.uid}`, {
    method: 'PUT',
    data: { ...params, method: 'update' },
  });
}

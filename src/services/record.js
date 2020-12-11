import request from '@/utils/request';

export async function queryRecord(params) {
  return request('/api/record', {
    params,
  });
}
export async function removeRecord(uid) {
  return request(`/api/record/${uid}`, {
    method: 'DELETE',
  });
}
export async function getRecordById(uid) {
  return request(`/api/record/${uid}`, {
    method: 'get',
  });
}
export async function updateRecord(params) {
  return request(`/api/record/${params.uid}`, {
    method: 'PUT',
    data: { ...params },
  });
}

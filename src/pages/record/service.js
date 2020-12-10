import request from '@/utils/request';

export async function queryRecord(params) {
  return request('/api/record', {
    params,
  });
}
export async function removeRecord(params) {
  console.log(params);
  return request(`/api/record/${params}`, {
    method: 'DELETE',
  });
}
export async function getRecordById(params) {
  return request(`/api/record/${params}`, {
    method: 'get',
  });
}
export async function updateRecord(params) {
  return request(`/api/record/${params}`, {
    method: 'PUT',
    data: { ...params },
  });
}

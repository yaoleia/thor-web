import request from '@/utils/request';

export async function queryRule(params) {
  return request('/api/record', {
    params,
  });
}
export async function removeRule(params) {
  console.log(params);
  return request('/api/record/' + params, {
    method: 'DELETE',
  });
}
export async function updateRecord(params) {
  return request('/api/record/' + params.uid, {
    method: 'PUT',
    data: { ...params },
  });
}
export async function addRecord(params) {
  return request('/api/record/', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}

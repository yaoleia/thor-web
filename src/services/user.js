import request from '@/utils/request';

export async function putCurrent(params) {
  return request('/api/currentUser', {
    method: 'PUT',
    data: params,
  });
}

export async function getCurrent() {
  return request('/api/currentUser');
}

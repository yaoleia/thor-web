import request from '@/utils/request';

export async function putUser(params) {
  return request('/api/currentUser', {
    method: 'PUT',
    data: params,
  });
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

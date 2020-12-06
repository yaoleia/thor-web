import request from '@/utils/request';
export async function fakeAccountLogin(params) {
  return request('/api/account/login', {
    method: 'POST',
    data: params,
  });
}

export async function fakeAccountLogout() {
  return request('/api/account/logout');
}

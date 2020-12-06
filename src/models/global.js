const GlobalModel = {
  namespace: 'global',
  state: {
    collapsed: !!window.localStorage.collapsed,
  },
  effects: {},
  reducers: {
    changeLayoutCollapsed(
      state = {
        collapsed: true,
      },
      { payload },
    ) {
      window.localStorage.collapsed = payload || '';
      return { ...state, collapsed: payload };
    },
  },
  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
export default GlobalModel;

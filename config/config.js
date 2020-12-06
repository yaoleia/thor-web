import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
  history: {
    type: 'hash',
  },
  hash: true,
  antd: {
    dark: true, // compact: true,
  },
  dva: {
    hmr: true,
  },
  outputPath: './dist',
  publicPath: '/public/',
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/projectlist',
            },
            {
              name: '项目',
              icon: 'ProjectOutlined',
              path: '/projectlist',
              component: './ProjectList',
            },
            {
              name: '数据集',
              icon: 'DatabaseOutlined',
              path: '/datasetlist',
              component: './DatasetList',
            },
            {
              name: '工作台',
              icon: 'ProjectOutlined',
              path: '/projectworkplace',
              component: './ProjectWorkplace',
              headerRender: false,
              hideMenu: true,
              hideInMenu: true,
            },
            {
              name: '数据标注',
              icon: 'smile',
              path: '/imagemapeditor',
              component: './ImageMapEditor',
              headerRender: false,
              hideMenu: true,
              hideInMenu: true,
            },
            // {
            //   path: '/admin',
            //   name: '权限',
            //   icon: 'crown',
            //   component: './Admin',
            //   authority: ['admin'],
            //   routes: [
            //     {
            //       path: '/admin/sub-page',
            //       name: 'sub-page',
            //       icon: 'smile',
            //       component: './ProjectList',
            //       authority: ['admin'],
            //     },
            //   ],
            // },
            {
              name: '个人设置',
              icon: 'smile',
              hideInMenu: true,
              path: '/accountsettings',
              component: './AccountSettings',
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  plugins: ['@alitajs/keep-alive'],
  keepalive: ['/datasetlist'],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  define: {
    SOCKETIO: 'http://localhost:7001/',
  },
});

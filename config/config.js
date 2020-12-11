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
              redirect: '/runtime',
            },
            {
              name: '运行检测',
              icon: 'PlayCircleOutlined',
              path: '/runtime',
              component: './Runtime',
            },
            {
              name: '生产记录',
              icon: 'FileSearchOutlined',
              path: '/record',
              component: './record',
            },
            {
              name: '设备管理',
              icon: 'BorderOuterOutlined',
              path: '/system',
              component: './system',
            },
            // {
            //   name: '数据集',
            //   icon: 'DatabaseOutlined',
            //   path: '/datasetlist',
            //   component: './DatasetList',
            // },
            // {
            //   name: '工作台',
            //   icon: 'ProjectOutlined',
            //   path: '/projectworkplace',
            //   component: './ProjectWorkplace',
            //   headerRender: false,
            //   hideMenu: true,
            //   hideInMenu: true,
            // },
            // {
            //   name: '数据标注',
            //   icon: 'smile',
            //   path: '/imagemapeditor',
            //   component: './ImageMapEditor',
            //   headerRender: false,
            //   hideMenu: true,
            //   hideInMenu: true,
            // },
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
            //       component: './Runtime',
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
  keepalive: ['/runtime'],
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
    SOCKETIO: 'http://10.18.144.239:7001/',
  },
});

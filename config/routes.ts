export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      // {
      //   path: '/user',
      //   component: '../layouts/UserLayout',
      //   routes: [
      //     {
      //       name: 'login',
      //       path: '/user/login',
      //       component: './user/login',
      //     },
      //   ],
      // },
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
                redirect: '/welcome',
              },
              {
                path: '/welcome',
                name: 'welcome',
                // icon: 'smile',
                component: './Projects/ProjectManage/AddProject',
              },
              {
                path: '/add',
                name: '新建',
                // icon: 'smile',
                hideInMenu: true,
                component: './Projects/ProjectManage/AddProject/index1.tsx',
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
    ],
  },
  {
    component: './404',
  },
];

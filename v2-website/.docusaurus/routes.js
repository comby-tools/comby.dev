import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', 'b3d'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '15e'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'e13'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'e08'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', 'c9b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', 'b59'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '30a'),
    exact: true
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'f20'),
    exact: true
  },
  {
    path: '/blog/2020/06/10/new-blog-site',
    component: ComponentCreator('/blog/2020/06/10/new-blog-site', 'c2b'),
    exact: true
  },
  {
    path: '/blog/2021/03/26/comby-reducer',
    component: ComponentCreator('/blog/2021/03/26/comby-reducer', 'f3b'),
    exact: true
  },
  {
    path: '/blog/2021/04/25/whatever-you-want-syntax',
    component: ComponentCreator('/blog/2021/04/25/whatever-you-want-syntax', '41c'),
    exact: true
  },
  {
    path: '/blog/2022/04/11/comby-decomposer-compiler-fuzzing',
    component: ComponentCreator('/blog/2022/04/11/comby-decomposer-compiler-fuzzing', '265'),
    exact: true
  },
  {
    path: '/blog/2022/08/31/comby-with-types',
    component: ComponentCreator('/blog/2022/08/31/comby-with-types', 'c78'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', 'ad9'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', 'ebc'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '2a0'),
    routes: [
      {
        path: '/docs/advanced-usage',
        component: ComponentCreator('/docs/advanced-usage', 'b46'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/api',
        component: ComponentCreator('/docs/api', '6ad'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/basic-usage',
        component: ComponentCreator('/docs/basic-usage', '9df'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/cheat-sheet',
        component: ComponentCreator('/docs/cheat-sheet', 'a2e'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/configuration',
        component: ComponentCreator('/docs/configuration', '89f'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/faq',
        component: ComponentCreator('/docs/faq', 'bed'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/get-help',
        component: ComponentCreator('/docs/get-help', '0bf'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/get-started',
        component: ComponentCreator('/docs/get-started', 'b35'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/overview',
        component: ComponentCreator('/docs/overview', '659'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/rewrite-properties',
        component: ComponentCreator('/docs/rewrite-properties', '059'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/syntax-reference',
        component: ComponentCreator('/docs/syntax-reference', '68c'),
        exact: true,
        sidebar: "core"
      },
      {
        path: '/docs/tips-and-tricks',
        component: ComponentCreator('/docs/tips-and-tricks', 'daa'),
        exact: true
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '38a'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];

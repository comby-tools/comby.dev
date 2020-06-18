//
// For all the possible configuration options:
// https://docusaurus.io/docs/site-config
//

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'Featured blog → Faster Refactoring with Comby',
    image: 'img/blog-solid.svg',
    infoLink: 'https://stefanbuck.com/blog/faster-refactoring-with-comby',
  },
  {
    caption: 'Merged Pull Requests',
    image: 'img/octicon-merged.svg',
    infoLink: 'https://github.com/squaresLab/pldi-artifact-2019/blob/master/PullRequests.md',
  },
  {
    caption: 'Search Popular GitHub Repos with Comby',
    image: 'img/search.svg',
    infoLink: '/redirect'
  },
  {
    caption: 'Projects using Comby',
    image: 'img/tools-solid.svg',
    infoLink: '/projects'
  },
];

const siteConfig = {
  title: 'Comby',
  tagline: 'Structural code search and replace for ~every language.',
  url: 'https://comby.dev',
  cname: 'comby.dev',
  baseUrl: '/',
  editUrl: 'https://github.com/comby-tools/comby.dev/edit/master/website/docs/',

  // Used for publishing and more
  projectName: 'comby',
  organizationName: '@rvtond',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    // 'get-started' and 'overview' are in the same top-level entry in sidebars.json,
    // so both tabs on mobile would get highlighted.  Using the 'href:' attribute
    // for "Get started" means that only the "Docs" tab will ever be active.
    {label: 'Get started', href: '/docs/get-started'},
    {label: 'Docs', doc: 'overview'},
    // {label: 'Try', href: 'https://bit.ly/2UXkonD'},
    {label: 'Projects & Talks', href: '/en/projects'},
    {label: 'GitHub', href: 'https://github.com/comby-tools/comby'},
    {blog: true, label: 'Blog'},
  ],

  customDocsPath: 'website/docs',

  // If you have users set above, you add it here:
  users,

  // path to images for header/footer
  headerIcon: 'img/comby-logo.svg',
  footerIcon: 'img/comby-logo.svg',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#0f0f0f',
    secondaryColor: '#0f0f0f',
  },

  markdownOptions: {
    typographer: true,
    quotes: '“”‘’',
  },

  // Custom fonts for website
  // fonts: {
  //   myFont: [
  //     "Times New Roman",
  //     "Serif"
  //   ],
  //   myOtherFont: [
  //     "-apple-system",
  //     "system-ui"
  //   ]
  // },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `© ${new Date().getFullYear()} @rvtond`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [],

  // Put Table of Contents on the right side of the page
  onPageNav: 'separate',

  // No .html extensions for paths.
  cleanUrl: true,

//  algolia: {
//    apiKey: '...',
//    This name must match the index name here:
//    https://github.com/algolia/docsearch-configs/blob/master/configs/comby.json
//    indexName: '...',
//    algoliaOptions: {}, // Optional, if provided by Algolia
//  },

  gaTrackingId: 'UA-142487942-1',
};

module.exports = siteConfig;

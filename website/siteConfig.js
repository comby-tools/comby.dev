//
// For all the possible configuration options:
// https://docusaurus.io/docs/site-config
//

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'Featured blog → Automatically Migrating Eq of No (/=) in Haskell',
    image: 'img/blog-solid.svg',
    infoLink: 'https://reasonablypolymorphic.com/blog/comby/',
  },
  {
    caption: 'Projects and merged changes using Comby',
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
    // {label: 'Try', href: 'https://comby-live.fly.dev/index.html#%7B%22source%22:%22if%20test.flags%20!=%20nil%20%7B%5Cn%20%20%20%20%20%20%20%20for%20key,%20val%20:=%20range%20test.flags%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20cmd.Flags().Set(key,%20val)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%7D%22,%22match%22:%22if%20:[expr]%20!=%20nil%20%7B%5Cn%20%20for%20:[x]%20:=%20range%20:[expr]%20%7B%5Cn%20%20%20%20:[body]%5Cn%20%20%7D%5Cn%7D%22,%22rule%22:%22where%20true%22,%22rewrite%22:%22for%20:[x]%20:=%20range%20:[expr]%20%7B%5Cn%20%20:[body]%5Cn%7D%22,%22language%22:%22.go%22,%22substitution_kind%22:%22in_place%22,%22id%22:0%7D'},
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
  scripts: [
      {
          src: 'https://plausible.io/js/plausible.js',
          async: true,
          defer: true,
          'data-domain': 'comby.dev',
      }
  ],

  // Put Table of Contents on the right side of the page
  onPageNav: 'separate',

  // No .html extensions for paths.
  cleanUrl: true,

algolia: {
  apiKey: '2338f495ecf7cf858c6f1d73e1634c85',
  //  This name must match the index name here:
  //  https://github.com/algolia/docsearch-configs/blob/master/configs/comby.json
  indexName: 'comby',
  algoliaOptions: {}, // Optional, if provided by Algolia
},

//  gaTrackingId: 'UA-142487942-1',
};

module.exports = siteConfig;

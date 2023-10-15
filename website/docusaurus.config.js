module.exports={
  "title": "Comby",
  "tagline": "Structural code search and replace for ~every language.",
  "url": "https://comby.dev",
  "baseUrl": "/",
  "organizationName": "@rvtond",
  "projectName": "comby",
  "scripts": [
    {
      "src": "https://plausible.io/js/plausible.js",
      "async": true,
      "defer": true,
      "data-domain": "comby.dev"
    }
  ],
  "favicon": "img/favicon.ico",
  "customFields": {
    "users": [
      {
        "caption": "Featured blog → Automatically Migrating Eq of No (/=) in Haskell",
        "image": "img/blog-solid.svg",
        "infoLink": "https://reasonablypolymorphic.com/blog/comby/"
      },
      {
        "caption": "Projects and merged changes using Comby",
        "image": "img/tools-solid.svg",
        "infoLink": "/projects"
      }
    ],
    "markdownOptions": {
      "typographer": true,
      "quotes": "“”‘’"
    }
  },
  "onBrokenLinks": "log",
  "onBrokenMarkdownLinks": "log",
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "path": "./docs",
          "showLastUpdateAuthor": true,
          "showLastUpdateTime": true,
          "editUrl": "https://github.com/comby-tools/comby.dev/edit/master/website/docs/",
          "sidebarPath": "./sidebars.json"
        },
        "blog": {
          "path": "./blog"
        },
        "theme": {
          "customCss": "./src/css/customTheme.css"
        }
      }
    ]
  ],
  "plugins": [],
  "themeConfig": {
    "navbar": {
      "title": "Comby",
      "logo": {
        "src": "img/comby-logo.svg"
      },
      "items": [
        {
          "href": "/docs/get-started",
          "label": "Get started",
          "position": "left"
        },
        {
          "to": "docs/overview",
          "label": "Docs",
          "position": "left"
        },
        {
          "href": "/en/projects",
          "label": "Projects & Talks",
          "position": "left"
        },
        {
          "href": "https://github.com/comby-tools/comby",
          "label": "GitHub",
          "position": "left"
        }
      ]
    },
    "footer": {
      "links": [],
      "copyright": "© 2023 @rvtond",
      "logo": {
        "src": "img/comby-logo.svg"
      }
    },
    "algolia": {
      "appId": "9EP71DIXLY",
      "apiKey": "1d268924ecaa37dfab8e862837fa2918",
      "indexName": "comby",
    }
  }
}

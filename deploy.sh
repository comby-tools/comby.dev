#!/bin/bash

rm -rf CNAME css en pdfs projects projects.html redirect redirect.html index.html blog docs img js sitemap.xml
cd website
yarn install
yarn build
mv build/comby/* ..
cd ..
git add .
git commit -m "update site"

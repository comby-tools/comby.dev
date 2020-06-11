#!/bin/bash

rm -rf CNAME css en pdfs projects.html blog docs img js projects sitemap.xml
cd website
yarn install
yarn build
mv build/comby/* ..
cd ..
git add .
git commit -m "update site"

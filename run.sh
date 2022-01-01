#!/bin/bash

# rm -rf CNAME css en pdfs projects projects.html redirect redirect.html index.html blog docs img js sitemap.xml
cd website
yarn --cwd website install && yarn --cwd website build
# mv build/comby/* ..
# cd ..
# git add .
# git commit -m "update site"

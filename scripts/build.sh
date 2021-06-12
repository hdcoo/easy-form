rm -rf dist
yarn tsc
yarn tsc -p tsconfig.es.json
cp package.json ./dist
cp README.md ./dist
node ./scripts/postbuild.js

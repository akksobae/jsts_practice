#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Set-PSDebug -Trace 1

# 必要なモジュールをインストールする。
npm install -g typescript
npm install animejs
npm install --save-dev ts-loader webpack-cli @types/animejs
npm install --save-dev jest ts-jest @types/jest ts-node
npm install --save-dev babel-jest @babel/core @babel/preset-env @babel/preset-typescript

# webpack.config.js を初期化する。
Write-Output @"
const path = require('path');

module.exports = {
  entry: './src/script.ts',  // TypeScriptエントリーポイント
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'script.js',  // 出力ファイル名
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
};
"@ > webpack.config.js

# tsconfig.json を初期化する。
tsc --init

# mode の warning を消すために、 package.json を書き換える。
$json = Get-Content -Path 'package.json' | ConvertFrom-Json
$scripts = @{
  "dev"   = "webpack --mode development"
  "build" = "webpack --mode production"
}
$json | Add-Member -Type NoteProperty -Name 'scripts' -Value $scripts
$json | ConvertTo-Json -Depth 100 | Set-Content 'package.json'

# Babel の設定初期化 https://jestjs.io/ja/docs/getting-started

Write-Output @"
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};
"@ > babel.config.js

# JEST の設定初期化 https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
npx ts-jest config:init

npm test

npm run dev # 開発モードビルド
# npm run build # 本番モードビルド

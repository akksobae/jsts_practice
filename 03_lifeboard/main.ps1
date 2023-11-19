#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Set-PSDebug -Trace 1

# 必要なモジュールをインストールする。
npm install -g typescript
npm install animejs
npm install --save-dev ts-loader webpack-cli @types/animejs

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

npm run dev # 開発モードビルド
# npm run build # 本番モードビルド

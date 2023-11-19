#!/usr/bin/env pwsh

# $ErrorActionPreference = "Stop"
# Set-PSDebug -Trace 1

$remove_list = @( `
    "./node_modules", `
    "./dist", `
    "./babel.config.js", `
    "./jest.config.js", `
    "./package.json", `
    "./package-lock.json", `
    "./tsconfig.json", `
    "./webpack.config.js"
)



Remove-Item -Recurse -Force $remove_list

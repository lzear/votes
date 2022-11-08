/* tslint:disable */

import shelljs from "shelljs";

import { readFileSync } from "fs";

import url from "url";
import dotenv from "dotenv";

const { cd, echo, exec, touch } = shelljs
dotenv.config()

let repoUrl
const pkg = JSON.parse(readFileSync('package.json'))

if (typeof pkg.repository === 'object') {
  if (!pkg.repository.hasOwnProperty('url')) {
    throw new Error('URL does not exist in repository section')
  }
  repoUrl = pkg.repository.url
} else {
  repoUrl = pkg.repository
}

const parsedUrl = url.parse(repoUrl)
const repository = (parsedUrl.host || '') + (parsedUrl.path || '')
const ghToken = process.env.GH_TOKEN

echo('Deploying docs!!!')
cd('docs')
touch('.nojekyll')
exec('git init')
exec('git add .')
exec('git config user.name "lzear"')
exec('git config user.email "antoine.clausse@gmail.com"')
exec('git commit -m "docs(docs): update gh-pages"')
exec(
  `git push --force --quiet "https://${ghToken}@${repository}" main:gh-pages`,
)
echo('Docs deployed!!')

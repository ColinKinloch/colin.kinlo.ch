'use strict'

import path from 'path'

import fse from 'fs-extra'

import vfs from 'vinyl-fs'
import ms from 'map-stream'

import nunjucks from 'nunjucks'
import marked from 'marked'
import matter from 'gray-matter'
import webpack from 'webpack'

import styleProcessor from './style'

import site from '../../site.json'
import webpackConfig from '../../webpack.config'

// TODO: Only for production
Object.assign(webpackConfig, {
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        })
    ]

})

console.log(webpackConfig)

const nEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('.'),
{})

new Promise((resolve, reject) => fse.ensureDir('./dist/public/', resolve))
.then(() => {
  const styleJob = styleProcessor('./client/style.scss', './dist/public/style.css')
  .then(() => console.log('Style complete'))

  const blogJob = new Promise((resolve, reject) => {
    vfs.src('./client/articles/**/!(_)*.md')
      .pipe(ms((file, next) => {
        const meta = matter(file.contents.toString())
        file.meta = meta.data
        file.contents = new Buffer(meta.content)
        const p = path.parse(file.path)
        const date = meta.data.date
        const title = meta.data.title || p.name
        p.name = ''
        if (date) p.name += date.toISOString() + '-'
        p.name += title
        p.base = p.name + p.ext
        file.path = path.format(p)
        console.log(file.path)
        next(null, file)
      }))
      .pipe(ms((file, next) => {
        file.contents = new Buffer(marked(file.contents.toString()))
        const p = path.parse(file.path)
        p.ext = '.html'
        p.base = p.name + p.ext
        file.path = path.format(p)
        next(null, file)
      }))
      .pipe(ms((file, next) => {
        // let string = `{% extends '../_article.html' %} {% block content %}${file.contents.toString()}{% endblock %}`
        const page = {
          site: site
        }
        const result = nEnv.renderString(file.contents.toString(), page)
        file.contents = new Buffer(result)
        next(null, file)
      }))
      .pipe(vfs.dest('./dist/public/articles/'))
      .on('finish', resolve)
      .on('error', reject)
  })
  .then(() => console.log('Articles complete'))

  const fontJob = new Promise((resolve, reject) => {
    vfs.src('./node_modules/font-awesome/fonts/*')
      .pipe(vfs.dest('./dist/public/fonts/'))
      .on('finish', resolve)
      .on('error', reject)
  })
  .then(() => console.log('Fonts complete'))

  const imageJob = new Promise((resolve, reject) => {
    vfs.src('./client/public/**/*.+(gif|png|webp|jpg|jpeg|svg|ico|jp2)')
      .pipe(vfs.dest('./dist/public/'))
      .on('finish', resolve)
      .on('error', reject)
  })
  .then(() => console.log('Images complete'))

  const markupJob = new Promise((resolve, reject) => {
    vfs.src('./client/**/!(_)*.html')
      .pipe(ms((file, next) => {
        const page = {
          site: site
        }
        nEnv.render(file.path, page, (error, result) => {
          if (error) {
            console.error(error)
            next(null, file)
          }
          file.contents = new Buffer(result)
          next(null, file)
        })
      }))
      .pipe(vfs.dest('./dist/public/'))
      .on('finish', resolve)
      .on('error', reject)
  })
  .then(() => console.log('Markup complete'))

  const scriptJob = new Promise((resolve, reject) => {
    webpack(webpackConfig)
    .run((error, stats) => {
      if (error) reject(error)
      const statString = stats.toString({
        colors: true,
        chunks: stats.hasErrors()
      })
      console.log(statString)
      resolve()
    })
  })
  .then(() => console.log('Script complete'))

  return Promise.all([
    styleJob,
    scriptJob,
    markupJob,
    fontJob,
    blogJob,
    imageJob
  ])
})
.then(() => console.log('Build complete'))
.catch((error) => console.log(error.message))

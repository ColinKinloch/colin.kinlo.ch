'use strict'

import fs from 'fs'

import postcss from 'postcss'
import pcScss from 'postcss-scss'
import autoprefixer from 'autoprefixer'
import sass from 'node-sass'

import errorReject from '../misc/error-reject'

const style = (inFile, outFile) => new Promise((resolve, reject) => {
  fs.readFile(inFile, 'utf8', (error, css) => {
    if (error) reject(error)
    else resolve(css)
  })
})
.then((css) => postcss([ autoprefixer ]).process(css, { parser: pcScss }))
.then((result) => {
  return new Promise((resolve, reject) =>
    sass.render({
      file: inFile,
      data: result.css,
      includePaths: [ './node_modules/font-awesome/scss/' ]
    }, (error, result) => { if (error) reject(error); else resolve(result.css) })
  )
})
.then((css) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(outFile, css, errorReject(resolve, reject))
  })
})

export default style

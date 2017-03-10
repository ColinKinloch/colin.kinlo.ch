'use strict'

import del from 'del'

async function clean () {
  await del(['./server.js', './dist/']).then((paths) => {
    console.log('Deleted:')
    // for (const path of path) console.log(path)
    console.log(paths)
  })
}

clean()
.catch(error => console.error(error))

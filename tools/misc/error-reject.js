'use strict'

const errorReject = (resolve, reject) =>
  error => { if (error) reject(error); else resolve() }

export default errorReject

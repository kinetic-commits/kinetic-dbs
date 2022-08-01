const path = require('path')
const fork = require('child_process').fork
const fs = require('fs')
const { csvGetter } = require('./essential')
const ErrorCatcher = require('../utils/errorCatcher')
const BulkLoader = require('../posgoose/BulkLoader')

exports.readCSVFile = async ({ req, res, next }) => {
  const { user, files } = req || {}
  if (!user) return next(new ErrorCatcher('Unauthorized', 401))
  if (!files) return next(new ErrorCatcher('Please upload a file', 400))
  const file = files.file
  const time = Date.now()

  if (!file.mimetype === 'text/csv')
    return next(new ErrorCatcher('Please upload a CSV file', 400))

  if (file.size > process.env.FILE_SIZE_MAX)
    return next(
      new ErrorCatcher(
        `Please upload a file less than equal to: ${
          process.env.FILE_SIZE_MAX / 1000000
        }MB`,
        400
      )
    )

  file.name = `file_${time}${path.parse(file.name).ext}`
  const filePath = `${process.env.FILE_UPLOAD_PATH}/${file.name}`
  file.mv(filePath, async (err) => {
    if (err) return next(new ErrorCatcher(err.message, 500))
    req.bulk_path = filePath
    const rl = new BulkLoader(req)
    rl.readInChunk()

    return next(new ErrorCatcher('Testing ongoing', 400))

    // const csv = csvGetter(filePath)
    // const { QUERIES, user, method, baseUrl, originalUrl } = req || {}
    // const child_process = fork(path.join(__dirname + '/CsvUploadAndEvents.js'))
    // child_process.send(
    //   JSON.stringify({ QUERIES, body: csv, user, method, originalUrl, baseUrl })
    // )
    // child_process.on('message', (message) => {
    //   const { success, data, code, error } = message
    //   if (success) {
    //     return res.status(code).json({ success, data })
    //   } else {
    //     return next(new ErrorCatcher(error, code))
    //   }
    // })
  })

  /*
    if (csv.length < 1)
      return next(new ErrorCatcher('No document found in your file', 400))
    req.body = csv
    const rl = new BulkLoader(req)
    const rs = await rl.create()

    const { success, data, code, error } = rs || {}
    if (success) {
      return res.status(200).json({ success, data })
    } else {
      return next(new ErrorCatcher(error, code))
    }
  })
  */
}

exports.imageUploads = async ({ req, schema, searchParams, field, action }) => {
  const time = new Date().getTime()
  const { QUERIES: q, user } = req
  const ID = searchParams

  if (!user) return { error: 'Unauthorized user', code: 401 }
  if (user.is_disabled)
    return {
      error: 'Error: Kindly contact system administrator',
      code: 401,
    }

  if (!ID) return { error: 'Searching params is required', code: 400 }
  if (!schema)
    return {
      error: 'Internal error Schema is required',
      code: 500,
    }

  const feeder = await schema.findOne(`where ${ID} = '${q.hasId}'`)

  if (!feeder) {
    return { error: 'No result found', code: 400 }
  }

  if (!req.files) return { error: 'Please upload a file', code: 400 }

  const file = req.files.file

  if (!file.mimetype.startsWith('image')) {
    return { error: 'Please upload an image file', code: 400 }
  }

  if (file.size > process.env.FILE_SIZE_MAX) {
    return {
      error: `Please upload an image less than equal ${
        process.env.FILE_SIZE_MAX / 1000000
      }MB`,
      code: 400,
    }
  }

  file.name = `photo_${feeder[field]}_${time}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) return { error: 'Problem error with file uplaod', code: 500 }

    await schema.UpdateDocument(q.hasId, { [field]: file.name })
  })

  return 'Image uploaded successfully...'
}

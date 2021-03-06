const express = require('express')
const {
  createMapItem,
  getMapItems,
  getMapItem,
  uploadCsvFiles,
  updateMapItem,
  MapSnapShotImage,
  replacementMeterImage,
} = require('../controller/map')
const router = express.Router()
const { protect } = require('../middleware/auth')

router.route('/photo-upload').post(protect, uploadCsvFiles)
router.route('/snap-shot/:id').put(protect, MapSnapShotImage)
router.route('/replacement-photo/:id').put(protect, replacementMeterImage)

router.route('/').get(protect, getMapItems).post(protect, createMapItem)
router.route('/:id').get(protect, getMapItem).put(protect, updateMapItem)

module.exports = router

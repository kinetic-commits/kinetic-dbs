const express = require('express')
const router = express.Router()
const {
  getDiscoItems,
  createDiscoItem,
  getDiscoItem,
  updateDiscoItem,
  uploadCsvFiles,
  DiscoSnapShotImage,
  afterInstallationImage,
  beforeInstallationImage,
  faultyMeterImage,
} = require('../controller/disco')
const { protect } = require('../middleware/auth')

router.route('/photo-upload').post(protect, uploadCsvFiles)
router.route('/snap-shot/:id').put(protect, DiscoSnapShotImage)
router.route('/before-photo-upload/:id').put(protect, beforeInstallationImage)
router.route('/after-photo-upload/:id').put(protect, afterInstallationImage)
router.route('/fault-photo-upload/:id').put(protect, faultyMeterImage)

router.route('/').get(protect, getDiscoItems).post(protect, createDiscoItem)

router.route('/:id').get(protect, getDiscoItem).put(protect, updateDiscoItem)

module.exports = router

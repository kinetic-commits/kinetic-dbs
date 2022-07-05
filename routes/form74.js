const express = require('express');
const router = express.Router();
const {
  createForm74,
  getForm74,
  getForm74s,
  updateForm74,
  form74Image,
  uploadCsvFiles,
} = require('../controller/form74');
const { protect } = require('../middleware/auth');

router.route('/photo-upload/:id').put(protect, form74Image);

router.route('/csv-upload').post(protect, uploadCsvFiles);

router.route('/').get(protect, getForm74s).post(protect, createForm74);

router.route('/:id').get(protect, getForm74).put(protect, updateForm74);

module.exports = router;

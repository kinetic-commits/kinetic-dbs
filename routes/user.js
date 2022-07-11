const express = require('express')
const router = express.Router()
const {
  getUsers,
  createUser,
  getUser,
  loginUser,
  updateUserInfo,
  logout,
  createPassportImage,
} = require('../controller/user')
const { protect } = require('../middleware/auth')

router.get('/logout', logout)
router.put('/photo/:id', protect, createPassportImage)

router.route('/').get(protect, getUsers).post(createUser)
router.post('/login', loginUser)
router.route('/:id').get(protect, getUser).put(protect, updateUserInfo)

module.exports = router

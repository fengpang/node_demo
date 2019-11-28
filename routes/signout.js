const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET siginout 登出
router.get('/', checkLogin, (req, res, next) => {
  res.send('dengchu')
})
module.exports = router
const exress = require('express')
const router = exress.Router()
const checkLogin = require('../middlewares/check').checkLogin

// POST /comments 创建一条留言
router.post('/comments', checkLogin, (req, res, next) => {
  res.send('创建留言')
})

// GET /comments/:commentId/remove 删除一条留言
router.get('/comments/:commentId/remove', checkLogin, (req, res, next) => {
  req.send('删除一条留言')
})

module.exports = router
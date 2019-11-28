const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLoginin = require('../middlewares/check').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLoginin, (req, res, next) => {
  res.render('signup')
})

// POST /signup 用户注册
router.post('/', checkNotLoginin, (req, res, next) => {
  let password = req.fields.password
  const {name, gender, bio, repassword} = req.fields
  const avatar = req.files.avatar.path.split(path.sep).pop()
  // 校验参数
  try {
    if(!(name.length >=1 && name.length <= 10)) {
      throw new Error('名字请限制在1到10个字符')
    }
    if(!['m', 'f', 'x'].includes(gender)) {
      throw new Error('性别只能是 m 、f 或者 x ')
    }
    if(!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介请限制在1-30个字符')
    }
    if(!req.files.avatar.name) {
      throw new Error('缺少头像')
    }
    if(password.length < 6) {
      throw new Error('密码至少6个字符')
    }
    if(password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
  } catch (e) {
      // 注册失败 异步删除上传的头像
      fs.unlink(req.files.avatar.path, err => {
        console.log(`删除${req.files.avatar.name} 成功`)
      })
      req.flash('error', e.message)
      return res.redirect('/signup')
  }

  // 密码加密
  password = sha1(password)

  // 待写入数据库的用户信息
  let user = {name, password, gender, bio, avatar}
  // 用户信息写入数据库
  UserModel.create(user)
  .then(result => {
    // 插入mongodb后的值，包含_id
    user = result.ops[0]
    delete user.password
    req.session.user = user
    // 写入flash
    req.flash('success', '注册成功')
    res.redirect('/posts')
  })
  .catch(e => {
    fs.unlink(req.files.avatar.path, err => {
      console.log(`删除${req.files.avatar.name} 成功`)
    })
    // 用户名被占用则跳回注册页
    if(e.message.match('duplicate key')) {
      req.flash('error', '用户名已被占用')
      return res.redirect('signup')
    }
    next(e)
  })
})

module.exports = router
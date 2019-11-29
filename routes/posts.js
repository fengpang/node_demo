const express = require('express')
const router = express.Router()

const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const checkLogin = require('../middlewares/check').checkLogin

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', (req, res, next) => {
  const author = req.query.author
  PostModel.getPosts(author)
    .then(posts => {
      res.render('posts', {posts})
    })
    .catch(next)
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, (req, res, next) => {
  const author = req.session.user._id
  const {title, content} = req.fields

  try {
    if(!title.length){
      throw new Error('请输入标题')
    }
    if(!content.length){
      throw new Error('请输入内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {author, title, content}
  PostModel.create(post)
    .then(result => {
      post = result.ops[0]
      req.flash('sucess', '发表成功')
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, (req, res, next) => {
  res.render('create')
})

// GET /posts/:postId 单独的一篇文章页
router.get('/:postId', (req, res, next) => {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId),
    PostModel.incPv(postId)
  ])
    .then(result => {
      const [post, comments] = result
      if(!post) {
        throw new Error('该文章不存在')
      }
      res.render('post', {post, comments})
    })
    .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, (req, res, next) => {
    const postId = req.params.postId
    const author = req.session.user._id

    PostModel.getRawPostById(postId)
      .then(post => {
        if(!post) {
          throw new Error('该文章不存在')
        }
        if(post.author.toString() !== author.toString()) {
          throw new Error("权限不足")
        }
        res.render('edit', {post})
      })
      .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, (req, res, next) => {
  const postId = req.params.postId
  const author = req.session.user._id
  const {title, content} = req.fields

  try {
    if(!title.length) {
      throw new Error('请填写标题')
    }
    if(!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getRawPostById(postId)
    .then(post => {
      if(!post){
        throw new Error('该文章不存在')
      }
      if(post.author.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.updatePostById(postId, {title, content})
        .then(() => {
          req.flash('success', '编辑文章成功')
          res.redirect(`/posts/${postId}`)
        })
    })
})

// POST /post/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, (req, res, next) => {
  const postId = req.params.postId
  const author = req.session.user._id
  PostModel.getRawPostById(postId)
    .then(post => {
      if(!post) {
        throw new Error('文章不存在')
      }
      if(post.author.toString() !== author.toString()) {
        throw new Error("没有权限")
      }
      PostModel.delPostById(postId)
        .then(() => {
          req.flash("删除文章成功")
          res.redirect('/posts')
        })
        .catch(next)
    })
})

module.exports = router
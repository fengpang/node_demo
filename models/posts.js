const marked = require('marked')
const Post = require('../lib/mongo').Post
const CommentModel = require('./comments')

// 给posts添加留言数量
Post.plugin('addCommentsCount', {
  afterFind (posts) {
    return Promise.all(posts.map(post => {
      return CommentModel.getCommentsCount(post._id).then(commentsCount => {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne (post) {
    if(!post) return post
    return CommentModel.getCommentsCount(post._id).then(commentsCount => {
      post.commentsCount = commentsCount
      return post
    })
  }
})

Post.plugin('contentToHtml', {
  afterFind: posts => {
    return posts.map(post => {
      post.content = marked(post.content)
      return post
    })
  },
  afterFindOne: post => {
    if(post){
      post.content = marked(post.content)
    }
    return post
  }
})

module.exports = {
  create: post => {
    return Post.create(post).exec()
  },
  getPostById: postId => {
    return Post
      .findOne({_id: postId})
      .populate({path: 'author', model: 'User'})
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },
  getPosts: author => {
    const query = {}
    if(author) {
      query.author = author
    }
    return Post
      .find(query)
      .populate({path: 'author', model: 'User'})
      .sort({_id: -1})
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
  incPv: postId => {
    return Post
      .update({_id: postId}, {$inc: {pv: 1}})
      .exec()
  },
  getRawPostById: postId => {
    return Post
      .findOne({_id: postId})
      .populate({path: 'auther', model: 'User'})
      .exec()
  },
  updatePostById: (postId, data) => {
    return Post.update({_id: postId}, {$set: data}).exec()
  },
  delPostById: postId => {
    return Post.deleteOne({_id: postId})
      .exec()
      .then(res => {
        if(res.result.ok && res.result.n > 0) {
          return CommentModel.delCommentByPostId(postId)
        }
      })
  }
}
const marked = require('marked')
const Post = require('../lib/mongo').Post

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
    return Post.deleteOne({_id: postId}).exec()
  }
}
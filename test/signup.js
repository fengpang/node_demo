const path = require('path')
const asseret = require('assert')
const request = require('supertest')
const app = require('../index')
const User = require('../lib/mongo')

const testName1 = 'testName1'
const testName2 = 'bikabika'

describe('signup', () => {
  describe('POST /signup', () => {
    const agent = request.agent(app)
    beforeEach((done) => {
      User.create({
        name: testName1,
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
        .exec()
        .then(() => {
          done()
        })
        .catch(done)
    })
    afterEach((done) => {
      User.deleteMany({name: { $in: [testName1, testName2] }})
        .exec()
        .then(() => {
          done()
        })
        .catch(done)
    })
    after((done) => {
      process.exit()
    })
    it('wrong name', done => {
      agent
        .post('signup')
        .type('form')
        .field({name: ''})
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .redirects()
        .end((err, res) => {
          if(err) return done(err)
          asseret(res.text.match(/名字请限制在1-10个字符/))
          done()
        })
    })
    it('wrong gender', done => {
      agent
        .post('/signup')
    })
  })
})
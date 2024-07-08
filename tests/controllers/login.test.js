const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../helper')
const app = require('../../app')
const User = require('../../models/user')

const api = supertest(app)

describe('login', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await helper.initializeUser()
  })

  afterEach(async () => {
    await helper.clearDB()
  })

  describe('with correct username and password', () => {
    let response

    beforeEach(async () => {
      const user = {
        username: 'firstUser',
        password: 'firstPassword'
      }

      response = await api
        .post('/api/login')
        .send(user)
    })

    test('succeeds', async () => {
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/application\/json/)
    })

    test('returns token, username, and email', async () => {
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('username')
      expect(response.body).toHaveProperty('email')
    })

  })

  test('fails with incorrect password', async () => {
    const user = {
      username: 'firstUser',
      password: 'wrongPassword'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /text\/html/)

    expect(response.text).toContain("Invalid username or password")

  }, 100000)

  test('fails with nonexisting username', async () => {
    const user = {
      username: 'nonExistingUsername',
      password: 'firstPassword'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /text\/html/)

    expect(response.text).toContain("Invalid username or password")

  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
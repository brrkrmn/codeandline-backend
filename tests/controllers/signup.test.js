const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../helper')
const app = require('../../app')
const User = require('../../models/user')

const api = supertest(app)

describe('signup', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await helper.initializeUser()
  })

  afterEach(async () => {
    await helper.clearDB()
  })

  test('succeeds with unique credentials', async () => {
    const newUser = {
      username: 'newUser',
      email: 'newUser@test.com',
      password: 'newUser',
    }

    const createdUser = await api
      .post('/api/signup')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(await helper.isUserInDB(createdUser.username)).toBeTruthy
  })

  test('fails with an existing email', async () => {
    const newUser = {
      username: 'newUser',
      email: 'firstUser@test.com',
      password: 'newUser',
    }

    const response = await api
      .post('/api/signup')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /text\/html/)

    expect(response.text).toContain("There's already an account with this email")
    expect(await helper.isUserInDB(newUser.username)).toBeFalsy
  })

  test('fails with an existing username', async () => {
    const newUser = {
      username: 'firstUser',
      email: 'newUser@test.com',
      password: 'newUser',
    }

    const response = await api
      .post('/api/signup')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /text\/html/)

    expect(response.text).toContain("There's already an account with this username")
    expect(await helper.isUserInDB(newUser.username)).toBeFalsy
  })
})

afterAll(async () => {
    await mongoose.connection.close()
})
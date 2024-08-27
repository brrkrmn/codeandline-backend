import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../../app'
import { User } from '../../models/user'
import { clearDB, initializeUser, isUserInDB } from '../helper'

const api = supertest(app)

describe('signup', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await initializeUser()
  })

  afterEach(async () => {
    await clearDB()
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

    expect(await isUserInDB(createdUser.body.username)).toBeTruthy
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
    expect(await isUserInDB(newUser.username)).toBeFalsy
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
    expect(await isUserInDB(newUser.username)).toBeFalsy
  })
})

afterAll(async () => {
    await mongoose.connection.close()
})
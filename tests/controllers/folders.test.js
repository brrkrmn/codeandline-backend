const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../helper')
const app = require('../../app')
const User = require('../../models/user')
const Folder = require('../../models/folder')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('User', () => {
  beforeEach(async () => {
    await helper.initializeUser()
    await helper.initializeFolder()
  })

  afterEach(async () => {
    await helper.clearDB()
  })

  describe('with no token', () => {
    const checkAccessWithNoToken = async (method, url) => {
      await api[method](url)
        .expect(401)
        .expect('Content-Type', /application\/json/)
        .then(res => expect(res.body.error).toContain('token is missing'));
    };

    test('fails to access folder routes', async () => {
      const firstFolder = await Folder.findOne({})

      checkAccessWithNoToken('get', '/api/folders')
      checkAccessWithNoToken('get', `/api/folders/${firstFolder.id}`)
      checkAccessWithNoToken('post', '/api/folders/')
      checkAccessWithNoToken('delete', `/api/folders/${firstFolder.id}`)
      checkAccessWithNoToken('put', `/api/folders/${firstFolder.id}`)
    })
  })

  describe('with non-matching token', () => {
    let token
    let firstFolder

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('newPassword', 10)
      const newUser = new User({
        username: 'newUser',
        email: 'newUser@test.com',
        passwordHash: passwordHash
      })

      await newUser.save()

      const response = await api
      .post('/api/login')
      .send({
        username: 'newUser',
        password: 'newPassword'
      })

      token = response.body.token
      firstFolder = await Folder.findOne({})
    })

    afterEach(async () => {
      await helper.clearDB()
    })

    const checkUnauthorizedAccess = async (method, url) => {
      await api[method](url)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
        .expect('Content-Type', /application\/json/)
        .then(res => expect(res.body.error).toContain('Unauthorized'));
    };

    test('fails to view folder details', async () => {
      await checkUnauthorizedAccess('get', `/api/folders/${firstFolder.id}`)
    })

    test('fails to delete folder', async () => {
      await checkUnauthorizedAccess('delete', `/api/folders/${firstFolder.id}`)
    })

    test('fails to edit folder', async () => {
      await checkUnauthorizedAccess('put', `/api/folders/${firstFolder.id}`)
    })
  })
})

describe('Authenticated user', () => {
  let token
  let firstFolder

  beforeEach(async () => {
    await helper.initializeUser()
    await helper.initializeFolder()

    response = await api
      .post('/api/login')
      .send({
        username: 'firstUser',
        password: 'firstPassword'
      })

    token = response.body.token
    firstFolder = await Folder.findOne({})
  })

  afterEach(async () => {
    await helper.clearDB()
  })

  test('succeeds to view all folders', async () => {
    const response = await api
      .get('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(1)
  })

  test('succeeds to view folder details', async () => {
    const response = await api
      .get(`/api/folders/${firstFolder.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.id).toBe(firstFolder.id)
  })

  test('succeeds to create folder', async () => {
    await api
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'newFolder',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('succeds to delete folder', async () => {
    await api
      .delete(`/api/folders/${firstFolder.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('succeeds to edit folder', async () => {
    await api
      .put(`/api/folders/${firstFolder.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({title: 'newTitle', description: 'newDescription'})
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then(res => expect(res.body.title).toContain('newTitle'));
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
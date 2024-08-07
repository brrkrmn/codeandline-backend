const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../helper')
const app = require('../../app')
const Folder = require('../../models/folder')

const api = supertest(app)

describe('authenticated user', () => {
  let token
  let firstFolder

  beforeEach(async () => {
    await helper.initializeUser()
    await helper.initializeFolder()

    const response = await api
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
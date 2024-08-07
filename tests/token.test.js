const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./helper')
const app = require('../app')
const Note = require('../models/note')
const Folder = require('../models/folder')
const api = supertest(app)

describe('user', () => {
  beforeEach(async () => {
    await helper.initializeUser()
    await helper.initializeFolder()
    await helper.initializeNote()
  })

  afterEach(async () => {
    await helper.clearDB()
  })

  describe('with no token', () => {
    const checkAccessWithNoToken = async (method, url) => {
      await api[method](url)
        .expect(401)
        .expect('Content-Type', /application\/json/)
        .then(res => expect(res.body.error).toContain('token is missing'))
    }

    test('fails to access folder routes', async () => {
      const firstFolder = await Folder.findOne({})

      checkAccessWithNoToken('get', '/api/folders')
      checkAccessWithNoToken('post', '/api/folders')
      checkAccessWithNoToken('get', `/api/folders/${firstFolder.id}`)
      checkAccessWithNoToken('delete', `/api/folders/${firstFolder.id}`)
      checkAccessWithNoToken('put', `/api/folders/${firstFolder.id}`)
    })

    test('fails to access note routes', async () => {
      const firstNote = await Note.findOne({})

      checkAccessWithNoToken('get', '/api/notes')
      checkAccessWithNoToken('post', '/api/notes')
      checkAccessWithNoToken('get', `/api/notes/${firstNote.id}`)
      checkAccessWithNoToken('delete', `/api/notes/${firstNote.id}`)
      checkAccessWithNoToken('put', `/api/notes/${firstNote.id}`)
    })
  })

  describe('with non-matching token', () => {
    let token
    let firstNote
    let firstFolder

    beforeEach(async () => {
      await helper.createNewUser()

      const response = await api
        .post('/api/login')
        .send({
          username: 'newUser',
          password: 'newPassword'
        })

      token = response.body.token
      firstFolder = await Folder.findOne({})
      firstNote = await Note.findOne({})
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

    test('fails to see note details', async () => {
      await checkUnauthorizedAccess('get', `/api/notes/${firstNote.id}`)
    })

    test('fails to delete note', async () => {
      await checkUnauthorizedAccess('delete', `/api/notes/${firstNote.id}`)
    })

    test('fails to edit note', async () => {
      await checkUnauthorizedAccess('put', `/api/notes/${firstNote.id}`)
    })

  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../helper')
const app = require('../../app')
const User = require('../../models/user')
const Note = require('../../models/note')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('authenticated user', () => {
  let token
  let firstNote

  beforeEach(async () => {
    await helper.initializeUser()
    await helper.initializeNote()

    const response = await api
      .post('/api/login')
      .send({
        username: 'firstUser',
        password: 'firstPassword'
      })

    token = response.body.token
    firstNote = await Note.findOne({})
  })

  afterEach(async () => {
    await helper.clearDB()
  })

  test('succeeds to view all notes', async () => {
    const response = await api
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(1)
  })

  test('succeeds to view note details', async () => {
    const response = await api
      .get(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.id).toBe(firstNote.id)
  })

  test('succeeds to create note', async () => {
    await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'newNote',
        code: "new code line",
        entries: [{
          lineNumbers: [1, 2],
          content: "new content for lines 1 and 2."
        }],
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('succeeds to delete note', async () => {
    await api
      .delete(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('succeeds to edit note', async () => {
    await api
      .put(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'newTitle', description: 'newDescription', code: 'new code line' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then(res => expect(res.body.title).toContain('newTitle'));
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
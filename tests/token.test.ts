import mongoose from 'mongoose'
import supertest, { Response } from 'supertest'
import app from '../app'
import { Folder, FolderDocument } from '../models/folder'
import { Note, NoteDocument } from '../models/note'
import { clearDB, createNewUser, initializeFolder, initializeNote, initializeUser } from './helper'

const api = supertest(app)

type Method = 'get' | 'post' | 'put' | 'delete'


describe('user', () => {
  beforeEach(async () => {
    await initializeUser()
    await initializeFolder()
    await initializeNote()
  })

  afterEach(async () => {
    await clearDB()
  })

  describe('with no token', () => {
    const checkAccessWithNoToken = async (method: Method, url: string) => {
      await api[method](url)
        .expect(401)
        .expect('Content-Type', /application\/json/)
        .then((res: Response) => expect(res.body.error).toContain('token is missing'))
    }

    test('fails to access folder routes', async () => {
      const firstFolder = await Folder.findOne({}) as FolderDocument

      checkAccessWithNoToken('get', '/api/folders')
      checkAccessWithNoToken('post', '/api/folders')
      checkAccessWithNoToken('get', `/api/folders/${firstFolder.id}`)
      checkAccessWithNoToken('delete', `/api/folders/${firstFolder.id}`)
      checkAccessWithNoToken('put', `/api/folders/${firstFolder.id}`)
    })

    test('fails to access note routes', async () => {
      const firstNote = await Note.findOne({}) as NoteDocument

      checkAccessWithNoToken('get', '/api/notes')
      checkAccessWithNoToken('post', '/api/notes')
      checkAccessWithNoToken('get', `/api/notes/${firstNote.id}`)
      checkAccessWithNoToken('delete', `/api/notes/${firstNote.id}`)
      checkAccessWithNoToken('put', `/api/notes/${firstNote.id}`)
    })
  })

  describe('with non-matching token', () => {
    let token: string
    let firstNote: NoteDocument
    let firstFolder: FolderDocument

    beforeEach(async () => {
      await createNewUser()

      const response = await api
        .post('/api/login')
        .send({
          username: 'newUser',
          password: 'newPassword'
        })

      token = response.body.token
      firstFolder = await Folder.findOne({}) as FolderDocument
      firstNote = await Note.findOne({}) as NoteDocument
    })

    afterEach(async () => {
      await clearDB()
    })

    const checkUnauthorizedAccess = async (method: Method, url: string) => {
      await api[method](url)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
        .expect('Content-Type', /application\/json/)
        .then((res: Response) => expect(res.body.error).toContain('Unauthorized'));
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
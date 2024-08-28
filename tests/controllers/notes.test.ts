import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../../app'
import { Folder, FolderDocument } from '../../models/folder'
import { Note, NoteDocument } from '../../models/note'
import { clearDB, initializeFolder, initializeNote, initializeUser } from '../helper'

const api = supertest(app)

describe('authenticated user', () => {
  let token: string

  beforeEach(async () => {
    await initializeUser()
    await initializeNote()
    await initializeFolder()

    const response = await api
      .post('/api/login')
      .send({
        username: 'firstUser',
        password: 'firstPassword'
      })

    token = response.body.token
  })

  afterEach(async () => {
    await clearDB()
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
    const firstNote = await Note.findOne({}) as NoteDocument
    const response = await api
      .get(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.id).toBe(firstNote.id)
  })

  test('succeeds to create note', async () => {
    const firstFolder = await Folder.findOne({}) as FolderDocument

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
        folder: firstFolder.id
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const updatedFolder = await Folder.findOne({}) as FolderDocument
    expect(updatedFolder.notes).toHaveLength(1)
  })

  test('succeeds to delete note', async () => {
    const firstNote = await Note.findOne({}) as NoteDocument
    await api
      .delete(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const updatedFolder = await Folder.findOne({}) as FolderDocument
    expect(updatedFolder.notes).toHaveLength(0)
  })

  test('succeeds to edit note', async () => {
    const firstNote = await Note.findOne({}) as NoteDocument
    const firstFolder = await Folder.findOne({}) as FolderDocument

    await api
      .put(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'newTitle', description: 'newDescription', code: 'new code line', folder: firstFolder.id })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then(res => expect(res.body.title).toContain('newTitle'));

    const updatedFolder = await Folder.findOne({}) as FolderDocument
    expect(updatedFolder.notes).toHaveLength(1)
  })
})

describe('folders are correctly updated', () => {
  let token: string

  beforeEach(async () => {
    await initializeUser()
    await initializeNote()
    await initializeFolder()

    const response = await api
      .post('/api/login')
      .send({
        username: 'firstUser',
        password: 'firstPassword'
      })

    const firstNote = await Note.findOne({}) as NoteDocument
    const firstFolder = await Folder.findOne({ title: 'firstFolder' }) as FolderDocument

    token = response.body.token

    firstNote.folder = firstFolder.id
    await firstNote.save()

    firstFolder.notes = firstFolder.notes.concat(firstNote.id)
    await firstFolder.save()
  })

  afterEach(async () => {
    await clearDB()
  })

  test('after note deletion', async () => {
    const firstNote = await Note.findOne({}) as NoteDocument

    await api
      .delete(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const updatedFolder = await Folder.findOne({}) as FolderDocument
    expect(updatedFolder.notes).toHaveLength(0)
  })

  test("after changing note's folder", async () => {
    const firstNote = await Note.findOne({}) as NoteDocument

    const response = await api
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'newFolder',
      })

    await api
      .put(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folder: response.body.id })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const updatedNote = await Note.findOne({}) as NoteDocument
    const updatedNewFolder = await Folder.findOne({ title: 'newFolder' }) as FolderDocument
    const updatedFirstFolder = await Folder.findOne({ title: 'firstFolder' }) as FolderDocument

    if (updatedNote.folder) {
      expect(updatedNote.folder.toString()).toEqual(updatedNewFolder.id.toString())
    }

    expect(updatedNewFolder.notes).toHaveLength(1)
    expect(updatedFirstFolder.notes).toHaveLength(0)
  })

  test("after removing note's folder", async () => {
    const firstNote = await Note.findOne({}) as NoteDocument

    await api
      .put(`/api/notes/${firstNote.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folder: null })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const updatedNote = await Note.findOne({}) as NoteDocument
    const updatedFolder = await Folder.findOne({}) as FolderDocument

    expect(updatedNote.folder).toBeNull()
    expect(updatedFolder.notes).toHaveLength(0)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
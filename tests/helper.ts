import * as bcrypt from 'bcrypt'
import Folder from '../models/folder'
import Note from '../models/note'
import User from '../models/user'

export const initializeUser = async () => {
  const passwordHash = await bcrypt.hash('firstPassword', 10)
  const firstUser = new User({
    username: 'firstUser',
    email: 'firstUser@test.com',
    passwordHash: passwordHash
  })
  const savedUser = await firstUser.save()
  return savedUser
}

export const isUserInDB = async (username) => {
  const user = await User.find({ username: username })
  if (user) return true; else false
}

export const initializeFolder = async () => {
  const user = await User.findOne({})
  const firstFolder = new Folder({
    title: 'firstFolder',
    description: 'firstFolderDescription',
    user: user.id,
  })
  await firstFolder.save()
}

export const initializeNote = async () => {
  const user = await User.findOne({})
  const firstNote = new Note({
    title: 'firstNote',
    description: 'firstNoteDescription',
    code: "First code line",
    entries: [
      {
        lineNumbers: [1, 2],
        content: "First content for lines 1 and 2."
      }
    ],
    user: user.id,
  })
  await firstNote.save()
}

export const createNewUser = async () => {
  const passwordHash = await bcrypt.hash('newPassword', 10)
  const newUser = new User({
    username: 'newUser',
    email: 'newUser@test.com',
    passwordHash: passwordHash
  })
  const savedUser = await newUser.save()
  return savedUser
}

export const clearDB = async () => {
  await Folder.deleteMany({})
  await Note.deleteMany({})
  await User.deleteMany({})
}
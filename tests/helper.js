const User = require('../models/user')
const Folder = require('../models/folder')
const Note = require('../models/note')
const bcrypt = require('bcrypt')

const initializeUser = async () => {
  const passwordHash = await bcrypt.hash('firstPassword', 10)
  const firstUser = new User({
    username: 'firstUser',
    email: 'firstUser@test.com',
    passwordHash: passwordHash
  })
  const savedUser = await firstUser.save()
  return savedUser
}

const isUserInDB = async (username) => {
  const user = await User.find({ username: username })
  if (user) return true; else false
}

const initializeFolder = async () => {
  const user = await User.findOne({})
  const firstFolder = new Folder({
    title: 'firstFolder',
    description: 'firstFolderDescription',
    user: user.id,
  })
  await firstFolder.save()
}

const clearDB = async () => {
  await Folder.deleteMany({})
  await Note.deleteMany({})
  await User.deleteMany({})
}

module.exports = {
  initializeUser, isUserInDB, initializeFolder, clearDB
}
const User = require('../models/user')
const bcrypt = require('bcrypt')

const createFirstUser = async () => {
  const passwordHash = await bcrypt.hash('firstPassword', 10)
  const firstUser = new User({ username: 'firstUser', email: 'firstUser@test.com', passwordHash: passwordHash })
  await firstUser.save()
}

const getUsersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const isUserInDB = async (username) => {
  const user = await User.find({ username: username })
  if (user) return true; else false
}

module.exports = {
  createFirstUser, getUsersInDB, isUserInDB
}
import * as bcrypt from 'bcrypt';
import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user';

const loginRouter = Router();

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).send('Invalid username or password')
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  response.status(200).send({ token, username: user.username, email: user.email })
})

export default loginRouter
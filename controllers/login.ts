import * as bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/user';

const loginRouter = Router();

loginRouter.post('/', async (req: Request, res: Response) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).send('Invalid username or password')
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  res.status(200).send({ token, username: user.username, email: user.email })
})

export default loginRouter
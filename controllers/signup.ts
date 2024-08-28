import * as bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { User } from '../models/user';

const signupRouter = Router()

signupRouter.post('/', async (req: Request, res: Response) => {
  const { email, username, password } = req.body

  const existingEmail = await User.findOne({ email: email });
  const existingUsername = await User.findOne({ username: username })

  if (existingEmail) return res
    .status(400)
    .send("There's already an account with this email");

  if (existingUsername) return res
    .status(400)
    .send("There's already an account with this username");

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    email,
    username,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

export default signupRouter;
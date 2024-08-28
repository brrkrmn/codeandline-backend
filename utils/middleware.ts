import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Folder } from '../models/folder';
import { User } from '../models/user';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log('Method', req.method);
  console.log('Path', req.path);
  console.log('Body', req.body);
  next();
}

export const unknownEndpoint = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('Error:', error.message);

  if (error.name === 'CastError') {
    return res
      .status(400)
      .send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res
      .status(400)
      .json({ error: error.message })
  } else if (error.name ===  'JsonWebTokenError') {
    return res
      .status(401)
      .json({ error: error.message })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' })
  }
  next(error);
}

export const tokenExtractor = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      req.token = token
  }
  next()
}

export const userExtractor = async (req: Request, res: Response, next: NextFunction) => {
  interface JwtPayload {
    id: string;
  }

  if (!req.token) {
    return res.status(401).json({ error: 'token is missing'})
  }

  const decodedToken = jwt.verify(req.token, process.env.SECRET as string) as JwtPayload

  if (!decodedToken.id) {
      return res.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  req.user = user

  next()
}

export const folderExtractor = async (req: Request, res: Response, next: NextFunction) => {
  const folderId = req.body.folder

  if (folderId) {
    const folder = await Folder.findById(folderId)
    req.folder = folder
  } else {
    req.folder = null
  }
  next()
}
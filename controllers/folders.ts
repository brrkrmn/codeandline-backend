import { Request, Response, Router } from 'express';
import { Folder } from '../models/folder';

const foldersRouter = Router();

foldersRouter.get('/', async (req: Request, res: Response) => {
  const user = req.user
  const userFolders = await Folder
    .find({ user: user._id }).populate('user').populate('notes')

  res.json(userFolders)
})

foldersRouter.get('/:id', async (req: Request, res: Response) => {
  const folder = await Folder.findById(req.params.id).populate('user').populate('notes')
  const user = req.user

  if (folder.user.id === user.id) {
    res.json(folder)
  } else {
    res.status(403).json({ error: 'Unauthorized' })
  }
})

foldersRouter.post('/', async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user

  const folder = new Folder({
    title: body.title,
    description: body.description,
    notes: body.notes || [],
    public: body.public,
    user: user._id
  })

  const savedFolder = await folder.save()
  user.folders = user.folders.concat(savedFolder._id)
  await user.save()

  res.status(201).json(savedFolder)
})

foldersRouter.delete('/:id', async (req: Request, res: Response) => {
  const user = req.user
  const folder = await Folder.findById(req.params.id).populate('user')

  if (folder.user.id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  await Folder.findByIdAndRemove(req.params.id)

  user.folders = user.folders.pull(folder.id)
  await user.save()

  res.status(204).end()
})

foldersRouter.put('/:id', async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user
  const folder = await Folder.findById(req.params.id).populate('user')

  if (folder.user.id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const newFolder = {
    title: body.title,
    description: body.description
  }

  const updatedFolder = await Folder.findByIdAndUpdate(req.params.id, newFolder, { new: true })
  res.status(200).json(updatedFolder)
})

export default foldersRouter
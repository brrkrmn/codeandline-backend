import { Request, Response, Router } from 'express';
import { Folder, FolderDocument } from '../models/folder';
import { User, UserDocument } from '../models/user';

const foldersRouter = Router();

foldersRouter.get('/', async (req: Request, res: Response) => {
  const user = req.user as UserDocument
  const userFolders = await Folder
    .find({ user: user._id }).populate('user').populate('notes')

  res.json(userFolders)
})

foldersRouter.get('/:id', async (req: Request, res: Response) => {
  const folder = await Folder.findById(req.params.id).populate('user').populate('notes') as FolderDocument
  const user = req.user as UserDocument

  if (folder.user.id === user.id) {
    res.json(folder)
  } else {
    res.status(403).json({ error: 'Unauthorized' })
  }
})

foldersRouter.post('/', async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user as UserDocument

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
  const user = req.user as UserDocument
  const folder = await Folder.findById(req.params.id).populate('user') as FolderDocument

  if (folder.user.id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  await Folder.findByIdAndRemove(req.params.id)

  await User.updateOne(
    { _id: user.id },
    { $pull: { folders: folder.id.toString() }}
  )

  res.status(204).end()
})

foldersRouter.put('/:id', async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user as UserDocument
  const folder = await Folder.findById(req.params.id).populate('user') as FolderDocument

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
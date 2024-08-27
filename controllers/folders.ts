import { Router } from 'express';
import Folder from '../models/folder';

const foldersRouter = Router();

foldersRouter.get('/', async (request, response) => {
  const user = request.user
  const userFolders = await Folder
    .find({ user: user._id }).populate('user').populate('notes')

  response.json(userFolders)
})

foldersRouter.get('/:id', async (request, response) => {
  const folder = await Folder.findById(request.params.id).populate('user').populate('notes')
  const user = request.user

  if (folder.user.id === user.id) {
    response.json(folder)
  } else {
    response.status(403).json({ error: 'Unauthorized' })
  }
})

foldersRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

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

  response.status(201).json(savedFolder)
})

foldersRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const folder = await Folder.findById(request.params.id).populate('user')

  if (folder.user.id !== user.id) {
    return response.status(403).json({ error: 'Unauthorized' })
  }

  await Folder.findByIdAndRemove(request.params.id)

  user.folders = user.folders.pull(folder.id)
  await user.save()

  response.status(204).end()
})

foldersRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = request.user
  const folder = await Folder.findById(request.params.id).populate('user')

  if (folder.user.id !== user.id) {
    return response.status(403).json({ error: 'Unauthorized' })
  }

  const newFolder = {
    title: body.title,
    description: body.description
  }

  const updatedFolder = await Folder.findByIdAndUpdate(request.params.id, newFolder, { new: true })
  response.status(200).json(updatedFolder)
})

export default foldersRouter
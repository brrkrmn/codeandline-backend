import { Request, Response, Router } from 'express';
import { Folder } from '../models/folder';
import { Note } from '../models/note';
import { folderExtractor } from '../utils/middleware';

const notesRouter = Router();

notesRouter.get('/', async (req: Request, res: Response) => {
  const user = req.user
  const userNotes = await Note
    .find({ user: user._id }).populate('user').populate('folder')

  res.json(userNotes)
})

notesRouter.get('/:id', async (req: Request, res: Response) => {
  const note = await Note.findById(req.params.id).populate('user').populate('folder')
  const user = req.user

  if (note.user.id === user.id) {
    res.json(note)
  } else {
    res.status(403).json({ error: 'Unauthorized' })
  }
})

notesRouter.post('/', folderExtractor, async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user
  const folder = req.folder

  const note = new Note({
    title: body.title,
    description: body.description,
    folder: body.folder || null,
    code: body.code,
    entries: body.entries,
    public: body.public,
    user: user._id
  })

  const savedNote = await note.save()

  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  if (folder) {
    folder.notes = folder.notes.concat(savedNote._id)
    await folder.save()
  }

  res.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (req: Request, res: Response) => {
  const user = req.user
  const note = await Note.findById(req.params.id).populate('user').populate('folder')

  if (note.user.id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  await Note.findByIdAndRemove(req.params.id)

  user.notes = user.notes.pull(note.id)
  await user.save()

  if (note.folder) {
    const folder = await Folder.findById(note.folder.id)
    folder.notes = folder.notes.pull(note.id)
    await folder.save()
  }

  res.status(204).end()
})

notesRouter.put('/:id', folderExtractor, async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user
  const newFolder = req.folder

  const note = await Note.findById(req.params.id).populate('user').populate('folder')
  const currentFolder = note.folder ? await Folder.findById(note.folder.id).populate('notes') : null

  if (note.user.id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const newNote = {
    title: body.title,
    description: body.description,
    folder: body.folder || null,
    code: body.code,
    entries: body.entries,
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, newNote, { new: true })

  if (newFolder) {
    if (currentFolder && newFolder.id !== currentFolder.id) {
      currentFolder.notes = currentFolder.notes.pull(updatedNote._id)
      await currentFolder.save()

      newFolder.notes = newFolder.notes.concat(updatedNote._id)
      await newFolder.save()
    } else if (!currentFolder) {
      newFolder.notes = newFolder.notes.concat(updatedNote._id)
      await newFolder.save()
    }
  } else {
    if (currentFolder) {
      currentFolder.notes = currentFolder.notes.pull(updatedNote._id)
      await currentFolder.save()
    }
  }

  res.status(200).json(updatedNote)
})

export default notesRouter
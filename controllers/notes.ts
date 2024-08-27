import { Request, Response, Router } from 'express';
import { Folder, FolderDocument } from '../models/folder';
import { Note, NoteDocument } from '../models/note';
import { User, UserDocument } from '../models/user';
import { folderExtractor } from '../utils/middleware';

const notesRouter = Router();

notesRouter.get('/', async (req: Request, res: Response) => {
  const user = req.user as UserDocument
  const userNotes = await Note
    .find({ user: user._id }).populate('user').populate('folder')

  res.json(userNotes)
})

notesRouter.get('/:id', async (req: Request, res: Response) => {
  const note = await Note.findById(req.params.id).populate('user').populate('folder') as NoteDocument
  const user = req.user as UserDocument

  if (note.user.id === user.id) {
    res.json(note)
  } else {
    res.status(403).json({ error: 'Unauthorized' })
  }
})

notesRouter.post('/', folderExtractor, async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user as UserDocument
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
  const user = req.user as UserDocument
  const note = await Note.findById(req.params.id).populate('user').populate('folder') as NoteDocument

  if (note.user.id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  await Note.findByIdAndRemove(req.params.id)

  await User.updateOne(
    { _id: user.id },
    { $pull: { notes: note.id.toString() }}
  )

  if (note.folder) {
    const folder = await Folder.findById(note.folder.id) as FolderDocument

    await Folder.updateOne(
      { _id: folder.id },
      { $pull: { notes: note.id.toString() }}
    )
  }

  res.status(204).end()
})

notesRouter.put('/:id', folderExtractor, async (req: Request, res: Response) => {
  const body = req.body
  const user = req.user as UserDocument
  const newFolder = req.folder

  const note = await Note.findById(req.params.id).populate('user').populate('folder') as NoteDocument
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

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, newNote, { new: true }) as NoteDocument

  if (newFolder) {
    if (currentFolder && newFolder.id !== currentFolder.id) {
      await Folder.updateOne(
        { _id: currentFolder.id },
        { $pull: { notes: updatedNote._id.toString() }}
      )

      newFolder.notes = newFolder.notes.concat(updatedNote._id)
      await newFolder.save()
    } else if (!currentFolder) {
      newFolder.notes = newFolder.notes.concat(updatedNote._id)
      await newFolder.save()
    }
  } else {
    if (currentFolder) {
      await Folder.updateOne(
        { _id: currentFolder.id },
        { $pull: { notes: updatedNote._id.toString() } }
      )
    }
  }

  res.status(200).json(updatedNote)
})

export default notesRouter
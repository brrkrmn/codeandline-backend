import mongoose from 'mongoose';
import { FolderDocument } from './folder';
import { UserDocument } from './user';

export type EntryDocument = mongoose.Document & {
  lineNumbers?: number[];
  content: string;
}

export type NoteDocument = mongoose.Document & {
  title: string;
  description?: string;
  date: Date;
  public: boolean;
  code: string;
  entries: EntryDocument[];
  folder?: FolderDocument | null;
  user: UserDocument;
}

const entrySchema = new mongoose.Schema<EntryDocument>({
  lineNumbers: {
    type: Array,
  },
  content: {
    type: String,
    required: true,
  }
})

const noteSchema = new mongoose.Schema<NoteDocument>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  public: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
    required: true,
  },
  entries: {
    type: [entrySchema]
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject._v
  }
})

export const Note = mongoose.model<NoteDocument>('Note', noteSchema)
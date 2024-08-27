import mongoose from 'mongoose';

export type FolderDocument = mongoose.Document & {
  title: string;
  description?: string;
  date: Date;
  public: boolean;
  notes: mongoose.Schema.Types.ObjectId[];
  user: mongoose.Schema.Types.ObjectId;
}

const folderSchema = new mongoose.Schema<FolderDocument>({
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
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

folderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject._v
  }
})

export const Folder = mongoose.model<FolderDocument>('Folder', folderSchema);
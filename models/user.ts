import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export type UserDocument = mongoose.Document & {
  email: string;
  username: string;
  passwordHash: string;
  notes: mongoose.Schema.Types.ObjectId[];
  folders: mongoose.Schema.Types.ObjectId[];
};

const userSchema = new mongoose.Schema<UserDocument>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  notes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
  }],
  folders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }]
})

userSchema.plugin(uniqueValidator)
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

export const User = mongoose.model<UserDocument>("User", userSchema);
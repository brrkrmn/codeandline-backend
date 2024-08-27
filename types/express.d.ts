import { FolderDocument } from "../models/folder";
import { UserDocument } from "../models/user";

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDocument | null;
    token?: string;
    folder?: FolderDocument | null;
  }
}
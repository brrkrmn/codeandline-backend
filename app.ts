import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import foldersRouter from './controllers/folders';
import loginRouter from './controllers/login';
import notesRouter from './controllers/notes';
import signupRouter from './controllers/signup';
import { MONGODB_URI } from './utils/config';
import { errorHandler, requestLogger, tokenExtractor, unknownEndpoint, userExtractor } from './utils/middleware';
const app = express()

mongoose.set('strictQuery', false);
console.log('Connecting to MONGODB...');

mongoose.connect(MONGODB_URI as string)
    .then(result => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB: ', error.message)
    });


app.use(express.json())
app.use(cors());

app.use(requestLogger)

app.use('/api/signup', signupRouter)
app.use('/api/login', loginRouter)
app.use('/api/notes', tokenExtractor, userExtractor, notesRouter)
app.use('/api/folders', tokenExtractor, userExtractor, foldersRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

export default app
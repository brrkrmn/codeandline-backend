"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const folder_1 = __importDefault(require("../models/folder"));
const note_1 = __importDefault(require("../models/note"));
const middleware_1 = require("../utils/middleware");
const notesRouter = (0, express_1.Router)();
notesRouter.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = request.user;
    const userNotes = yield note_1.default
        .find({ user: user._id }).populate('user').populate('folder');
    response.json(userNotes);
}));
notesRouter.get('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const note = yield note_1.default.findById(request.params.id).populate('user').populate('folder');
    const user = request.user;
    if (note.user.id === user.id) {
        response.json(note);
    }
    else {
        response.status(403).json({ error: 'Unauthorized' });
    }
}));
notesRouter.post('/', middleware_1.folderExtractor, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const user = request.user;
    const folder = request.folder;
    const note = new note_1.default({
        title: body.title,
        description: body.description,
        folder: body.folder || null,
        code: body.code,
        entries: body.entries,
        public: body.public,
        user: user._id
    });
    const savedNote = yield note.save();
    user.notes = user.notes.concat(savedNote._id);
    yield user.save();
    if (folder) {
        folder.notes = folder.notes.concat(savedNote._id);
        yield folder.save();
    }
    response.status(201).json(savedNote);
}));
notesRouter.delete('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = request.user;
    const note = yield note_1.default.findById(request.params.id).populate('user').populate('folder');
    if (note.user.id !== user.id) {
        return response.status(403).json({ error: 'Unauthorized' });
    }
    yield note_1.default.findByIdAndRemove(request.params.id);
    user.notes = user.notes.pull(note.id);
    yield user.save();
    if (note.folder) {
        const folder = yield folder_1.default.findById(note.folder.id);
        folder.notes = folder.notes.pull(note.id);
        yield folder.save();
    }
    response.status(204).end();
}));
notesRouter.put('/:id', middleware_1.folderExtractor, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const user = request.user;
    const newFolder = request.folder;
    const note = yield note_1.default.findById(request.params.id).populate('user').populate('folder');
    const currentFolder = note.folder ? yield folder_1.default.findById(note.folder.id).populate('notes') : null;
    if (note.user.id !== user.id) {
        return response.status(403).json({ error: 'Unauthorized' });
    }
    const newNote = {
        title: body.title,
        description: body.description,
        folder: body.folder || null,
        code: body.code,
        entries: body.entries,
    };
    const updatedNote = yield note_1.default.findByIdAndUpdate(request.params.id, newNote, { new: true });
    if (newFolder) {
        if (currentFolder && newFolder.id !== currentFolder.id) {
            currentFolder.notes = currentFolder.notes.pull(updatedNote._id);
            yield currentFolder.save();
            newFolder.notes = newFolder.notes.concat(updatedNote._id);
            yield newFolder.save();
        }
        else if (!currentFolder) {
            newFolder.notes = newFolder.notes.concat(updatedNote._id);
            yield newFolder.save();
        }
    }
    else {
        if (currentFolder) {
            currentFolder.notes = currentFolder.notes.pull(updatedNote._id);
            yield currentFolder.save();
        }
    }
    response.status(200).json(updatedNote);
}));
exports.default = notesRouter;

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
const foldersRouter = (0, express_1.Router)();
foldersRouter.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = request.user;
    const userFolders = yield folder_1.default
        .find({ user: user._id }).populate('user').populate('notes');
    response.json(userFolders);
}));
foldersRouter.get('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const folder = yield folder_1.default.findById(request.params.id).populate('user').populate('notes');
    const user = request.user;
    if (folder.user.id === user.id) {
        response.json(folder);
    }
    else {
        response.status(403).json({ error: 'Unauthorized' });
    }
}));
foldersRouter.post('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const user = request.user;
    const folder = new folder_1.default({
        title: body.title,
        description: body.description,
        notes: body.notes || [],
        public: body.public,
        user: user._id
    });
    const savedFolder = yield folder.save();
    user.folders = user.folders.concat(savedFolder._id);
    yield user.save();
    response.status(201).json(savedFolder);
}));
foldersRouter.delete('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = request.user;
    const folder = yield folder_1.default.findById(request.params.id).populate('user');
    if (folder.user.id !== user.id) {
        return response.status(403).json({ error: 'Unauthorized' });
    }
    yield folder_1.default.findByIdAndRemove(request.params.id);
    user.folders = user.folders.pull(folder.id);
    yield user.save();
    response.status(204).end();
}));
foldersRouter.put('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const user = request.user;
    const folder = yield folder_1.default.findById(request.params.id).populate('user');
    if (folder.user.id !== user.id) {
        return response.status(403).json({ error: 'Unauthorized' });
    }
    const newFolder = {
        title: body.title,
        description: body.description
    };
    const updatedFolder = yield folder_1.default.findByIdAndUpdate(request.params.id, newFolder, { new: true });
    response.status(200).json(updatedFolder);
}));
exports.default = foldersRouter;

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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const folder_1 = __importDefault(require("../../models/folder"));
const note_1 = __importDefault(require("../../models/note"));
const helper_1 = require("../helper");
const api = (0, supertest_1.default)(app_1.default);
describe('authenticated user', () => {
    let token;
    let firstNote;
    let firstFolder;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.initializeUser)();
        yield (0, helper_1.initializeNote)();
        yield (0, helper_1.initializeFolder)();
        const response = yield api
            .post('/api/login')
            .send({
            username: 'firstUser',
            password: 'firstPassword'
        });
        token = response.body.token;
        firstNote = yield note_1.default.findOne({});
        firstFolder = yield folder_1.default.findOne({});
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.clearDB)();
    }));
    test('succeeds to view all notes', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(response.body).toHaveLength(1);
    }));
    test('succeeds to view note details', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api
            .get(`/api/notes/${firstNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(response.body.id).toBe(firstNote.id);
    }));
    test('succeeds to create note', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
            title: 'newNote',
            code: "new code line",
            entries: [{
                    lineNumbers: [1, 2],
                    content: "new content for lines 1 and 2."
                }],
            folder: firstFolder.id
        })
            .expect(201)
            .expect('Content-Type', /application\/json/);
        const updatedFolder = yield folder_1.default.findOne({});
        expect(updatedFolder.notes).toHaveLength(1);
    }));
    test('succeeds to delete note', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .delete(`/api/notes/${firstNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);
        const updatedFolder = yield folder_1.default.findOne({});
        expect(updatedFolder.notes).toHaveLength(0);
    }));
    test('succeeds to edit note', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .put(`/api/notes/${firstNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'newTitle', description: 'newDescription', code: 'new code line', folder: firstFolder.id })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(res => expect(res.body.title).toContain('newTitle'));
        const updatedFolder = yield folder_1.default.findOne({});
        expect(updatedFolder.notes).toHaveLength(1);
    }));
});
describe('folders are correctly updated', () => {
    let token;
    let firstNote;
    let firstFolder;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.initializeUser)();
        yield (0, helper_1.initializeNote)();
        yield (0, helper_1.initializeFolder)();
        const response = yield api
            .post('/api/login')
            .send({
            username: 'firstUser',
            password: 'firstPassword'
        });
        token = response.body.token;
        firstNote = yield note_1.default.findOne({});
        firstFolder = yield folder_1.default.findOne({ title: 'firstFolder' });
        firstNote.folder = firstFolder.id;
        yield firstNote.save();
        firstFolder.notes = firstFolder.notes.concat(firstNote.id);
        yield firstFolder.save();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.clearDB)();
    }));
    test('after note deletion', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .delete(`/api/notes/${firstNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);
        const updatedFolder = yield folder_1.default.findOne({});
        expect(updatedFolder.notes).toHaveLength(0);
    }));
    test("after changing note's folder", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api
            .post('/api/folders')
            .set('Authorization', `Bearer ${token}`)
            .send({
            title: 'newFolder',
        });
        yield api
            .put(`/api/notes/${firstNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ folder: response.body.id })
            .expect(200)
            .expect('Content-Type', /application\/json/);
        const updatedNote = yield note_1.default.findOne({});
        const updatedNewFolder = yield folder_1.default.findOne({ title: 'newFolder' });
        const updatedFirstFolder = yield folder_1.default.findOne({ title: 'firstFolder' });
        expect(updatedNote.folder.toString()).toEqual(updatedNewFolder.id.toString());
        expect(updatedNewFolder.notes).toHaveLength(1);
        expect(updatedFirstFolder.notes).toHaveLength(0);
    }));
    test("after removing note's folder", () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .put(`/api/notes/${firstNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ folder: null })
            .expect(200)
            .expect('Content-Type', /application\/json/);
        const updatedNote = yield note_1.default.findOne({});
        const updatedFolder = yield folder_1.default.findOne({});
        expect(updatedNote.folder).toBeNull();
        expect(updatedFolder.notes).toHaveLength(0);
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

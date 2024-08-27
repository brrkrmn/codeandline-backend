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
const app_1 = __importDefault(require("../app"));
const folder_1 = __importDefault(require("../models/folder"));
const note_1 = __importDefault(require("../models/note"));
const helper_1 = require("./helper");
const api = (0, supertest_1.default)(app_1.default);
describe('user', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.initializeUser)();
        yield (0, helper_1.initializeFolder)();
        yield (0, helper_1.initializeNote)();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.clearDB)();
    }));
    describe('with no token', () => {
        const checkAccessWithNoToken = (method, url) => __awaiter(void 0, void 0, void 0, function* () {
            yield api[method](url)
                .expect(401)
                .expect('Content-Type', /application\/json/)
                .then(res => expect(res.body.error).toContain('token is missing'));
        });
        test('fails to access folder routes', () => __awaiter(void 0, void 0, void 0, function* () {
            const firstFolder = yield folder_1.default.findOne({});
            checkAccessWithNoToken('get', '/api/folders');
            checkAccessWithNoToken('post', '/api/folders');
            checkAccessWithNoToken('get', `/api/folders/${firstFolder.id}`);
            checkAccessWithNoToken('delete', `/api/folders/${firstFolder.id}`);
            checkAccessWithNoToken('put', `/api/folders/${firstFolder.id}`);
        }));
        test('fails to access note routes', () => __awaiter(void 0, void 0, void 0, function* () {
            const firstNote = yield note_1.default.findOne({});
            checkAccessWithNoToken('get', '/api/notes');
            checkAccessWithNoToken('post', '/api/notes');
            checkAccessWithNoToken('get', `/api/notes/${firstNote.id}`);
            checkAccessWithNoToken('delete', `/api/notes/${firstNote.id}`);
            checkAccessWithNoToken('put', `/api/notes/${firstNote.id}`);
        }));
    });
    describe('with non-matching token', () => {
        let token;
        let firstNote;
        let firstFolder;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, helper_1.createNewUser)();
            const response = yield api
                .post('/api/login')
                .send({
                username: 'newUser',
                password: 'newPassword'
            });
            token = response.body.token;
            firstFolder = yield folder_1.default.findOne({});
            firstNote = yield note_1.default.findOne({});
        }));
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, helper_1.clearDB)();
        }));
        const checkUnauthorizedAccess = (method, url) => __awaiter(void 0, void 0, void 0, function* () {
            yield api[method](url)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)
                .expect('Content-Type', /application\/json/)
                .then(res => expect(res.body.error).toContain('Unauthorized'));
        });
        test('fails to view folder details', () => __awaiter(void 0, void 0, void 0, function* () {
            yield checkUnauthorizedAccess('get', `/api/folders/${firstFolder.id}`);
        }));
        test('fails to delete folder', () => __awaiter(void 0, void 0, void 0, function* () {
            yield checkUnauthorizedAccess('delete', `/api/folders/${firstFolder.id}`);
        }));
        test('fails to edit folder', () => __awaiter(void 0, void 0, void 0, function* () {
            yield checkUnauthorizedAccess('put', `/api/folders/${firstFolder.id}`);
        }));
        test('fails to see note details', () => __awaiter(void 0, void 0, void 0, function* () {
            yield checkUnauthorizedAccess('get', `/api/notes/${firstNote.id}`);
        }));
        test('fails to delete note', () => __awaiter(void 0, void 0, void 0, function* () {
            yield checkUnauthorizedAccess('delete', `/api/notes/${firstNote.id}`);
        }));
        test('fails to edit note', () => __awaiter(void 0, void 0, void 0, function* () {
            yield checkUnauthorizedAccess('put', `/api/notes/${firstNote.id}`);
        }));
    });
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

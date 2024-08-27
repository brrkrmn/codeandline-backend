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
const helper_1 = require("../helper");
const api = (0, supertest_1.default)(app_1.default);
describe('authenticated user', () => {
    let token;
    let firstFolder;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.initializeUser)();
        yield (0, helper_1.initializeFolder)();
        const response = yield api
            .post('/api/login')
            .send({
            username: 'firstUser',
            password: 'firstPassword'
        });
        token = response.body.token;
        firstFolder = yield folder_1.default.findOne({});
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.clearDB)();
    }));
    test('succeeds to view all folders', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api
            .get('/api/folders')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(response.body).toHaveLength(1);
    }));
    test('succeeds to view folder details', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api
            .get(`/api/folders/${firstFolder.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(response.body.id).toBe(firstFolder.id);
    }));
    test('succeeds to create folder', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .post('/api/folders')
            .set('Authorization', `Bearer ${token}`)
            .send({
            title: 'newFolder',
        })
            .expect(201)
            .expect('Content-Type', /application\/json/);
    }));
    test('succeds to delete folder', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .delete(`/api/folders/${firstFolder.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);
    }));
    test('succeeds to edit folder', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api
            .put(`/api/folders/${firstFolder.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'newTitle', description: 'newDescription' })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(res => expect(res.body.title).toContain('newTitle'));
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

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
const user_1 = __importDefault(require("../../models/user"));
const helper_1 = require("../helper");
const api = (0, supertest_1.default)(app_1.default);
describe('login', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_1.default.deleteMany({});
        yield (0, helper_1.initializeUser)();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.clearDB)();
    }));
    describe('with correct username and password', () => {
        let response;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const user = {
                username: 'firstUser',
                password: 'firstPassword'
            };
            response = yield api
                .post('/api/login')
                .send(user);
        }));
        test('succeeds', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/application\/json/);
        }));
        test('returns token, username, and email', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('username');
            expect(response.body).toHaveProperty('email');
        }));
    });
    test('fails with incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = {
            username: 'firstUser',
            password: 'wrongPassword'
        };
        const response = yield api
            .post('/api/login')
            .send(user)
            .expect(401)
            .expect('Content-Type', /text\/html/);
        expect(response.text).toContain("Invalid username or password");
    }));
    test('fails with nonexisting username', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = {
            username: 'nonExistingUsername',
            password: 'firstPassword'
        };
        const response = yield api
            .post('/api/login')
            .send(user)
            .expect(401)
            .expect('Content-Type', /text\/html/);
        expect(response.text).toContain("Invalid username or password");
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

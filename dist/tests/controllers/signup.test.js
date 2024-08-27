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
describe('signup', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_1.default.deleteMany({});
        yield (0, helper_1.initializeUser)();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, helper_1.clearDB)();
    }));
    test('succeeds with unique credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            username: 'newUser',
            email: 'newUser@test.com',
            password: 'newUser',
        };
        const createdUser = yield api
            .post('/api/signup')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);
        expect(yield (0, helper_1.isUserInDB)(createdUser.username)).toBeTruthy;
    }));
    test('fails with an existing email', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            username: 'newUser',
            email: 'firstUser@test.com',
            password: 'newUser',
        };
        const response = yield api
            .post('/api/signup')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /text\/html/);
        expect(response.text).toContain("There's already an account with this email");
        expect(yield (0, helper_1.isUserInDB)(newUser.username)).toBeFalsy;
    }));
    test('fails with an existing username', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            username: 'firstUser',
            email: 'newUser@test.com',
            password: 'newUser',
        };
        const response = yield api
            .post('/api/signup')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /text\/html/);
        expect(response.text).toContain("There's already an account with this username");
        expect(yield (0, helper_1.isUserInDB)(newUser.username)).toBeFalsy;
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

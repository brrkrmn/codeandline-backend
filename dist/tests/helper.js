"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.clearDB = exports.createNewUser = exports.initializeNote = exports.initializeFolder = exports.isUserInDB = exports.initializeUser = void 0;
const bcrypt = __importStar(require("bcrypt"));
const folder_1 = __importDefault(require("../models/folder"));
const note_1 = __importDefault(require("../models/note"));
const user_1 = __importDefault(require("../models/user"));
const initializeUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const passwordHash = yield bcrypt.hash('firstPassword', 10);
    const firstUser = new user_1.default({
        username: 'firstUser',
        email: 'firstUser@test.com',
        passwordHash: passwordHash
    });
    const savedUser = yield firstUser.save();
    return savedUser;
});
exports.initializeUser = initializeUser;
const isUserInDB = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.find({ username: username });
    if (user)
        return true;
    else
        false;
});
exports.isUserInDB = isUserInDB;
const initializeFolder = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({});
    const firstFolder = new folder_1.default({
        title: 'firstFolder',
        description: 'firstFolderDescription',
        user: user.id,
    });
    yield firstFolder.save();
});
exports.initializeFolder = initializeFolder;
const initializeNote = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({});
    const firstNote = new note_1.default({
        title: 'firstNote',
        description: 'firstNoteDescription',
        code: "First code line",
        entries: [
            {
                lineNumbers: [1, 2],
                content: "First content for lines 1 and 2."
            }
        ],
        user: user.id,
    });
    yield firstNote.save();
});
exports.initializeNote = initializeNote;
const createNewUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const passwordHash = yield bcrypt.hash('newPassword', 10);
    const newUser = new user_1.default({
        username: 'newUser',
        email: 'newUser@test.com',
        passwordHash: passwordHash
    });
    const savedUser = yield newUser.save();
    return savedUser;
});
exports.createNewUser = createNewUser;
const clearDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield folder_1.default.deleteMany({});
    yield note_1.default.deleteMany({});
    yield user_1.default.deleteMany({});
});
exports.clearDB = clearDB;

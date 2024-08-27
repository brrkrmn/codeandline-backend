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
exports.folderExtractor = exports.userExtractor = exports.tokenExtractor = exports.errorHandler = exports.unknownEndpoint = exports.requestLogger = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const folder_1 = __importDefault(require("../models/folder"));
const user_1 = __importDefault(require("../models/user"));
const requestLogger = (request, response, next) => {
    console.log('Method', request.method);
    console.log('Path', request.path);
    console.log('Body', request.body);
    next();
};
exports.requestLogger = requestLogger;
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
exports.unknownEndpoint = unknownEndpoint;
const errorHandler = (error, request, response, next) => {
    console.log('Error:', error.message);
    if (error.name === 'CastError') {
        return response
            .status(400)
            .send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        return response
            .status(400)
            .json({ error: error.message });
    }
    else if (error.name === 'JsonWebTokenError') {
        return response
            .status(401)
            .json({ error: error.message });
    }
    else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'token expired' });
    }
    next(error);
};
exports.errorHandler = errorHandler;
const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', '');
        request.token = token;
    }
    next();
};
exports.tokenExtractor = tokenExtractor;
const userExtractor = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!request.token) {
        return response.status(401).json({ error: 'token is missing' });
    }
    const decodedToken = jsonwebtoken_1.default.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'invalid token' });
    }
    const user = yield user_1.default.findById(decodedToken.id);
    request.user = user;
    next();
});
exports.userExtractor = userExtractor;
const folderExtractor = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const folderId = request.body.folder;
    if (folderId) {
        const folder = yield folder_1.default.findById(folderId);
        request.folder = folder;
    }
    else {
        request.folder = null;
    }
    next();
});
exports.folderExtractor = folderExtractor;

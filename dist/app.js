"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const mongoose_1 = __importDefault(require("mongoose"));
const folders_1 = __importDefault(require("./controllers/folders"));
const login_1 = __importDefault(require("./controllers/login"));
const notes_1 = __importDefault(require("./controllers/notes"));
const signup_1 = __importDefault(require("./controllers/signup"));
const config_1 = require("./utils/config");
const middleware_1 = require("./utils/middleware");
const app = (0, express_1.default)();
mongoose_1.default.set('strictQuery', false);
console.log('Connecting to MONGODB...');
mongoose_1.default.connect(config_1.MONGODB_URI)
    .then(result => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.log('Error connecting to MongoDB: ', error.message);
});
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(middleware_1.requestLogger);
app.use('/api/signup', signup_1.default);
app.use('/api/login', login_1.default);
app.use('/api/notes', middleware_1.tokenExtractor, middleware_1.userExtractor, notes_1.default);
app.use('/api/folders', middleware_1.tokenExtractor, middleware_1.userExtractor, folders_1.default);
app.use(middleware_1.unknownEndpoint);
app.use(middleware_1.errorHandler);
exports.default = app;

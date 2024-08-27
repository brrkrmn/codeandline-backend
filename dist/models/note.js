"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const entrySchema = new mongoose_1.default.Schema({
    lineNumbers: {
        type: Array,
    },
    content: {
        type: String,
        required: true,
    }
});
const noteSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    public: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        required: true,
    },
    entries: {
        type: [entrySchema]
    },
    folder: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    }
});
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject._v;
    }
});
exports.default = mongoose_1.default.model('Note', noteSchema);

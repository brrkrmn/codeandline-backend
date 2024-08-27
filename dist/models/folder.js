"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const folderSchema = new mongoose_1.default.Schema({
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
    notes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Note'
        }],
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
});
folderSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject._v;
    }
});
exports.default = mongoose_1.default.model('Folder', folderSchema);

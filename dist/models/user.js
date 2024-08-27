"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    notes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Note'
        }],
    folders: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Folder'
        }]
});
userSchema.plugin(mongoose_unique_validator_1.default);
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
    }
});
exports.default = mongoose_1.default.model('User', userSchema);

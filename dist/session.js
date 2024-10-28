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
exports.createSession = createSession;
const ioredis_1 = __importDefault(require("ioredis"));
const uuid_1 = require("uuid");
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
function createSession(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionId = (0, uuid_1.v4)();
        yield redis.set(sessionId, userId.toString(), 'EX', 3600);
        return sessionId;
    });
}

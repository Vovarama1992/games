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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const session_1 = require("../session");
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    try {
        yield client.connect();
        const result = yield client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rowCount === 0) {
            yield client.end();
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const user = result.rows[0];
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            yield client.end();
            return res.status(401).json({ error: 'Неверный пароль' });
        }
        const sessionId = yield (0, session_1.createSession)(user.id);
        res.json({ sessionId });
    }
    catch (error) {
        console.error('Ошибка при логине:', error);
        res.status(500).json({ error });
    }
    finally {
        yield client.end();
    }
}));
router.put('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, oldPassword, newPassword } = req.body;
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    try {
        yield client.connect();
        const result = yield client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rowCount === 0) {
            yield client.end();
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const user = result.rows[0];
        const passwordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password_hash);
        if (!passwordMatch) {
            yield client.end();
            return res.status(401).json({ error: 'Неверный старый пароль' });
        }
        const newPasswordHash = yield bcryptjs_1.default.hash(newPassword, 10);
        yield client.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newPasswordHash, username]);
        res.json({ message: 'Пароль успешно изменен' });
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    finally {
        yield client.end();
    }
}));
exports.default = router;

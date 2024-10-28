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
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, itemName, price } = req.body;
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    try {
        yield client.connect();
        yield client.query('BEGIN');
        const userResult = yield client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rowCount === 0) {
            yield client.end();
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const itemResult = yield client.query('SELECT * FROM items WHERE name = $1', [itemName]);
        if (itemResult.rowCount === 0) {
            yield client.end();
            return res.status(404).json({ error: 'Предмет не найден' });
        }
        const user = userResult.rows[0];
        const item = itemResult.rows[0];
        if (user.balance < price) {
            yield client.end();
            return res.status(400).json({ error: 'Недостаточно средств' });
        }
        const newBalance = user.balance - price;
        yield client.query('UPDATE users SET balance = $1 WHERE username = $2', [newBalance, username]);
        yield client.query('INSERT INTO purchases (user_id, item_id, price) VALUES ($1, $2, $3)', [user.id, item.id, price]);
        yield client.query('COMMIT');
        res.json({ message: 'Покупка успешна', newBalance });
    }
    catch (error) {
        yield client.query('ROLLBACK');
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    finally {
        yield client.end();
    }
}));
exports.default = router;

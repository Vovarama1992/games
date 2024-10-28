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
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    try {
        yield client.connect();
        const cachedItems = yield redis.get('items');
        if (cachedItems) {
            return res.json(JSON.parse(cachedItems));
        }
        const result = yield client.query(`
      SELECT name, tradable_price, non_tradable_price 
      FROM items
      WHERE tradable_price IS NOT NULL AND non_tradable_price IS NOT NULL
      ORDER BY tradable_price ASC, non_tradable_price ASC
      LIMIT 2
    `);
        const items = result.rows;
        yield redis.set('items', JSON.stringify(items), 'EX', 60 * 60);
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    finally {
        yield client.end();
    }
}));
exports.default = router;

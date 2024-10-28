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
const axios_1 = __importDefault(require("axios"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
function loadItems() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.skinport.com/v1/items');
            const items = response.data;
            for (const item of items) {
                if (item.market_hash_name) {
                    yield pool.query(`INSERT INTO items (item_id, name, tradable_price, non_tradable_price)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (item_id) DO NOTHING`, [
                        item.market_hash_name,
                        item.market_hash_name,
                        item.min_price,
                        item.suggested_price
                    ]);
                }
                else {
                    console.warn(`Пропуск предмета с отсутствующим market_hash_name:`, item);
                }
            }
            console.log('Данные успешно загружены в базу данных');
        }
        catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
        finally {
            yield pool.end();
        }
    });
}
loadItems();

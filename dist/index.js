"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const items_1 = __importDefault(require("./routes/items"));
const purchase_1 = __importDefault(require("./routes/purchase"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
app.get('/status', (req, res) => {
    res.send({ status: 'Server is running' });
});
app.use('/auth', auth_1.default);
console.log('Auth routes mounted');
app.use('/items', items_1.default);
console.log('Item routes mounted');
app.use('/purchase', purchase_1.default);
console.log('Purchase routes mounted');
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

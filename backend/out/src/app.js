"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = __importDefault(require("./utils/config"));
const middleware_1 = __importDefault(require("./utils/middleware"));
const users_1 = __importDefault(require("./controllers/users"));
const login_1 = __importDefault(require("./controllers/login"));
const games_1 = __importDefault(require("./controllers/games"));
const rooms_1 = __importDefault(require("./controllers/rooms"));
const app = (0, express_1.default)();
mongoose_1.default.set("strictQuery", false);
if (config_1.default.MONGODB_URI) {
    mongoose_1.default
        .connect(config_1.default.MONGODB_URI, {
        dbName: config_1.default.MONGODB_DBNAME,
    })
        .catch((error) => {
        logger_1.default.error(`Error connecting to MongoDB: ${error.message}`);
    });
}
const clientBuildPath = node_path_1.default.join(__dirname, "dist");
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(middleware_1.default.requestLogger);
app.use(express_1.default.static(clientBuildPath));
app.use("/api/login", login_1.default);
app.use("/api/users", users_1.default);
app.use("api/games", games_1.default);
app.use("api/rooms", rooms_1.default);
// Las rutas API inexistentes deben responder 404,
// no recibir el index.html de React.
app.use("/api", middleware_1.default.unknownEndpoint);
// Fallback para React Router.
// La expresión regular funciona con Express 4 y Express 5.
app.get(/.*/, (_req, res, next) => {
    res.sendFile(node_path_1.default.join(clientBuildPath, "index.html"), (error) => {
        if (error)
            next(error);
    });
});
app.use(middleware_1.default.errorHandler);
exports.default = app;

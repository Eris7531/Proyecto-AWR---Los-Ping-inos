"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const supertest_1 = __importDefault(require("supertest"));
const users_1 = __importDefault(require("../../src/models/users"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const node_test_1 = __importStar(require("node:test"));
const app_1 = __importDefault(require("../../src/app"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_assert_1 = __importDefault(require("node:assert"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../src/utils/config"));
const api = (0, supertest_1.default)(app_1.default);
const user = {
    username: "root",
    password: "sekret",
};
const login = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api
        .post("/api/login")
        .send(user);
    return result;
});
(0, node_test_1.describe)("when there is initially one user in db", () => {
    (0, node_test_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield users_1.default.deleteMany({});
        const passwordHash = yield bcrypt_1.default.hash("sekret", 10);
        const user = new users_1.default({ username: "root", passwordHash });
        yield user.save();
    }));
    (0, node_test_1.describe)("When login succeeds with valid credentials", () => {
        (0, node_test_1.default)("Check username in response body", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield login(user);
            node_assert_1.default.strictEqual(result.status, 200);
            node_assert_1.default.match(result.headers["content-type"], /application\/json/);
            (0, node_assert_1.default)(result.body.username === user.username);
        }));
        (0, node_test_1.default)("Check CSRF header", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield login(user);
            const csrfToken = result.headers["x-csrf-token"];
            (0, node_assert_1.default)(typeof csrfToken === "string", "Missing X-CSRF-Token header");
            (0, node_assert_1.default)(csrfToken.length > 10, "CSRF token too short");
        }));
        (0, node_test_1.default)("Check JWT in cookie", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const result = yield login(user);
            const csrfToken = result.headers["x-csrf-token"];
            const setCookie = result.headers["set-cookie"];
            (0, node_assert_1.default)(Array.isArray(setCookie), "Set-Cookie header missing");
            const jwtValue = (_a = setCookie[0].match(/token=([^;]+)/)) === null || _a === void 0 ? void 0 : _a[1];
            (0, node_assert_1.default)(jwtValue, "JWT not found in cookie");
            const payload = jsonwebtoken_1.default.verify(jwtValue, config_1.default.JWT_SECRET);
            (0, node_assert_1.default)(payload && typeof payload === "object");
            node_assert_1.default.strictEqual(payload.username, user.username);
            node_assert_1.default.strictEqual(payload.csrf, csrfToken);
        }));
    });
    (0, node_test_1.describe)("When login fails with invalid credentials", () => {
        (0, node_test_1.default)("Check status code", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield login({
                username: "root",
                password: "wrongpassword",
            });
            node_assert_1.default.strictEqual(result.status, 401);
        }));
    });
});
(0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

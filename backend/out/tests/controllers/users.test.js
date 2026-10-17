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
const test_utils_1 = __importDefault(require("./test_utils"));
const node_assert_1 = __importDefault(require("node:assert"));
const api = (0, supertest_1.default)(app_1.default);
(0, node_test_1.describe)("when there is initially one user in db", () => {
    (0, node_test_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield users_1.default.deleteMany({});
        const passwordHash = yield bcrypt_1.default.hash("sekret", 10);
        const user = new users_1.default({ username: "root", passwordHash });
        yield user.save();
    }));
    // aca van los tests
    (0, node_test_1.default)("creation succeeds with a fresh username", () => __awaiter(void 0, void 0, void 0, function* () {
        const usersAtStart = yield test_utils_1.default.usersInDb();
        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "salainen",
        };
        yield api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/);
        const usersAtEnd = yield test_utils_1.default.usersInDb();
        node_assert_1.default.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
        const usernames = usersAtEnd.map((u) => u.username);
        (0, node_assert_1.default)(usernames.includes(newUser.username));
    }));
    (0, node_test_1.default)("creation fails with proper statuscode and message if username already taken", () => __awaiter(void 0, void 0, void 0, function* () {
        const usersAtStart = yield test_utils_1.default.usersInDb();
        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen",
        };
        const result = yield api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);
        const usersAtEnd = yield test_utils_1.default.usersInDb();
        (0, node_assert_1.default)(result.body.error.includes("expected `username` to be unique"));
        node_assert_1.default.strictEqual(usersAtEnd.length, usersAtStart.length);
    }));
});
(0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));

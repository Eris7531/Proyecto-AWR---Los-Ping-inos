import supertest from "supertest";
import User from "../../src/models/users";
import bcrypt from "bcrypt";
import test, { after, beforeEach, describe } from "node:test";
import app from "../../src/app";
import mongoose from "mongoose";
import helper from "./test_utils";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import config from "../../src/utils/config";

const api = supertest(app);

const user = {
  username: "root",
  password: "sekret",
};

const login = async (user: { username: string; password: string }) => {
  const result = await api
    .post("/api/login")
    .send(user);
  return result;
};

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  describe("When login succeeds with valid credentials", () => {
    test("Check username in response body", async () => {
      const result = await login(user);
      assert.strictEqual(result.status, 200);
      assert.match(result.headers["content-type"], /application\/json/);

      assert(result.body.username === user.username);
    });
    test("Check CSRF header", async () => {
      const result = await login(user);
      const csrfToken = result.headers["x-csrf-token"];
      assert(typeof csrfToken === "string", "Missing X-CSRF-Token header");
      assert(csrfToken.length > 10, "CSRF token too short");
    });

    test("Check JWT in cookie", async () => {
      const result = await login(user);
      const csrfToken = result.headers["x-csrf-token"];
      const setCookie = result.headers["set-cookie"];
      assert(Array.isArray(setCookie), "Set-Cookie header missing");
      const jwtValue = setCookie[0].match(/token=([^;]+)/)?.[1];
      assert(jwtValue, "JWT not found in cookie");
      const payload = jwt.verify(jwtValue, config.JWT_SECRET!);
      assert(payload && typeof payload === "object");
      assert.strictEqual(payload.username, user.username);
      assert.strictEqual(payload.csrf, csrfToken);
    });
  });
  describe("When login fails with invalid credentials", () => {
    test("Check status code", async () => {
      const result = await login({
        username: "root",
        password: "wrongpassword",
      });
      assert.strictEqual(result.status, 401);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
import dotenv from "dotenv";
dotenv.config();


const NODE_ENV = process.env.NODE_ENV || "development";
const isTest = NODE_ENV === "test";
const JWT_SECRET = process.env.JWT_SECRET || "my_secret"

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

const MONGODB_URI = isTest
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const MONGODB_DBNAME = isTest
    ? process.env.TEST_MONGODB_DBNAME 
    : process.env.MONGODB_DBNAME;

if (isTest && (!MONGODB_URI || !MONGODB_DBNAME)) {
  throw new Error(
    "TEST_MONGODB_URI y TEST_MONGODB_DBNAME deben configurarse para NODE_ENV=test",
  );
}

export default { NODE_ENV, PORT, MONGODB_URI, HOST, JWT_SECRET, MONGODB_DBNAME };

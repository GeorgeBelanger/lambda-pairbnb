// index.js
import serverless from "serverless-http";
import express from "express";
import path from "path";

// import middleware
import renderer from "./middleware/renderer";
const app = express();

// root (/) should always serve our server rendered page
app.use("^/$", renderer);

// serve static assets
app.use(express.static(path.join(__dirname, "PairBNB", "./build")));

// handler
export const handler = serverless(app);
// renderer.js
import fs from "fs";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router"

// import main App component
import App from "../PairBNB/src/App";
import "../pairbnb/build/static/css/main.b48cd46e.css"
export default (req, res, next) => {

  // point build index.html
  const filePath = path.resolve("PairBNB", "./build", "index.html");

// read in html file
  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      return res.send(err).end();
    }

    // render the app as a string
    const context = {}
    const html = ReactDOMServer.renderToString(
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>);

    // inject the rendered app into our html and send it
    return res.send(
      
      // replace default html with rendered html
      htmlData.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    );
  });
};
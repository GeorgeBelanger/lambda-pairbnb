## Wednesday 2/13/19 4:30pm quill
  - Today going to work on getting my projects hosted on lambda. The deadline is 22nd for my aws free teir I think but I can host on netlify if this doesn't happen before then. 
    - I still hadn't decided on which guide to use first, because I need to host a CRA app and also a node + express app.
      - I'm going to first do the create-react-app https://medium.com/@YatinBadal/rendering-and-serving-a-create-react-app-from-an-express-server-running-within-a-lambda-function-832576a5167e I was hesitant to do this one first because all the babel and webpack stuff is handled for me in CRA and I hadn't messed with it but it will be a good idea to get into it. 
      - Then node & express using the video guide here https://www.youtube.com/watch?v=71cd5XerKss&t=131s because the freecodecamp guide was using something called Claudia and I want to reduce this to the smallest amount of packages. Article found here https://medium.freecodecamp.org/express-js-and-aws-lambda-a-serverless-love-story-7c77ba0eaa35
  - Here we go with the CRA serverless.
    - Found out it is going to be server side rendered *thumbsupemoji*
    - Running `npm install -g serverless`
    - Following this video guide on setting up AWS credentials https://www.youtube.com/watch?v=KngM5bfpttA
     - Using my George user that I used for EC2
     - Added admin access permission
     - Created new access key id
     - ran `serverless config credentials --provider aws --key AKIAIGDYWOMU3DBIQP3Q --secret *****`
    - Ran `echo. > serverless.yml` to make our file
    - Ran `npm i -S serverless-http express` to install express and serverless-http
    - Ran `npm i -D webpack serverless-webpack serverless-offline webpack-node-externals` because 
    >We also want to install the serverless-webpack plugin which will help use all the shiny new JS. The serverless-offline plugin will allow us to deploy our Serverless stack locally. We will use webpack-node-externals to exclude node_modules from our build.
    - Copy pasted into serverless.yml 
    ```yaml
    //serverless.yml

    service: my-project
    plugins:
      - serverless-webpack
      - serverless-offline
    custom:
      webpack:
        webpackConfig: ./webpack.config.js
        includeModules: true
        packager: 'npm'
    provider:
      name: aws
      runtime: nodejs8.10
      stage: dev
      region: eu-west-1
    functions:
      app:
        handler: index.handler
        events:
          - http: ANY /
          - http: 'ANY {proxy+}'
          - cors: true
    ```
      - On first look this shows the path for the webpack config, which I assume is in node_modules. 
        - After writing this I now realize we aren't going to be using react-scripts start anymore
      - I updated `runtime: nodejs8.10` to nodejs10.14.1 and `region: eu-west-1` to us-east-1
      - I see we have the index.handler and that's it. Also CORS is true which will save us headache. 
    - Changing our index.js next. 
      - Changed our index.js file and commented out all the CRA code. Wondering if we should use a service worker? 
    - Ran `echo.> webpack.config.js`
    - Ran `npm i -D babel-core babel-loader babel-plugin-source-map-support babel-preset-env` to install the babel transpiler. To make it ECMA2015 friendly right? 
    - Copied this into webpack.config.js
    ```javascript
    // webpack.config.js
    const path = require("path");
    const slsw = require("serverless-webpack");
    const nodeExternals = require("webpack-node-externals");
    module.exports = {
      entry: slsw.lib.entries,
      target: "node",
      mode: slsw.lib.webpack.isLocal ? "development" : "production",
      optimization: {
        // We do not want to minimize our code.
        minimize: false
      },
      performance: {
        // Turn off size warnings for entry points
        hints: false
      },
      devtool: "nosources-source-map",
      externals: [nodeExternals()],
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader"
              }
            ]
          }
        ]
      },
      output: {
        libraryTarget: "commonjs2",
        path: path.join(__dirname, ".webpack"),
        filename: "[name].js",
        sourceMapFilename: "[file].map"
      }
    };
    ```
      - First thoughts looking at this: 
        - I see that if we aren't running locally then webpack is running in production, but the serverless is always in dev mode. 
        - I see that node_modules are excluded and that we are going to have a commonjs2.webpack file?
    - Going to run `sls offline start` and that should give us our hello world. If it gives me my entire app I will be so pumped 
      | Get the error 
      >Y A M L Exception --------------------------------------
      >
      >end of the stream or a document separator is expected in "C:\my_developments\lambda-pairbnb\PairBNB\serverless.yml" at line 3, column 8:
      >  service: my-project
    @| Got rid of the //comment at the beginning and now I get the error `serverless error --------- No matching handler found for 'index' in 'C:\my_developments\lambda-pairbnb\PairBNB'. Check your service definition.`
      - I assume this is because my index.js in inside of /src
    @ Ran `echo.> index.js` in my root folder and then copied all the index.js code into it
    - And we have hello world at localhost:3000
    - "Run `$ create-react-app client` This should create a client directory containing a react application."
      - I already have CRA all made except we are in the root of that directory that would be client. Not sure if I have to go up a folder yet. 
      - The guide is asking to create a folder called middleware and put renderer.js in it. I will do that now. 
        - In renderer.js changing `import App from "../client/src/App";` to `import App from "../src/App";`
        - Not sure about `const filePath = path.resolve("client", "./build", "index.html");` specifically the `"client", "./build"`part because my app folder doesn't have client in it. Will leave it as is for now. 
    - Changing `/index.js` again. Again worried about having `client` in there
    - Reverted `src/index.js` to it's normal self. 
    - Ran `npm i -D babel-plugin-css-modules-transform babel-preset-es2015 babel-preset-react-app babel-preset-stage-2 babel-preset-env url-loader copy-webpack-plugin`
    - Changing `webpack.config.js` 
    - Running `sls offline start` again and expect to see an error related to client
      | Error `ERROR in [copy-webpack-plugin] unable to locate 'client/build' at 'C:\my_developments\lambda-pairbnb\PairBNB\client\build'`
      - Not sure where my build folder is going. Going to have to check the webpack file 
        - Changing `new CopyWebpackPlugin([{ from: "client/build", to: "build" }], {` to `new CopyWebpackPlugin([{ from: "src/build", to: "build" }], {`
        - Now getting `ERROR in [copy-webpack-plugin] unable to locate 'src/build' at 'C:\my_developments\lambda-pairbnb\PairBNB\src\build'`
          - Changed client to src in both renderer and index but now realizing that the build is located in `/public`
            - Changed client or src in all 3 files to public.
            - Still getting `[copy-webpack-plugin] WARNING - unable to locate 'public/build' at 'C:\my_developments\lambda-pairbnb\PairBNB\public\build'`
            - Going to try to change it from public/build to /build because our CRA package.json is in root whereas his is in client
      - Perhaps this is because I never ran npm install and we don't have react-scripts build
      | Ran into `Cannot read property 'thisCompilation' of undefined` after running npm install and npm run-script build to make my build file.
        @ Found this on github issue report from Dan Abramov here https://github.com/facebook/create-react-app/issues/4076
        > If you have `react-scripts` in `package.json`, make sure you _don't_ have `webpack` in it
        - Based on this, I am just going to move my middleware and my serverless/webpack stuff up a folder. 
          - Lots of people saying just delete node_modules and use yarn install but I don't like that answer. 
          - Delete .webpack
          - Move middleware up a folder
          - Move serverless.yml up a folder 
          - Move index.js up a folder.
          - As for package.json....
            - Considering just moving up a folder and following all the run commands from the guide and also copy pasting from my previous pairbnb into the current package.json 
          - When he said install react dependencies `npm i -S react react-dom react-scripts` I'm not sure where he meant to do that!
            - Going to go into pairbnb and run npm install instead of doing the above anywhere
          - Still not sure where to run build. 
            ?? Ran npm install babel stuff in the wrong folder and I'm not sure if terminate batch job is transactional or if the 2 seconds that happened before I stopped it did something. Going to say no because there is nothing changed in my package.json
      | Ran npm run-script build inside pairbnb and got `Failed to minify the code from this file: ./node_modules/dotenv/lib/main.js:28`
        - Found this issue that says that some npm packages can't be compiled to ES5 and then someone said "see #261 dotenv is not intended for browser environments" https://github.com/motdotla/dotenv/issues/266
          - Not entirely sure what that means but for me it meants use something other than dotenv. 
          - Deleted dotenv from package.json and ran npm install
            - I still see dotenv in node_modules but it said it removed 1 package. 
            - Want to delete the folders in node_modules manually but will not. 
          @| Running build again. After deleting the dotenv line in app.js Run build again and Successfully compied and we have a build folder now. 
            - Concerned here because the public index.html has scripts in it. 
          - Running sls offline start. 
            - Got a bunch of `[copy-webpack-plugin] determined that 'C:/my_developments/lambda-pairbnb/PairBNB/build/asset-manifest.json' should write to 'build/asset-manifest.json'`
            | Error: Plugin/Preset files are not allowed to export objects, only functions. In C:\my_developments\lambda-pairbnb\node_modules\babel-preset-es2015\lib\index.js
          - Has something to do with @babel/core(babel7) and babel-core(babel6) but I am out of time. https://github.com/babel/babel/issues/8838

## 2/14/19 thursday 9:00pm home
  - Doing my timesheet. I think the babel issue comes from @babel/core and babel-core in between package json in pairbnb and in parent folder.

## 2/15/19 Friday 8:00am home
  - Taking a whack at the babel issue for 15 minutes.
    - Ran `npm ls babel` to see what version I'm on. it shows --(empty)
      ?? Not sure why it has this behavior. It should show everything in every folder recursively right?
      @ "When ls is run as ll or la, it shows extended information by default."
    | Running `npm ls @babel` gives an error Unhandled rejection Error: Invalid tag name "@babel": Tags may not have any characters that encodeURIComponent encodes. npm ERR! cb() never called!   npm ERR! This is an error with npm itself. Please report this error at:

## 2/17/19 Sunday 8:00pm home
  - A few things I want to try to get this babel config running
    - One is to just start over fresh and start out with the correct folder structure according to the guide
    - Another I tried that didn't work was changing "es2015" in presets under babel-loader in webpack.config.js to "env" because of this I see here https://babeljs.io/docs/en/v7-migration but this is talking about upgrading from 6 to 7 so I think this only applies to 7. 

      >babel-preset-es2015
      >babel-preset-es2016
      >babel-preset-es2017
      >babel-preset-latest
      >A combination of the above ^
      >These presets should be substituted with the "env" preset.
      >We are removing the stage presets in favor of explicit proposal usage. Can check the stage-0 README for more migration steps.
      >
      >To do this automatically you can run npx babel-upgrade (PR added here).
      - I do see that we have the presets/ plugins `presets: ["es2015", "react-app", "stage-2"], plugins: ["css-modules-transform"]`
      - Running `npx babel-upgrade`
        - Got this as the output
        ```
        🙌  Thanks for trying out https://github.com/babel/babel-upgrade!

        Updating closest package.json dependencies
        Index: C:\my_developments\lambda-pairbnb\package.json
        ===================================================================
        --- C:\my_developments\lambda-pairbnb\package.json      Before Upgrade
        +++ C:\my_developments\lambda-pairbnb\package.json      After Upgrade
        @@ -13,16 +13,23 @@
            "express": "^4.16.4",
            "serverless-http": "^1.9.0"
          },
          "devDependencies": {
        -    "babel-core": "7.0.0",
        +    "@babel/core": "^7.0.0",
        +    "@babel/plugin-proposal-class-properties": "^7.0.0",
        +    "@babel/plugin-proposal-decorators": "^7.0.0",
        +    "@babel/plugin-proposal-export-namespace-from": "^7.0.0",
        +    "@babel/plugin-proposal-function-sent": "^7.0.0",
        +    "@babel/plugin-proposal-json-strings": "^7.0.0",
        +    "@babel/plugin-proposal-numeric-separator": "^7.0.0",
        +    "@babel/plugin-proposal-throw-expressions": "^7.0.0",
        +    "@babel/plugin-syntax-dynamic-import": "^7.0.0",
        +    "@babel/plugin-syntax-import-meta": "^7.0.0",
        +    "@babel/preset-env": "^7.0.0",
            "babel-loader": "^8.0.5",
            "babel-plugin-css-modules-transform": "^1.6.2",
            "babel-plugin-source-map-support": "^2.0.1",
        -    "babel-preset-env": "^1.7.0",
        -    "babel-preset-es2015": "^6.24.1",
            "babel-preset-react-app": "^7.0.1",
        -    "babel-preset-stage-2": "^6.24.1",
            "copy-webpack-plugin": "^4.6.0",
            "serverless-offline": "^4.4.2",
            "serverless-webpack": "^5.2.0",
            "url-loader": "^1.1.2",
        ```
          - Not sure what the minuses mean but they are my presets lol
          - Trying sls offline start again
          - Still busted. 
          - Set es2015 to env and deleted stage-2, said NODE_ENV has to be set, set it to development then I got cannot read bindings of null and forum said also an issue with 6/7 but found this https://github.com/storybooks/storybook/issues/3937
            >After doing some digging (and reading this issue thread over on the Babel repository [babel/babel#7627](https://github.com/babel/babel/issues/7627)), it appears that this error is caused by a miss-match in Babel version (v6 vs v7).
            >
            >I was able to solve the issue with the following changes:
            >
            >package.json:
            >
            >* remove `babel-core: 7.0.0-bridge.0`
            >* install `@babel/core` (as of writing this comment, 7.0.0-beta.56 is the latest)
            >* install `@babel//preset-env` (as of writing this comment, 7.0.0-beta.56 is the latest)
            >  (note that it is important that the two Babel dependencies match in version)
            >
            >.babel.rc: delete this file
            >
            >babel.config.js
            >
            >* add `@babel/preset-env` to the presets array
            >
            >(all this was done using Vue CLI v3.0.0-rc.12 and Storybook CLI 4.0.0-alpha.16)
            >
            >pro tip: if you don't see any change in behaviour, try deleting your node_modules as well as package-lock.json file before running `npm install`
            - Going to do everything that is said here. I'm going to bed after either way. 
            - Ran `npm install --save-dev @babel/preset-env` and `npm install --save-dev @babel/core` and changed babel@core to 7.3.1 because they have to match. 
            - Deleted node_modules and package-lock.json and added @babel/preset-env to the presets array in webpack.config.js
              - Curious as to wether to delete es2015 and stage-2
              - I get `npm WARN deprecated babel-preset-es2015@6.24.1: 🙌  Thanks for using Babel: we recommend using babel-preset-env now: please read babeljs.io/env to update!` when I run npm install so I am going to remove es2015 and just use `@babel/preset-env` or `env`
            - Npm install
            - I guess I got past the previous issue by deleting "es2015" and "stage-2". But now I have several other issues. Will address them tomorrow. 

## 2/18/19 Monday 2:15pm home
  - Applying to jobs today
    - Followed up with job for developer/data engineer here https://www.5hdagency.com/
    - Sent an email on a full stack react job in Salt Lake City. 

## 2/19/19 Tuesday 8:00pm Home
  - Going to take another shot at this serverless start.
    - Errors I'm currently getting:
      - First off NODE_ENV isn't set and it seems I have to run SET NODE_ENV=development everytime I restart the cpu?
      | SyntaxError: Missing class properties transform.
        - First thing I find is that order of plugins matters. I don't have any of the plugins from stage-2 or stage-3 in right now. Will try to rearrange because es2015 which was replaced with env was before react. 
          @ Put  "@babel/preset-env" before "react-app" and I don't see this error anymore. 
      | Module not found: Error: Can't resolve 'react' or 'react-dom/server' in 'C:\my_developments\lambda-pairbnb\middleware'
        - This is because react and react-dom are used in our renderer file but I don't have them installed or listed on package.json.
          @ Added 'react' and 'react-dom' in my package.json and ran npm install
      | Module not found: Error: Can't resolve './Slider' in 'C:\my_developments\lambda-pairbnb\PairBNB\src\obnoxious-demo-for-react-router-animation-blog-post\src'
        - Tried renaming index.jsx to Slider.jsx
        - Tried a few different path options in import
        - Tried deleting the hooks.jsx file I had in that folder
          @ Realized this is because I only have a loader for .js files and not .jsx files. Changed the extension to .js and it didn't break
      | Module parse failed: Unexpected character '@' (1:0) You may need an appropriate loader to handle this file type. @import url(font-awesome.min.css);
        - Need to implement a css loader. 
          - Found out that loaders are deprecated and are from webpack 1 and rules are webpack 2. 
          @ implemented a css rule and installed `css-loader` in my package.json
      | ERROR in ./PairBNB/src/assets/fonts/fontawesome-webfont.woff?v=4.7.0 1:4
        - Got about 6 of these from my fonts folder.
          - Considering just using url links to the fonts instead of messing with a loader for .eot .svg .ttf .woff .woff2 and .otf  
          @ Ran `npm install file-loader --save-dev`
          @ Added these extensions to my webpack.config.js file according do this guide https://chriscourses.com/blog/loading-fonts-webpack
    - Finally got it to run locally without any errors in compile.
      - Now for the runtime errors:
        | "Error:",
          "fetch is not found globally and no fetcher passed, to fix pass a fetch for",
          "your environment like https://www.npmjs.com/package/node-fetch.",
          "",
          "For example:",
          "import fetch from 'node-fetch';",
          "import { createHttpLink } from 'apollo-link-http';",
          "",
          "const link = createHttpLink({ uri: '/graphql', fetch: fetch });",
          - This post talks about setting up node-fetch with apollo because it doesn't take links without proper formatting. https://stackoverflow.com/questions/50688998/using-apolloclient-with-node-js-fetch-is-not-found-globally-and-no-fetcher-pas
            - In ./pairbnb ran `npm install node-fetch, apollo-link-http, apollo-cache-inmemory`
            - Changed C:\my_developments\lambda-pairbnb\PairBNB\src\components\home.js to reflect the post, except didn't link API_URI. 
              | This caused a 404 error saying link is an unaccepted option for apollo. 
              @@ Had to make it the verbose mode of Apolloclient by changing `import ApolloClient from 'apollo-boost'` to `import { ApolloClient } from 'apollo-boost'`
        | "ReferenceError: window is not defined",
          - Getting this error and understand that window is the global in the browser and global is the global in node.js, but not sure how to change this to work with SSR.
            - Found this article and this resulting article: https://github.com/webpack/webpack/issues/7112 https://www.hacksparrow.com/global-variables-in-node-js.html
  | When I rename or delete a file in the side explorer in VS code it changes it but doesn't show the change in the explorer. 

## 2/20/19 Wednesday 3:30 glickman  
 - Trying to get my stuff hosted on lambda today
  ? Have to find out about git submodules
  | First error to deal with is "ReferenceError: window is not defined",
    - "variables declared with the var keyword remain local to a module; those declared without it get attached to the global object.
      - Going to try using https://www.npmjs.com/package/window-or-global where you import 'root' from 'window-or-global' and then use 'root' instead of 'global' or 'window' and then you can use it client side or server side without changing anything.  
        - Before I do this I want to see if I can just change a few things to global to see if it works. 
          @ Changed app.js window.jquery=jquery to global which seems to fix it because all the other files are using jQuery$window . 
            ? Going to come back and use window or global for this... But it seemed to work when I fired it client side anyway. 
  |Invariant Violation: Uncaught error: Element type is invalid: expected a string
    @ This was fixed because I was importing StaticRouter as a default export when I should have imported it like a named export {StaticRouter}
  |Invariant Violation: Uncaught error: Browser history needs a DOM
    - I read here that this is because react router uses BrowserRouter in a client side app and Static or ServerRouter on the serverside app https://github.com/ReactTraining/react-router/issues/4042
    @ I had to move BrowserRouter from app to index so it is only used in client fired apps and now I only have 1 router with each side I fire. 
  @ I now see html so my react code is working
    | No CSS Says mimetype is 'text/html' and not css mimetype
      - Says canceled in the network tab
      - Some said that <base href="/"> had an effect
      - Tried putting the CSS in the serverless-http routes
      - Says that .css files give mimetype text/css but .html files give text/html so my css is going into an html file somewhere??? The extension for the route is .css
    | No GraphQL Listings
    | No Js outside of the react js
      - All my js respond with 404 twice
      - I see that in pairbnb/build and in .webpack/build that they are all there in the root folder. 
      - In the source tab, there is no JS. Only index.html
      - In .webpack/index.js there is no mention of scrollex or the other deffered scripts
      - For the css file I get:
        - /***/ "./PairBNB/src/assets/css/main.css":
          /*!*****************************************!*\
            !*** ./PairBNB/src/assets/css/main.css ***!
            \*****************************************/
          /*! no static exports found */
          /***/ (function(module, exports, __webpack_require__) {

          exports = module.exports = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
          // Imports
          exports.i(__webpack_require__(/*! -!../../../../node_modules/css-loader/dist/cjs.js!./font-awesome.min.css */ "./node_modules/css-loader/dist/cjs.js!./PairBNB/src/assets/css/font-awesome.min.css"), "");
          exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300italic,600,600italic);", ""]);
          var urlEscape = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/url-escape.js */ "./node_modules/css-loader/dist/runtime/url-escape.js");
          var ___CSS_LOADER_URL___0___ = urlEscape(__webpack_require__(/*! ../../images/DSC03456.JPG */ "./PairBNB/src/images/DSC03456.JPG"));

          // Module which ends up being a superr long ass thing. It's module.exports[module.i] and then everything in the css file. 
    | Can't go to /about
      - For some reason in the headers I get `content-security-policy: default-src 'self'` which I do not get in /
  


  |@ Sperryfarms doesn't connect without www. now
  | Pairbnb won't connect at http://ec2-18-191-187-105.us-east-2.compute.amazonaws.com:3001/ but is running 
    - Tried adding www.
    - Tried restarting it in pm2
    - Uploading it to netlify right now
    - I think the plan should be to get the lambda app working ASAP 
    @ Just started working fine again after I accessed it with my phone. Very annoying that I don't know wtf happened. 
      | Still doesn't work on my computer. 

## 2/21/19 Thursday 4:00pm Glickman 
  - Going to get back in the lambda sattle again today
    - Messing around with the deferred js scripts in index.html, but should work on the css first. 
    - Tried messing around with a few things:
      - First for the CSS I removed the comments and @ symbols at the top to see if it would change the mimetype
      - Then I went in to serverless.yml and changed the http handler events around and included /about, but now I am realizing that they all just fire root folder ./index.js which says it uses ... ... ... build. Let me try putting some of these files into the root folder and see what happens maybe I just need to change the routes in index. 
      - I tried in the index.js folder and it didn't work. 
      - The mimetype makes me think that it is finding the CSS file but when I go to the CSS file directly it says cannot get and says 404
      - It has to be that the files aren't wherever local host is. Because I have the routes set up for GET /about and it still 404's

## 2/22/19 Friday 3:00pm Glickman 
  - Today have to do timesheets and then will work on serverless 
    - Going to try moving the JS files around in the pairbnb build because all that's being done is copying the build to the lambda .webpack folder
      - Deleted the files from the src/assets/js folder because they are in the public folder and used from there
        - I think that all files that aren't used are shaken from the tree- that's why we don't see the scss files or folder in the build pack
        - Perhaps I should go back to trying to import the js files without using script tags...
          - Still would rely on main.js 
            - Potentially could make an npm package out of it???? 
          - We know that npm run build includes the index.html file in the public folder because the index.html file in the .webpack folder has the script tags. 
          - Going to try running serve in paribnb and see what happens
            - Runs exactly like npm start except that when I delete the @import fontawesome line in main.css the icons still work in production but not in development. 
          - Tried removing the imports from the main.css file then building with pairbnb to get rid of the comments in the css build file but it didn't do anything we still get the mimetype error. 
          > http://localhost:3000/src/css/component.css by this way you can't access the file , it will consider this as route and try to give you html
          - The build for pairbnb must work because serve -s starts from index.html and works from the build folder while sls starts from index.js and works from there. 
            - Perhaps if I change the pairbnb index.html after the build to change the routes for things to /build/util.js it may work... 
              - Changing the path from /jquery.min.js to /build/jquery.min.js didn't help
                - I think that everything is supposed to come from index.js and it doesn't have to call for anything which is weird for images, but there is an image folder.  
          - This may have been established already but none of my js files are making into index.js
            - The main.js build only has things from app.js in it
            - index.html in the build folder creates a stylesheet link to the compiled css which works fine here but in the serverless configuation the only thing I have access to is index.js....
        @ The only file I have access to is index.js for some reason. 
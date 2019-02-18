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
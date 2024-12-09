---
title: Server-Side Rendering in Angular
slug: server-side-rendering-in-angular
description: SEO and quick initial page loading with server-side rendering in angular
hashtags: [angular, ssr]
createdAt: Aug 06, 2022
source: https://github.com/panesarpbx8/express-typescript-setup
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://panesarpbx8.vercel.app
published: true
---

## Create new project

Create a new angular project. This step can be skipped if you already have a angular project up and running.

```css
$ ng new your-project-name
```

## Setup Angular Universal

Angular Universal is official library to turn any client rendered Angular app into server side rendered. SSR (Server Side Rendering) is often used for SEO (Search Engine Optimization) so that link crawlers can read meta tags and content on a web app. Run below schematic through command line to add Angular Universal into your project. Under the hood, Angular Universal is using Expressjs to render our Angular application.

```css
$ ng add @nguniversal/express-engine
```

## Updates to your project

Above schematic will add and update some files in your Angular project. For now, go into your package.json and observe new scripts related to SSR.

```ts
'package.json'

"scripts": {
  "ng": "ng",
  "start": "npm run serve:ssr",
  "build": "npm run build:ssr",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "dev:ssr": "ng run your-project-name:serve-ssr",
  "serve:ssr": "node dist/your-project-name/server/main.js",
  "build:ssr": "ng build && ng run your-project-name:server",
  "prerender": "ng run your-project-name:prerender"
}
```

## Running Angular Universal

First build the angular project using build:ssr command and then run using serve:ssr command. You should see Expressjs log in your terminal.

```css
$ npm run build:ssr
$ npm run serve:ssr

Node express server listening on localhost:4000
```

## Using with Firebase

If you are using Firebase with Angular Universal, then you might face some errors related to Firebase. Just add these below lines to your angular.json files under server > external dependencies.

```ts
'angular.json'
'your-project-name > architect > server > options > externalDependencies'

"externalDependencies": [
  "@firebase/app", 
  "@firebase/firestore" 
]
```


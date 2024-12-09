---
title: Deploy Angular Universal to Vercel
slug: deploy-angular-universal-to-vercel
description: Learn how to make angular universal run on vercel as edge function
hashtags: [angular, ssr, vercel]
createdAt: may 28, 2023
source: https://github.com/panesarpbx8/univercel
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://panesarpbx8.vercel.app
published: true
---

## Getting started

Create new angular 16 app with standalone apis, use --minimal to skip routing.

```bash
$ ng new angular-vercel --minimal --routing --standalone --style=scss

CREATE angular-vercel/package.json (790 bytes)
CREATE angular-vercel/README.md (1067 bytes)
CREATE angular-vercel/tsconfig.json (901 bytes)
CREATE angular-vercel/.gitignore (548 bytes)
CREATE angular-vercel/tsconfig.app.json (263 bytes)
CREATE angular-vercel/.vscode/extensions.json (130 bytes)
CREATE angular-vercel/.vscode/launch.json (297 bytes)
CREATE angular-vercel/.vscode/tasks.json (531 bytes)
CREATE angular-vercel/src/main.ts (250 bytes)
CREATE angular-vercel/src/favicon.ico (1642 bytes)
CREATE angular-vercel/src/index.html (299 bytes)
CREATE angular-vercel/src/styles.scss (80 bytes)
CREATE angular-vercel/src/app/app.component.ts (1647 bytes)
CREATE angular-vercel/src/app/app.config.ts (228 bytes)
CREATE angular-vercel/src/app/app.routes.ts (77 bytes)
CREATE angular-vercel/src/assets/.gitkeep (0 bytes)
√ Packages installed successfully.
```

## Add ssr

Install Angular Universal's express-engine packages

```bash
$ cd angular-vercel
$ ng add @nguniversal/express-engine

i Using package manager: yarn
√ Found compatible package version: @nguniversal/express-engine@16.0.2.
√ Package information loaded.
The package @nguniversal/express-engine@16.0.2 will be installed and executed.
Would you like to proceed? Yes
√ Packages successfully installed.

CREATE src/main.server.ts (264 bytes)
CREATE src/app/app.config.server.ts (350 bytes)
CREATE tsconfig.server.json (272 bytes)
CREATE server.ts (2002 bytes)
UPDATE package.json (1231 bytes)
UPDATE angular.json (5021 bytes)
√ Packages installed successfully.
```

## Add vercel

Create `vercel.json` file in root directory of your project. We will redirect all requests to api directory which will `export default` an express app which will be imported from main server bundle.

```json
"./vercel.json"

{
  "version": 2,
  "public": true,
  "name": "angular-vercel",
  "rewrites": [
    { "source": "/(.*)", "destination": "/api" }
  ],
  "functions": {
    "api/index.js": {
      "includeFiles": "dist/angular-vercel/browser/**"
    }
  }
}
```

```js
"./api/index.js"

const server = require('../dist/angular-vercel/server/main');

module.exports = server.app();
```

## Modify package.json

Add vercel-build script so that Vercel prioritize this command over yarn build.

```json
"./package.json"

"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "dev:ssr": "ng run angular-vercel:serve-ssr",
  "serve:ssr": "node dist/angular-vercel/server/main.js",
  "build:ssr": "ng build && ng run angular-vercel:server",
  "prerender": "ng run angular-vercel:prerender",
  "vercel-build": "yarn build:ssr" <- add this script
},
```

## Finishing

Before we deploy, create an empty folder `public` at root of your project with `.gitkeep` file inside.

```bash
$ touch public/.gitkeep
```

Generate two routes in angular application to test ssr working with different routes. Add these two components to your routing config.

```bash
$ ng g c routes/home
$ ng g c routes/about
```

```ts
"./src/app/app.routes.ts"

import { Routes } from '@angular/router';
import { HomeComponent } from './routes/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    loadComponent: () => import('./routes/about/about.component'),
  }
];

```

```ts
"./src/app/app.component.ts"

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
  ],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {

}
```

You can optionally add Angular 16's Hydration feature by use `provideClientHydration` function in your `app.config.ts` file.

```ts
"./src/app/app.config.ts"

import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
  ]
};
```

## Deploying 

Install Vercel CLI using yarn and run vercel deploy

```bash
$ yarn global add vercel
```

```bash
$ vercel deploy
Vercel CLI 30.0.0
? Set up and deploy “X:\Development\projects\angular-vercel”? [Y/n] y
? Link to existing project? [y/N] n
? What’s your project’s name? angular-vercel
? In which directory is your code located? ./
Local settings detected in vercel.json:
Auto-detected Project Settings (Angular):
- Build Command: ng build
- Development Command: ng serve --port $PORT
- Install Command: `yarn install`, `pnpm install`, or `npm install`
- Output Directory: dist
? Want to modify these settings? [y/N] n
🔗  Linked to [name]/angular-vercel (created .vercel and added it to .gitignore)
🔍  Inspect: https://vercel.com/[name]/angular-vercel/72TnZdRH82ozigY544VWXWCRPgJz [1s]
✅  Production: https://angular-vercel-gamma-rosy.vercel.app [2m]
📝  Deployed to production. Run `vercel --prod` to overwrite later (https://vercel.link/2F).
💡  To change the domains or build command, go to https://vercel.com/[name]/angular-vercel/settings

```

That's it! Now you can see your angular universal app is fully server-side rendered using vercel edge functions.

go head and try: [https://univercel.vercel.app](https://univercel.vercel.app)

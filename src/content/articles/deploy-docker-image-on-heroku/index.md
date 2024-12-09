---
title: Deploy Docker image on Heroku
slug: deploy-docker-image-on-heroku
description: Docker takes away repetitive tasks and is used throughout the development lifecycle for fast development
hashtags: [docker, heroku]
createdAt: Jun 30, 2023
source: https://gist.github.com/panesarpbx8/1c931316cdb4cc266487d5e10ca6f134
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://panesarpbx8.vercel.app
published: true
---

## Dockerfile

The most important file for docker image that defines instructions how to deploy an application. For this tutorial, I will be using a Angular project but this method can be applied to pretty much any node.js application. First create a `Dockerfile` in root directory of the project.

```css
$ touch Dockerfile
```

## Dockerfile instructions

For this project, I will be using `node:14.1-alpine` image as base image. Feel free to explore other [docker images](https://hub.docker.com/search?q=&type=image) as well. Moving on, You can set node env as production with `ENV` command and move into directory by `WORKDIR`

```dockerfile
Dockerfile

FROM node:14.1-alpine
ENV NODE_ENV=production
WORKDIR /app
```
Now, `COPY` the `package.json` and `package-lock.json` from root directory of project to root directory of `/app`. (because we `WORKDIR` into `/app` on 2nd step so we will use current directory symbol (.) ). Now installing node dependencies with production flag to ignore installing `devDependencies`. After COPYing all files from our angular project into docker image we can write `CMD` command which will execute the starting script of your application.

```dockerfile
Dockerfile

FROM node:14.1-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]
```

## Dockerignore

Notice one step before `CMD` we copied all files into Docker image which includes `node_modules` folder as well. We can ignore `node_modules` just like `.gitignore` by creating `.dockerignore` file in the root directory of project.

```.docker
.dockerignore

node_modules
```

## Heroku setup

If your machine does not have [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed, you can download it from their official [website](https://devcenter.heroku.com/articles/heroku-cli). Create a new Heroku app through its cli and set stack to container.

```css
$ heroku login
$ heroku create <your-app-name>
$ heroku stack:set container -a <your-app-name>
```

## Uploading image to Heroku

At this point, we can push our project into heroku container and release it to finish deployment process.

```css
$ heroku container:push web -a <your-app-name>
$ heroku container:release web -a <your-app-name>
```

## Heroku logs

You can see rest of the logs by heroku logs command for your app. And that is it, your application is dockerized and should be accessible on your-app-name.herokuapp.com

```css
$ heroku logs -t -a <your-app-name>
```


---
title: Integrating Firebase into Angular
slug: integrating-firebase-into-angular
description: How to integrate firebase into Angular 17 using @angular/fire
hashtags: [angular, firebase]
createdAt: Jan 15, 2024
source: https://github.com/panesarpbx8/ngx-firestarter
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://panesar.dev
published: true
---

## Getting started

We will create this template for getting initial boilerplate code out of the way for the future projects. Let's just get started by creating a new Angular project using its powerful [cli](https://angular.io/cli) tool

```bash
$ ng new ngx-firestarter --style=scss
```

## Create firebase project

Create a new firebase project from their [console](https://console.firebase.google.com) and do as follow.

![Creating firebase project](/articles/integrating-firebase-into-angular/img/firebase.gif)

After creating firebase project, register a new web app and copy the firebase config.

![Creating new web app](/articles/integrating-firebase-into-angular/img/webapp.gif)

## Installing firebase

@angular/fire is official library by Angular team that provides observable streams for firebase services. start by installing using npm or yarn

```bash
$ npm i @angular/fire firebase
```

```bash
$ yarn add @angular/fire firebase
```

## Adding in app.config.ts

import the required packages from @angular/fire and add them to providers array in app.config.ts file. we will add Authentication and Firestore packages as well. Since standalone APIs for @angular/fire is not available yet, you can use importProvidersFrom function from @angular/core to add firebase packages.

```ts
"src/app/app.config.ts"

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
    ),
  ]
};

const FIREBASE_CONFIG = {
  // your firebase config,
}
```

## Todos component

Generate a todos component mapped to `/todos` route to show the list of todos from the firestore

```bash
$ ng g c todos
```

```ts
"src/app/app.routes.ts"

import { Routes } from '@angular/router';
import { TodosComponent } from './todos/todos.component';

export const routes: Routes = [
  {
    path: 'todos',
    component: TodosComponent,
  }
];
```

## Using firestore

Inject Firestore from @angular/fire/firestore packages using inject() function. you can create a reference for todos collection in firestore using collection function and get observable steam for todos collection using collectionData function.

```ts
"src/app/todos/todos.component.ts"

import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Todo {
  text: string;
  isDone: boolean;
}

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [
    AsyncPipe,
  ],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss'
})
export class TodosComponent {
  private firestore = inject(Firestore);

  todos$ = collectionData(
    collection(this.firestore, 'todos'),
  ) as Observable<Todo[]>;

}
```

Using todos$ in html

```html
<section>
  @for (todo of todos$ | async; track $index) {
    <h1>{{ todo.text }}</h1>
  }
  @empty {
    <p>No todos</p>
  }  
</section>
```


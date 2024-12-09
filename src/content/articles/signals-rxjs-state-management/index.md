---
title: State management using RXJS and Signals
slug: signals-rxjs-state-management
description: Using new Angular signals with rxjs to create an awesome state management solution
hashtags: [angular, signals, rxjs]
createdAt: April 30, 2024
source: https://github.com/panesardev/ngx-state
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://panesar.dev
published: true
---

## The idea

Showcasing my new state management solution to uses signals and rxjs together to create a Store that can be injected and used from anywhere. Main idea is to inject store in all parts of application to select slice of AppState or the global state and to dispatch actions as well, therefore components do not need to worry about which specific service to inject to fetch content.

![diagram](/articles/signals-rxjs-state-management/img/diagram.png)

## Getting started

Create a new angular project using the cli or optionally clone my angular starter project from [this link](https://github.com/panesardev/ngx-starter). 

```bash
$ ng new project-name
or
$ git clone https://github.com/panesardev/ngx-starter.git project-name
```

## Defining AppState

Define global app state and state slices

```ts
export interface AppState {
  user: User;
  todos: Todo[];
}

export interface User {
  email: string;
  password: string;
}

export interface Todo {
  id: string;
  text: string;
}

export const initialState: AppState = {
  user: {
    email: '',
    password: '',
  },
  todos: [],
}
```

## Creating Store service

Store is an angular service that can be inject anywhere to dispatch actions and accessing immutable state as a signal. The Store has some helper methods to mutate state directly such as setState(), patchState() and resetState(). You should avoid using these methods from anywhere other that Effects services (you will see below). dispatch method will push input action to the actions stream which can be listened by Effects services. finally state signal is exposed as a read-only signal to consume state but not change it, Or components can use select function to select a certain slice from AppState.

```ts
import { computed, Injectable, Signal, signal } from "@angular/core";
import { Subject } from "rxjs";
import { Action } from "./app.actions";
import { AppState, initialState } from "./app.state";

@Injectable({ providedIn: 'root' })
export class Store {
  private stateSignal = signal<AppState>(initialState);
  private actions = new Subject<Action>();

  readonly state = this.stateSignal.asReadonly();
  readonly actions$ = this.actions.asObservable();

  dispatch(action: Action): void {
    this.actions.next(action);
  }

  select<T>(key: keyof AppState): Signal<T> {
    return computed(() => this.stateSignal()[key] as T);
  }

  setState(state: AppState): void {
    this.stateSignal.set(state);
  }

  patchState(state: Partial<AppState>): void {
    this.stateSignal.update(v => ({ ...v, ...state }));
  }

  resetState(): void {
    this.stateSignal.set(initialState);
  }
}
```

## Defining Actions

Action are just typescript classes that contains optional payload with them. However, I made them extend a base Action class to identify actions later on. 

```ts
// base action class
export class Action {
  constructor(public readonly type: string, public payload?: any) {}
}

export class Login extends Action {
  constructor(public override payload: { email: string, password: string }) {
    super(Login.name, payload);
  }
}

export class Logout extends Action {
  constructor() {
    super(Logout.name);
  }
}

export class FetchTodos extends Action {
  constructor() {
    super(FetchTodos.name);
  }
}
```

## Mutating AppState

Effects services are only classes that uses State mutating method like setState(), patchState() and resetState(). By listening to actions stream from Store, we can filter the specific action we want to listen to and handle it accordingly.

```ts
import { inject, Injectable } from "@angular/core";
import { filter, switchMap, tap } from "rxjs";
import { Store } from "../app.store";
import { FetchTodos, Login, Logout } from "./auth.actions";
import { runEffects } from "../../utilities/operators";
import { HttpClient } from "@angular/common/http";
import { Todo } from "../app.state";

@Injectable({ providedIn: 'root' })
export class AuthEffects {
  private store = inject(Store);

  login = this.store.actions$.pipe(
    filter(action => action instanceof Login),
    tap({
      next: action => this.store.patchState({ user: action.payload }),
      error: e => console.log(e),
    }),
  );

  logout = this.store.actions$.pipe(
    filter(action => action instanceof Logout),
    tap({
      next: () => this.store.resetState(),
      error: e => console.log(e),
    }),
  );

  constructor() {
    runEffects(this.login, this.logout);
  }
}

@Injectable({ providedIn: 'root' })
export class TodosEffects {
  private http = inject(HttpClient);
  private store = inject(Store);

  fetchTodos = this.store.actions$.pipe(
    filter(action => action instanceof FetchTodos),
    switchMap(() => this.http.get<Todo[]>(`your-backend-url`)),
    tap({
      next: todos => this.store.patchState({ todos }),
      error: e => console.log(e),
    }),
  );

  constructor() {
    runEffects(this.fetchTodos);
  }
}
```

## Using in components
```ts
"todos.component.ts"

import { Component, inject } from '@angular/core';
import { Store } from '../../store/app.store';
import { Todo } from '../../store/app.state';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [],
  template: `
    <div>
      @for (todo of todos(); track todo.id) {
        <h1>{{ todo.text }}</h1>
      }
    </div>
  `,
})
export class TodosComponent {
  private store = inject(Store);

  todos = this.store.select<Todo[]>('todos');
}
```

```ts
"user.component.ts"

import { Component, inject } from '@angular/core';
import { Store } from '../../store/app.store';
import { User } from '../../store/app.state';
import { Login } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  template: `
    <div>
      {{ user().email }}

      <!-- dispatching actions -->
      <button (click)="login()">Login</button>
      <button (click)="logout()">Logout</button>
    </div>
  `,
})
export class UsersComponent {
  private store = inject(Store);

  user = this.store.select<User>('user');

  login() {
    const user: User = {
      email: 'email',
      password: 'password'
    };
    this.store.dispatch(new Login(user));
  }

  logout() {
    this.store.dispatch(new Logout());
  }
}
```

## Setting up effects

Create a runEffects function that takes in list of observables and return their subscriptions. By using takeUntilDestroyed() operator from '@angular/core/rxjs-interop' package we make sure there are not memory leaks.

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';

export function runEffects(...sources: Observable<unknown>[]): Subscription[] {
  return sources.map(source => source.pipe(takeUntilDestroyed()).subscribe());
}
```

Finally, we need some way to initialize Effects services to they can start listening to actions dispatched by store. Hence I ended up creating a function that returns ENVIRONMENT_INITIALIZER provider that initializes effect services.

```ts
import { ENVIRONMENT_INITIALIZER, inject, Provider } from "@angular/core";
import { AuthEffects, TodosEffects } from "./auth/auth.effects";

export function initializeEffects(): Provider {
  return {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      inject(AuthEffects);
      inject(TodosEffects);
    }
  };
}
```

Make sure to call this provider function in app.config.ts file

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeEffects } from './store/effects';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    initializeEffects(),
  ],
};
```
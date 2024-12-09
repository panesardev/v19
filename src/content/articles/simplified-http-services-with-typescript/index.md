---
title: Simplified Http Services with Typescript
slug: simplified-http-services-with-typescript
description: Creating a http service that can be extended by angular services to provide crud operations
hashtags: [angular, typescript]
createdAt: Jun 24, 2021
source: https://gist.github.com/panesardev/44b8569e2b6f00aac6a5eb810e019989
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://panesar.dev
published: true
---

## Create a generic class

Assuming you already have a Angular project with angular fire installed, create a simple generic class. Generic class will help you get IntelliSense in your IDE and allow to strongly type the methods.

```ts
export class HttpService<T> { }
```

## Inject HttpClient and URL

We will pass the HttpClient and baseUrl from the subclass service that we will create shortly. By Adding a slash (/) at the end of url will help us appending query parameters.

```ts
export class HttpService<T> {
  constructor(
    private http: HttpClient,
    private url: string,
  ) {
    this.url = this.url.endsWith('/') ? this.url : this.url + '/';
  }
}
```

## Add request methods

Majority of the APIs use these four method to communicate with client applications. If you are using PATCH instead of PUT to send a update request, you can replace PUT with PATCH in this step. Everything else should be fine.

```ts
export class HttpService<T> {
  constructor(
    private http: HttpClient,
    private url: string,
  ) {
    this.url = this.url.endsWith('/') ? this.url : this.url + '/';
  }

  findAll(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  find(id: string): Observable<T> {
    return this.http.get<T>(this.url + id);
  }

  create(t: T): Observable<T> {
    return this.http.post<T>(this.url, t);
  }

  update(t: T): Observable<T> {
    return this.http.put<T>(this.url + t['id'], t);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(this.url + id);
  }
}
```

## Using HttpService

At this point, you can just create a normal angular service which extends our HttpService. To set an example I have created an Employee interface from one of my projects.

```ts
export class Employee {
  id?: string;
  firstName: string;
  lastName: string;
  dob: Date;
  age: number;
  gender: 'm' | 'f';
  jobTitle: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService extends HttpService<Employee> {
  constructor(http: HttpClient) { 
    super(http, environment.serverURL + '/employees');
  }
}
```

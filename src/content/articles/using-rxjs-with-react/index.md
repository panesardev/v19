---
title: Using RXJS with React
slug: using-rxjs-with-react
description: basic usage of rxjs observables with react and react hooks
hashtags: [rxjs, react]
createdAt: Dec 1, 2022
source: https://github.com/panesarpbx8
authorName: Sukhpreet Singh
authorImage: https://lh3.googleusercontent.com/a-/AOh14Gh75b7CK1JPwLcKqE8a-zJjwaEVGUreGuWl2nYZbw=s96-c
authorLink: https://github.com/panesarpbx8
published: true
---

## Getting started

Create a new React project and install rxjs

```bash
$ npx create-react-app react-rxjs
$ npm install rxjs
```

## Fetching posts

Create a `posts.js` file in `src/api` directory and define some functions that fetch posts from jsonplaceholder.

```js
const url = 'https://jsonplaceholder.typicode.com';

export async function findAll() {
  return fetch(`${url}/posts`).then(response => response.json());
}

export async function findByTitle(title) {
  const posts = await findAll();
  return posts.filter(post => post.title.includes(title));
}
```

## Posts component

Create a Posts component to fetch and display posts using rxjs

```bash
$ touch Posts.js
```

Import some react hooks and `findAll` from the `posts.js` file we created earlier. Import `from` from rxjs to convert promises into observables.

```js
import { from } from 'rxjs';
import { useEffect, useState } from 'react';
import { findAll } from '../api/posts';
```

Now, create posts variable using `useState` hook and subscribe to the `posts$` observable in `useEffect` when component renders.

```jsx
export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const posts$ = from(findAll());
    const subscription = posts$.subscribe(posts => setPosts(posts));

    return () => subscription.unsubscribe();
  }, []);

}
```

In the return function in `useEffect`, call the unsubscribe function from the subscription returned when subscribing to the `posts$` observable to prevent memory leaks.
Finally loop over posts in the jsx.

```jsx
export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const posts$ = from(findAll());
    const subscription = posts$.subscribe(posts => setPosts(posts));

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
```

## Search component

In this example, I will be creating a search functionality to fetch posts by name.
Notice I am running the useEffect every time the input changes to fetch posts that matches the input.

```jsx
import { useEffect, useState } from "react";
import { from } from "rxjs";
import { findByTitle } from '../api/posts';

export default function Search() {
  const [input, setInput] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const posts$ = from(findByTitle(input));

    let subscription = posts$.subscribe(posts => setPosts(posts));

    return () => subscription.unsubscribe();
  }, [input]);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  return (<>
    <h1>Search Posts</h1>
    <input type="text" value={input} onChange={handleChange} 
      placeholder="Enter post title"/>

    {posts.map(post => <div key={post.id}>{post.title}</div>)}
  </>);
}
```






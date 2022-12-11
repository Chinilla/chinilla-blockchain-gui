# chinilla-blockchain-gui/api-react

![Chinilla logo](https://www.chinilla.net/wp-content/uploads/2022/09/chinilla-logo.svg)

![GitHub contributors](https://img.shields.io/github/contributors/Chinilla/chinilla-blockchain-gui?logo=GitHub)

This library provides react hooks on the top of @chinilla/api and uses [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) under the hood.
It is designed to simplify common cases for loading data in a web application, eliminating the need to hand-write data fetching & caching logic yourself. Benefits include:

- Automatically refresh queries when data changed (using events from Chinilla Blockchain).
- Tracking loading state in order to show UI spinners.
- Avoiding duplicate requests for the same data.
- Optimistic updates to make the UI feel faster.
- Managing cache lifetimes as the user interacts with the UI.
- Ability to use it without React library
- Support for polling and parallel queries

## Query Example

### **`PublicKeys.tsx`**

```tsx
import React from 'react';
import { useGetPublicKeysQuery } from '@chinilla/api-react';
import Suspender from 'react-suspender';

export default function PublicKeys() {
  const { data: publicKeys, isLoading, error } = useGetPublicKeysQuery();

  if (isLoading) {
    return <Suspender />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <ul>
      {publicKeys.map((key) => (
        <li key={key}>{key}</li>
      ))}
    </ul>
  );
}
```

### **`Application.tsx`**

```tsx
import React, { Suspense } from 'react';
import Websocket from 'ws'; // or read this value from electron main application
import { store, api } from '@chinilla/api-react';
import PublicKeys from './PublicKeys';

// prepare api
api.initializeConfig({
  url: 'wss://127.0.0.1:54000',
  cert: fs.readFileSync(certPath).toString(), // or read this value from electron main application
  key: fs.readFileSync(keyPath).toString(), // or read this value from electron main application
  webSocket: Websocket,
});

export default function Application() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Provider store={store}>
        <PublicKeys />
      </Provider>
    </Suspense>
  );
}
```

## Development

Please read and follow the main [README.md](https://github.com/Chinilla/chinilla-blockchain-gui) of this monorepo.

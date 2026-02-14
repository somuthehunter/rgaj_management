## RatnaSmriti Management Portal

This is a ratnasmriti management service which will provide full business management service.

## Set Up

First , Clone this project , and install

```bash
git clone    https://github.com/somuthehunter/rgaj_management.git
```

Second, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Architecture

```
feature name
    _components
    _hooks
    _lib
    page.tsx
    layout.tsx
    providers.tsx
```

Inside the \_components place all the components basically all the UI.
\_hooks for api call and handler
\_lib for basic or utils fucntions.

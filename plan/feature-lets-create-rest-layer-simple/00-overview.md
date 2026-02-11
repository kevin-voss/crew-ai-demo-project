# Implementation Plan: Create REST Layer (Simple)

## High-Level Overview

This plan adds a simple REST layer to the existing HTTP server. The REST layer introduces:

- **Router**: A lightweight routing module that maps `(method, path)` to handler functions
- **Request parsing**: Utilities to parse JSON request bodies for POST/PUT/PATCH
- **Resource API**: A simple in-memory CRUD resource (e.g., `/api/items`) demonstrating REST patterns
- **Clean integration**: The REST layer plugs into the existing server without replacing `GET /` or `GET /health`

The implementation stays **dependency-free** and uses only Node.js built-in modules (`http`, `url`).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Project Structure                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  src/                                                                       │
│  ├── server.js           ← HTTP server (updated to use REST layer)           │
│  └── rest/                                                                  │
│      ├── router.js       ← Route registration & dispatch (Step 01)           │
│      ├── parser.js       ← Request body parsing (Step 02)                    │
│      ├── routes.js       ← REST route definitions & handlers (Step 03)      │
│      └── store.js        ← In-memory resource store (Step 03)               │
│  tests/                                                                     │
│  ├── server.test.js      ← Existing tests (unchanged)                       │
│  └── rest.test.js       ← REST layer tests (Step 05)                        │
│  docs/                                                                      │
│  └── SERVER.md           ← Updated with REST API docs (Step 06)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Request Flow

```mermaid
flowchart TB
    subgraph Incoming["Incoming Request"]
        Req[HTTP Request]
    end

    subgraph Server["server.js"]
        Dispatch{Route Match?}
        Root[GET /]
        Health[GET /health]
        REST[REST Router]
    end

    subgraph RestLayer["REST Layer"]
        Router[router.js]
        Parser[parser.js]
        Routes[routes.js]
        Store[store.js]
    end

    subgraph Endpoints["REST Endpoints"]
        List[GET /api/items]
        Create[POST /api/items]
        Get[GET /api/items/:id]
        Update[PUT /api/items/:id]
        Delete[DELETE /api/items/:id]
    end

    Req --> Dispatch
    Dispatch --> Root
    Dispatch --> Health
    Dispatch --> REST
    REST --> Router
    Router --> Parser
    Router --> Routes
    Routes --> Store
    Router --> List
    Router --> Create
    Router --> Get
    Router --> Update
    Router --> Delete
```

## Sequence Diagram: REST Request Handling

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Router
    participant Parser
    participant Handler
    participant Store

    Client->>Server: POST /api/items {"name":"Widget"}
    Server->>Router: route(req, res)
    Router->>Parser: parseBody(req)
    Parser-->>Router: { name: "Widget" }
    Router->>Handler: createItem(req, res, body)
    Handler->>Store: add(item)
    Store-->>Handler: item
    Handler->>Server: res.status(201).json(item)
    Server->>Client: 201 Created + JSON body
```

## Component Diagram

```mermaid
flowchart LR
    subgraph Core["Core"]
        server[server.js]
    end

    subgraph Rest["REST Layer"]
        router[router.js]
        parser[parser.js]
        routes[routes.js]
        store[store.js]
    end

    server --> router
    router --> parser
    router --> routes
    routes --> store
```

## Step Dependencies

```mermaid
graph TD
    A[01 - Create REST Router] --> B[02 - Add Request Body Parser]
    B --> C[03 - Create REST Resource & Store]
    C --> D[04 - Integrate REST Layer into Server]
    D --> E[05 - Add REST Tests]
    D --> F[06 - Update Documentation]

    style A fill:#e8f5e9
    style B fill:#e8f5e9
    style C fill:#fff3e0
    style D fill:#e3f2fd
    style E fill:#f3e5f5
    style F fill:#f3e5f5
```

| Step | Depends On | Output |
|------|------------|--------|
| 01 | None | `src/rest/router.js` - routing module |
| 02 | 01 | `src/rest/parser.js` - request body parsing |
| 03 | 02 | `src/rest/store.js`, `src/rest/routes.js` - items resource & handlers |
| 04 | 03 | Updated `src/server.js` - wires REST layer |
| 05 | 04 | `tests/rest.test.js` - REST endpoint tests |
| 06 | 04 | Updated `docs/SERVER.md` - REST API documentation |

## Prerequisites

- **Node.js** v18+ installed
- **npm** for package management
- **Existing server** at `src/server.js` with `GET /` and `GET /health`
- **package.json** with scripts: `start`, `build`, `test`

## Scope

- **In scope:** REST router, request parsing, in-memory `items` resource (CRUD), integration, tests, docs
- **Out of scope:** Database persistence, authentication, complex validation, external frameworks (Express, etc.)

## REST API Endpoints (Target)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/items | List all items |
| POST | /api/items | Create item (JSON body) |
| GET | /api/items/:id | Get item by ID |
| PUT | /api/items/:id | Update item (JSON body) |
| DELETE | /api/items/:id | Delete item |

## File Summary

| File | Purpose |
|------|---------|
| `src/rest/router.js` | Route registration and dispatch by method + path |
| `src/rest/parser.js` | Parse JSON request body from readable stream |
| `src/rest/store.js` | In-memory store for items (CRUD operations) |
| `src/rest/routes.js` | Route definitions and handler functions |
| `src/server.js` | Orchestrates routing; delegates REST paths to router |
| `tests/rest.test.js` | Tests for REST endpoints |
| `docs/SERVER.md` | Updated API documentation including REST endpoints |

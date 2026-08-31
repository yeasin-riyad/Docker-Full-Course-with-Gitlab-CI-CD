# 🐳 Docker Multi-Stage Build, Production Image & Nginx

এই নোটে আমরা Docker ব্যবহার করে কীভাবে একটি **Production-ready Application** তৈরি করতে হয় তা শিখব।

বিশেষভাবে আমরা দেখব:

* Docker Multi-Stage Build কী
* Builder এবং Runtime Stage কী
* Production Docker Image কীভাবে তৈরি করতে হয়
* Development এবং Production Image-এর পার্থক্য
* `npm install --omit=dev` কেন ব্যবহার করা হয়
* React/Vite Application-এর Production Build
* Nginx কী এবং কেন ব্যবহার করা হয়
* Nginx কীভাবে Static File Serve করে
* Nginx Reverse Proxy কী
* `/api` request কীভাবে Backend-এ যায়
* Docker Container-এর মধ্যে Service Communication কীভাবে কাজ করে

---

# 📚 আলোচিত বিষয়সমূহ

1. 🐳 Docker Multi-Stage Build
2. 🏗️ Builder Stage
3. 🚀 Runtime Stage
4. 📦 Production Dependencies
5. ⚡ Docker Image Optimization
6. ⚛️ React/Vite Production Build
7. 🌐 Nginx
8. 🔄 Nginx Reverse Proxy
9. 🔀 React SPA Routing
10. 🐳 Docker Networking
11. 🔗 Frontend ও Backend Connection
12. 🏭 Production-ready Docker Architecture

---

# 🐳 ১. Docker Multi-Stage Build কী?

একটি Dockerfile-এর মধ্যে একাধিক `FROM` ব্যবহার করে Application-এর **Build Environment** এবং **Production Runtime Environment** আলাদা করাকে **Multi-Stage Build** বলা হয়।

সাধারণভাবে Flow:

```text
Builder Stage
      ↓
Dependencies Install
      ↓
Application Build
      ↓
dist/ তৈরি
      ↓
Runtime Stage
      ↓
শুধু প্রয়োজনীয় File + Dependencies
      ↓
Production Application
```

এর ফলে Docker Image:

* ছোট হয়
* দ্রুত Deploy করা যায়
* Security ভালো হয়
* Production Environment পরিষ্কার থাকে

---

# 🏗️ ২. Backend-এর Production Dockerfile

Node.js/Express Backend-এর জন্য একটি Production Dockerfile:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:20-alpine AS runtime

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

এখানে আমরা দুইটি Stage ব্যবহার করছি:

```text
Stage 1 → builder
Stage 2 → runtime
```

---

# 🏗️ ৩. Builder Stage

প্রথম Stage:

```dockerfile
FROM node:20-alpine AS builder
```

এখানে `builder` নামে একটি Stage তৈরি করা হয়েছে।

এর কাজ হলো Application **Build করা**।

---

## `WORKDIR`

```dockerfile
WORKDIR /app
```

Container-এর ভিতরে `/app`-কে Working Directory হিসেবে নির্ধারণ করা হয়েছে।

তাই পরবর্তী Command-গুলো `/app` Directory-এর ভিতরে কাজ করবে।

---

# 📦 ৪. Package Files Copy

```dockerfile
COPY package*.json ./
```

সাধারণত এখানে:

```text
package.json
package-lock.json
```

Container-এর `/app` Directory-তে Copy হবে।

এরপর:

```dockerfile
RUN npm install
```

Application-এর সব Dependencies Install হবে।

---

# 📁 ৫. Source Code Copy

```dockerfile
COPY . .
```

এতে Local Project-এর Source Code Container-এর `/app` Directory-তে Copy হবে।

উদাহরণ:

```text
/app
├── package.json
├── package-lock.json
├── src/
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   └── services/
└── ...
```

---

# 🔨 ৬. Application Build

```dockerfile
RUN npm run build
```

যদি TypeScript Project হয়, তাহলে Source Code Compile হয়ে JavaScript তৈরি হতে পারে।

উদাহরণ:

```text
src/
└── server.ts
```

Build করার পরে:

```text
dist/
└── server.js
```

তৈরি হবে।

অর্থাৎ:

```text
TypeScript Source Code
        ↓
   npm run build
        ↓
     dist/
        ↓
   server.js
```

---

# 🚀 ৭. Runtime Stage

এরপর আমরা নতুন Stage শুরু করছি:

```dockerfile
FROM node:20-alpine AS runtime
```

এটি হলো Production-এর জন্য আমাদের Runtime Environment।

Builder Stage-এর সবকিছু এখানে নেওয়া হচ্ছে না।

---

# 📦 ৮. Production Dependencies

```dockerfile
COPY package*.json ./

RUN npm install --omit=dev
```

এখানে:

```bash
npm install --omit=dev
```

ব্যবহার করা হয়েছে।

এর অর্থ:

> শুধুমাত্র Production Dependencies Install করো এবং Development Dependencies বাদ দাও।

উদাহরণ:

```json
{
  "dependencies": {
    "express": "...",
    "mongoose": "..."
  },

  "devDependencies": {
    "typescript": "...",
    "eslint": "...",
    "nodemon": "..."
  }
}
```

Production Environment-এ সাধারণত প্রয়োজন:

```text
express
mongoose
```

কিন্তু প্রয়োজন নেই:

```text
typescript
eslint
nodemon
```

তাই:

```bash
npm install --omit=dev
```

ব্যবহার করলে Production Image ছোট ও পরিষ্কার হয়।

---

# 📁 ৯. Builder থেকে `dist` Copy

সবচেয়ে গুরুত্বপূর্ণ Command:

```dockerfile
COPY --from=builder /app/dist ./dist
```

এখানে:

```text
builder
```

হলো প্রথম Stage-এর নাম।

আমরা প্রথম Stage থেকে:

```text
/app/dist
```

Copy করে Runtime Stage-এর:

```text
/app/dist
```

এ রাখছি।

অর্থাৎ:

```text
Builder
│
├── src/
├── node_modules/
├── package.json
└── dist/
      │
      │ COPY
      ↓
Runtime
│
├── node_modules/
├── package.json
└── dist/
      └── server.js
```

Builder-এর Source Code বা Build Tools Runtime Image-এ নেওয়া হচ্ছে না।

---

# ▶️ ১০. Backend Start

```dockerfile
CMD ["node", "dist/server.js"]
```

Container Start হলে:

```bash
node dist/server.js
```

চালু হবে।

এটাই Production Backend Application।

---

# ⚡ ১১. Multi-Stage Build-এর সুবিধা

একটি সাধারণ Docker Image-এ থাকতে পারে:

```text
Source Code
Development Dependencies
Build Tools
TypeScript
Testing Tools
Production Dependencies
Compiled Code
```

কিন্তু Multi-Stage Build ব্যবহার করলে:

```text
Builder
   ↓
Application Build
   ↓
dist/
   ↓
Runtime
   ↓
Production Dependencies + dist/
```

### প্রধান সুবিধা

| সুবিধা                  | কারণ                              |
| ----------------------- | --------------------------------- |
| 📦 ছোট Image            | অপ্রয়োজনীয় Files থাকে না          |
| ⚡ দ্রুত Deployment      | Image ছোট হওয়ায় দ্রুত Transfer হয় |
| 🔐 ভালো Security        | অপ্রয়োজনীয় Tools থাকে না          |
| 🧹 পরিষ্কার Environment | Build ও Runtime আলাদা থাকে        |
| 🚀 Production Ready     | শুধুমাত্র প্রয়োজনীয় জিনিস থাকে    |

---

# ⚛️ ১২. React/Vite Production Build

React/Vite Frontend-এর জন্য আমরা Node.js দিয়ে Application Build করব।

এরপর Production-এ Node.js দিয়ে Frontend চালানোর পরিবর্তে **Nginx** ব্যবহার করব।

Production Dockerfile:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

# 🔨 ১৩. Frontend Builder Stage

প্রথম Stage:

```dockerfile
FROM node:20-alpine AS builder
```

এখানে Node.js ব্যবহার করে Frontend Build করা হবে।

```dockerfile
RUN npm install
```

Dependencies Install করবে।

এরপর:

```dockerfile
RUN npm run build
```

Production Build তৈরি করবে।

ফলে:

```text
dist/
├── index.html
├── assets/
│   ├── index.js
│   └── index.css
└── ...
```

তৈরি হবে।

---

# 🔗 ১৪. `VITE_API_URL` কী?

Dockerfile-এ:

```dockerfile
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
```

ব্যবহার করা হয়েছে।

Frontend Code-এ আমরা লিখতে পারি:

```javascript
fetch(`${import.meta.env.VITE_API_URL}/products`);
```

যদি:

```text
VITE_API_URL=/api
```

হয়, তাহলে Request হবে:

```text
/api/products
```

এরপর Nginx এই Request Backend-এ পাঠাবে।

---

# 🌐 ১৫. Nginx কী?

**Nginx** একটি High-performance Web Server এবং Reverse Proxy।

React/Vite Application Build করার পর এটি মূলত Static Files-এ পরিণত হয়:

```text
dist/
├── index.html
├── assets/
├── favicon.ico
└── ...
```

Production-এ এই Static Files Serve করার জন্য Nginx খুব ভালো।

Architecture:

```text
Browser
   ↓
Nginx
   ↓
React Static Files
```

---

# 📁 ১৬. Nginx-এর মধ্যে React Build Copy

Dockerfile:

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

এখানে Builder Stage-এর:

```text
/app/dist
```

Nginx-এর:

```text
/usr/share/nginx/html
```

Directory-তে Copy করা হচ্ছে।

অর্থাৎ:

```text
Builder
/app/dist
     │
     │ COPY
     ↓
Nginx
/usr/share/nginx/html
```

Nginx এখন React Application-এর Static Files Serve করতে পারবে।

---

# ⚙️ ১৭. Nginx Configuration

আমাদের File:

```text
nginx/
└── default.conf
```

Configuration:

```nginx
server {
  listen 80;

  server_name _;

  root /usr/share/nginx/html;

  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://server:5000;

    proxy_http_version 1.1;

    proxy_set_header Host $host;

    proxy_set_header X-Real-IP $remote_addr;

    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

# 🔀 ১৮. `location /` কী করছে?

```nginx
location / {
  try_files $uri /index.html;
}
```

React/Vite Application সাধারণত SPA বা **Single Page Application**।

ধরো React Router-এ আছে:

```text
/
 /login
 /dashboard
 /products
```

User যদি সরাসরি:

```text
/dashboard
```

এ যায়, Nginx `/dashboard` নামে কোনো Physical File খুঁজতে পারে।

File না পেলে:

```nginx
try_files $uri /index.html;
```

বলছে:

> Requested File না পাওয়া গেলে `index.html` Return করো।

তারপর React Router বুঝবে কোন Component দেখাতে হবে।

---

# 🔄 ১৯. Nginx Reverse Proxy

Nginx শুধু Static Files Serve করবে না, Backend-এর জন্য Reverse Proxy হিসেবেও কাজ করবে।

```nginx
location /api/ {
  proxy_pass http://server:5000;
}
```

এর অর্থ:

```text
/api/*
   ↓
Nginx
   ↓
server:5000
   ↓
Node.js Backend
```

উদাহরণ:

```text
GET /api/products
```

Request Flow:

```text
Browser
   ↓
Nginx
   ↓
/api/products
   ↓
server:5000
   ↓
Express Backend
```

---

# 🐳 ২০. `server:5000` কী?

ধরো Docker Compose-এ:

```yaml
services:

  server:
    build: ./server
    ports:
      - "5000:5000"

  client:
    build: ./client
    ports:
      - "80:80"
```

এখানে:

```text
server
```

হলো Backend Service-এর নাম।

Docker Compose একই Network-এর মধ্যে থাকা Container-গুলোকে Service Name দিয়ে একে অপরের সাথে যোগাযোগ করতে দেয়।

তাই:

```text
http://server:5000
```

মানে:

> Docker Network-এর মধ্যে `server` নামের Backend Container-এর Port `5000`-এ Connect করো।

---

# 🌍 ২১. Browser কি `server:5000` জানে?

না।

Browser শুধু Request করবে:

```text
/api/products
```

তারপর Nginx internally Request Forward করবে:

```text
Browser
   │
   │ /api/products
   ↓
Nginx
   │
   │ http://server:5000
   ↓
Node.js Backend
```

তাই Frontend থেকে আমরা সহজেই লিখতে পারি:

```javascript
fetch("/api/products");
```

---

# 🏛️ ২২. সম্পূর্ণ Production Architecture

```text
                       INTERNET
                          │
                          ▼
                   ┌────────────┐
                   │  Browser   │
                   └─────┬──────┘
                         │
                         ▼
                ┌─────────────────┐
                │      Nginx      │
                │      :80        │
                └────────┬────────┘
                         │
                ┌────────┴────────┐
                │                 │
               /                /api/
                │                 │
                ▼                 ▼
        ┌───────────────┐   ┌──────────────┐
        │ React/Vite    │   │ Node.js      │
        │ Static Files  │   │ Express API  │
        └───────────────┘   └──────┬───────┘
                                   │
                                   ▼
                              ┌──────────┐
                              │ Database │
                              └──────────┘
```

---

# 🔥 ২৩. সম্পূর্ণ Request Flow

ধরো User Browser-এ খুলল:

```text
https://example.com/dashboard
```

Flow:

```text
Browser
   ↓
Nginx
   ↓
index.html
   ↓
React Application
   ↓
React Router
   ↓
Dashboard Component
```

এখন Dashboard যদি Product API Call করে:

```text
GET /api/products
```

তাহলে:

```text
Browser
   ↓
Nginx
   ↓
/api/products
   ↓
server:5000
   ↓
Express Router
   ↓
Controller
   ↓
Service
   ↓
Database
```

Response আবার ফিরে আসবে:

```text
Database
   ↓
Node.js
   ↓
Nginx
   ↓
Browser
```

---

# 🆚 ২৪. Development বনাম Production

| বিষয়          | Development         | Production              |
| ------------- | ------------------- | ----------------------- |
| Frontend      | Vite                | Nginx                   |
| Backend       | Node.js             | Node.js                 |
| Frontend Port | 4173                | 80                      |
| Backend Port  | 5000                | 5000                    |
| Dependencies  | সব Dependencies     | Production Dependencies |
| Build         | Development/Preview | Production Build        |
| Reverse Proxy | সাধারণত প্রয়োজন নেই | Nginx                   |
| Docker Build  | Simple              | Multi-Stage             |
| Static Files  | Vite Serve করে      | Nginx Serve করে         |

---

# 📦 ২৫. Development Frontend Dockerfile

Development বা Preview Environment-এর জন্য:

```dockerfile
FROM node:20-alpine

WORKDIR /app

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
```

এখানে Vite নিজেই Application Serve করছে।

---

# 🚀 ২৬. Production Frontend Flow

Production-এ:

```text
React/Vite Source
       ↓
   npm run build
       ↓
      dist/
       ↓
      Nginx
       ↓
     Browser
```

Node.js এখানে শুধু **Build Stage-এ** ব্যবহৃত হচ্ছে।

Final Frontend Runtime Image-এ Node.js প্রয়োজন নেই।

---

# 🧠 ২৭. গুরুত্বপূর্ণ Docker Commands

### `FROM`

Base Image নির্ধারণ করে।

```dockerfile
FROM node:20-alpine
```

---

### `WORKDIR`

Working Directory সেট করে।

```dockerfile
WORKDIR /app
```

---

### `COPY`

File বা Directory Image-এর মধ্যে Copy করে।

```dockerfile
COPY . .
```

---

### `RUN`

Image Build হওয়ার সময় Command চালায়।

```dockerfile
RUN npm install
```

---

### `EXPOSE`

Container কোন Port ব্যবহার করছে তা নির্দেশ করে।

```dockerfile
EXPOSE 5000
```

---

### `CMD`

Container Start হলে কোন Command চলবে তা নির্ধারণ করে।

```dockerfile
CMD ["node", "dist/server.js"]
```

---

### `ARG`

Build-time Variable তৈরি করে।

```dockerfile
ARG VITE_API_URL=/api
```

---

### `ENV`

Environment Variable সেট করে।

```dockerfile
ENV VITE_API_URL=$VITE_API_URL
```

---

# 🌐 ২৮. Nginx-এর গুরুত্বপূর্ণ বিষয়

### Static File Serving

```text
React dist/
      ↓
Nginx
      ↓
Browser
```

### Reverse Proxy

```text
/api/*
   ↓
Nginx
   ↓
Node.js
```

### SPA Routing

```nginx
try_files $uri /index.html;
```

React Router-এর Route Handle করার জন্য এটি গুরুত্বপূর্ণ।

---

# ⭐ ২৯. Key Takeaways

### ১. Multi-Stage Build

Build এবং Runtime Environment আলাদা করার জন্য Multi-Stage Build ব্যবহার করা হয়।

### ২. Builder Stage

Application-এর Dependencies Install এবং Build করে।

```text
npm install
npm run build
```

### ৩. Runtime Stage

শুধু Production-এর প্রয়োজনীয় Files এবং Dependencies রাখে।

```text
Production Dependencies
+
dist/
```

### ৪. `--omit=dev`

Development Dependencies বাদ দিয়ে শুধু Production Dependencies Install করে।

### ৫. React/Vite + Nginx

React/Vite Build করার পরে পাওয়া Static Files Nginx Serve করতে পারে।

### ৬. Nginx Reverse Proxy

Nginx API Request Backend-এ Forward করতে পারে:

```text
/api/*
   ↓
Node.js
```

### ৭. Docker Networking

Docker Compose-এর Service Name ব্যবহার করে Container-গুলো একে অপরের সাথে যোগাযোগ করতে পারে:

```text
server:5000
```

### ৮. SPA Routing

React Router-এর জন্য:

```nginx
try_files $uri /index.html;
```

ব্যবহার করা হয়।

---

# 🎯 ৩০. পুরো বিষয়টি এক নজরে

```text
                         USER
                           │
                           ▼
                     ┌──────────┐
                     │ Browser  │
                     └────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │   Nginx   │
                    │    :80    │
                    └─────┬─────┘
                          │
               ┌──────────┴──────────┐
               │                     │
              /                    /api
               │                     │
               ▼                     ▼
        ┌──────────────┐     ┌──────────────┐
        │ React/Vite   │     │ Node.js      │
        │ Static Files │     │ Express API  │
        └──────────────┘     └──────┬───────┘
                                    │
                                    ▼
                               ┌──────────┐
                               │ Database │
                               └──────────┘
```

---

## 🏁 সংক্ষেপে

একটি Production Application-এর ক্ষেত্রে আমরা করতে পারি:

```text
React/Vite
    ↓
npm run build
    ↓
dist/
    ↓
Nginx
```

এবং Backend:

```text
Node.js/Express
    ↓
npm run build
    ↓
dist/server.js
    ↓
Node.js Runtime
```

তারপর Nginx:

```text
/       → React Frontend
/api/*  → Node.js Backend
```

অর্থাৎ সম্পূর্ণ Architecture:

```text
React/Vite
     ↓
Multi-Stage Build
     ↓
Nginx
     ↓
/api
     ↓
Node.js/Express
     ↓
Database
```

**এটাই Docker Multi-Stage Build + Production Docker Image + Nginx Reverse Proxy-এর একটি পরিষ্কার Production Architecture।**

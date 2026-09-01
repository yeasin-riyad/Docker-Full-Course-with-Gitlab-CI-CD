# 🐳 Docker & GitLab CI/CD

This repository covers the essential concepts and practical workflows of **Docker, Production Docker Images, Nginx, and GitLab CI/CD**.

The main goal is to understand how to containerize applications, manage multi-container applications, optimize Docker images for production, configure Nginx as a web server and reverse proxy, and automate deployment to a VPS using GitLab CI/CD.

---

## 📚 Table of Contents

1. [Docker Fundamentals](#-docker-fundamentals)
2. [Docker Architecture](#-docker-architecture)
3. [Core Docker Concepts](#-core-docker-concepts)
4. [Practical Docker Implementation](#-practical-docker-implementation)
5. [Docker Compose](#-docker-compose)
6. [Production Optimization](#-production-optimization)
7. [Multi-Stage Builds](#-multi-stage-builds)
8. [Nginx](#-nginx)
9. [GitLab CI/CD](#-gitlab-cicd)
10. [SSH Key Setup](#-ssh-key-setup)
11. [GitLab CI/CD Variables](#-gitlab-cicd-variables)
12. [Complete Deployment Flow](#-complete-deployment-flow)
13. [Key Takeaways](#-key-takeaways)

---

# 🐳 Docker Fundamentals

## What is Docker?

**Docker** is a containerization platform that allows developers to package an application together with its dependencies and run it in an isolated environment called a **container**.

One of Docker's biggest advantages is reducing **environment inconsistency**.

Without Docker:

```text
Developer Machine
       ↓
Different OS / Dependencies
       ↓
Application
       ↓
"It works on my machine!"
```

With Docker:

```text
Application
    +
Dependencies
    +
Configuration
    ↓
Docker Image
    ↓
Container
```

The same Docker image can be used across different environments:

```text
Developer PC
     ↓
   Docker
     ↓
 Container

VPS Server
     ↓
   Docker
     ↓
 Container

Cloud Server
     ↓
   Docker
     ↓
 Container
```

This makes application deployment more consistent and predictable.

---

# 🏗️ Docker Architecture

Docker consists of several important components:

```text
              Docker CLI
                  │
                  ▼
           Docker Daemon
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
     Images   Containers  Networks
                           │
                           ▼
                        Volumes
```

---

## ⚙️ Docker Engine

**Docker Engine** is the core technology that allows Docker containers to be created and managed.

It provides the environment required to:

* Build images
* Run containers
* Manage networks
* Manage volumes
* Manage container lifecycle

---

## 🔧 Docker Daemon

The **Docker Daemon** runs in the background and manages Docker resources such as:

* Containers
* Images
* Networks
* Volumes

The basic communication flow is:

```text
Docker CLI
    ↓
Docker Daemon
    ↓
Docker Resources
```

---

## 💻 Docker CLI

The **Docker CLI** is the command-line interface used to communicate with Docker.

Common commands:

```bash
docker build
docker run
docker ps
docker stop
docker images
docker pull
docker push
```

---

# 📦 Core Docker Concepts

The four fundamental Docker concepts are:

```text
Image
Container
Network
Volume
```

---

# 🖼️ 1. Docker Image

A **Docker Image** is a read-only template used to create containers.

It contains everything required to run an application, such as:

* Application code
* Runtime
* Dependencies
* Configuration

Example:

```text
Application
     +
Dependencies
     +
Runtime
     ↓
Docker Image
```

Example command:

```bash
docker build -t my-app .
```

Here:

```text
my-app
```

is the image name.

---

# 📦 2. Docker Container

A **Container** is a running instance of a Docker Image.

The relationship is:

```text
Docker Image
      ↓
    docker run
      ↓
Docker Container
```

Example:

```bash
docker run my-app
```

This creates and starts a container from the `my-app` image.

---

# 🔗 3. Docker Network

Docker Networks allow containers to communicate with each other.

Example:

```text
┌──────────────┐
│   Frontend   │
│    Nginx     │
└──────┬───────┘
       │
       │ Docker Network
       ▼
┌──────────────┐
│   Backend    │
│   Node.js    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Database   │
└──────────────┘
```

Docker Compose allows services to communicate using their service names.

For example:

```text
server:5000
```

Here, `server` can be the Backend service name.

---

# 💾 4. Docker Volumes

Container data can be lost when a container is removed.

**Docker Volumes** provide persistent storage outside the container's writable layer.

Example:

```text
Container
    │
    ▼
 Volume
    │
    ▼
Persistent Data
```

Volumes are especially useful for databases and other stateful applications.

---

# 🛠️ Practical Docker Implementation

## 📄 Dockerfile

A `Dockerfile` contains instructions for building a Docker Image.

Example:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

A Dockerfile defines:

* Base Image
* Working Directory
* Dependencies
* Source Code
* Build Process
* Application Port
* Startup Command

---

# 🚫 `.dockerignore`

The `.dockerignore` file prevents unnecessary files from being included in the Docker build context.

Example:

```text
node_modules
.env
.git
.gitignore
Dockerfile
README.md
npm-debug.log
```

Important files to ignore include:

```text
node_modules
.env
.git
```

### Why ignore `node_modules`?

Dependencies can be installed inside the Docker Image:

```dockerfile
RUN npm install
```

There is usually no need to copy the local `node_modules`.

### Why ignore `.env`?

Environment files may contain sensitive information such as:

```text
Database credentials
API keys
Secret keys
Passwords
```

Secrets should not be baked into Docker Images.

---

# 🐳 Docker Compose

**Docker Compose** makes it easier to define and manage multi-container applications.

For example, an application might contain:

```text
Frontend
Backend
Database
Redis
```

Instead of manually managing each container, Docker Compose allows us to define everything in one configuration file.

Example:

```yaml
services:

  server:
    build:
      context: ./server
    restart: unless-stopped
    environment:
      PORT: 5000
      MONGODB_URI: ${MONGODB_URI}

  client:
    build:
      context: ./client
      args:
        VITE_API_URL: /api
    restart: unless-stopped
    depends_on:
      - server
    ports:
      - "80:80"
```

---

# 🏭 Production Optimization

Production Docker Images should ideally be:

* Small
* Secure
* Clean
* Fast to deploy
* Easy to maintain

For this purpose, we can use:

```text
Multi-Stage Builds
        +
Production Dependencies
        +
Nginx
```

---

# 🏗️ Multi-Stage Builds

**Multi-Stage Build** allows us to use multiple `FROM` instructions in a single Dockerfile.

This makes it possible to separate the **Build Environment** from the **Production Runtime Environment**.

Architecture:

```text
             Builder Stage
                   │
                   ▼
        Install Dependencies
                   │
                   ▼
              Build App
                   │
                   ▼
                dist/
                   │
                   ▼
             Runtime Stage
                   │
                   ▼
       Production Application
```

---

## 🚀 Why Use Multi-Stage Builds?

The Builder Stage may contain:

```text
Source Code
TypeScript
Development Dependencies
Build Tools
Testing Tools
```

Most of these are not required at runtime.

The Runtime Stage can contain only:

```text
Production Dependencies
+
Compiled Application
```

This results in:

```text
Smaller Image
      +
Better Security
      +
Faster Deployment
```

---

# 📦 Production Dependencies

For Node.js applications, development dependencies can be excluded from the production image:

```bash
npm install --omit=dev
```

For example:

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

Production typically needs:

```text
express
mongoose
```

But does not need:

```text
typescript
eslint
nodemon
```

Therefore:

```bash
npm install --omit=dev
```

helps keep the production image smaller.

---

# 🌐 Nginx

**Nginx** is a high-performance web server and reverse proxy.

For a React/Vite application, the frontend can be built into static files:

```text
React/Vite
     ↓
npm run build
     ↓
dist/
```

Nginx can then serve those static files:

```text
dist/
  ↓
Nginx
  ↓
Browser
```

Nginx can also work as a **Reverse Proxy** for the Backend API.

---

# 🔄 Nginx Reverse Proxy

Example Nginx configuration:

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

## 🔀 Frontend Routing

If the React application has:

```text
/login
/dashboard
/products
/profile
```

Nginx uses:

```nginx
location / {
    try_files $uri /index.html;
}
```

This allows React Router to handle client-side routes.

For example:

```text
Browser
   ↓
/login
   ↓
Nginx
   ↓
index.html
   ↓
React
   ↓
React Router
   ↓
<Login />
```

---

## 🔗 API Routing

When the frontend sends:

```javascript
fetch("/api/products");
```

the request flow becomes:

```text
Browser
   ↓
/api/products
   ↓
Nginx
   ↓
server:5000
   ↓
Node.js / Express
   ↓
Database
```

Here:

```text
server
```

is the Docker Compose service name of the Backend.

---

# 🔐 GitLab CI/CD

Docker can package our application, while **GitLab CI/CD** can automate the process of building and deploying it.

The basic workflow is:

```text
Developer
    ↓
Git Push
    ↓
GitLab Repository
    ↓
CI/CD Pipeline
    ↓
Build
    ↓
Test
    ↓
Deploy
    ↓
VPS Server
```

---

# 🔄 What is CI/CD?

## Continuous Integration — CI

CI automatically validates changes when developers push code.

Typical CI tasks include:

```text
Install Dependencies
       ↓
Build Application
       ↓
Run Tests
       ↓
Validate Code
```

---

## Continuous Delivery/Deployment — CD

CD automates the process of delivering or deploying the application after the CI process succeeds.

Example:

```text
Code Push
    ↓
Build
    ↓
Test
    ↓
Docker Image
    ↓
Deploy to VPS
```

---

# 🔐 SSH Key Setup

GitLab CI/CD can connect to a VPS using **SSH**.

Architecture:

```text
GitLab CI/CD
      │
      │ SSH
      ▼
  VPS Server
```

SSH provides secure authentication between the GitLab runner and the VPS.

---

# 🔑 GitLab CI/CD Variables

Sensitive information should not be hardcoded inside `.gitlab-ci.yml`.

Examples:

```text
SSH_PRIVATE_KEY
SERVER_HOST
SERVER_USER
MONGODB_URI
```

These values can be stored securely using GitLab's **CI/CD Variables**.

The workflow becomes:

```text
GitLab Variables
       │
       ▼
CI/CD Pipeline
       │
       ▼
VPS Deployment
```

This keeps sensitive information out of the source code.

---

# 📄 `.gitlab-ci.yml`

The `.gitlab-ci.yml` file defines the GitLab CI/CD pipeline.

A pipeline can contain stages such as:

```text
Build
  ↓
Test
  ↓
Deploy
```

Conceptually:

```yaml
stages:
  - build
  - test
  - deploy
```

Each stage can contain one or more jobs.

Example workflow:

```text
                 Git Push
                    │
                    ▼
              ┌───────────┐
              │   Build   │
              └─────┬─────┘
                    │
                    ▼
              ┌───────────┐
              │   Test    │
              └─────┬─────┘
                    │
                    ▼
              ┌───────────┐
              │  Deploy   │
              └─────┬─────┘
                    │
                    ▼
               VPS Server
```

---

# 🚀 Complete Deployment Flow

Combining Docker, Nginx, Docker Compose, and GitLab CI/CD:

```text
                    Developer
                        │
                        │ git push
                        ▼
                ┌──────────────┐
                │    GitLab    │
                └──────┬───────┘
                       │
                       ▼
                GitLab CI/CD
                       │
              ┌────────┴────────┐
              │                 │
            Build              Test
              │                 │
              └────────┬────────┘
                       │
                       ▼
                   Deploy
                       │
                       │ SSH
                       ▼
                 ┌───────────┐
                 │ VPS Server│
                 └─────┬─────┘
                       │
                       ▼
                Docker Compose
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           Client             Server
          Nginx :80         Node.js :5000
              │                 │
              │                 ▼
              │              MongoDB
              │
              ├── / → React
              │
              └── /api → Backend
```

---

# 🔥 Complete Request Flow

When a user visits:

```text
https://example.com/login
```

the request flows through:

```text
Browser
   ↓
VPS
   ↓
Nginx :80
   ↓
index.html
   ↓
React Application
   ↓
React Router
   ↓
Login Page
```

When the Login Page sends:

```text
POST /api/login
```

the request flows through:

```text
Browser
   ↓
Nginx :80
   ↓
/api/login
   ↓
server:5000
   ↓
Node.js / Express
   ↓
MongoDB
```

---

# 🧩 Complete Architecture

```text
                           INTERNET
                               │
                               ▼
                         ┌───────────┐
                         │  Browser  │
                         └─────┬─────┘
                               │
                               ▼
                         ┌───────────┐
                         │   Nginx   │
                         │    :80    │
                         └─────┬─────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                   /                    /api/
                    │                     │
                    ▼                     ▼
             React Static Files     Node.js / Express
                                          │
                                          ▼
                                      MongoDB
```

---

# ⭐ Key Takeaways

### 1. Docker

Docker packages an application and its dependencies into containers, making environments more consistent.

### 2. Image

An Image is a read-only template used to create containers.

```text
Image
  ↓
Container
```

### 3. Container

A Container is a running instance of a Docker Image.

### 4. Docker Network

Networks allow containers to communicate with each other.

### 5. Docker Volume

Volumes provide persistent storage for containerized applications.

### 6. Dockerfile

A Dockerfile defines how a Docker Image should be built.

### 7. `.dockerignore`

Prevents unnecessary and sensitive files from being included in the Docker build context.

### 8. Docker Compose

Docker Compose simplifies managing multiple services such as:

```text
Frontend
Backend
Database
Redis
```

### 9. Multi-Stage Build

Separates the Build Environment from the Production Runtime Environment.

### 10. Nginx

Nginx can:

* Serve frontend static files
* Handle SPA routing
* Act as a Reverse Proxy
* Forward API requests to the Backend

### 11. GitLab CI/CD

GitLab CI/CD automates:

```text
Build
  ↓
Test
  ↓
Deploy
```

### 12. SSH

SSH allows GitLab CI/CD to securely connect to the VPS server.

### 13. GitLab Variables

Sensitive credentials and configuration values should be stored securely in GitLab CI/CD Variables instead of being hardcoded.

---

# 🎯 Final Summary

The complete production workflow can be summarized as:

```text
Developer
    ↓
Git Push
    ↓
GitLab
    ↓
GitLab CI/CD
    ↓
Build + Test
    ↓
Docker
    ↓
Production Deployment
    ↓
VPS
    ↓
Docker Compose
    ↓
Nginx + Node.js
    ↓
Database
```

And the production request architecture is:

```text
                       Browser
                          │
                          ▼
                       Nginx
                        :80
                          │
               ┌──────────┴──────────┐
               │                     │
              /                    /api
               │                     │
               ▼                     ▼
            React               Node.js
          Frontend              Backend
                                    │
                                    ▼
                                 MongoDB
```

> **Docker handles containerization, Nginx handles frontend serving and reverse proxying, Docker Compose manages multiple services, and GitLab CI/CD automates the deployment process.**

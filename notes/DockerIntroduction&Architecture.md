# 🐳 Docker: Introduction & Architecture

Docker is one of the most important technologies for modern backend development, DevOps, and microservices.

This guide explains **what Docker is, why we use it, and how Docker Architecture works** in simple Bangla with practical examples.

---

## 📚 Table of Contents

- [What is Docker?](#-what-is-docker)
- [Why Do We Need Docker?](#-why-do-we-need-docker)
- [What is a Container?](#-what-is-a-container)
- [Docker Architecture](#-docker-architecture)
- [Docker Client / CLI](#1️⃣-docker-client--cli)
- [Docker API](#2️⃣-docker-api)
- [Docker Daemon](#3️⃣-docker-daemon)
- [Docker Engine](#-docker-engine)
- [Docker Image](#-docker-image)
- [Docker Registry](#-docker-registry)
- [How `docker run` Works](#-how-docker-run-works)
- [How `docker build` Works](#-how-docker-build-works)
- [Complete Docker Workflow](#-complete-docker-workflow)
- [Docker Architecture Example](#-docker-architecture-example)
- [Docker CLI vs Docker Daemon](#-docker-cli-vs-docker-daemon)
- [Key Takeaways](#-key-takeaways)
- [Final Mental Model](#-final-mental-model)

---

# 🐳 What is Docker?

**Docker** হলো একটি **open-source containerization platform**।

Docker application-এর:

- Application Code
- Runtime
- Dependencies
- Libraries
- System Tools
- Configuration

একসাথে package করে একটি **Docker Image** তৈরি করতে সাহায্য করে।

সেই image থেকে আমরা **Container** তৈরি করে application চালাতে পারি।

সহজভাবে:

> **Docker = Application + তার প্রয়োজনীয় environment-কে একটি portable container-এর মধ্যে রাখা।**

### Example

ধরো তোমার Node.js application চালাতে প্রয়োজন:

```text
Node.js 20
Express.js
npm packages
Environment variables
System dependencies
Application code
```

Docker এগুলোকে একটি image-এর মাধ্যমে package করে container-এ চালাতে পারে।

```text
┌──────────────────────────────┐
│       Docker Container       │
│                              │
│  Application Code            │
│  Node.js Runtime             │
│  Dependencies                │
│  Libraries                   │
│  Configuration               │
│                              │
└──────────────────────────────┘
```

---

# 🤔 Why Do We Need Docker?

Software development-এ একটি খুব common সমস্যা হলো:

> **"It works on my machine!"**

ধরো তোমার computer-এ:

```text
Node.js      → 20
PostgreSQL   → 16
Redis        → 7
OS           → Windows
```

তোমার teammate-এর computer:

```text
Node.js      → 18
PostgreSQL   → 14
Redis        → 6
OS           → macOS
```

Production server:

```text
Node.js      → 20
PostgreSQL   → 15
Redis        → 7
OS           → Linux
```

একই code হলেও environment আলাদা হওয়ার কারণে application ভিন্নভাবে behave করতে পারে।

Docker এই ধরনের **environment inconsistency** অনেকটাই কমাতে সাহায্য করে।

---

# 📦 What is a Container?

**Container** হলো একটি Docker Image-এর running instance।

সহজভাবে:

```text
Docker Image
     ↓
Container
     ↓
Running Application
```

একটি image থেকে একাধিক container তৈরি করা যায়।

```text
             Docker Image
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
   Container   Container   Container
```

### সহজ উদাহরণ

যেমন:

```text
Class
  ↓
Object
```

তেমন:

```text
Docker Image
  ↓
Container
```

---

# 🏗️ Docker Architecture

Docker মূলত একটি **Client-Server Architecture** অনুসরণ করে।

এর গুরুত্বপূর্ণ components:

1. **Docker Client / CLI**
2. **Docker API**
3. **Docker Daemon**
4. **Docker Engine**
5. **Docker Images**
6. **Docker Containers**
7. **Docker Registry**

Basic architecture:

```text
                         USER
                           │
                           │ Docker Commands
                           ▼
                  ┌─────────────────┐
                  │   Docker CLI    │
                  │                 │
                  │ docker run      │
                  │ docker build    │
                  │ docker ps       │
                  └────────┬────────┘
                           │
                           │ Docker API
                           ▼
                  ┌─────────────────┐
                  │ Docker Daemon   │
                  │    dockerd      │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Images      Containers     Networks
                                        │
                                        ▼
                                    Volumes
```

এখন প্রতিটি component বিস্তারিতভাবে দেখি।

---

# 1️⃣ Docker Client / CLI

**Docker CLI** হলো Docker-এর সাথে interaction করার জন্য আমাদের command-line interface।

আমরা Terminal থেকে যে Docker commands লিখি, সেগুলো Docker CLI-এর মাধ্যমে Docker daemon-এর কাছে যায়।

### Example

```bash
docker run nginx
```

```bash
docker build -t my-app .
```

```bash
docker ps
```

```bash
docker stop my-container
```

Docker CLI নিজে container চালায় না।

এটি মূলত Docker daemon-কে instruction দেয়।

```text
You
 │
 │ docker run nginx
 ▼
Docker CLI
```

সহজভাবে:

> **Docker CLI = Docker-কে command দেওয়ার মাধ্যম।**

---

# 2️⃣ Docker API

Docker CLI এবং Docker Daemon-এর মধ্যে communication করার জন্য **Docker API** ব্যবহৃত হয়।

Flow:

```text
User
 │
 │ docker run nginx
 ▼
Docker CLI
 │
 │ Docker API
 ▼
Docker Daemon
```

API হলো communication interface।

CLI daemon-কে বলতে পারে:

```text
"একটা container চালাও"

"একটা image build করো"

"এই container বন্ধ করো"

"এই container-এর information দাও"
```

---

# 3️⃣ Docker Daemon

Docker-এর সবচেয়ে গুরুত্বপূর্ণ components-এর একটি হলো **Docker Daemon**।

এটি একটি background process, সাধারণত:

```text
dockerd
```

নামে চলে।

Docker daemon Docker-এর actual operations পরিচালনা করে।

এর দায়িত্বের মধ্যে রয়েছে:

- Docker Images manage করা
- Containers create করা
- Containers start করা
- Containers stop করা
- Networks manage করা
- Volumes manage করা
- Docker resources পরিচালনা করা

সহজভাবে:

> **Docker CLI command দেয়, Docker Daemon সেই command-এর কাজ করে।**

---

# 🧠 Example: `docker run nginx`

তুমি Terminal-এ লিখলে:

```bash
docker run nginx
```

তখন conceptually:

### Step 1 — User Command

```text
docker run nginx
```

### Step 2 — Docker CLI

CLI command-টি গ্রহণ করে।

```text
Docker CLI
```

### Step 3 — Docker API

CLI API-এর মাধ্যমে Docker Daemon-এর কাছে request পাঠায়।

```text
CLI
 ↓
Docker API
 ↓
Docker Daemon
```

### Step 4 — Image Check

Docker daemon দেখে:

```text
nginx image কি local machine-এ আছে?
```

যদি না থাকে, Docker Registry থেকে image pull করতে পারে।

### Step 5 — Container Creation

Image ব্যবহার করে container তৈরি করা হয়।

```text
nginx Image
     ↓
Container
```

### Step 6 — Container Start

শেষে:

```text
nginx Container
      ↓
Running 🚀
```

---

# ⚙️ Docker Engine

**Docker Engine** হলো Docker-এর core technology/platform যা containers তৈরি, চালানো এবং manage করার জন্য প্রয়োজনীয় infrastructure প্রদান করে।

Conceptually:

```text
Docker Engine
│
├── Docker Daemon
│      └── dockerd
│
├── Docker APIs
│
└── Container Runtime
```

অনেক সময় learning-এর সময় **Docker Engine**, **Docker Daemon**, এবং **Docker** শব্দগুলোকে কাছাকাছি অর্থে ব্যবহার করা হয়।

তবে এগুলোকে conceptually আলাদা করে বোঝা ভালো।

---

# 🖼️ Docker Image

**Docker Image** হলো container তৈরি করার একটি template।

উদাহরণ:

```text
Node.js Image
     │
     ├── Node.js Runtime
     ├── Required Libraries
     └── Required Files
```

একটি image থেকে একাধিক container তৈরি করা সম্ভব।

```text
             Node.js Image
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
       C1        C2        C3
```

সহজভাবে:

> **Image = Template**

---

# 📦 Docker Container

Container হলো Docker Image-এর running instance।

```text
Docker Image
     │
     ▼
Docker Container
     │
     ▼
Running Application
```

উদাহরণ:

```bash
docker run node:20
```

এখানে:

```text
node:20
   ↓
Docker Image
   ↓
Container
```

---

# 🌐 Docker Registry

**Docker Registry** হলো Docker Images store এবং distribute করার জায়গা।

সবচেয়ে জনপ্রিয় public registry হলো:

```text
Docker Hub
```

ধরো তুমি চালালে:

```bash
docker pull nginx
```

যদি `nginx` image local machine-এ না থাকে, Docker registry থেকে image pull করতে পারে।

Architecture:

```text
                 Docker Hub
                     │
                     │ Pull Image
                     ▼
              Docker Daemon
                     │
                     ▼
                Nginx Image
                     │
                     ▼
                 Container
```

---

# 🔨 How `docker build` Works

ধরো তোমার project-এ একটি `Dockerfile` আছে:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

এখন command:

```bash
docker build -t my-app .
```

Flow:

```text
Dockerfile
    │
    ▼
docker build
    │
    ▼
Docker Image
    │
    ▼
my-app
```

অর্থাৎ:

> **Dockerfile → Docker Build → Docker Image**

---

# ▶️ How `docker run` Works

Image তৈরি হওয়ার পরে:

```bash
docker run my-app
```

Flow:

```text
Docker Image
     │
     ▼
docker run
     │
     ▼
Docker Container
     │
     ▼
Application Running 🚀
```

---

# 🔄 Complete Docker Workflow

একটি সাধারণ application-এর workflow:

```text
             Developer
                  │
                  ▼
             Dockerfile
                  │
                  ▼
            docker build
                  │
                  ▼
             Docker Image
                  │
                  ▼
              docker run
                  │
                  ▼
            Docker Container
                  │
                  ▼
           Application 🚀
```

---

# 🐳 Docker Registry Workflow

যদি image Docker Hub-এ push করতে চাও:

```text
Developer
    │
    ▼
Dockerfile
    │
    ▼
docker build
    │
    ▼
Docker Image
    │
    ▼
docker push
    │
    ▼
Docker Hub
```

অন্য machine থেকে:

```text
Docker Hub
    │
    │ docker pull
    ▼
Docker Image
    │
    ▼
Docker Container
```

---

# 🧩 Docker Architecture Example

ধরো তুমি একটি Node.js backend তৈরি করেছো।

তোমার application-এর প্রয়োজন:

```text
Node.js
PostgreSQL
Redis
```

Docker ব্যবহার করলে:

```text
                    Docker
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      Backend      PostgreSQL     Redis
     Container      Container     Container
          │            │            │
          └────────────┼────────────┘
                       │
                  Docker Network
```

Backend PostgreSQL-এর সাথে communicate করতে পারে:

```text
Backend
   │
   │ Database Request
   ▼
PostgreSQL
```

এবং Redis-এর সাথে:

```text
Backend
   │
   │ Cache Request
   ▼
Redis
```

---

# 🧠 Real-World Example

ধরো তুমি command দিলে:

```bash
docker run redis
```

Conceptually পুরো process:

```text
                         YOU
                          │
                          │ docker run redis
                          ▼
                  ┌───────────────┐
                  │  Docker CLI   │
                  └───────┬───────┘
                          │
                          │ Docker API
                          ▼
                  ┌───────────────┐
                  │ Docker Daemon │
                  │    dockerd    │
                  └───────┬───────┘
                          │
                          │
                 Redis Image Check
                          │
                 ┌────────┴────────┐
                 │                 │
              Exists?             No
                 │                 │
                 │                 ▼
                 │          Docker Registry
                 │                 │
                 │                 ▼
                 │            Redis Image
                 │                 │
                 └────────┬────────┘
                          ▼
                    Redis Container
                          │
                          ▼
                   Redis Running 🚀
```

---

# 🆚 Docker CLI vs Docker Daemon

| Docker CLI | Docker Daemon |
|---|---|
| User-এর commands গ্রহণ করে | Actual Docker operations পরিচালনা করে |
| `docker run` | Container create/start করে |
| `docker build` | Image build করে |
| `docker ps` | Container information দেয় |
| `docker stop` | Container stop করে |
| Client হিসেবে কাজ করে | Background service হিসেবে কাজ করে |

সহজভাবে:

```text
CLI    = "কি করতে হবে" বলে
Daemon = "কাজটা করে"
```

---

# 🧱 Important Docker Commands

### Check Docker version

```bash
docker --version
```

### Pull an image

```bash
docker pull nginx
```

### Run a container

```bash
docker run nginx
```

### Run container in background

```bash
docker run -d nginx
```

### List running containers

```bash
docker ps
```

### List all containers

```bash
docker ps -a
```

### Build an image

```bash
docker build -t my-app .
```

### Stop a container

```bash
docker stop <container_id>
```

### Remove a container

```bash
docker rm <container_id>
```

### List images

```bash
docker images
```

---

# 🎯 Docker-এর মূল বিষয়গুলো একসাথে

Docker-এর architecture মনে রাখার সবচেয়ে সহজ formula:

```text
Docker CLI
    ↓
Docker API
    ↓
Docker Daemon
    ↓
┌──────────┬────────────┬──────────┐
│          │            │          │
Images  Containers   Networks   Volumes
```

আর Registry-এর সাথে:

```text
Docker CLI
    ↓
Docker API
    ↓
Docker Daemon
    ↓
Docker Registry
    ↓
Docker Image
    ↓
Docker Container
```

---

# 🔑 Key Takeaways

## 1️⃣ Docker কী?

Docker হলো application-কে container-এর মধ্যে package এবং run করার platform।

---

## 2️⃣ Docker Architecture কী?

Docker মূলত **Client-Server Architecture** ব্যবহার করে।

---

## 3️⃣ Docker CLI কী?

Docker-এর সাথে command দিয়ে interaction করার interface।

```bash
docker run
docker build
docker ps
docker stop
```

---

## 4️⃣ Docker API কী?

Docker CLI এবং Docker Daemon-এর মধ্যে communication interface।

```text
CLI
 ↓
API
 ↓
Daemon
```

---

## 5️⃣ Docker Daemon কী?

একটি background service যা Docker-এর actual operations পরিচালনা করে।

```text
dockerd
```

এটি manage করে:

```text
Images
Containers
Networks
Volumes
```

---

## 6️⃣ Docker Image কী?

Container তৈরি করার template।

```text
Image = Template
```

---

## 7️⃣ Docker Container কী?

Docker Image-এর running instance।

```text
Image
 ↓
Container
 ↓
Application
```

---

## 8️⃣ Docker Registry কী?

Docker Images store এবং distribute করার জায়গা।

Example:

```text
Docker Hub
```

---

# 🏁 Final Mental Model

সবকিছু একসাথে মনে রাখতে এই architecture-টি follow করো:

```text
                         USER
                          │
                          │ Docker Command
                          ▼
                  ┌─────────────────┐
                  │   Docker CLI    │
                  └────────┬────────┘
                           │
                           │ Docker API
                           ▼
                  ┌─────────────────┐
                  │ Docker Daemon   │
                  │    dockerd      │
                  └────────┬────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Images      Containers     Networks
             │             │
             │             ▼
             │        Application
             │
             ▼
       Docker Registry
          Docker Hub
```

---

# 🚀 Final Summary

Docker-এর core concept খুব সহজ:

```text
Application
     +
Dependencies
     +
Runtime
     +
Environment
     ↓
Docker Image
     ↓
Docker Container
     ↓
Running Application 🚀
```

আর Docker Architecture:

```text
User
 ↓
Docker CLI
 ↓
Docker API
 ↓
Docker Daemon
 ↓
Images / Containers / Networks / Volumes
```

সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো:

> 🐳 **Docker CLI দিয়ে আমরা Docker Daemon-কে command দিই, Docker API সেই communication handle করে, আর Docker Daemon images, containers, networks এবং volumes-এর মতো resources manage করে।**

এই architecture বুঝে ফেললে `docker build`, `docker run`, `docker pull`, `docker push`, `docker ps`, `docker stop`, `docker exec`—এই commands কেন এবং কীভাবে কাজ করে, সেগুলো বোঝা অনেক সহজ হয়ে যাবে। 🚀
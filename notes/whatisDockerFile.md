# 🐳 Dockerfile — Docker Image তৈরির Recipe বা তালিকা

**Dockerfile** হলো একটি সাধারণ **text file**, যেখানে Docker-এর জন্য বিভিন্ন instruction লেখা থাকে।

সহজ কথায়:

> **Dockerfile হলো একটি recipe বা instruction list, যা Docker-কে বলে দেয় কীভাবে একটি application-এর Docker Image তৈরি করতে হবে।**

একটি application-কে Docker-এর মধ্যে চালানোর জন্য কী লাগবে, কোথায় application থাকবে, কোন files copy করতে হবে, কোন dependencies install করতে হবে এবং container start হলে কোন command চলবে—এসব Dockerfile-এ define করা যায়।

---

# 🧠 Dockerfile কেন প্রয়োজন?

ধরুন আপনার একটি Node.js application আছে:

```text
my-app/
├── package.json
├── package-lock.json
├── server.js
└── src/
```

আপনি চান application-টি Docker container-এর মধ্যে চলুক।

তাহলে Docker-কে জানতে হবে:

1. কোন base image ব্যবহার করবে?
2. Container-এর ভিতরে application কোথায় থাকবে?
3. কোন files copy করবে?
4. Dependencies কীভাবে install করবে?
5. কোন port ব্যবহার করবে?
6. Container start হলে কোন command execute করবে?

এই instructionsগুলো Dockerfile-এ লেখা হয়।

---

# 🍰 Dockerfile-কে Recipe হিসেবে ভাবুন

একটি রান্নার recipe যেমন বলে:

```text
1. চাল নাও
2. পানি দাও
3. রান্না করো
4. পরিবেশন করো
```

Dockerfile একইভাবে বলে:

```text
1. Base Image নাও
2. Working Directory তৈরি করো
3. Files Copy করো
4. Dependencies Install করো
5. Port Define করো
6. Application Start করো
```

তারপর Docker এই instructions অনুসরণ করে একটি **Docker Image** তৈরি করে।

---

# 🏗️ Dockerfile → Image → Container

এটি খুব ভালোভাবে মনে রাখুন:

```text
                Dockerfile
                    │
                    │ docker build
                    ▼
              Docker Image
                    │
                    │ docker run
                    ▼
             Docker Container
                    │
                    ▼
             Running Application
```

অর্থাৎ:

```text
Dockerfile
    ↓
Image
    ↓
Container
```

---

# 📄 Basic Dockerfile

একটি simple Node.js application-এর Dockerfile:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

এখন প্রতিটি instruction বুঝি।

---

# 1️⃣ FROM

```dockerfile
FROM node:20
```

`FROM` দিয়ে Dockerfile-এর **Base Image** নির্ধারণ করা হয়।

Node.js application-এর জন্য আমরা Node.js image ব্যবহার করতে পারি।

```text
node:20
```

মানে:

```text
Node.js version 20
```

Docker Hub-এ বিভিন্ন ধরনের official image পাওয়া যায়।

উদাহরণ:

```dockerfile
FROM node:20
```

অথবা:

```dockerfile
FROM node:20-alpine
```

Nginx-এর জন্য:

```dockerfile
FROM nginx:latest
```

Python-এর জন্য:

```dockerfile
FROM python:3.12
```

---

# 🧠 Base Image কী?

Base Image হলো এমন একটি image যার ওপর ভিত্তি করে তুমি নিজের application image তৈরি করবে।

উদাহরণ:

```text
Node.js Base Image
        │
        ▼
Your Application
        │
        ▼
Your Docker Image
```

Node.js application হলে:

```dockerfile
FROM node:20
```

Docker প্রথমে Node.js-এর environment ব্যবহার করবে।

---

# 2️⃣ WORKDIR

```dockerfile
WORKDIR /app
```

এটি container-এর ভিতরে application-এর **working directory** সেট করে।

অর্থাৎ পরবর্তী commands `/app` directory-এর মধ্যে execute হবে।

```text
Container
│
└── /app
     │
     ├── package.json
     ├── server.js
     └── src/
```

এখন:

```dockerfile
COPY . .
```

এর মতো command দিলে files `/app`-এর মধ্যে copy হবে।

---

# 🤔 WORKDIR কেন ব্যবহার করি?

যদি `WORKDIR` না ব্যবহার করি, তাহলে files কোথায় থাকবে তা manage করা inconvenient হতে পারে।

তাই:

```dockerfile
WORKDIR /app
```

লিখে আমরা বলি:

> "আমার application-এর জন্য container-এর ভিতরে `/app` directory ব্যবহার করো।"

---

# 3️⃣ COPY

```dockerfile
COPY . .
```

`COPY` local machine থেকে files Docker image-এর filesystem-এ copy করে।

Syntax:

```dockerfile
COPY <source> <destination>
```

উদাহরণ:

```dockerfile
COPY . .
```

এর অর্থ:

```text
Local Computer
      │
      │ COPY
      ▼
Docker Image
      │
      ▼
/app
```

ধরুন local project:

```text
my-app/
├── package.json
├── server.js
└── src/
```

Dockerfile:

```dockerfile
COPY . .
```

তাহলে image-এর `/app`-এ এগুলো যাবে:

```text
/app
├── package.json
├── server.js
└── src/
```

---

# 4️⃣ RUN

```dockerfile
RUN npm install
```

`RUN` instruction **image build করার সময়** command execute করে।

যেমন:

```dockerfile
RUN npm install
```

এর অর্থ:

> Image তৈরি হওয়ার সময় `npm install` চালাও।

তখন:

```text
package.json
      │
      ▼
npm install
      │
      ▼
node_modules
```

Image-এর মধ্যে dependencies install হয়ে যায়।

---

# ⚠️ RUN কখন execute হয়?

এটি খুব গুরুত্বপূর্ণ।

```dockerfile
RUN npm install
```

এটি:

```text
docker build
```

এর সময় execute হয়।

**Container start করার সময় নয়।**

অর্থাৎ:

```text
docker build
     │
     ▼
RUN npm install
     │
     ▼
Image Created
```

---

# 5️⃣ EXPOSE

```dockerfile
EXPOSE 5000
```

`EXPOSE` Docker-কে জানায় যে application container-এর ভিতরে কোন port-এ listen করবে।

যেমন Node.js:

```javascript
app.listen(5000);
```

তাহলে Dockerfile-এ:

```dockerfile
EXPOSE 5000
```

লিখতে পারি।

Architecture:

```text
Node.js Application
        │
        ▼
Container Port 5000
```

### ⚠️ Important

`EXPOSE` নিজে থেকে host machine-এর port publish করে না।

যেমন:

```dockerfile
EXPOSE 5000
```

লিখলেই browser থেকে:

```text
localhost:5000
```

automatically accessible হবে না।

এর জন্য `docker run -p` ব্যবহার করতে হয়।

যেমন:

```bash
docker run -p 5000:5000 my-app
```

এখানে:

```text
Host Port       Container Port
    5000   →        5000
```

---

# 6️⃣ CMD

```dockerfile
CMD ["npm", "start"]
```

`CMD` বলে দেয়:

> **Container start হওয়ার পরে কোন default command execute হবে।**

যেমন:

```dockerfile
CMD ["npm", "start"]
```

তাহলে container start হলে:

```bash
npm start
```

চলবে।

Flow:

```text
docker run
    │
    ▼
Container Starts
    │
    ▼
CMD ["npm", "start"]
    │
    ▼
Node.js Application Running 🚀
```

---

# 🔄 RUN vs CMD

এটি খুব গুরুত্বপূর্ণ difference।

| RUN | CMD |
|---|---|
| Image build করার সময় চলে | Container start হলে চলে |
| Image তৈরির অংশ | Container-এর default startup command |
| `npm install` | `npm start` |
| Build time | Runtime |

### Example

```dockerfile
RUN npm install
```

মানে:

```text
docker build
    ↓
npm install
```

আর:

```dockerfile
CMD ["npm", "start"]
```

মানে:

```text
docker run
    ↓
npm start
```

---

# 🏗️ Complete Docker Build Process

ধরুন Dockerfile:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

এখন:

```bash
docker build -t my-node-app .
```

চালালে Docker step-by-step কাজ করবে।

```text
Dockerfile
    │
    ▼
FROM node:20
    │
    ▼
WORKDIR /app
    │
    ▼
COPY package*.json ./
    │
    ▼
RUN npm install
    │
    ▼
COPY . .
    │
    ▼
EXPOSE 5000
    │
    ▼
CMD ["npm", "start"]
    │
    ▼
Docker Image
```

---

# 🚀 তারপর Container Run

Image তৈরি হওয়ার পরে:

```bash
docker run -d \
  --name my-node-app \
  -p 5000:5000 \
  my-node-app
```

Flow:

```text
Docker Image
     │
     │ docker run
     ▼
Container
     │
     ▼
CMD
     │
     ▼
npm start
     │
     ▼
Node.js Application 🚀
```

---

# 📁 Example Project Structure

```text
my-node-app/
│
├── Dockerfile
├── package.json
├── package-lock.json
├── server.js
└── src/
    ├── routes/
    ├── controllers/
    └── services/
```

Dockerfile:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

---

# 🧪 Build Command

Dockerfile-এর directory-তে গিয়ে:

```bash
docker build -t my-node-app .
```

এখানে:

```text
docker build
     ↓
Image তৈরি করো

-t my-node-app
     ↓
Image-এর নাম

.
     ↓
Current directory থেকে Dockerfile খুঁজে নাও
```

---

# 🔍 Image Check

Build শেষ হলে:

```bash
docker images
```

তখন দেখতে পারো:

```text
REPOSITORY     TAG       IMAGE ID
my-node-app    latest    abc123
```

---

# ▶️ Container Run

```bash
docker run -d \
  --name my-node-app \
  -p 5000:5000 \
  my-node-app
```

তারপর:

```bash
docker ps
```

দিয়ে container running কিনা দেখতে পারো।

---

# 🌐 Application Access

যদি Node.js application:

```javascript
app.listen(5000);
```

এ চলে এবং Docker mapping:

```bash
-p 5000:5000
```

হয়, তাহলে:

```text
Browser
   │
   ▼
localhost:5000
   │
   ▼
Host Port 5000
   │
   ▼
Container Port 5000
   │
   ▼
Node.js
```

---

# 🧠 পুরো Process একসাথে

```text
              Dockerfile
                  │
                  │ docker build
                  ▼
             Docker Image
                  │
                  │ docker run
                  ▼
          Docker Container
                  │
                  │ CMD
                  ▼
         Node.js Application
                  │
                  ▼
              Port 5000
```

---

# 🔑 Dockerfile Instructions Summary

| Instruction | কাজ |
|---|---|
| `FROM` | Base Image নির্বাচন করে |
| `WORKDIR` | Working directory সেট করে |
| `COPY` | Local files image-এ copy করে |
| `RUN` | Image build-এর সময় command চালায় |
| `EXPOSE` | Container-এর intended port document করে |
| `CMD` | Container start হলে default command চালায় |

---

# 🎯 Final Mental Model

Dockerfile-কে এভাবে মনে রাখুন:

```text
FROM
 ↓
"কোন environment ব্যবহার করবো?"

WORKDIR
 ↓
"Application কোথায় থাকবে?"

COPY
 ↓
"কোন files নিয়ে আসবো?"

RUN
 ↓
"Image build করার সময় কী install/setup করবো?"

EXPOSE
 ↓
"Application কোন container port-এ চলে?"

CMD
 ↓
"Container start হলে কী চালাবো?"
```

শেষ পর্যন্ত:

```text
Dockerfile
    │
    │ docker build
    ▼
Docker Image
    │
    │ docker run
    ▼
Docker Container
    │
    ▼
Application 🚀
```

> **এক কথায়: Dockerfile হলো Docker Image তৈরির recipe, আর `docker build` সেই recipe অনুসরণ করে Image তৈরি করে।** 🐳
# 🌐 Nginx — Web Server & Reverse Proxy

**Nginx** (ইঞ্জিন-এক্স) হলো একটি জনপ্রিয় **হাই-পারফরম্যান্স ওয়েব সার্ভার**, যা একই সাথে একটি **Reverse Proxy** হিসেবেও কাজ করে।

সহজভাবে বললে, Nginx আপনার **Frontend এবং Backend-এর মধ্যে একটি Bridge বা Traffic Controller** হিসেবে কাজ করে।

---

## 🌐 1. Nginx as a Web Server

Web Server হিসেবে Nginx ব্রাউজারের request গ্রহণ করে এবং **static files** serve করে।

Static files-এর উদাহরণ:

- HTML
- CSS
- JavaScript
- Images
- Fonts

### Example

```text
Browser
   │
   │ Request
   ▼
 Nginx
   │
   ├── index.html
   ├── style.css
   ├── app.js
   └── image.png
   │
   ▼
Browser
```

অর্থাৎ, কোনো user যখন website visit করে, Nginx সরাসরি static files browser-এর কাছে পাঠাতে পারে।

---

## 🔄 2. Nginx as a Reverse Proxy

Nginx-এর গুরুত্বপূর্ণ একটি কাজ হলো **Reverse Proxy** হিসেবে কাজ করা।

এখানে Nginx একটি **নিরাপত্তা প্রহরী বা মধ্যস্থতাকারী** হিসেবে কাজ করে।

User সরাসরি backend server-এর সাথে communicate না করে প্রথমে Nginx-এর কাছে request পাঠায়।

```text
User
 │
 │ Request
 ▼
Nginx
 │
 │ Forward Request
 ▼
Backend Server
 │
 │ Response
 ▼
Nginx
 │
 ▼
User
```

ধরো তোমার Node.js backend চলছে:

```text
localhost:5000
```

User কিন্তু সরাসরি:

```text
example.com:5000
```

access করবে না।

বরং:

```text
User
 │
 │ https://example.com
 ▼
Nginx
 │
 │ http://localhost:5000
 ▼
Node.js Backend
```

এভাবে Nginx backend-এর সামনে একটি **Reverse Proxy Layer** তৈরি করে।

---

## 🚦 3. API Routing with Nginx

Nginx ব্যবহার করে বিভিন্ন API request সঠিক backend service-এ পাঠানো যায়।

ধরো তোমার application-এ:

```text
/api/auth
/api/users
/api/posts
```

এই ধরনের API আছে।

Nginx request-এর path দেখে সেটিকে সঠিক backend service-এ forward করতে পারে।

```text
                    Nginx
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
     /api/auth    /api/users   /api/posts
          │           │           │
          ▼           ▼           ▼
      Auth API     User API     Post API
```

Microservices architecture-এ এটি আরও useful।

উদাহরণ:

```text
/api/auth/*
      ↓
Identity Service

/api/posts/*
      ↓
Post Service

/api/messages/*
      ↓
Message Service
```

---

## 🧠 সহজভাবে Nginx-কে কীভাবে মনে রাখবেন?

Nginx-কে একটি **Traffic Controller** হিসেবে ভাবতে পারেন।

```text
                         User
                          │
                          ▼
                     ┌────────┐
                     │ Nginx  │
                     └───┬────┘
                         │
             ┌───────────┼───────────┐
             │           │           │
             ▼           ▼           ▼
         Frontend     Backend      API Service
```

User request পাঠালে Nginx সিদ্ধান্ত নেয়:

```text
এই request → Frontend-এ যাবে
এই request → Backend-এ যাবে
এই request → অন্য API Service-এ যাবে
```

---

## 🎯 Key Takeaways

### Web Server

Nginx static files serve করতে পারে:

```text
HTML
CSS
JavaScript
Images
```

### Reverse Proxy

Client-এর request backend server-এর কাছে forward করে:

```text
Client
  ↓
Nginx
  ↓
Backend
```

### API Routing

API path অনুযায়ী request সঠিক backend service-এ পাঠাতে পারে:

```text
/api/auth
    ↓
Auth Service

/api/posts
    ↓
Post Service
```

---

## 🏁 Final Mental Model

```text
                         USER
                          │
                          │ HTTP / HTTPS
                          ▼
                    ┌──────────────┐
                    │    NGINX     │
                    │              │
                    │ Web Server   │
                    │ Reverse Proxy│
                    │ API Router   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Frontend      Backend      API Service
```

> **সংক্ষেপে: Nginx হলো একটি high-performance Web Server এবং Reverse Proxy, যা client-এর request গ্রহণ করে static files serve করতে পারে এবং API request-গুলোকে সঠিক backend service বা server-এর কাছে forward করতে পারে।**
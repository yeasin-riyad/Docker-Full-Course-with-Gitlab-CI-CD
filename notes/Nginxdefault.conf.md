# 🌐 Nginx `default.conf` — বাংলা গাইড

এই README-তে আমরা Nginx-এর `default.conf` ফাইল কী, কেন ব্যবহার করা হয় এবং React/Vite Frontend ও Node.js/Express Backend-এর সাথে কীভাবে কাজ করে তা বিস্তারিতভাবে দেখব।

---

# 📚 আলোচিত বিষয়

* Nginx কী?
* `default.conf` কী?
* `server` block
* `listen 80`
* `server_name`
* `root`
* `index`
* `location /`
* `try_files`
* React Router-এর `/login`, `/dashboard` ইত্যাদি route
* `location /api/`
* `proxy_pass`
* Docker-এর `server:5000`
* `proxy_set_header`
* Reverse Proxy
* সম্পূর্ণ Request Flow

---

# 🌐 ১. Nginx কী?

**Nginx** হলো একটি High-performance Web Server এবং Reverse Proxy Server।

React/Vite application-এর ক্ষেত্রে Production-এ Nginx সাধারণত দুইটি গুরুত্বপূর্ণ কাজ করে:

### ১. Frontend Static Files Serve করা

```text
React/Vite
    ↓
npm run build
    ↓
dist/
    ↓
Nginx
    ↓
Browser
```

### ২. Backend API Request Forward করা

```text
Browser
    ↓
Nginx
    ↓
Node.js/Express
```

অর্থাৎ Nginx application-এর সামনে একটি **Gateway** হিসেবে কাজ করতে পারে।

---

# 📁 ২. `default.conf` কী?

`default.conf` হলো Nginx-এর একটি configuration file।

এখানে আমরা Nginx-কে বলে দিই:

* কোন port-এ request শুনবে
* Frontend files কোথা থেকে serve করবে
* React Router কীভাবে handle করবে
* `/api/` request কোথায় পাঠাবে
* Backend-এর সাথে কীভাবে communicate করবে

সাধারণত Docker-এর ক্ষেত্রে আমরা এই file ব্যবহার করতে পারি:

```text
nginx/
└── default.conf
```

তারপর Dockerfile থেকে:

```dockerfile
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
```

Nginx-এর configuration directory-তে copy করা হয়।

---

# 📝 ৩. সম্পূর্ণ `default.conf`

আমাদের configuration:

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

এখন প্রতিটি অংশ বুঝি।

---

# 🖥️ ৪. `server { }`

```nginx
server {
   ...
}
```

`server` block-এর ভিতরে Nginx-এর জন্য বিভিন্ন configuration দেওয়া হয়।

সহজভাবে:

```text
server
  │
  ├── কোন port?
  ├── কোন website?
  ├── Frontend কোথায়?
  ├── React route কীভাবে handle করবে?
  └── API কোথায় পাঠাবে?
```

---

# 🔌 ৫. `listen 80`

```nginx
listen 80;
```

এর অর্থ:

> Nginx Port `80`-এ HTTP request গ্রহণ করবে।

যেমন:

```text
http://example.com
```

Browser থেকে request এলে:

```text
Browser
   ↓
Port 80
   ↓
Nginx
```

---

# 🌍 ৬. `server_name _`

```nginx
server_name _;
```

এখানে `_` সাধারণত একটি catch-all server name হিসেবে ব্যবহৃত হয়।

অর্থাৎ নির্দিষ্ট কোনো domain name match না হলেও এই server block request handle করতে পারে।

Production-এ চাইলে নির্দিষ্ট domain দেওয়া যায়:

```nginx
server_name example.com www.example.com;
```

---

# 📁 ৭. `root`

```nginx
root /usr/share/nginx/html;
```

এর অর্থ:

> Nginx Frontend-এর static files এই directory-এর মধ্যে খুঁজবে।

আমাদের Dockerfile-এ সাধারণত থাকে:

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

অর্থাৎ:

```text
React/Vite
    ↓
npm run build
    ↓
/app/dist
    ↓
COPY
    ↓
/usr/share/nginx/html
```

ধরো `dist`:

```text
dist/
├── index.html
├── assets/
│   ├── index.js
│   └── index.css
└── favicon.ico
```

তাহলে Nginx container-এ:

```text
/usr/share/nginx/html/
├── index.html
├── assets/
│   ├── index.js
│   └── index.css
└── favicon.ico
```

থাকবে।

---

# 📄 ৮. `index index.html`

```nginx
index index.html;
```

এর অর্থ:

> Root directory-এর request এলে `index.html` ব্যবহার করো।

যখন user visit করবে:

```text
https://example.com/
```

Nginx খুঁজবে:

```text
/usr/share/nginx/html/index.html
```

তারপর সেই file Browser-কে পাঠাবে।

---

# 🔀 ৯. `location /`

```nginx
location / {
    try_files $uri /index.html;
}
```

`location /` সাধারণ Frontend request handle করে।

যেমন:

```text
/
```

```text
/login
```

```text
/dashboard
```

```text
/products
```

```text
/profile
```

ইত্যাদি।

তবে `/api/` আলাদা `location` block-এ আছে, তাই API request সেখানে যাবে।

---

# 🔥 ১০. `try_files $uri /index.html`

```nginx
try_files $uri /index.html;
```

React/Vite SPA-এর জন্য এটি অত্যন্ত গুরুত্বপূর্ণ।

এর অর্থ:

> প্রথমে requested path-এর জন্য কোনো physical file আছে কিনা খুঁজো। না থাকলে `index.html` return করো।

---

# ⚛️ ১১. React Router-এর `/login` কীভাবে কাজ করে?

ধরো React Router-এ:

```jsx
<Route path="/login" element={<Login />} />
```

আছে।

User Browser-এ সরাসরি:

```text
https://example.com/login
```

visit করল।

Request:

```text
Browser
   ↓
GET /login
   ↓
Nginx
```

Nginx দেখবে:

```nginx
location / {
    try_files $uri /index.html;
}
```

প্রথমে খুঁজবে:

```text
/usr/share/nginx/html/login
```

কিন্তু সাধারণত এমন কোনো physical file নেই।

তাই:

```text
/login
   ↓
File পাওয়া যায়নি
   ↓
/index.html
```

return করবে।

এরপর:

```text
index.html
   ↓
React Application
   ↓
React Router
   ↓
/login
   ↓
<Login />
```

ফলে Login Page render হবে।

---

# 🔥 ১২. `/dashboard`-ও একইভাবে কাজ করবে

ধরো:

```jsx
<Route path="/dashboard" element={<Dashboard />} />
```

User সরাসরি visit করল:

```text
https://example.com/dashboard
```

Flow:

```text
/dashboard
     ↓
Nginx
     ↓
Physical file নেই
     ↓
index.html
     ↓
React
     ↓
React Router
     ↓
Dashboard Component
```

তাই React SPA-এর জন্য:

```nginx
try_files $uri /index.html;
```

খুব গুরুত্বপূর্ণ।

---

# ❌ ১৩. `try_files` না থাকলে কী হতে পারে?

যদি configuration এমন হয়:

```nginx
location / {
}
```

তাহলে user সরাসরি:

```text
/dashboard
```

এ গেলে Nginx `/dashboard` নামে physical file খুঁজতে পারে।

File না পেলে:

```text
404 Not Found
```

দিতে পারে।

কিন্তু:

```nginx
try_files $uri /index.html;
```

ব্যবহার করলে React Router route handle করতে পারে।

---

# 🔗 ১৪. `location /api/`

```nginx
location /api/ {
```

এটি `/api/` দিয়ে শুরু হওয়া সব request handle করবে।

উদাহরণ:

```text
/api/login
/api/register
/api/products
/api/users
/api/orders
```

এসব request Frontend static file হিসেবে serve হবে না।

এগুলো Backend-এ পাঠানো হবে।

---

# 🔄 ১৫. `proxy_pass`

```nginx
proxy_pass http://server:5000;
```

এটি Nginx-এর Reverse Proxy-এর মূল অংশ।

এর অর্থ:

> `/api/` request Backend Server-এর `server:5000`-এ পাঠাও।

উদাহরণ:

```text
GET /api/products
```

Flow:

```text
Browser
   │
   │ /api/products
   ▼
Nginx
   │
   │ proxy_pass
   ▼
server:5000
   │
   ▼
Node.js / Express
```

---

# 🐳 ১৬. `server:5000` কী?

Docker Compose-এ Backend Service-এর নাম যদি হয়:

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

তাহলে:

```text
server
```

হলো Backend Service-এর নাম।

Docker-এর internal network-এ অন্য container এই service name ব্যবহার করে Backend-এর সাথে যোগাযোগ করতে পারে।

তাই:

```text
http://server:5000
```

মানে:

> Docker network-এর ভিতরে `server` নামের Backend Container-এর Port `5000`।

---

# ⚠️ ১৭. Browser `server:5000` ব্যবহার করে না

এটা খুব গুরুত্বপূর্ণ।

Browser request করে:

```text
/api/products
```

Browser সরাসরি:

```text
server:5000
```

এ request করে না।

Nginx internally Backend-এর সাথে যোগাযোগ করে।

```text
Browser
   │
   │ /api/products
   ▼
Nginx
   │
   │ http://server:5000
   ▼
Node.js Backend
```

---

# 🌐 ১৮. Frontend ও Backend একই Domain-এর মাধ্যমে

এই configuration-এর একটি বড় সুবিধা হলো Frontend থেকে API call করা যায়:

```javascript
fetch("/api/products");
```

Browser request করবে:

```text
https://example.com/api/products
```

Nginx request-টি Backend-এ পাঠাবে:

```text
http://server:5000
```

Architecture:

```text
example.com
     │
     ▼
   Nginx
     │
     ├── /              → React
     │
     └── /api/*         → Node.js
```

---

# 🔄 ১৯. `proxy_http_version 1.1`

```nginx
proxy_http_version 1.1;
```

Nginx Backend-এর সাথে communicate করার সময় HTTP/1.1 ব্যবহার করবে।

এটি connection reuse এবং কিছু modern communication pattern-এর জন্য উপকারী।

WebSocket ব্যবহার করলে এই ধরনের configuration-এর সাথে আরও WebSocket-specific header/configuration প্রয়োজন হতে পারে।

---

# 📦 ২০. `proxy_set_header Host`

```nginx
proxy_set_header Host $host;
```

Nginx Backend-এ Request Forward করার সময় original Host information পাঠায়।

যেমন:

```text
Browser
Host: example.com
      ↓
Nginx
      ↓
Backend
Host: example.com
```

---

# 🧑‍💻 ২১. `X-Real-IP`

```nginx
proxy_set_header X-Real-IP $remote_addr;
```

এটি Backend-কে Client-এর IP address জানাতে সাহায্য করে।

এটি কাজে লাগতে পারে:

* Logging
* Rate Limiting
* Security
* Request Tracking

ইত্যাদিতে।

---

# 🔗 ২২. `X-Forwarded-For`

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

Proxy-এর মাধ্যমে Request Forward হওয়ার সময় Client-এর original IP information ধরে রাখতে সাহায্য করে।

যেমন:

```text
User
  ↓
Nginx
  ↓
Node.js
```

Backend যেন original Client-এর IP সম্পর্কে information পেতে পারে, সেজন্য এই header ব্যবহৃত হয়।

---

# 🔐 ২৩. `X-Forwarded-Proto`

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

Client কোন protocol ব্যবহার করেছে তা Backend-কে জানায়।

যেমন:

```text
https://example.com
```

হলে:

```text
X-Forwarded-Proto: https
```

হতে পারে।

আর HTTP হলে:

```text
X-Forwarded-Proto: http
```

হতে পারে।

---

# 🧩 ২৪. `location` কীভাবে কাজ করে?

আমাদের দুইটি গুরুত্বপূর্ণ location:

```nginx
location / {
    try_files $uri /index.html;
}
```

এবং:

```nginx
location /api/ {
    proxy_pass http://server:5000;
}
```

এখন:

| Request         | কোথায় যাবে |
| --------------- | ---------- |
| `/`             | React      |
| `/login`        | React      |
| `/dashboard`    | React      |
| `/products`     | React      |
| `/profile`      | React      |
| `/api/login`    | Backend    |
| `/api/products` | Backend    |
| `/api/users`    | Backend    |
| `/api/orders`   | Backend    |

---

# 🏗️ ২৫. সম্পূর্ণ Architecture

```text
                         INTERNET
                            │
                            ▼
                      ┌───────────┐
                      │  Browser  │
                      └─────┬─────┘
                            │
                            ▼
                     ┌────────────┐
                     │   Nginx    │
                     │    :80     │
                     └──────┬─────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
                 /                  /api/
                  │                   │
                  ▼                   ▼
          ┌───────────────┐    ┌──────────────┐
          │ React/Vite    │    │ Node.js      │
          │ Static Files  │    │ Express API  │
          └───────────────┘    └──────┬───────┘
                                      │
                                      ▼
                                 ┌──────────┐
                                 │ Database │
                                 └──────────┘
```

---

# 🔥 ২৬. `/login` Request Flow

```text
User visits:

https://example.com/login

        ↓

      Nginx

        ↓

location /

        ↓

try_files $uri /index.html

        ↓

index.html

        ↓

React Application

        ↓

React Router

        ↓

<Login />
```

---

# 🔥 ২৭. `/api/login` Request Flow

যদি Login Form থেকে:

```javascript
fetch("/api/login", {
  method: "POST"
});
```

করা হয়:

```text
Browser
   │
   │ POST /api/login
   ▼
Nginx
   │
   │ location /api/
   ▼
server:5000
   │
   ▼
Node.js / Express
   │
   ▼
Login Controller
   │
   ▼
Database
```

---

# 🧠 ২৮. `default.conf`-কে সহজভাবে মনে রাখুন

Nginx-কে একজন **Traffic Controller** হিসেবে ভাবতে পারেন।

```text
                    Nginx
                      │
             ┌────────┴────────┐
             │                 │
         Normal URL          /api/
             │                 │
             ▼                 ▼
          React             Backend
```

অর্থাৎ:

```text
/login
/dashboard
/products
```

➡️ React-এর কাছে যাবে।

আর:

```text
/api/login
/api/products
/api/users
```

➡️ Node.js Backend-এর কাছে যাবে।

---

# ⭐ ২৯. গুরুত্বপূর্ণ Configuration Summary

### `listen`

```nginx
listen 80;
```

➡️ Port 80-এ request গ্রহণ করে।

### `server_name`

```nginx
server_name _;
```

➡️ Server block-এর জন্য hostname matching নির্ধারণ করে।

### `root`

```nginx
root /usr/share/nginx/html;
```

➡️ Frontend Static Files-এর location।

### `index`

```nginx
index index.html;
```

➡️ Default HTML file।

### `location /`

```nginx
location / {
    try_files $uri /index.html;
}
```

➡️ React Frontend এবং SPA Routing handle করে।

### `location /api/`

```nginx
location /api/ {
```

➡️ Backend API Request handle করে।

### `proxy_pass`

```nginx
proxy_pass http://server:5000;
```

➡️ API Request Backend-এ Forward করে।

### `proxy_set_header`

```nginx
proxy_set_header ...
```

➡️ Original Request-এর গুরুত্বপূর্ণ তথ্য Backend-এ পাঠায়।

---

# 🎯 ৩০. Final Flow

সবচেয়ে সহজভাবে পুরো বিষয়টি:

```text
                       Browser
                          │
                          ▼
                     Nginx :80
                          │
             ┌────────────┴────────────┐
             │                         │
        /login                     /api/login
             │                         │
             ▼                         ▼
      index.html                  server:5000
             │                         │
             ▼                         ▼
     React Router              Node.js/Express
             │                         │
             ▼                         ▼
         <Login />                  API
```

---

# 🏁 উপসংহার

তোমার `default.conf` মূলত Nginx-কে এই তিনটি গুরুত্বপূর্ণ কাজ করতে বলছে:

```text
১. Port 80-এ Request গ্রহণ করো
             ↓
২. Frontend Request → React Application Serve করো
             ↓
৩. /api/ Request → Node.js Backend-এ Proxy করো
```

বিশেষ করে এই দুইটি অংশ পুরো configuration-এর মূল:

```nginx
location / {
    try_files $uri /index.html;
}
```

এটি **React Router-এর `/login`, `/dashboard`, `/products` ইত্যাদি route** ঠিকভাবে কাজ করতে সাহায্য করে।

আর:

```nginx
location /api/ {
    proxy_pass http://server:5000;
}
```

এটি **Frontend-এর API Request Node.js/Express Backend-এ পাঠায়**।

সুতরাং পুরো architecture:

```text
React/Vite
    ↓
npm run build
    ↓
dist/
    ↓
Nginx
    ├── /       → React Frontend
    └── /api/   → Node.js Backend
                       ↓
                    Database
```

> **Nginx এখানে Frontend-এর Web Server এবং Backend-এর Reverse Proxy—দুই ভূমিকাতেই কাজ করছে।**

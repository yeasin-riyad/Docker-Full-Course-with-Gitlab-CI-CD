# 🐳 Docker: Stateless vs Stateful Containers

Docker-এ **Stateless** এবং **Stateful** Container-এর পার্থক্য বোঝা খুবই গুরুত্বপূর্ণ, বিশেষ করে production application এবং microservices architecture-এর ক্ষেত্রে।

---

## 📌 Stateless Container

**Stateless Container** হলো এমন একটি container যেখানে কোনো data **permanently** জমা থাকে না।

অর্থাৎ, আপনি যদি container-টি delete করে আবার নতুন করে তৈরি করেন, তাহলে container-এর ভিতরের আগের data আর থাকবে না।

```text
Container
   │
   ├── Application Code
   ├── Dependencies
   └── Temporary Data

        ↓

   Container Delete ❌

        ↓

   New Container
        ↓
   Fresh Application
```

### 💡 Example: Backend

ধরুন আপনার একটি Node.js + Express backend আছে:

```text
Node.js Backend
       │
       ▼
Docker Container
```

Container-এর ভিতরে আছে:

```text
server.js
package.json
node_modules
```

কিন্তু user-এর গুরুত্বপূর্ণ data container-এর ভিতরে নেই।

User data রাখা হচ্ছে:

```text
Node.js Container
       │
       ▼
   MongoDB
```

এখন Node.js container delete করলেও MongoDB-এর data হারাবে না।

```text
Backend Container
       │
       │
       ▼
     MongoDB
       │
       ▼
   User Data
```

তাই Backend container-কে সহজেই:

```text
Delete → Recreate → Run
```

করা যায়।

### সাধারণত Stateless হয়:

- Frontend
- Backend/API
- Node.js application
- Express.js application
- React application
- Next.js application

---

# 🗄️ Stateful Container

**Stateful Container** হলো এমন একটি container যেখানে application-এর গুরুত্বপূর্ণ data বা state সংরক্ষণ করা হয়।

যেমন:

```text
MongoDB
PostgreSQL
MySQL
```

Database-এর data দীর্ঘমেয়াদে সংরক্ষণ করা প্রয়োজন।

উদাহরণ:

```text
MongoDB Container
       │
       ├── Users
       ├── Products
       ├── Orders
       └── Transactions
```

এখন যদি container delete করা হয় এবং কোনো persistent storage না থাকে, তাহলে container-এর writable layer-এ থাকা data হারিয়ে যেতে পারে।

তাই database-এর জন্য **Persistent Storage** ব্যবহার করতে হয়।

---

# 💾 Docker Volumes

Docker Volume হলো container-এর data **persistent** রাখার একটি উপায়।

Architecture:

```text
                MongoDB Container
                       │
                       │
                       ▼
                Docker Volume
                       │
                       ▼
                Persistent Data
```

Container delete হলেও:

```text
MongoDB Container ❌
       │
       ▼
Docker Volume ✅
       │
       ▼
Database Data ✅
```

পরবর্তীতে নতুন MongoDB container-এর সাথে একই volume attach করলে আগের data আবার পাওয়া যায়।

---

# 🐳 Example: MongoDB with Docker Volume

প্রথমে একটি volume তৈরি করি:

```bash
docker volume create mongo-data
```

তারপর MongoDB container চালাই:

```bash
docker run -d \
  --name mongodb \
  -v mongo-data:/data/db \
  mongo
```

এখানে:

```text
-v mongo-data:/data/db
   │         │
   │         └── Container-এর data directory
   │
   └──────────── Docker Volume
```

Architecture:

```text
Host
 │
 ▼
Docker Volume
 │
 ▼
mongo-data
 │
 ▼
/data/db
 │
 ▼
MongoDB Container
```

---

# 🔄 Container Delete করলে কী হয়?

ধরুন MongoDB container delete করলাম:

```bash
docker rm -f mongodb
```

Container:

```text
MongoDB Container ❌
```

কিন্তু volume:

```text
mongo-data ✅
```

এবং database data:

```text
Users       ✅
Products    ✅
Orders      ✅
```

থেকে যাবে।

নতুন container চালানো যায়:

```bash
docker run -d \
  --name mongodb-new \
  -v mongo-data:/data/db \
  mongo
```

তারপর আগের database data পাওয়া যাবে।

---

# 🔥 Stateless vs Stateful

| বিষয় | Stateless | Stateful |
|---|---|---|
| Permanent Data | ❌ সাধারণত থাকে না | ✅ থাকে |
| Container Delete | সাধারণত safe | Data protection প্রয়োজন |
| Recreate | সহজ | Persistent storage প্রয়োজন |
| Scaling | তুলনামূলক সহজ | তুলনামূলক কঠিন |
| Example | Backend/API | MongoDB |
| Data Storage | External DB/Storage | Volume/Persistent Storage |
| Container-এর ভিতরের Data | Temporary | Important/Persistent |

---

# 🏗️ Real-World Application Architecture

ধরুন আপনার একটি MERN application আছে:

```text
                    👤 User
                       │
                       ▼
                  React Frontend
                       │
                       ▼
                Node.js Backend
                       │
                       ▼
                MongoDB Database
```

Docker ব্যবহার করলে:

```text
                    👤 User
                       │
                       ▼
             ┌─────────────────┐
             │ React Container  │
             │   Stateless      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Node.js Container│
             │   Stateless      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │MongoDB Container │
             │    Stateful      │
             └────────┬────────┘
                      │
                      ▼
                Docker Volume
                      │
                      ▼
               Persistent Data
```

এখানে:

```text
React       → Stateless
Node.js     → Stateless
MongoDB     → Stateful
Volume      → Persistent Storage
```

---

# 🚀 কেন Backend Stateless রাখা ভালো?

Production application-এ backend container সহজে replace করা দরকার।

ধরুন আপনার তিনটি backend container আছে:

```text
Backend 1
Backend 2
Backend 3
```

যেকোনো সময়:

```text
Backend 2 ❌
```

হয়ে গেলে নতুন container তৈরি করা যায়:

```text
Backend 1
Backend 3
Backend 4 ✅
```

কারণ গুরুত্বপূর্ণ data backend container-এর ভিতরে নেই।

Data আছে:

```text
MongoDB
   │
   ▼
Persistent Storage
```

এতে application সহজে:

- Scale করা যায়
- Restart করা যায়
- Replace করা যায়
- Deploy করা যায়
- Recover করা যায়

---

# 🧠 সহজ উদাহরণ

একটি **Stateless Container**-কে আপনি একটি temporary workspace-এর মতো ভাবতে পারেন।

```text
Workspace
   ↓
কাজ করলাম
   ↓
Workspace Delete
   ↓
নতুন Workspace
```

কাজের গুরুত্বপূর্ণ information অন্য জায়গায় থাকলে workspace delete হলেও সমস্যা নেই।

অন্যদিকে Database হলো আপনার **স্থায়ী storage**:

```text
Database
   ↓
Users
Orders
Payments
Posts
```

এগুলো হারানো যাবে না।

তাই:

```text
Container → Temporary
Volume    → Persistent
Database  → Important Data
```

---

# ⚠️ গুরুত্বপূর্ণ বিষয়

শুধু container restart করলে সাধারণত container-এর writable-layer data থাকে, কিন্তু **container remove/recreate** করলে সেই data হারানোর ঝুঁকি থাকে।

তাই গুরুত্বপূর্ণ data-এর জন্য container-এর filesystem-এর ওপর নির্ভর না করে ব্যবহার করুন:

```text
Docker Volumes
External Database
Cloud Storage
Managed Database
Object Storage
```

---

# 🎯 Summary

### Stateless Container

```text
Application
     │
     ▼
Container
     │
     ▼
Delete / Recreate
     │
     ▼
No important data lost
```

সাধারণ উদাহরণ:

```text
Frontend
Backend
API Service
```

---

### Stateful Container

```text
Application
     │
     ▼
Container
     │
     ▼
Persistent Storage
     │
     ▼
Important Data
```

সাধারণ উদাহরণ:

```text
MongoDB
PostgreSQL
MySQL
```

---

# 🔑 Key Takeaway

> **Stateless containers can be deleted and recreated easily because they don't hold important persistent data.**

> **Stateful containers manage important data, so persistent storage such as Docker Volumes is required to prevent data loss.**

সবচেয়ে গুরুত্বপূর্ণ বিষয়:

```text
        Container
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
Stateless     Stateful
     │           │
     ▼           ▼
Backend       Database
Frontend         │
     │           ▼
     │         Volume
     │           │
     └───────┬───┘
             ▼
      Persistent Data
```

> 🧠 **মনে রাখুন: Container disposable হতে পারে, কিন্তু important data disposable হওয়া উচিত নয়।** 🚀
# **Local Development
# # Base image
# # ডকার ইমেজের সাইজ ছোট রাখতে এবং অ্যাপ্লিকেশনের 
# # পারফরম্যান্স অপ্টিমাইজ করতে ডেভেলপাররা সাধারণত Alpine ভার্সন ব্যবহার করেন।

# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Set argument for API URL
# ARG VITE_API_URL=http://localhost:5000
# ENV VITE_API_URL=$VITE_API_URL

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Expose port
# EXPOSE 4173

# # Command to start the app
# CMD ["npm", "run", "preview", "--","--host","0.0.0.0","--port","4173"]




# **Production Docker Image

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


# 🌐 Premium Social Media Platform

A full-featured, responsive, and modern social media application built using **React, TypeScript, Node.js, Express, PostgreSQL.

Designed with clean typography, dynamic user interfaces, real-time communication, and robust database models.

---

## ✨ Features

### 🔐 User Authentication & Profiles
- **Secure Authentication**: Register and Login with passwords securely hashed using `bcryptjs`.
- **Dynamic Profiles**: 
  - Change profile pictures, email, name, and passwords.
  - Customize your profile with a personalized bio.
  - Real-time follow/unfollow functionality.
  - Profile tabs displaying user posts, followers, and following lists.

### 📝 Posts & Interactions
- **Rich Media Posts**: Create posts with text captions and images.
- **Engagement**: Like and unlike posts instantly.
- **Comments**:
  - Add comments to posts.
  - View all comments on a post.
  - Delete own comments.
- **News Feed**: A dynamic feed compiling posts from users you follow.

### 💬 Real-Time Messaging & Chat
- **Instant Messaging**: Real-time chat powered by Socket.io.
- **Modern Chat Features**:
  - Live typing indicators.
  - Group and private chat spaces.
  - User search with auto-complete for fast chat creation.
  - Instant notifications for incoming messages.
- **Theme Customization**: Beautiful light and dark mode toggles for the chat environment.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (with TypeScript)
- **Vite** (fast build tool)
- **TailwindCSS** (modern responsive design)
- **Framer Motion** (smooth, premium UI animations)
- **Lucide React** (beautiful icons)
- **Socket.io Client** (real-time events)

### Backend & Database
- **Node.js** & **Express**
- **TypeScript** & **TS-Node**
- **PostgreSQL** (relational database)
- **Socket.io** (WebSocket server integration)

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (running locally or a cloud database instance)
- NPM or Yarn

---

### Step-by-Step Guide

#### 1. Clone & Navigate
Ensure you are in the root directory of the project:
```bash
cd Social-media-application
```

#### 2. Configure Database & Environment
Navigate to the `backend` folder and configure your database URL:
1. Open the `/backend/.env` file.
2. Update the `DATABASE_URL` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
   ```

#### 3. Setup Backend
Open a terminal in the `/backend` folder:
```bash
# Install dependencies
npm install

# Start the backend development server
npm run dev
```
*The backend server will run on `http://localhost:4000`.*

#### 4. Setup Frontend
Open a new terminal in the `/FrontEnd` folder:
```bash
# Install dependencies
npm install

# Start the frontend dev server
npm run dev
```
*The frontend will run on `http://localhost:5173` (or the port specified by Vite).*

---

## 🗄️ Database Schema Overview
- **User**: Represents user accounts, credentials, profile information, and follow relationships.
- **Post**: Represents user-created posts with media files and links to authors.
- **Comment**: Standard comment models with relational links to users and posts.
- **Chat**: Group and private chat channels.
- **Message**: Individual text messages linked to chats and senders.
- **Community**: Group community hubs for shared post sharing.

---
Developed with passion for modern web engineering. 🚀

# 🕒 SlotSwapper – Peer-to-Peer Time Slot Exchange Platform

## 📘 Overview

**SlotSwapper** is a peer-to-peer **time-slot scheduling application** that enables users to **swap calendar slots** with others.  
The idea: if two users have conflicting events, they can **exchange** their busy time slots to find a better fit for both parties.  

### 🌟 Key Features

- 📅 **User Calendars** – Manage and visualize your available and busy slots.
- 🔁 **Swappable Slots** – Mark busy slots as “swappable” and view others’ swappable slots.
- 📨 **Swap Requests** – Send and accept swap requests between users.
- 🔐 **Authentication** – Secure login and signup (JWT or OAuth).
- ⚡ **Real-time Updates** – Instant notifications when swaps are requested or approved.
- 📱 **Responsive UI** – Built with a modern, mobile-friendly design.

---
 Design Choices

 1. **Frontend** – Built with **React.js (Vite)** for fast performance and smooth state handling.  
   - Component-based structure for scalability.  
   - TailwindCSS for rapid UI styling and theme consistency.

     
2. **Backend** – Developed using **Node.js + Express.js**.  
   - RESTful API design for modularity and easy integration.  
   - MongoDB for flexible event and user data storage.  

3. **Authentication** – JWT-based session management for stateless security.

4. **Calendar Management** – Simple event model allowing users to tag time slots as busy or swappable.

---

## ⚙️ Setup Instructions (Local Development)

Follow these steps to run the project locally on your machine:

### 🔧 Prerequisites

- Node.js (>= 18)
- MongoDB (Atlas)
- npm 
- Git

- Setup Backend
using command npm init..

 Challenges Faced

Designing a swap-matching algorithm to efficiently find compatible slots.

Handling real-time notifications for swap requests and approvals.

Syncing frontend state after swap actions without page reloads.

Managing authentication tokens securely across frontend & backend.



 

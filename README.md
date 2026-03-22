# Warehouse Robot Prototype

## Project Description

This project is a prototype of a warehouse management system that simulates the integration between warehouse operations and autonomous robots.

The system demonstrates how product management, robot task coordination, and real-time monitoring can be combined into a unified platform.

The architecture includes:

* Frontend for user interaction
* Backend (Node.js + Express) for business logic processing
* Airtable as a cloud database for real-time data storage

---

## Main Features

The prototype focuses on three core warehouse operations:

### 1. Inventory Management (Stock Update from Sales)

Simulates POS system sending sales data to the warehouse system.

Key functions:

* Update product stock automatically after sales
* Check minimum stock threshold
* Automatically trigger restocking tasks when stock is low

API:

POST /api/sales

---

### 2. Warehouse Import Management

Simulates importing goods into the warehouse.

Key functions:

* Increase product stock
* Automatically create robot tasks to store goods

API:

POST /api/warehouse/import

---

### 3. Robot Task Management

Manages tasks assigned to robots in the warehouse.

Key functions:

* Create robot tasks manually or automatically
* Assign robot and product to tasks
* Track task status (processing, completed, error)

API:

POST /api/robots/tasks

---

### 4. Dashboard Monitoring

Provides an overview of system operations.

Displays:

* Total robots
* Total products
* Active tasks
* Completed tasks

API:

GET /api/dashboard

---

## System Workflow

The system follows a logical operational flow:

1. User selects role and logs into the system
2. Dashboard displays overall system status
3. Inventory is updated automatically from sales
4. If stock is low → system triggers restocking task
5. If stock is insufficient → user imports goods
6. Robot tasks are created and executed
7. All data is updated back to the dashboard

This creates a continuous and automated warehouse operation cycle.

---

## User Interfaces

The prototype includes the following main screens:

* Role Selection
* Login
* Dashboard
* Inventory Management
* Robot Task Management
* Warehouse Import
* Notifications

---

## Technology Stack

Backend:

* Node.js
* Express.js

Frontend:

* HTML
* CSS
* JavaScript

Database:

* Airtable

Tools:

* Visual Studio Code
* Git
* GitHub

---

## How to Run the Project

1. Install Node.js

2. Install dependencies

npm install

3. Create .env file and add:

AIRTABLE_API_KEY=your_key
BASE_ID=your_base_id

4. Start the server

node server.js

5. Open browser:

http://localhost:3000/role.html

---

## Notes

* This is a prototype for demonstration purposes only
* Data is simulated and stored on Airtable
* Robot behavior is simulated through task management logic

# AAA Tech Solutions

AAA Tech Solutions is a modern, full-stack corporate web application and student enrollment platform. It features an interactive, high-performance user interface for exploring technical courses, selecting transparent pricing plans, submitting enrollment applications, and managing operations through a secure administrative dashboard.

---

## Features

- **Responsive Official Company Website**: Sleek modern UI built with React and custom CSS, designed for mobile, tablet, and desktop devices.
- **About Us**: Overview of corporate vision, milestones, leadership, and core technological values.
- **Services**: Comprehensive enterprise software development, cloud infrastructure, and consulting offerings.
- **Courses**: Interactive catalog of technical training programs with detailed syllabi and level indicators.
- **Course Details**: Deep dive into curriculum, project deliverables, prerequisites, and learning outcomes.
- **Pricing**: Transparent tiered course plans with billing periods and popular tags.
- **Online Enrollment**: Streamlined student enrollment modal with live validation and persistent database storage.
- **Contact Form**: Direct customer inquiry submissions with automated validation.
- **Reviews**: Verified student feedback and rating testimonials.
- **Portfolio / Projects**: Showcase of real-world production systems and enterprise implementations.
- **Careers**: Active job openings and talent recruitment applications.
- **Blog / News**: Insights on modern web frameworks, cloud DevOps, and engineering practices.
- **Admin Dashboard**: Dedicated portal for monitoring enrollments, inquiries, reviews, and platform analytics.
- **Admin Authentication**: Multi-layered route protection, bcrypt credential verification, and signed JWT session management.
- **MySQL / TiDB-Compatible Database**: Production-ready relational schema supporting both local MySQL and cloud-native TiDB clusters with TLS 1.2+ encryption.
- **REST API**: Modular Express backend architecture with centralized controllers and error handling.
- **Responsive Design**: Fluid layout system with seamless mobile navigation.
- **SEO-Friendly Structure**: Semantic HTML5 hierarchy, meta descriptions, and descriptive title tags.

---

## Tech Stack

### Frontend
- **React**: Component-driven UI library
- **Vite**: Next-generation frontend build tool and dev server
- **JavaScript (ES6+)**: Frontend application logic
- **CSS**: Custom responsive styling system (vanilla CSS)

### Backend
- **Node.js**: Asynchronous JavaScript runtime environment
- **Express.js**: RESTful API server framework

### Database
- **MySQL-compatible database**: MySQL 8.0+ or TiDB Cloud (Serverless / Dedicated) with TLS/SSL transport
- **mysql2/promise**: High-performance promise-based connection pool

### Other & Tooling
- **Git & GitHub**: Version control and collaborative workflow
- **GitHub Actions**: Continuous integration and automated GitHub Pages deployment for the frontend
- **REST API**: RESTful JSON endpoints
- **JWT (`jsonwebtoken`)**: Stateless authentication tokens with configurable expiration
- **Bcrypt (`bcryptjs`)**: Strong salt-hashed password encryption for admin accounts

---

## Project Structure

```text
AAA Tech Solutions/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   ├── app.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── .github/
│   └── workflows/
│       └── static.yml
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Frontend Setup

To run the React frontend locally:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000` (or `http://localhost:5173`).

---

## Frontend Production Build

To test or generate the production distribution bundle:

```bash
cd frontend
npm install
npm run build
```

The optimized static assets will be output to `frontend/dist/`.

---

## Backend Setup

To install dependencies and start the Node.js / Express backend server:

```bash
cd backend
npm install
npm start
```

For automatic hot-reloading during development:

```bash
npm run dev
```

The backend API server will listen on `http://localhost:5000`.

---

## Environment Variables

The backend uses environment variables for database connectivity, security secrets, and server configuration. Create a `.env` file inside `backend/` using `backend/.env.example` as a template:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# MySQL / TiDB Database Configuration
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=aaa_tech_solutions
DB_SSL=false

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_change_in_production

# Initial Administrator Credentials (used during seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

> [!IMPORTANT]
> Never commit real database credentials or secret keys to GitHub. Real `.env` files must remain strictly on local machines or in hosting platform environment variable settings.

For the frontend, configure `frontend/.env` if pointing to a non-default API endpoint:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Database

The application utilizes a MySQL-compatible relational database schema.

- **Database Name**: `aaa_tech_solutions`

### Major Tables
- **`admins`**: Administrator accounts, usernames, hashed credentials, and role permissions.
- **`courses`**: Technical training offerings, duration, difficulty levels, and categories.
- **`course_plans`**: Pricing tiers and billing frequencies (Starter, Monthly, 2-Month, Premium).
- **`enrollments`**: Student application submissions linked to courses and selected plans.
- **`contacts`**: Customer inquiries and messaging records.
- **`reviews`**: Student testimonials and course satisfaction ratings.

### Database Initialization & Seeding
To initialize the schema and populate baseline data:

```bash
cd backend
npm run db:seed
```

---

## Enrollment Flow

```text
User Submits Application
       │
       ▼
Enrollment Modal (Frontend Form Validation)
       │
       ▼
REST API Call (`POST /api/enrollments`)
       │
       ▼
Express Backend (`enrollmentController.js`)
       │
       ▼
MySQL / TiDB Database (`INSERT INTO enrollments`)
       │
       ▼
Enrollment Stored & Confirmation Returned
```

---

## Admin Security

The administration dashboard implements defense-in-depth security:
- **Mandatory Authentication**: Direct browser navigation to `/admin`, `/admin/dashboard`, or any `/admin/*` sub-routes redirects unauthenticated users to `/admin/login`.
- **Protected Backend Endpoints**: Administrative API routes (`/api/admin/*`) require a valid HTTP Bearer token verified by `adminAuth.js` middleware. Unauthenticated requests are rejected with `401 Unauthorized`.
- **Hashed Passwords**: Passwords are never stored in plain text; all credentials use bcrypt hashing with minimum 12 salt rounds.
- **Credential Protection**: Hardcoded credentials and authentication bypass flags do not exist in frontend client code.
- **Environment Isolation**: JWT secrets and database passwords are read exclusively from environment variables.

---

## Deployment

The frontend and backend are decoupled and deployed independently:

- **Frontend**: Built as static production assets (`npm run build`) and deployed to static hosting platforms such as GitHub Pages, Vercel, or AWS S3 / CloudFront.
- **Backend**: Deployed as a persistent Node.js / Express service on cloud application platforms such as Render, Railway, AWS ECS / EC2, or Heroku.
- **Database**: Hosted on a cloud MySQL-compatible service such as TiDB Cloud Serverless / Dedicated or AWS RDS, communicating securely over TLS/SSL.

---

## Development

To contribute or run the entire application locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mayur51015/AAA-TECH-SOLUTIONS.git
   cd AAA-TECH-SOLUTIONS
   ```
2. **Setup the Database**:
   - Create the `aaa_tech_solutions` database in your local MySQL or cloud TiDB instance.
   - Run `cd backend && npm install && npm run db:seed`.
3. **Configure Environment Variables**:
   - Copy `backend/.env.example` to `backend/.env` and update your database credentials.
   - Copy `frontend/.env.example` to `frontend/.env`.
4. **Start Servers**:
   - Terminal 1 (Backend): `cd backend && npm start`
   - Terminal 2 (Frontend): `cd frontend && npm run dev`
5. **Open Browser**:
   - Frontend Application: `http://localhost:3000/AAA-TECH-SOLUTIONS/`
   - Admin Login: `http://localhost:3000/AAA-TECH-SOLUTIONS/admin/login`

---

## License

License information will be added by the project owner.

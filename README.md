

# 🧠 USOF Backend

A backend API for the **USOF (University Stack Overflow)** project — a question-and-answer platform for sharing knowledge and experience between developers.
Built with **Node.js**, **TypeScript**, **Express**, and **MySQL**.

---

## ⚙️ Requirements

Before running the project, make sure you have:

* **Node.js** ≥ 18
* **npm** or **yarn**
* **MySQL 8.0**

---

## 🚀 Getting Started

Follow these steps to run the project locally.

---

### 🧩 Setup

1. **Clone the repository:**

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure the app:**

    * Create a configuration file `config.yaml` and fill in the database credentials, e.g.:

      ```yaml
      server:
        host: "localhost"
        port: 8080
        logging:
          level: "debug"
 
      jwt:
        ttl: 2678400
        secret_key: "suppersecretkey"
 
      database:
        sql:
          host: "localhost"
          port: 3306
          user: "usof"
          name: "usof"
          password: "password"
 
      aws:
        region: "eu-north-1"
        bucket_name: "usof-s3"
        public_base: "https://usof-s3.s3.eu-north-1.amazonaws.com"
      ```
    * Make sure your MySQL server is running and accessible.

4. **Build the TypeScript code:**

   ```bash
   make build-js
   ```

   *(or directly: `npx tsc -p tsconfig.json`)*

5. **Run database migrations:**

   ```bash
   make migrate-up-js
   ```

   *(to rollback use `make migrate-down-js`)*

6. **Start the backend service:**

   ```bash
   make start-js
   ```

   *(or `make start-ts` if running from TypeScript directly)*

---

## 🧱 Makefile Commands

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `make build-js`        | Build the project using TypeScript          |
| `make start-js`        | Run the backend (compiled JS)               |
| `make start-ts`        | Run the backend directly in TypeScript mode |
| `make migrate-up-js`   | Run all database migrations                 |
| `make migrate-down-js` | Roll back the last migration                |

---

## ☁️ Avatar Upload (AWS S3)

If you want to enable **avatar uploads**, you need to connect your own **AWS S3 bucket**.
Add your S3 credentials and bucket configuration to the `config.yaml` file, for example:

```yaml
aws:
  region: eu-north-1
  access_key_id: YOUR_ACCESS_KEY
  secret_access_key: YOUR_SECRET_KEY
  bucket: your-s3-bucket-name
```

Without this setup, avatars will not be uploaded and the default avatar will be used instead.

---

## 📂 Project Structure

```
usof-backend/
├── src/                # Source code (controllers, services, models)
├── dist/               # Compiled JS files
├── Makefile            # Build and run commands
├── config.yaml         # App configuration
└── package.json
```

---

## 🧠 Notes

* By default, the API runs on port **8080**.
* The database uses the name **usof** and is created automatically on startup.
* Logs are printed directly to the console.


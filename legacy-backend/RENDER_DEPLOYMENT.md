# Deploying Spring Boot Backend to Render using Docker

This guide explains how to deploy your Spring Boot backend application (`FestTracker`) to [Render](https://render.com) using the provided `Dockerfile`.

---

## 1. Files Added
We have added the following deployment files to your `Backend` directory:
- [Dockerfile](file:///g:/SATTRACK/Backend/Dockerfile): A multi-stage Docker build file that builds the jar using Maven (JDK 17) and runs it using a lightweight JRE 17 image.
- [.dockerignore](file:///g:/SATTRACK/Backend/.dockerignore): Prevents local files (like `.idea`, `target/`, etc.) from being uploaded to the Docker build context, making builds faster.

---

## 2. Steps to Deploy on Render

### Step 1: Create a Web Service
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New** (top right) and select **Web Service**.
3. Connect your Git repository (the one containing the `Backend` folder).
4. Set the following details:
   - **Name**: `fest-tracker-backend` (or your preferred name)
   - **Language**: `Docker`
   - **Branch**: `main` (or your active development branch)
   - **Root Directory**: Leave blank if your Git repository contains only the files inside `Backend`. If it is a monorepo, set it to `Backend`.

### Step 2: Configure Environment Variables
Your application (`application.properties`) requires several environment variables to run. In the Render service creation page, click **Advanced** or go to the **Environment** tab after creation, and add the following keys:

| Environment Variable | Description / Example |
| :--- | :--- |
| **`DATABASE_URL`** | The JDBC PostgreSQL URL. **Important:** Render provides a URL starting with `postgres://`. You must convert this to **`jdbc:postgresql://`**. <br> *Example:* `jdbc:postgresql://dpg-xxx-a.oregon-postgres.render.com/festdb` |
| **`DATABASE_USERNAME`** | The database username provided by Render. |
| **`DATABASE_PASSWORD`** | The database password provided by Render. |
| **`REDIS_HOST`** | The hostname of your Redis instance (e.g., `red-xxxx.oregon-redis.render.com`). |
| **`REDIS_USERNAME`** | The Redis username (usually `default` or blank). |
| **`REDIS_PASSWORD`** | The Redis password. |
| **`JWT_SECRET_KEY`** | A secure random string for signing JWT tokens. |
| **`CLOUDINARY_CLOUD_NAME`** | Cloudinary cloud name. |
| **`CLOUDINARY_API_KEY`** | Cloudinary API Key. |
| **`CLOUDINARY_API_SECRET`** | Cloudinary API Secret. |
| **`BREVO_API_KEY`** | Brevo (Sendinblue) API Key. |
| **`BREVO_SENDER_EMAIL`** | Sender email address for emails. |

---

## 3. Databases and Services on Render

### PostgreSQL
You can create a free PostgreSQL database directly on Render:
1. Click **New** -> **PostgreSQL**.
2. Once created, use the **Internal Database URL** (for services running on Render) or **External Database URL** (for local testing).
3. Remember to change `postgres://` to `jdbc:postgresql://` for `DATABASE_URL`.

### Redis
You can also create a Redis instance on Render:
1. Click **New** -> **Redis**.
2. Once created, copy the hostname (exclude the port and scheme) and set it as `REDIS_HOST`.

---

## 4. Verification
Once the deployment starts, you can monitor the logs in the Render console. Render will:
1. Detect the `Dockerfile`.
2. Build the Maven project.
3. Run the container.
4. Automatically detect that the container exposes port `8080` and route incoming HTTP requests to it.

# FinSight Server Maintenance & SOP

This document outlines the **Standard Operating Procedure (SOP)** for managing and restarting your FinSight server while ensuring data persistence.

## ⚠️ Critical Warning: Data Loss

Your server was previously configured with `DB_SYNCHRONIZE=true`. This setting allows TypeORM to automatically update your database schema to match your code. However, for complex tables (like `Transactions` with Enums), this often leads to TypeORM **dropping and recreating** the table on startup, wiping all data.

**Resolution:** We have disabled this setting. Changes to the database schema should now be handled via **Migrations**.

---

## 🛠️ SOP: Safe Server Restarts

Follow these instructions to restart your services without losing data.

### 1. The "Safe" Service Restart
If you only need to restart the NestJS API or the ML service (e.g., after a code change), do **not** restart all of Docker Desktop. Instead, run:

```bash
# Restart only the API container
docker-compose restart api

# Or restart while pulling new changes
docker-compose up -d --build api
```

### 2. The "Full" Stack Restart
If you must stop all services (e.g., to save system resources), use `stop` rather than `down`:

```bash
# STOPS containers but keeps them in the system (SAFE)
docker-compose stop

# STARTS them again (SAFE)
docker-compose start
```

### 3. Understanding `docker-compose down`
If you use the `down` command, be extremely careful:

| Command | Action | Data Safety |
| :--- | :--- | :--- |
| `docker-compose stop` | Pauses containers | ✅ **100% Safe** |
| `docker-compose down` | Removes containers & network | ✅ Safe (as long as volumes exist) |
| `docker-compose down -v` | Removes containers AND **Volumes** | ❌ **WIPES ALL DATA** |

### 4. Windows & WSL2 Best Practices
*   **Docker Desktop Restart:** If you restart the Docker Desktop app, it triggers a `docker-compose up` flow. Since we have disabled `DB_SYNCHRONIZE`, your data should now persist even after a full Docker restart.
*   **Time Sync:** Ensure your WSL2 clock is synced with Windows. A desynced clock can sometimes cause authentication (JWT) errors after a wake-from-sleep.

---

## 🏗️ Managing Schema Changes (Advanced)

Since `synchronize` is now `false`, manual changes to entities (like adding a new field to `Transaction`) will not automatically reflect in the database.

1.  **Generate a Migration:**
    ```bash
    npm run migration:generate --name=AddFieldToTransaction
    ```
2.  **Run Migrations:**
    ```bash
    npm run migration:run
    ```

> [!TIP]
> Always verify your dashboard shows your data *before* performing regular backups or major updates.

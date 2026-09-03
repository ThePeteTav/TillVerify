# Deploying TillVerify to Azure

This app is a single Node.js process (Express) that serves both the API and
the built React app. Target: **Azure App Service** (Node 20 LTS) +
**Azure Database for PostgreSQL - Flexible Server**.

## 1. Create the database

1. Azure Portal → **Create a resource** → **Azure Database for PostgreSQL flexible server**.
2. Choose the **Burstable B1ms** tier to start (cheapest that's usable in production; resize later if needed).
3. Set an admin username/password — save these, you'll need them for the connection string.
4. Under **Networking**, allow "Allow public access from any Azure service within Azure" (simplest) — or, once the App Service exists, restrict to its outbound IPs for tighter security.
5. After it's created, go to **Databases** and create a database named `tillverify`.
6. Build your connection string:
   ```
   postgresql://<admin-user>:<password>@<server-name>.postgres.database.azure.com:5432/tillverify?sslmode=require
   ```

## 2. Create the App Service

1. Azure Portal → **Create a resource** → **Web App**.
2. Runtime stack: **Node 20 LTS**. Operating System: **Linux**.
3. Plan: **Basic B1** is enough to start.
4. Once created, go to **Configuration → General settings** and set:
   - Startup Command: `node dist/index.js`
5. Go to **Configuration → Application settings** and add:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the connection string from step 1 |
   | `SESSION_SECRET` | a long random string (e.g. generate with `openssl rand -hex 32`) |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | from your Google Cloud service account |
   | `GOOGLE_PRIVATE_KEY` | from the same service account's JSON key (keep the `\n` escapes as-is) |
   | `NODE_ENV` | `production` |
   | `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |

   Azure sets `PORT` for you automatically — don't add it yourself.

## 3. Deploy the code

Easiest path: **Deployment Center** (in the App Service's left menu) → connect it
directly to the `ThePeteTav/TillVerify` GitHub repo and branch `main`. Azure
will build (`npm install && npm run build`) and deploy on every push — no
separate CI file needed. Once connected, push to `main` deploys automatically.

## 4. Run the database migration and create the first admin

Both one-time steps need `DATABASE_URL` pointed at the Azure database. Easiest
is from your own machine with the Azure DB's connection string in your local
`.env`:

```bash
npm run db:push          # creates the tables
npm run seed:admin -- "Your Name" 12345   # creates the first admin login (pick a real PIN)
```

If your local machine can't reach the database (networking restricted to
Azure-only), run these instead from the App Service's built-in SSH console
(**App Service → Development Tools → SSH**), since it runs inside Azure's
network.

## 5. Google Sheets integration (optional, only if you want cloud submission)

This was already built into the app; it just needs credentials:

1. In Google Cloud Console, create a service account, enable the **Google Sheets API**, and generate a JSON key.
2. Share your target Google Sheet with the service account's email (found in the JSON key) as an Editor.
3. Put the service account's `client_email` and `private_key` into the App Service settings above.
4. In the app's Settings (Admin Panel → Drawer Settings), paste the Google Sheet's ID (the long string in its URL between `/d/` and `/edit`).

## 6. Custom domain / M365 tie-in (optional)

- Add a custom domain (e.g. `till.journeyautorepair.com`) under **Custom domains** in the App Service, and point a CNAME at it from your DNS.
- App Service gives you a free managed TLS certificate for custom domains.
- Since login is PIN-based (not Microsoft Entra ID), there's no additional M365 identity setup required — the app just needs to be reachable on your network/domain.

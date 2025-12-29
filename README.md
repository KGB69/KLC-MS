<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sgHXbpeea5xooUxPKZ608yXPwMZTUyFO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment to Render

This app is designed to be hosted on Render as a **Web Service** with a **PostgreSQL Database**.

### Using Blueprints (Automated)

1. Push this repository to your GitHub.
2. Log in to [Render](https://render.com).
3. Click **"New +"** and select **"Blueprint"**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file and configure:
   - A **Node.js Web Service** for the backend (serving the React frontend).
   - A **PostgreSQL Database** for persistent storage.
6. Render will automatically generate a `JWT_SECRET` and link the `DATABASE_URL`.

### Database Initialization

To initialize the database locally or on a custom server, run the `server/schema.sql` script against your PostgreSQL instance. On Render, you can use the "Shell" tab of your service to run:
`psql $DATABASE_URL -f server/schema.sql`

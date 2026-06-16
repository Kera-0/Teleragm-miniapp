# Monitoring and Telegram Mini App deploy

## What was added

The project now has a ready monitoring stack:

- Spring Boot Actuator endpoint: `GET /actuator/prometheus`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- Grafana dashboard: `TgApp / TgApp Sales & Store Monitoring`

Default Grafana login:

```text
admin / admin
```

You can override it in `.env`:

```env
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=change_me
```

## Start everything locally

```bash
docker compose up --build
```

Open:

- Mini App frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Backend metrics: `http://localhost:8080/actuator/prometheus`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

## Business metrics

Prometheus receives these custom application metrics:

- `tgapp_orders_total` - total orders in the database.
- `tgapp_orders_by_status{status="..."}` - orders grouped by status.
- `tgapp_sales_revenue_total` - total revenue for non-cancelled orders.
- `tgapp_items_sold_total` - total sold item quantity for non-cancelled orders.
- `tgapp_average_order_value` - average order value for non-cancelled orders.
- `tgapp_products_total` - total products.
- `tgapp_products_available_total` - products with stock greater than zero.
- `tgapp_stock_units_total` - total units currently in stock.
- `tgapp_orders_created_total` - orders created since backend start.
- `tgapp_order_created_revenue_total` - created order revenue since backend start.
- `tgapp_order_created_items_total` - created order item quantity since backend start.
- `tgapp_order_status_changes_total{from="...",to="..."}` - order status changes since backend start.

The dashboard also uses standard Spring metrics:

- HTTP request rate.
- 5xx error ratio.
- Average API latency.
- JVM heap memory usage.

## Publish as a Telegram Mini App

I cannot publish it for you without your Telegram bot token, BotFather access, hosting account, and public HTTPS domain. The project is now prepared for monitoring, but deployment still needs these production steps.

If you already have a real `BOT_TOKEN` and public HTTPS URL, this repository includes an automation script that sets the bot menu button through Telegram Bot API:

```powershell
.\scripts\publish-telegram-miniapp.ps1 -MiniAppUrl https://your-domain.com -ButtonText "Open shop"
```

The script reads `BOT_TOKEN` from `.env` by default. You can also pass it directly:

```powershell
.\scripts\publish-telegram-miniapp.ps1 -BotToken "123456:token" -MiniAppUrl https://your-domain.com -ButtonText "Open shop"
```

For `.env` based setup:

```env
BOT_TOKEN=123456:telegram_bot_token
MINI_APP_URL=https://your-domain.com
TELEGRAM_MENU_BUTTON_TEXT=Open shop
```

### 1. Host frontend and backend

You need a public HTTPS URL. Telegram Mini Apps require HTTPS.

Common options:

- VPS with Docker Compose plus Nginx/Caddy reverse proxy.
- Render, Railway, Fly.io, DigitalOcean App Platform, or similar.
- Any hosting where the frontend and backend are reachable over HTTPS.

Recommended production layout:

```text
https://your-domain.com          -> frontend
https://your-domain.com/api      -> backend API
https://your-domain.com/actuator -> keep private or protect with auth/network rules
```

Do not expose Grafana publicly without a strong password or network protection.

### 2. Set production environment variables

Example `.env`:

```env
DB_NAME=tgapp
DB_USER=postgres
DB_PASSWORD=strong_database_password
BOT_TOKEN=123456:telegram_bot_token
JWT_SECRET=long_random_secret
SELLER_TELEGRAM_IDS=your_seller_telegram_id
ADMIN_TELEGRAM_IDS=your_admin_telegram_id
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=strong_grafana_password
```

### 3. Configure CORS

In production, replace wildcard CORS with your real domain:

```env
APP_CORS_ALLOWED_ORIGINS=https://your-domain.com
```

The current `application.yml` still defaults to `*`, which is convenient for local development but not ideal for production.

### 4. Configure BotFather

In Telegram:

1. Open `@BotFather`.
2. Create or select your bot.
3. Run `/setmenubutton`.
4. Select the bot.
5. Choose `Configure menu button`.
6. Set the Mini App URL, for example:

```text
https://your-domain.com
```

You can also use `/newapp` in BotFather if you want the Mini App to appear as a named Telegram app with icon, description, screenshots, and short name.

### 5. Production security note

The app currently sends `X-Telegram-User-Id` from the frontend. That is fine for a training/demo app, but in production the backend must validate Telegram `initData` with the bot token and derive the user id from verified Telegram data.

Before accepting real purchases, implement backend validation for `X-Telegram-Init-Data`.

# Telegram Mini App — Shop

Мини-приложение для Telegram: витрина товаров, корзина, оформление заказов и панель продавца для управления магазином.

Проект состоит из двух частей:

- `backend` — Java 21, Spring Boot 3.3, PostgreSQL, Flyway, Spring Data JPA.
- `frontend` — React 18, TypeScript, Vite, Axios, React Router.

## Что уже было сделано

До добавления панели продавца в проекте уже были:

- каталог товаров на главной странице;
- карточки товаров с изображением, ценой, описанием и остатком;
- корзина с изменением количества товаров;
- создание заказа из корзины;
- страница истории заказов текущего Telegram-пользователя;
- таблицы `products`, `orders`, `order_items`;
- REST API для товаров и заказов;
- сидовые товары через Flyway;
- Docker Compose для запуска PostgreSQL, backend и frontend.

## Что добавлено сейчас

Добавлены страница продавца, уровни доступа и документация по ним.

### Frontend

- Новый маршрут: `/seller`.
- Новая страница: `frontend/src/pages/Seller/index.tsx`.
- Новый контекст доступа: `frontend/src/store/access.tsx`.
- Навигация теперь показывает пункт `Seller` только пользователям с ролью `SELLER` или `ADMIN`.
- Axios-клиент отправляет на backend заголовок `X-Telegram-User-Id`.
- Страница продавца позволяет:
  - смотреть сводку по магазину;
  - видеть общий остаток товаров;
  - видеть количество открытых заказов;
  - видеть сумму заказов без отменённых;
  - создавать товар;
  - редактировать товар;
  - смотреть все товары, включая товары с нулевым остатком;
  - смотреть все заказы;
  - менять статус заказа.
- Пользователь с ролью `ADMIN` дополнительно видит кнопку удаления товара.

### Backend

Добавлен пакет `backend/src/main/java/com/tgapp/access`:

- `AccessLevel` — роли `BUYER`, `SELLER`, `ADMIN`;
- `AccessProperties` — чтение списков Telegram id из конфигурации;
- `AccessControlService` — проверка прав доступа.

Добавлен endpoint:

```http
GET /api/access/me
```

Он возвращает текущий Telegram id и уровень доступа:

```json
{
  "telegramUserId": 1001,
  "level": "SELLER"
}
```

В контроллеры товаров и заказов добавлены проверки доступа:

- покупатель может смотреть доступные товары, создавать свои заказы и смотреть только свои заказы;
- продавец может управлять товарами, видеть все заказы и менять статусы;
- администратор может всё, что продавец, плюс удалять товары.

## Уровни доступа

| Роль | Что может делать |
| --- | --- |
| `BUYER` | Смотреть каталог, добавлять товары в корзину, создавать заказ, смотреть свои заказы |
| `SELLER` | Всё как покупатель, плюс страница `/seller`, создание и редактирование товаров, просмотр всех заказов, смена статуса заказа |
| `ADMIN` | Всё как продавец, плюс удаление товаров |

Роль определяется на backend по Telegram user id.

По умолчанию для локальной разработки:

- `1001` — продавец;
- `9001` — администратор.

Это сделано специально, потому что вне Telegram приложение использует демо-id `1001`.

## Настройка доступов

В `backend/src/main/resources/application.yml` добавлены настройки:

```yaml
tgapp:
  access:
    seller-ids: ${SELLER_TELEGRAM_IDS:1001}
    admin-ids: ${ADMIN_TELEGRAM_IDS:9001}
```

Через `.env` или переменные окружения можно задать свои id:

```env
SELLER_TELEGRAM_IDS=1001,1002,1003
ADMIN_TELEGRAM_IDS=9001
```

В `docker-compose.yml` эти переменные уже проброшены в backend.

## Важное замечание по безопасности

Сейчас доступ разделён на уровне backend, но Telegram user id приходит в заголовке `X-Telegram-User-Id`.

Для учебного проекта и локального запуска этого достаточно, чтобы показать уровни доступа и закрыть админские операции от обычного UI. Для production нужно обязательно валидировать `X-Telegram-Init-Data` через bot token на backend и брать Telegram id только из проверенных данных Telegram, а не доверять клиентскому заголовку.

Заголовок `X-Telegram-Init-Data` уже отправляется frontend-клиентом, но полноценная криптографическая проверка initData пока не реализована.

## Основные API

### Доступ

```http
GET /api/access/me
```

Возвращает роль текущего пользователя.

### Товары

```http
GET /api/products
```

Публичный список товаров с остатком больше нуля.

```http
GET /api/products?availableOnly=false
```

Полный список товаров. Доступен только `SELLER` и `ADMIN`.

```http
POST /api/products
PUT /api/products/{id}
```

Создание и редактирование товара. Доступно `SELLER` и `ADMIN`.

```http
DELETE /api/products/{id}
```

Удаление товара. Доступно только `ADMIN`.

### Заказы

```http
POST /api/orders
GET /api/orders/user/{telegramUserId}
GET /api/orders/{id}
```

Покупатель может создавать и смотреть только свои заказы.

```http
GET /api/orders
PATCH /api/orders/{id}/status
```

Просмотр всех заказов и смена статуса доступны `SELLER` и `ADMIN`.

Доступные статусы заказа:

- `PENDING`
- `PAID`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## Быстрый запуск через Docker

Создайте `.env` в корне проекта:

```env
DB_NAME=tgapp
DB_USER=postgres
DB_PASSWORD=postgres
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=change_me
SELLER_TELEGRAM_IDS=1001
ADMIN_TELEGRAM_IDS=9001
```

Запустите проект:

```bash
docker compose up --build
```

После запуска:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- PostgreSQL: `localhost:5432`

## Локальный запуск

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite dev server запускается на `http://localhost:3000` и проксирует `/api` на `http://localhost:8080`.

## Проверка

Frontend проверен командой:

```bash
cd frontend
npm run build
```

Java-проверка планировалась командой:

```bash
cd backend
mvn test
```

Но в текущем окружении команда `mvn` не найдена, а Maven Wrapper (`mvnw`) в репозитории отсутствует. Чтобы проверить backend локально, установите Maven или добавьте Maven Wrapper.

## Структура проекта

```text
.
├── backend
│   ├── src/main/java/com/tgapp/access
│   ├── src/main/java/com/tgapp/config
│   ├── src/main/java/com/tgapp/database
│   ├── src/main/java/com/tgapp/endpoints
│   ├── src/main/java/com/tgapp/schemas
│   └── src/main/resources/db/migration
├── frontend
│   ├── src/api
│   ├── src/components
│   ├── src/pages
│   ├── src/router
│   ├── src/store
│   └── src/utils
└── docker-compose.yml
```

## Где смотреть новые изменения

Backend:

- `backend/src/main/java/com/tgapp/access/AccessLevel.java`
- `backend/src/main/java/com/tgapp/access/AccessProperties.java`
- `backend/src/main/java/com/tgapp/access/AccessControlService.java`
- `backend/src/main/java/com/tgapp/endpoints/AccessController.java`
- `backend/src/main/java/com/tgapp/endpoints/ProductController.java`
- `backend/src/main/java/com/tgapp/endpoints/OrderController.java`
- `backend/src/main/resources/application.yml`

Frontend:

- `frontend/src/pages/Seller/index.tsx`
- `frontend/src/store/access.tsx`
- `frontend/src/api/client.ts`
- `frontend/src/api/marketplace.ts`
- `frontend/src/components/AppShell.tsx`
- `frontend/src/router/index.tsx`
- `frontend/src/index.css`

## Что можно улучшить дальше

- Реализовать полноценную проверку Telegram `initData` на backend.
- Добавить сущность пользователя и хранить роли в базе данных.
- Добавить фильтры заказов на странице продавца.
- Добавить загрузку изображений вместо ручного URL.
- Добавить тесты для `AccessControlService` и контроллеров.
- Добавить Maven Wrapper, чтобы backend можно было проверять без установленного Maven.

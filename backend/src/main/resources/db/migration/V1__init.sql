CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL,
    image_url   VARCHAR(512),
    stock       INTEGER        NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id               BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT         NOT NULL,
    status           VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    total_price      NUMERIC(10, 2) NOT NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT         NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id BIGINT         NOT NULL REFERENCES products (id),
    quantity   INTEGER        NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- Seed data
INSERT INTO products (name, description, price, stock)
VALUES ('Sample Product', 'A great product for testing', 9.99, 100);

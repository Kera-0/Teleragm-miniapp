UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Sample Product' AND image_url IS NULL;

INSERT INTO products (name, description, price, image_url, stock)
SELECT 'Everyday Sneakers',
       'Light sneakers for city walks and daily outfits.',
       89.90,
       'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
       14
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Everyday Sneakers');

INSERT INTO products (name, description, price, image_url, stock)
SELECT 'Canvas Tote Bag',
       'Durable cotton bag with roomy inner pocket.',
       24.50,
       'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
       31
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Canvas Tote Bag');

INSERT INTO products (name, description, price, image_url, stock)
SELECT 'Minimal Watch',
       'Clean analog watch with stainless steel case.',
       129.00,
       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
       8
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Minimal Watch');

INSERT INTO products (name, description, price, image_url, stock)
SELECT 'Desk Lamp',
       'Adjustable LED lamp for focused evening work.',
       46.00,
       'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
       18
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Desk Lamp');

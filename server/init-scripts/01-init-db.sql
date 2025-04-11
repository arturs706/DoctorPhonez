-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User related tables and indexes
CREATE TABLE IF NOT EXISTS users (
    usid UUID NOT NULL PRIMARY KEY,
    fullname TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    mob_phone TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    email_ver BOOLEAN DEFAULT false,
    email_ver_token TEXT,
    passwd TEXT,
    authmethod TEXT DEFAULT 'local', -- Corrected curly quote
    created_at TIMESTAMPTZ NOT NULL
);

-- Note: Second users table definition is redundant due to IF NOT EXISTS, but included as provided.
CREATE TABLE IF NOT EXISTS users (
    usid UUID NOT NULL PRIMARY KEY,
    fullname TEXT NOT NULL,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    mob_phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_ver BOOLEAN DEFAULT false,
    email_ver_token TEXT,
    passwd TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS email_ver_idx ON users (email_ver_token);
CREATE INDEX IF NOT EXISTS email_idx ON users (email);
CREATE INDEX IF NOT EXISTS mob_phone_idx ON users (mob_phone);

-- User address tables and indexes
CREATE TABLE IF NOT EXISTS useraddr (
    addrid UUID NOT NULL PRIMARY KEY,
    userid UUID UNIQUE NOT NULL,
    firstline TEXT NOT NULL,
    secondline TEXT NOT NULL,
    city TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS userid_idx ON useraddr (userid);

CREATE TABLE IF NOT EXISTS useraddrsecondary (
    addrid UUID NOT NULL PRIMARY KEY,
    userid UUID UNIQUE NOT NULL,
    firstline TEXT NOT NULL,
    secondline TEXT NOT NULL,
    city TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS useridd_idx ON useraddrsecondary (userid); -- Note potential typo in original index name

-- Verification token tables
CREATE TABLE email_verification_tokens (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pass_verification_tokens (
    id SERIAL PRIMARY KEY,
    userid UUID UNIQUE NOT NULL,
    secretcode TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE
);

CREATE TABLE mobp_verification_tokens (
    id SERIAL PRIMARY KEY,
    userid UUID UNIQUE NOT NULL,
    mob_phone TEXT NOT NULL,
    secretcode TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE
);

-- Product related tables and indexes
CREATE TABLE IF NOT EXISTS products(
    productid UUID NOT NULL PRIMARY KEY,
    prodname TEXT UNIQUE NOT NULL,
    proddescr TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    modelnr TEXT NOT NULL UNIQUE,
    availableqty INT4 NOT NULL,
    price TEXT NOT NULL, -- Consider NUMERIC(10, 2) if precision is needed
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS category_idx ON products (category);
CREATE INDEX IF NOT EXISTS brand_idx ON products (brand);
CREATE INDEX IF NOT EXISTS modelnr_idx ON products (modelnr);

-- Product specifications table, index, function, and trigger
CREATE TABLE IF NOT EXISTS productspecs(
    specid UUID NOT NULL PRIMARY KEY,
    color TEXT NOT NULL,
    subcolor TEXT NOT NULL,
    productmodel TEXT NOT NULL UNIQUE,
    memory TEXT NOT NULL,
    totalrating INT4 NOT NULL DEFAULT 0,
    totalleftrate INT4 NOT NULL DEFAULT 0,
    rating NUMERIC(10, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (productmodel) REFERENCES products(modelnr) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS productmodel_idx ON productspecs (productmodel);

-- WARNING: This function might cause division by zero if totalleftrate is 0.
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Avoid division by zero error
    IF NEW.totalleftrate > 0 THEN
        UPDATE productspecs
           SET rating = NEW.totalrating::NUMERIC / NEW.totalleftrate -- Cast to numeric for potential precision
         WHERE specid = NEW.specid;
    ELSE
        UPDATE productspecs
           SET rating = 0
         WHERE specid = NEW.specid;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OF totalrating, totalleftrate ON productspecs
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Product images table
CREATE TABLE IF NOT EXISTS productimages(
    productimgid UUID NOT NULL PRIMARY KEY,
    productmodel TEXT NOT NULL UNIQUE,
    imageone TEXT NOT NULL UNIQUE,
    imagetwo TEXT NOT NULL UNIQUE,
    imagethree TEXT NOT NULL UNIQUE,
    imagefour TEXT NOT NULL UNIQUE,
    FOREIGN KEY (productmodel) REFERENCES products(modelnr) ON DELETE CASCADE
);

-- Order related tables, indexes, and functions
CREATE TABLE userorders (
    orderid TEXT PRIMARY KEY,
    userid UUID NOT NULL,
    useremail TEXT NOT NULL,
    totalcost NUMERIC(10, 2) NOT NULL,
    receiptlink TEXT NOT NULL,
    paymentmeth TEXT NOT NULL,
    cardendnr TEXT,
    delivered BOOLEAN DEFAULT false,
    orderdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE
);

-- Note: This function needs to be called periodically (e.g., by pg_cron or external scheduler)
CREATE OR REPLACE FUNCTION mark_orders_delivered()
RETURNS VOID AS $$
BEGIN
    UPDATE userorders
       SET delivered = true
     WHERE orderdate + INTERVAL '5 days' <= NOW()
       AND delivered = false;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS orderididx ON userorders (orderid);

CREATE TABLE orderitems (
    orderitemsid SERIAL PRIMARY KEY,
    orderid TEXT NOT NULL,
    productname TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price TEXT NOT NULL, -- Consider NUMERIC(10, 2)
    color TEXT NOT NULL,
    memory TEXT NOT NULL,
    imageurl TEXT NOT NULL,
    FOREIGN KEY (orderid) REFERENCES userorders(orderid) ON DELETE CASCADE,
    FOREIGN KEY (productname) REFERENCES products(prodname) ON DELETE CASCADE
);

CREATE TABLE shippingaddress (
    shippingid SERIAL PRIMARY KEY,
    orderid TEXT NOT NULL UNIQUE,
    firstline TEXT NOT NULL,
    secondline TEXT NOT NULL,
    city TEXT NOT NULL,
    postcode TEXT NOT NULL,
    FOREIGN KEY (orderid) REFERENCES userorders(orderid) ON DELETE CASCADE
);

-- Favourites table
CREATE TABLE IF NOT EXISTS favourites(
    favid UUID NOT NULL PRIMARY KEY,
    userid UUID NOT NULL,
    productid UUID NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES products(productid) ON DELETE CASCADE
);

-- Sales report table
CREATE TABLE IF NOT EXISTS sales_report (
    productid UUID NOT NULL,
    sales_count INT4 NOT NULL,
    PRIMARY KEY (productid)
);

-- Delivery tables
CREATE TABLE delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    delivery_time TIMESTAMP,
    status VARCHAR(20)
);

CREATE TABLE delivery_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID REFERENCES delivery(id),
    status VARCHAR(20),
    status_time TIMESTAMP
);

-- Additional order/item tables (potentially overlapping with userorders/orderitems?)
CREATE TABLE orderdet(
    orderid SERIAL PRIMARY KEY,
    userid uuid NOT NULL,
    total DECIMAL(20,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(usid)
);

CREATE TABLE IF NOT EXISTS listitems(
    orditid UUID NOT NULL PRIMARY KEY,
    productid UUID UNIQUE NOT NULL,
    orderidretr INT8, -- Consider referencing orderdet(orderid) if related
    quantity INT8,
    FOREIGN KEY (productid) REFERENCES products(productid) ON DELETE CASCADE
    -- Potentially add FOREIGN KEY (orderidretr) REFERENCES orderdet(orderid) ON DELETE CASCADE;
);

-- Note: Second favourites table definition is redundant, but included as provided.
CREATE TABLE IF NOT EXISTS favourites(
    favid UUID NOT NULL PRIMARY KEY,
    userid UUID NOT NULL,
    productid UUID NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(usid) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES products(productid) ON DELETE CASCADE
);


-- Product Data Insertion (Mobile Phones)
INSERT INTO products(productid, prodname, proddescr, brand, category, modelnr, availableqty, price, created_at) VALUES
('9680ead9-57f6-441d-af5f-a384a66d3300', 'SIM Free iPhone 13 5G Mobile Phone 128GB - Midnight', 'Your new superpower. All-out standout. The iPhone 13 features the most advanced dual-camera system ever on an iPhone. The colourful, sharper and brighter 6.1-inch Super Retina XDR display and durable flat-edge design with Ceramic Shield. A15 Bionic chip, the worlds fastest smartphone chip for lightning-fast performance. A big leap in battery life. ', 'apple', 'mobilephones', 'MLPF3B/A', 13, '699.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3322', 'SIM Free iPhone 13 5G Mobile Phone 128GB - Blue', 'Your new superpower. All-out standout. The iPhone 13 features the most advanced dual-camera system ever on an iPhone. The colourful, sharper and brighter 6.1-inch Super Retina XDR display and durable flat-edge design with Ceramic Shield. A15 Bionic chip, the worlds fastest smartphone chip for lightning-fast performance. A big leap in battery life. ', 'apple', 'mobilephones', 'MLPF3B/B', 13, '699.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3342', 'SIM Free iPhone 13 5G Mobile Phone 128GB - Green', 'Your new superpower. All-out standout. The iPhone 13 features the most advanced dual-camera system ever on an iPhone. The colourful, sharper and brighter 6.1-inch Super Retina XDR display and durable flat-edge design with Ceramic Shield. A15 Bionic chip, the worlds fastest smartphone chip for lightning-fast performance. A big leap in battery life. ', 'apple', 'mobilephones', 'MLPF3C/A', 45, '699.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3352', 'SIM Free iPhone 13 5G Mobile Phone 128GB - Pink', 'Your new superpower. All-out standout. The iPhone 13 features the most advanced dual-camera system ever on an iPhone. The colourful, sharper and brighter 6.1-inch Super Retina XDR display and durable flat-edge design with Ceramic Shield. A15 Bionic chip, the worlds fastest smartphone chip for lightning-fast performance. A big leap in battery life. ', 'apple', 'mobilephones', 'MLPF3D/A', 49, '699.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3362', 'SIM Free iPhone 13 5G Mobile Phone 128GB - Red', 'Your new superpower. All-out standout. The iPhone 13 features the most advanced dual-camera system ever on an iPhone. The colourful, sharper and brighter 6.1-inch Super Retina XDR display and durable flat-edge design with Ceramic Shield. A15 Bionic chip, the worlds fastest smartphone chip for lightning-fast performance. A big leap in battery life. ', 'apple', 'mobilephones', 'MLPF3E/A', 127, '699.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3372', 'SIM Free iPhone 13 5G Mobile Phone 128GB - White', 'Your new superpower. All-out standout. The iPhone 13 features the most advanced dual-camera system ever on an iPhone. The colourful, sharper and brighter 6.1-inch Super Retina XDR display and durable flat-edge design with Ceramic Shield. A15 Bionic chip, the worlds fastest smartphone chip for lightning-fast performance. A big leap in battery life. ', 'apple', 'mobilephones', 'MLPF3F/A', 148, '699.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3482', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone - Phantom Black', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'samsung', 'mobilephones', 'SM-S918B-A', 188, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3492', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone - Graphite', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'samsung', 'mobilephones', 'SM-S918B-B', 278, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3502', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone - Cream', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'samsung', 'mobilephones', 'SM-S918B-C', 338, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3512', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone - Lavender', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'samsung', 'mobilephones', 'SM-S918C-C', 492, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3522', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone - Lime', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'samsung', 'mobilephones', 'SM-S918D-C', 145, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3532', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone - Red', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'Samsung', 'mobilephones', 'SM-S918E-C', 179, '1249.99', NOW()), -- Corrected Brand casing potentially?
('9680ead9-57f6-441d-af5f-a384a66d3542', 'SIM Free Samsung Galaxy S23 Ultra 5G 256GB Phone – Sky Blue', 'Your Galaxy, your way. The Samsung Galaxy S23 Series boasts a fresh look, both outside and in. The new and improved One UI 5.1 lets you customise your whole experience. From lock screen and wallpaper designs to how the clock and notification bar appear. You can even manage how notifications appear and assign full-screen GIFs to your favourite contacts, so they begin looping with incoming calls. All the core Samsung apps have had a facelife too, for a fresh look throughout. More personalised options to suit every taste, now built in as standard.', 'samsung', 'mobilephones', 'SM-S918F-C', 379, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3632', 'SIM Free iPhone 14 Pro Max 5G Mobile Phone 256GB - Gold', 'iPhone 14 Pro Max. Pro. Beyond. All Systems Pro. Capture incredible detail with a 48MP main camera. Experience iPhone in a whole new way with Dynamic Island and Always-On display. Introducing Dynamic Island, a truly Apple innovation that has hardware and software and something in between. It bubbles up music, FaceTime and so much more - all without taking you away from what you are doing. A16 Bionic, the ultimate smartphone chip. Superfast 5G cellular.', 'apple', 'mobilephones', 'APP-IP-S988B-A', 544, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3642', 'SIM Free iPhone 14 Pro Max 5G Mobile Phone 256GB – Deep Purple', 'iPhone 14 Pro Max. Pro. Beyond. All Systems Pro. Capture incredible detail with a 48MP main camera. Experience iPhone in a whole new way with Dynamic Island and Always-On display. Introducing Dynamic Island, a truly Apple innovation that has hardware and software and something in between. It bubbles up music, FaceTime and so much more - all without taking you away from what you are doing. A16 Bionic, the ultimate smartphone chip. Superfast 5G cellular.', 'apple', 'mobilephones', 'APP-IP-S919B-A', 679, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3662', 'SIM Free iPhone 14 Pro Max 5G Mobile Phone 256GB – Space Black', 'iPhone 14 Pro Max. Pro. Beyond. All Systems Pro. Capture incredible detail with a 48MP main camera. Experience iPhone in a whole new way with Dynamic Island and Always-On display. Introducing Dynamic Island, a truly Apple innovation that has hardware and software and something in between. It bubbles up music, FaceTime and so much more - all without taking you away from what you are doing. A16 Bionic, the ultimate smartphone chip. Superfast 5G cellular.', 'apple', 'mobilephones', 'APP-IP-S919B-B', 458, '1249.99', NOW()),
('9680ead9-57f6-441d-af5f-a384a66d3652', 'SIM Free iPhone 14 Pro Max 5G Mobile Phone 256GB – Silver', 'iPhone 14 Pro Max. Pro. Beyond. All Systems Pro. Capture incredible detail with a 48MP main camera. Experience iPhone in a whole new way with Dynamic Island and Always-On display. Introducing Dynamic Island, a truly Apple innovation that has hardware and software and something in between. It bubbles up music, FaceTime and so much more - all without taking you away from what you are doing. A16 Bionic, the ultimate smartphone chip. Superfast 5G cellular.', 'apple', 'mobilephones', 'APP-IP-S979B-A', 822, '1249.99', NOW());

-- Product Specification Data Insertion (Mobile Phones)
-- Note: Redundant CREATE TABLE IF NOT EXISTS productspecs removed here, already created above.
INSERT INTO productspecs(specid, color, subcolor, productmodel, memory, totalrating, totalleftrate) VALUES
( '9680ead9-57f6-441d-af5f-a384a66d3493', 'gray', 'gray', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918B-B'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3301', 'midnight', 'black', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3B/A'), '128GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3311', 'blue', 'blue', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3B/B'), '128GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3341', 'green', 'green', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3C/A'), '128GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3351', 'pink', 'pink', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3D/A'), '128GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3361', 'red', 'red', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3E/A'), '128GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3371', 'white', 'white', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3F/A'), '128GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3483', 'phantomblack', 'black', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918B-A'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3503', 'white', 'white', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918B-C'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3523', 'lime', 'green', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918D-C'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3633', 'gold', 'yellow', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S988B-A'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3513', 'lavender', 'purple', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918C-C'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3533', 'red', 'red', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918E-C'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3663', 'spaceblack', 'black', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S919B-B'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3543', 'skyblue', 'blue', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918F-C'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3643', 'darkpurple', 'purple', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S919B-A'), '256GB', 0, 0 ),
( '9680ead9-57f6-441d-af5f-a384a66d3653', 'white', 'white', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S979B-A'), '256GB', 0, 0 );

-- Product Image Data Insertion (Mobile Phones)
INSERT INTO productimages(productimgid, productmodel, imageone, imagetwo, imagethree, imagefour) VALUES
( '9680ead9-57f6-441d-af5f-a384a66d3302', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3B/A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103397/Apple/Mobile%20Phones/Free%20iPhone%2013/black/2_hbuho7.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103397/Apple/Mobile%20Phones/Free%20iPhone%2013/black/1_ykxiqg.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678102000/Apple/Mobile%20Phones/iPhone%2014%20Plus/blue/3_vefnao.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678102001/Apple/Mobile%20Phones/iPhone%2014%20Plus/blue/4_zmwf8u.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3312', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3B/B'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103146/Apple/Mobile%20Phones/Free%20iPhone%2013/blue/2_n6qlvx.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103146/Apple/Mobile%20Phones/Free%20iPhone%2013/blue/1_mljrbs.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103147/Apple/Mobile%20Phones/Free%20iPhone%2013/blue/3_xqrsvj.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103146/Apple/Mobile%20Phones/Free%20iPhone%2013/blue/4_z4kvdn.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3342', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3C/A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678102910/Apple/Mobile%20Phones/Free%20iPhone%2013/green/2_pjgqkm.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678102910/Apple/Mobile%20Phones/Free%20iPhone%2013/green/1_emdrxa.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678102910/Apple/Mobile%20Phones/Free%20iPhone%2013/green/3_qqijhp.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678102909/Apple/Mobile%20Phones/Free%20iPhone%2013/green/4_h50vam.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3352', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3D/A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103808/Apple/Mobile%20Phones/Free%20iPhone%2013/pink/2_yujzte.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103808/Apple/Mobile%20Phones/Free%20iPhone%2013/pink/1_fcflyu.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103808/Apple/Mobile%20Phones/Free%20iPhone%2013/pink/3_aohqfe.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678103808/Apple/Mobile%20Phones/Free%20iPhone%2013/pink/4_dysdhz.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3363', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3E/A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104150/Apple/Mobile%20Phones/Free%20iPhone%2013/red/2_xno38d.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104150/Apple/Mobile%20Phones/Free%20iPhone%2013/red/1_bglxe0.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104150/Apple/Mobile%20Phones/Free%20iPhone%2013/red/3_rsfyic.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104150/Apple/Mobile%20Phones/Free%20iPhone%2013/red/4_u2wf47.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3373', (SELECT modelnr FROM products WHERE modelnr = 'MLPF3F/A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104921/Apple/Mobile%20Phones/Free%20iPhone%2013/white/2_xhcpah.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104921/Apple/Mobile%20Phones/Free%20iPhone%2013/white/1_jb9ihn.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104921/Apple/Mobile%20Phones/Free%20iPhone%2013/white/3_fwsfuq.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678104921/Apple/Mobile%20Phones/Free%20iPhone%2013/white/4_jdgb3d.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3383', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918B-A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105720/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/phantom%20black/2_l6g9ox.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105720/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/phantom%20black/1_nnd2i9.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105720/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/phantom%20black/3_r2yah1.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105720/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/phantom%20black/4_ftmfrt.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3394', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918B-B'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678116342/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/graphite/2_jfkdvu.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678116342/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/graphite/1_leoa8c.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678116342/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/graphite/3_ptyvbr.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678116342/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/graphite/4_zyhdct.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3504', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918B-C'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106032/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/cream/2_vkwnfz.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106032/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/cream/1_bfrk9e.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106032/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/cream/3_f8djrh.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106032/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/cream/4_vpaknr.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3514', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918C-C'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105889/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lavender/2_dgkjrt.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105889/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lavender/1_d8ozwm.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105889/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lavender/3_oonwmd.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678105890/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lavender/4_tnwsex.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3524', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918D-C'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106311/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lime/2_ehvprr.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106310/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lime/1_wydyiq.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106310/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lime/3_bxczkl.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106311/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/lime/4_s5paax.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3534', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918E-C'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106448/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/red/2_ranjib.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106448/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/red/1_bccyfg.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106448/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/red/3_y3vdyd.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106448/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/red/4_mh7cml.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3544', (SELECT modelnr FROM products WHERE modelnr = 'SM-S918F-C'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106186/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/sky%20blue/2_ytbtul.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106186/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/sky%20blue/1_fsnksh.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106186/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/sky%20blue/3_iwffep.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678106186/Samsung/Mobile%20Phones/Galaxy%20S23%20Ultra/sky%20blue/4_vmq2jx.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3633', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S988B-A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100219/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/gold/2_lon12e.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100220/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/gold/1_xs4yxa.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100220/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/gold/3_moexiu.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100224/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/gold/4_khjbu4.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3644', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S919B-A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678098033/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/purple/2_so8aov.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678098033/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/purple/1_eycry9.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678098033/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/purple/3_wyyjs4.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100198/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/purple/4_ha8fyk.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3654', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S979B-A'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678099256/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/silver/2_ka8sgp.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678099256/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/silver/1_qnrek4.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678099257/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/silver/3_i0mpfg.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100173/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/silver/4_qynrhe.png' ),
( '9680ead9-57f6-441d-af5f-a384a66d3664', (SELECT modelnr FROM products WHERE modelnr = 'APP-IP-S919B-B'), 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678099893/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/space%20black/2_vvokje.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678099893/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/space%20black/1_mjjfwx.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678099893/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/space%20black/3_a9mhxv.png', 'https://res.cloudinary.com/dttaprmbu/image/upload/v1678100150/Apple/Mobile%20Phones/iPhone%2014%20Pro%20Max/space%20black/4_wayea3.png' );

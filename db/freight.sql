CREATE TABLE IF NOT EXISTS vendor_invoice_registry (
 supplier_id BIGINT UNSIGNED NOT NULL,
 invoice_key VARCHAR(200) NOT NULL,
 bill_id BIGINT UNSIGNED NOT NULL,
 PRIMARY KEY(supplier_id,invoice_key),
 UNIQUE KEY(bill_id),
 FOREIGN KEY(supplier_id) REFERENCES business_records(id),
 FOREIGN KEY(bill_id) REFERENCES business_records(id)
);
CREATE TABLE IF NOT EXISTS vendor_profiles (
 user_id BIGINT UNSIGNED PRIMARY KEY,
 organization_id BIGINT UNSIGNED NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(organization_id) REFERENCES business_records(id)
);
CREATE TABLE IF NOT EXISTS stock_balances (
 warehouse_id BIGINT UNSIGNED NOT NULL,
 shipment_id BIGINT UNSIGNED NOT NULL,
 location VARCHAR(100) NOT NULL,
 sku VARCHAR(100) NOT NULL,
 lot VARCHAR(100) NOT NULL,
 quantity DECIMAL(18,4) NOT NULL DEFAULT 0,
 PRIMARY KEY(warehouse_id,shipment_id,location,sku,lot),
 CHECK(quantity>=0),
 FOREIGN KEY(warehouse_id) REFERENCES business_records(id),
 FOREIGN KEY(shipment_id) REFERENCES business_records(id)
);
CREATE TABLE IF NOT EXISTS consolidation_members (
 consolidation_id BIGINT UNSIGNED NOT NULL,
 shipment_id BIGINT UNSIGNED PRIMARY KEY,
 share DECIMAL(9,4) NOT NULL,
 FOREIGN KEY(consolidation_id) REFERENCES business_records(id),
 FOREIGN KEY(shipment_id) REFERENCES business_records(id),
 CHECK(share>0 AND share<=100)
);
CREATE TABLE IF NOT EXISTS login_limits (
 limiter_key CHAR(64) PRIMARY KEY,
 attempts INT UNSIGNED NOT NULL,
 window_start DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS freight_document_numbers (
 document_type VARCHAR(40) NOT NULL,
 document_number VARCHAR(200) NOT NULL,
 record_id BIGINT UNSIGNED NOT NULL,
 PRIMARY KEY(document_type,document_number),
 UNIQUE KEY(record_id),
 FOREIGN KEY(record_id) REFERENCES business_records(id)
);
CREATE TABLE IF NOT EXISTS staged_uploads (
 upload_token CHAR(64) PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 name VARCHAR(200) NOT NULL,
 mime VARCHAR(100) NOT NULL,
 content MEDIUMBLOB NOT NULL,
 expires_at DATETIME NOT NULL,
 INDEX(user_id,expires_at),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

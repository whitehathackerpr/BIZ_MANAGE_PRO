# Database Schema Documentation

## Overview

The database uses PostgreSQL and follows a relational model with proper foreign key constraints and indexes. The schema is designed to support multi-branch operations, real-time analytics, and comprehensive business management.

## Tables

### Users and Authentication

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    phone VARCHAR(20),
    address TEXT,
    avatar_url VARCHAR(255),
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Branch Management

#### branches
```sql
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### branch_settings
```sql
CREATE TABLE branch_settings (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, setting_key)
);
```

### Inventory Management

#### products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    barcode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### branch_inventory
```sql
CREATE TABLE branch_inventory (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 0,
    reorder_point INTEGER,
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, product_id)
);
```

#### inventory_transfers
```sql
CREATE TABLE inventory_transfers (
    id SERIAL PRIMARY KEY,
    from_branch_id INTEGER REFERENCES branches(id),
    to_branch_id INTEGER REFERENCES branches(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sales Management

#### sales
```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### sale_items
```sql
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Employee Management

#### branch_users
```sql
CREATE TABLE branch_users (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, user_id)
);
```

#### attendance
```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    branch_user_id INTEGER REFERENCES branch_users(id),
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,
    status VARCHAR(20) DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analytics and Reporting

#### analytics_events
```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### analytics_metrics
```sql
CREATE TABLE analytics_metrics (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, metric_type, metric_date)
);
```

### Notifications

#### notifications
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notification_recipients
```sql
CREATE TABLE notification_recipients (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER REFERENCES notifications(id),
    user_id INTEGER REFERENCES users(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

### Performance Indexes
```sql
-- Sales indexes
CREATE INDEX idx_sales_branch_date ON sales(branch_id, created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);

-- Inventory indexes
CREATE INDEX idx_branch_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_branch_inventory_product ON branch_inventory(product_id);

-- Analytics indexes
CREATE INDEX idx_analytics_events_branch_date ON analytics_events(branch_id, created_at);
CREATE INDEX idx_analytics_metrics_branch_date ON analytics_metrics(branch_id, metric_date);
```

### Foreign Key Indexes
```sql
-- User references
CREATE INDEX idx_branch_users_user ON branch_users(user_id);
CREATE INDEX idx_branch_users_branch ON branch_users(branch_id);

-- Branch references
CREATE INDEX idx_branch_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_sales_branch ON sales(branch_id);
```

## Views

### Sales Summary View
```sql
CREATE VIEW sales_summary AS
SELECT 
    s.branch_id,
    DATE(s.created_at) as sale_date,
    COUNT(*) as total_sales,
    SUM(s.total_amount) as total_revenue,
    AVG(s.total_amount) as average_sale
FROM sales s
GROUP BY s.branch_id, DATE(s.created_at);
```

### Inventory Status View
```sql
CREATE VIEW inventory_status AS
SELECT 
    bi.branch_id,
    p.name as product_name,
    bi.quantity,
    bi.reorder_point,
    CASE 
        WHEN bi.quantity <= bi.reorder_point THEN 'Low Stock'
        ELSE 'In Stock'
    END as status
FROM branch_inventory bi
JOIN products p ON bi.product_id = p.id;
```

## Functions

### Update Updated At
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Apply Updated At Trigger
```sql
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Constraints

### Check Constraints
```sql
-- Sales amount check
ALTER TABLE sales ADD CONSTRAINT check_sales_amount 
CHECK (total_amount >= 0);

-- Inventory quantity check
ALTER TABLE branch_inventory ADD CONSTRAINT check_inventory_quantity 
CHECK (quantity >= 0);

-- Attendance check
ALTER TABLE attendance ADD CONSTRAINT check_attendance_times 
CHECK (check_out IS NULL OR check_out > check_in);
```

## Maintenance

### Vacuum and Analyze
```sql
-- Regular maintenance
VACUUM ANALYZE;
```

### Index Maintenance
```sql
-- Reindex tables
REINDEX TABLE sales;
REINDEX TABLE branch_inventory;
```

## Backup and Recovery

### Backup Strategy
1. Daily full database backup
2. Hourly transaction log backup
3. Point-in-time recovery capability

### Backup Commands
```bash
# Full backup
pg_dump -Fc -f backup.dump biz_manage

# Restore
pg_restore -d biz_manage backup.dump
``` 
-- ============================================================
-- Smart Ticketing System — SQL Server Setup Script
-- Run this in SSMS before starting the backend
-- ============================================================

-- 1. Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TicketingDB')
BEGIN
    CREATE DATABASE TicketingDB;
END
GO

USE TicketingDB;
GO

-- 2. Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        name        NVARCHAR(100)  NOT NULL,
        email       NVARCHAR(150)  NOT NULL UNIQUE,
        password    NVARCHAR(255)  NOT NULL,         -- bcrypt hash
        role        NVARCHAR(20)   NOT NULL DEFAULT 'user', -- 'user' | 'admin'
        is_active   BIT            NOT NULL DEFAULT 1,
        created_at  DATETIME       NOT NULL DEFAULT GETDATE(),
        last_login  DATETIME       NULL
    );
END
GO

-- 3. Tickets Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tickets' AND xtype='U')
BEGIN
    CREATE TABLE Tickets (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        ticket_no   NVARCHAR(20)   NOT NULL UNIQUE,  -- e.g. TKT-1001
        user_id     INT            NOT NULL FOREIGN KEY REFERENCES Users(id),
        category    NVARCHAR(100)  NOT NULL,
        issue       NVARCHAR(255)  NOT NULL,
        priority    NVARCHAR(20)   NOT NULL DEFAULT 'Medium', -- Low | Medium | High
        status      NVARCHAR(30)   NOT NULL DEFAULT 'Open',   -- Open | In Progress | Resolved | Rejected
        created_at  DATETIME       NOT NULL DEFAULT GETDATE(),
        updated_at  DATETIME       NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 4. Ticket Comments Table (admin adds resolution comments)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TicketComments' AND xtype='U')
BEGIN
    CREATE TABLE TicketComments (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        ticket_id   INT            NOT NULL FOREIGN KEY REFERENCES Tickets(id),
        admin_id    INT            NOT NULL FOREIGN KEY REFERENCES Users(id),
        comment     NVARCHAR(1000) NOT NULL,
        created_at  DATETIME       NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 5. Activity Logs Table (tracks user actions for admin monitoring)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLogs' AND xtype='U')
BEGIN
    CREATE TABLE ActivityLogs (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        user_id     INT            NOT NULL FOREIGN KEY REFERENCES Users(id),
        action      NVARCHAR(100)  NOT NULL,   -- e.g. 'LOGIN', 'TICKET_CREATED'
        description NVARCHAR(500)  NULL,
        ip_address  NVARCHAR(50)   NULL,
        created_at  DATETIME       NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 6. Seed default admin user
-- IMPORTANT: Do NOT use this hash directly.
-- After running npm install in /server, run:  node config/seed_admin.js
-- That script will hash 'admin123' correctly and insert the admin user.
-- ─────────────────────────────────────────────────────────────────────────────

PRINT 'TicketingDB setup complete!';
GO

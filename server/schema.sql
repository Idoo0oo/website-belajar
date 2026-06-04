-- ============================================
-- Study Management App — Database Schema
-- Engine: MySQL 8.0+
-- Character Set: utf8mb4 (full Unicode support)
-- ============================================

CREATE DATABASE IF NOT EXISTS study_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_management;

-- ============================================
-- 1. Users
-- Core user accounts for authentication
-- ============================================
CREATE TABLE Users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('student', 'superadmin') DEFAULT 'student',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ============================================
-- 2. Materials
-- Uploaded study documents (PDF only)
-- ============================================
CREATE TABLE Materials (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  file_path   VARCHAR(500)  NOT NULL,
  file_type   VARCHAR(50)   NOT NULL DEFAULT 'application/pdf',
  quiz_cache  JSON          NULL COMMENT 'Cached AI-generated quiz questions',
  uploaded_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_materials_user (user_id)
) ENGINE=InnoDB;

-- ============================================
-- 3. MaterialTags
-- Traffic light tagging system for study materials
--   page_number = NULL → document-level tag
--   page_number = INT  → page-level tag
-- Upsert pattern: INSERT ... ON DUPLICATE KEY UPDATE
-- ============================================
CREATE TABLE MaterialTags (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  material_id  INT           NOT NULL,
  page_number  INT           NULL,
  status       ENUM('UNDERSTOOD', 'REVIEW', 'FOCUS') NOT NULL,
  tagged_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE,
  INDEX idx_tags_material (material_id),
  INDEX idx_tags_status (status),
  UNIQUE KEY uq_material_page (material_id, page_number)
) ENGINE=InnoDB;

-- ============================================
-- 4. Flashcards
-- Active recall cards linked to study materials
-- ============================================
CREATE TABLE Flashcards (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  material_id  INT           NOT NULL,
  question     TEXT          NOT NULL,
  answer       TEXT          NOT NULL,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE,
  INDEX idx_flashcards_material (material_id)
) ENGINE=InnoDB;

-- ============================================
-- 5. StudySessions
-- Logs daily study and rest durations per subject
-- Used by dashboard AreaChart (last 7 days query)
-- ============================================
CREATE TABLE StudySessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  subject       VARCHAR(255)  NOT NULL,
  study_minutes INT           NOT NULL DEFAULT 0,
  rest_minutes  INT           NOT NULL DEFAULT 0,
  session_date  DATE          NOT NULL,

  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user_date (user_id, session_date)
) ENGINE=InnoDB;

-- ============================================
-- 6. Reminders
-- Calendar-based notifications & study schedule
-- idx_reminders_pending optimizes pending lookup
-- ============================================
CREATE TABLE Reminders (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT           NOT NULL,
  title     VARCHAR(255)  NOT NULL,
  remind_at DATETIME      NOT NULL,
  is_sent   BOOLEAN       DEFAULT FALSE,

  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_reminders_user (user_id),
  INDEX idx_reminders_pending (is_sent, remind_at)
) ENGINE=InnoDB;

ALTER TABLE Users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE Users ADD COLUMN verification_token VARCHAR(255) NULL;
ALTER TABLE Users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE Users ADD COLUMN reset_token_expires DATETIME NULL;

CREATE TABLE IF NOT EXISTS QuizResults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  material_id INT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE,
  INDEX idx_quiz_results_user (user_id),
  INDEX idx_quiz_results_material (material_id)
) ENGINE=InnoDB;
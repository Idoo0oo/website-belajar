-- Add Quizzes cache table
-- Run this once against the study_management database

ALTER TABLE Materials ADD COLUMN IF NOT EXISTS quiz_cache JSON NULL;

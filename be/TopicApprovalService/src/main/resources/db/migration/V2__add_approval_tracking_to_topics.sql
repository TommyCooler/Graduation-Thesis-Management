-- Migration: Add approval tracking columns to topics table
-- Date: 2025-01-XX
-- Description: Add approval_count and required_approvals columns to support 2-person approval workflow

ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS approval_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS required_approvals INTEGER DEFAULT 2;

-- Update existing records
UPDATE topics 
SET approval_count = 0, required_approvals = 2 
WHERE approval_count IS NULL OR required_approvals IS NULL;

-- Add constraints
ALTER TABLE topics
ALTER COLUMN approval_count SET NOT NULL,
ALTER COLUMN required_approvals SET NOT NULL;

-- Add check constraints
ALTER TABLE topics
ADD CONSTRAINT check_approval_count_non_negative CHECK (approval_count >= 0),
ADD CONSTRAINT check_required_approvals_positive CHECK (required_approvals > 0),
ADD CONSTRAINT check_approval_count_not_exceed_required CHECK (approval_count <= required_approvals);

-- Add comments for documentation
COMMENT ON COLUMN topics.approval_count IS 'Current number of approvals received (0 to required_approvals)';
COMMENT ON COLUMN topics.required_approvals IS 'Number of approvals required before topic is fully approved (default: 2)';

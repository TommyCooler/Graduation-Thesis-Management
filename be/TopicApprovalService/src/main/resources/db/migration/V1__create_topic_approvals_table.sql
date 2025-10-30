-- Migration: Add topic_approvals table
-- Date: 2025-01-XX
-- Description: Create table to track individual topic approvals for 2-person approval workflow

CREATE TABLE IF NOT EXISTS topic_approvals (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    approver_email VARCHAR(255) NOT NULL,
    approver_name VARCHAR(255),
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    CONSTRAINT fk_topic_approvals_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    CONSTRAINT unique_topic_approver UNIQUE (topic_id, approver_email)
);

-- Create indexes for better query performance
CREATE INDEX idx_topic_approvals_topic_id ON topic_approvals(topic_id);
CREATE INDEX idx_topic_approvals_approver_email ON topic_approvals(approver_email);

-- Add comments for documentation
COMMENT ON TABLE topic_approvals IS 'Tracks individual approvals for topics requiring multiple approvers';
COMMENT ON COLUMN topic_approvals.topic_id IS 'Foreign key to topics table';
COMMENT ON COLUMN topic_approvals.approver_email IS 'Email of the user who approved the topic';
COMMENT ON COLUMN topic_approvals.approver_name IS 'Display name of the approver';
COMMENT ON COLUMN topic_approvals.approved_at IS 'Timestamp when the approval was made';
COMMENT ON COLUMN topic_approvals.comment IS 'Optional comment from the approver';

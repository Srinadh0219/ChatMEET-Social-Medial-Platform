CREATE TABLE "Post" (
    id SERIAL PRIMARY KEY,
    caption TEXT NOT NULL,
    photo TEXT,
    author_id VARCHAR(255) NOT NULL,
    community_id VARCHAR(255),
    user_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_post_author_id ON "Post" (author_id);
CREATE INDEX idx_post_community_id ON "Post" (community_id);
CREATE INDEX idx_post_created_at ON "Post" (created_at);

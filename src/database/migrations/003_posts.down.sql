-- DROP INDEX idx_post_categories_post_id ON post_categories;
-- DROP INDEX idx_post_categories_category_id ON post_categories;

DROP TABLE IF EXISTS post_categories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

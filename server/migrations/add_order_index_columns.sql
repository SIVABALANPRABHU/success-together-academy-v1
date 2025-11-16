-- Add order_index column to pages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pages' 
        AND column_name = 'order_index'
    ) THEN
        ALTER TABLE pages ADD COLUMN order_index INTEGER DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(order_index);
    END IF;
END $$;

-- Add order_index column to chapters table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chapters' 
        AND column_name = 'order_index'
    ) THEN
        ALTER TABLE chapters ADD COLUMN order_index INTEGER DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_index);
    END IF;
END $$;

-- Add order_index column to courses table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'order_index'
    ) THEN
        ALTER TABLE courses ADD COLUMN order_index INTEGER DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(order_index);
    END IF;
END $$;

-- Add order_index column to menus table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'menus' 
        AND column_name = 'order_index'
    ) THEN
        ALTER TABLE menus ADD COLUMN order_index INTEGER DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(order_index);
    END IF;
END $$;


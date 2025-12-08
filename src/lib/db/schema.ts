import { mysqlTable, varchar, text, boolean, timestamp, json, int, index } from 'drizzle-orm/mysql-core';

export const blogPosts = mysqlTable('blog_posts', {
  slug: varchar('slug', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  body: text('body').notNull(),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  featuredImage: varchar('featured_image', { length: 1000 }),
  categories: json('categories').$type<string[]>(),
  tags: json('tags').$type<string[]>(),
  seoTitle: varchar('seo_title', { length: 500 }),
  seoDescription: text('seo_description'),
}, (table) => ({
  publishedIdx: index('published_idx').on(table.published),
  publishedAtIdx: index('published_at_idx').on(table.publishedAt),
}));

export const blogCategories = mysqlTable('blog_categories', {
  slug: varchar('slug', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const portfolioItems = mysqlTable('portfolio_items', {
  slug: varchar('slug', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  body: text('body').notNull(),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  featuredImage: varchar('featured_image', { length: 1000 }),
  type: varchar('type', { length: 50 }),
  category: varchar('category', { length: 255 }),
  status: varchar('status', { length: 50 }),
  featured: boolean('featured').default(false),
  order: int('order').default(0),
  client: varchar('client', { length: 255 }),
  year: varchar('year', { length: 10 }),
  tags: json('tags').$type<string[]>(),
  link: varchar('link', { length: 1000 }),
  images: json('images').$type<{
    hero?: string;
    mockup?: string;
    result?: string;
    gallery?: string[];
  }>(),
  objectives: json('objectives').$type<Array<{
    title: string;
    description: string;
    color?: 'blue' | 'purple' | 'orange' | 'indigo';
  }>>(),
  results: json('results').$type<{
    title?: string;
    paragraphs: string[];
    figmaLink?: string;
  }>(),
  reflections: json('reflections').$type<{
    title?: string;
    content: string[];
  }>(),
  illustration: json('illustration').$type<{
    subtitle?: string;
    styleTitle?: string;
    styleDescription?: string[];
    exampleImages?: string[];
    reflectionsTitle?: string;
    reflectionsContent?: string[];
  }>(),
  seoTitle: varchar('seo_title', { length: 500 }),
  seoDescription: text('seo_description'),
}, (table) => ({
  publishedIdx: index('published_idx').on(table.published),
  updatedAtIdx: index('updated_at_idx').on(table.updatedAt),
}));

export const pages = mysqlTable('pages', {
  slug: varchar('slug', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  body: text('body').notNull(),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  seoTitle: varchar('seo_title', { length: 500 }),
  seoDescription: text('seo_description'),
}, (table) => ({
  publishedIdx: index('published_idx').on(table.published),
}));

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  photoURL: varchar('photo_url', { length: 1000 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const socialLinks = mysqlTable('social_links', {
  id: varchar('id', { length: 50 }).primaryKey().default('socials'),
  instagram: varchar('instagram', { length: 500 }),
  linkedin: varchar('linkedin', { length: 500 }),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type NewPortfolioItem = typeof portfolioItems.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;


import { pgTable, serial, varchar, text, jsonb, timestamp, integer, pgEnum, bigint } from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "sales", "buyer"]);
export const demoStatusEnum = pgEnum("demo_status", ["draft", "active", "archived"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("sales"),
  profilePicture: text("profile_picture"), // URL de la foto de perfil
  company: varchar("company", { length: 255 }), // Nombre de la empresa
  createdByUserId: integer("created_by_user_id"), // Usuario que creó este usuario (referencia a users.id)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"), // URL to logo image
  corporateColor: varchar("corporate_color", { length: 7 }), // Hex color code
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Demos Table
export const demos = pgTable("demos", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  url: text("url"), // Demo iframe URL (opcional si hay htmlContent)
  htmlContent: text("html_content"), // HTML directo para demos de una sola página
  videoPreview: text("video_preview"), // URL to preview video
  instructions: text("instructions"), // DEPRECATED: Legacy field, use instructionsEs/En instead
  instructionsEs: text("instructions_es"), // Instrucciones en español
  instructionsEn: text("instructions_en"), // Instrucciones en inglés
  credentialsJson: jsonb("credentials_json"), // JSON object with login credentials
  hasResponsive: integer("has_responsive").default(0).notNull(), // 0 = false, 1 = true (boolean)
  requiresCredentials: integer("requires_credentials").default(0).notNull(), // 0 = false, 1 = true (boolean)
  status: demoStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leads Table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  revenueRange: varchar("revenue_range", { length: 50 }), // e.g., "$1M-$10M"
  employeeCount: integer("employee_count"),
  location: varchar("location", { length: 255 }),
  sharedByUserId: integer("shared_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Feedback Table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id), // Opcional: para leads públicos
  userId: integer("user_id").references(() => users.id), // Opcional: para buyers con login
  demoId: integer("demo_id").references(() => demos.id).notNull(),
  attendedByUserId: integer("attended_by_user_id").references(() => users.id), // Admin, vendedor o comprador que atendió
  systemRating: integer("system_rating"), // 1-5 rating for the demo system
  promoterRating: integer("promoter_rating"), // 1-5 rating for the salesperson
  npsScore: integer("nps_score"), // 0-10 Net Promoter Score
  interestLevel: varchar("interest_level", { length: 50 }), // low, medium, high, very-high
  purchaseStage: varchar("purchase_stage", { length: 50 }), // exploring, evaluating, negotiating, ready
  budgetRange: varchar("budget_range", { length: 50 }), // e.g., "$10K-$50K"
  decisionTimeframe: varchar("decision_timeframe", { length: 50 }), // immediate, 1-month, 3-months, etc.
  keyFeatures: jsonb("key_features"), // Array of selected features
  painPoints: text("pain_points"), // Text describing pain points
  useCase: text("use_case"), // Text describing use case
  comments: text("comments"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Demo Assignments Table (for buyers - which demos they can access)
export const demoAssignments = pgTable("demo_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  demoId: integer("demo_id").references(() => demos.id).notNull(),
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id), // Admin or Sales who assigned it
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Demo Media Table (for multiple images and videos per demo)
export const demoMedia = pgTable("demo_media", {
  id: serial("id").primaryKey(),
  demoId: integer("demo_id").references(() => demos.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'image', 'video', 'pdf', or 'document'
  url: text("url").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  uploadedByUserId: integer("uploaded_by_user_id").references(() => users.id),
  fileSize: bigint("file_size", { mode: "number" }), // Tamaño en bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Storage Usage Table (tracking de almacenamiento por usuario)
export const storageUsage = pgTable("storage_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalBytes: bigint("total_bytes", { mode: "number" }).notNull().default(0), // Total usado en bytes
  limitBytes: bigint("limit_bytes", { mode: "number" }).notNull().default(26843545600), // Límite por defecto: 25GB (26843545600 bytes) - Cloudinary free tier
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


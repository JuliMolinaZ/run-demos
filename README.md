# RUN Demo Hub

Enterprise Sales Enablement & Demo Management Platform built with Next.js 15, TypeScript, and PostgreSQL.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Admin, Sales, and Buyer roles with granular permissions
- **Demo Management**: Create, edit, and manage interactive demos with iframe or HTML content
- **Lead Management**: Track leads, feedback, and sales pipeline
- **Analytics Dashboard**: Real-time KPIs and performance metrics
- **Multi-language Support**: Spanish and English interface
- **Secure Credential Management**: Encrypted storage for demo credentials
- **Media Management**: Cloudinary integration for images and videos
- **Responsive Design**: Mobile-first, accessible UI

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Styling**: Tailwind CSS + Framer Motion
- **Media Storage**: Cloudinary
- **File Uploads**: UploadThing
- **Automation**: N8N Webhooks

## 📋 Prerequisites

- Node.js 20+ (LTS recommended)
- PostgreSQL 16+
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/demo_hub"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

   # Cloudinary (Media Storage)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # UploadThing (File Uploads)
   UPLOADTHING_TOKEN="your-uploadthing-token"
   UPLOADTHING_SECRET="your-uploadthing-secret"

   # N8N Webhooks (Optional - for automation)
   N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"

   # Encryption Key (for demo credentials)
   ENCRYPTION_KEY="your-32-byte-base64-encoded-key" # Generate with: openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Or push schema directly (development)
   npx drizzle-kit push
   ```

5. **Create an admin user**
   ```bash
   npm run create-user "Admin Name" admin@example.com "secure-password" admin
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run create-user` - Create a new user

## 🏗 Project Structure

```
demo-hub/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── demos/             # Demo pages
│   ├── leads/             # Leads pages
│   └── users/             # User management
├── components/             # React components
│   ├── demos/             # Demo-related components
│   ├── settings/          # Settings components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── auth/              # Authentication config
│   ├── db/                # Database schema and client
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## 🔐 Security Features

- **Credential Encryption**: Demo credentials are encrypted using AES-256-GCM
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Zod schemas for all user inputs
- **XSS Protection**: HTML sanitization with DOMPurify
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Error Sanitization**: Sensitive error details hidden from clients
- **Session Management**: Secure session handling with NextAuth.js

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NEXTAUTH_SECRET` | Secret for JWT signing | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `UPLOADTHING_TOKEN` | UploadThing token | ✅ |
| `UPLOADTHING_SECRET` | UploadThing secret | ✅ |
| `ENCRYPTION_KEY` | 32-byte base64 key for credential encryption | ✅ |
| `N8N_WEBHOOK_URL` | N8N webhook URL for automation | ❌ |

## 🚢 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables** in your hosting platform

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

### Recommended Hosting Platforms

- **Vercel** (Recommended for Next.js)
- **Railway**
- **Render**
- **AWS** (with Docker)

### Database Hosting

- **Neon** (Serverless PostgreSQL)
- **Supabase**
- **Railway**
- **AWS RDS**

## 📝 Database Migrations

The project uses Drizzle ORM for database management. Migrations are stored in the `drizzle/` directory.

To create a new migration:
```bash
npm run db:generate
```

To apply migrations:
```bash
npm run db:migrate
```

## 🧪 Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Logging**: Use the centralized logger (`lib/utils/logger.ts`) instead of `console.log`
- **Error Handling**: Use the API error handler (`lib/utils/api-error-handler.ts`)
- **Validation**: Always validate inputs with Zod schemas
- **Security**: Never expose sensitive data in error messages or logs

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ by RUN**

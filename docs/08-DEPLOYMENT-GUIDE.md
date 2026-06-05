# Apotik-V - Deployment Guide (Vercel + Neon)

**Version:** 1.1  
**Last Updated:** 2026-02-07  
**Status:** MVP  
**Recommended Stack:** Vercel (Hosting) + Neon (PostgreSQL)

---

## 1. Why Vercel + Neon?

| Feature | Vercel | Neon |
|---------|--------|------|
| **Free Tier** | 100GB bandwidth, 1000 build mins | 512MB storage, 24/7 compute |
| **Next.js Support** | Native (created Next.js) | N/A |
| **PostgreSQL** | N/A | Serverless PostgreSQL |
| **Scaling** | Auto-scaling | Auto-suspend/resume |
| **Database Branching** | N/A | Yes (preview environments) |
| **GitHub Integration** | Yes | Yes |
| **Edge Functions** | Yes | N/A |

---

## 2. Prerequisites

- GitHub account
- Vercel account (free tier)
- Neon account (free tier)
- Node.js 20+ (for local development)

---

## 3. Neon Database Setup

### 3.1 Create Neon Account

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create a new project:
   - **Project name:** `apotik-v`
   - **Region:** Choose closest to your users
   - **PostgreSQL version:** 15+

### 3.2 Get Connection String

1. Go to Dashboard > Project > Connection Details
2. Copy the connection string:
   ```
   postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this for later (you'll need it for Vercel)

### 3.3 Database Branching (Optional but Recommended)

Neon supports database branching for preview environments:

1. Go to Branches
2. Create a `main` branch (production)
3. Create a `preview` branch (for Vercel previews)

---

## 4. Vercel Deployment

### 4.1 Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Phase 1"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/apotik-v.git
git push -u origin main
```

### 4.2 Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `apotik-v` repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Click "Deploy"

### 4.3 Configure Environment Variables

In Vercel Dashboard:

1. Go to **Project Settings** > **Environment Variables**
2. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | (run `openssl rand -base64 32`) | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Production |

3. Click "Save"

### 4.4 Deploy with Database

After setting environment variables:

1. Go to **Deployments** tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Select "Redeploy with existing Build Cache"

### 4.5 Run Database Migrations

You need to run Prisma migrations on your Neon database:

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Run migration via Vercel
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

#### Option B: Using Neon Console
1. Go to Neon Dashboard > SQL Editor
2. Run the migration SQL manually

#### Option C: Local Migration (Recommended for first time)
```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run migration
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### 4.6 Verify Deployment

1. Go to your Vercel URL: `https://your-project.vercel.app`
2. Login with:
   - **Doctor:** `doctor@apotikv.com` / `password123`
   - **Staff:** `staff@apotikv.com` / `password123`
3. Test all features

---

## 5. Preview Deployments

Vercel automatically creates preview deployments for pull requests.

### 5.1 Setup Preview Database

1. In Neon, create a `preview` branch
2. In Vercel, add `DATABASE_URL` for Preview environment with the preview branch URL

### 5.2 Workflow

1. Create a new branch in Git
2. Make changes
3. Push to GitHub
4. Vercel creates preview deployment
5. Preview uses separate database
6. Merge to main → Production deployment

---

## 6. Custom Domain (Optional)

1. In Vercel Dashboard > Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
4. Wait for DNS propagation
5. Update `NEXTAUTH_URL` to your custom domain

---

## 7. Monitoring & Analytics

### 7.1 Vercel Analytics
1. Go to Project > Analytics
2. Enable Web Vitals tracking
3. Monitor performance metrics

### 7.2 Neon Dashboard
1. Monitor database performance
2. Check query latency
3. View connection counts

### 7.3 Error Tracking (Optional)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 8. Troubleshooting

### 8.1 Database Connection Issues

**Error:** `Can't reach database server`

1. Check Neon project is active (not suspended)
2. Verify `DATABASE_URL` format
3. Ensure `?sslmode=require` is included

**Error:** `Connection timeout`

1. Neon free tier has connection limits
2. Use connection pooling (PgBouncer)
3. Consider upgrading Neon plan

### 8.2 Build Failures

**Error:** `Prisma generate failed`

1. Run `npx prisma generate` locally
2. Commit generated files
3. Redeploy

### 8.3 Auth Issues

**Error:** `NEXTAUTH_URL mismatch`

1. Verify `NEXTAUTH_URL` matches your Vercel domain
2. Include `https://` protocol
3. No trailing slash

---

## 9. Cost Estimation

### Free Tier Limits

| Service | Free Tier | Overage |
|---------|-----------|---------|
| **Vercel** | 100GB bandwidth, 1000 build mins | $20/month |
| **Neon** | 512MB storage, 24/7 compute | $19/month |

### For MVP (Small scale)
- **Vercel:** Free tier should suffice
- **Neon:** Free tier should suffice
- **Total:** $0/month for MVP

---

## 10. Security Checklist

- [ ] `NEXTAUTH_SECRET` is random and secure
- [ ] `DATABASE_URL` is not committed to Git
- [ ] `.env` is in `.gitignore`
- [ ] Neon connection requires SSL
- [ ] Vercel HTTPS is enabled
- [ ] No sensitive data in logs

---

**End of Document**

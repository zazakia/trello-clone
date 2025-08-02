# Deployment Instructions

## 1. Push to GitHub

First, create a new repository on GitHub (github.com), then run:

```bash
# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/trello-clone.git

# Rename main branch to main (recommended)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 2. Deploy to Netlify

### Option A: Connect GitHub Repository (Recommended)

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your `trello-clone` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 or higher
6. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
7. Click "Deploy site"

### Option B: Manual Deploy

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (first time)
netlify deploy --prod --dir=dist

# For future deployments
netlify deploy --prod --dir=dist
```

## 3. Environment Setup

### Supabase Configuration

1. Go to your Supabase project dashboard
2. In Settings > API, copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
3. Run the database migrations:
   - Go to SQL Editor in Supabase
   - Run the contents of `supabase/schema.sql`
   - Run the contents of `supabase/add_reminders_migration.sql`
   - Optionally run `supabase/seed.sql` for sample data

### Update Environment Variables

In Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## 4. Domain Setup (Optional)

In Netlify dashboard:
1. Go to Domain settings
2. Add custom domain or use the provided netlify.app subdomain
3. Set up HTTPS (automatic with Netlify)

## Features Included

✅ Drag and drop lists and cards
✅ Card reminders with browser notifications  
✅ Real-time updates via Supabase
✅ Responsive design
✅ Purple glassmorphism theme (readability optimized)
✅ TypeScript for type safety

## Troubleshooting

- **Build fails**: Check Node.js version (18+ required)
- **Supabase connection**: Verify environment variables
- **Notifications not working**: Check browser permissions
- **Database errors**: Ensure migrations are run in Supabase
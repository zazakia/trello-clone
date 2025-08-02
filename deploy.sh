#!/bin/bash

echo "🚀 Deploying Trello Clone to Netlify..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Netlify dashboard:"
echo "   - VITE_SUPABASE_URL: Your Supabase project URL"
echo "   - VITE_SUPABASE_ANON_KEY: Your Supabase anon key"
echo ""
echo "2. Set up Supabase database:"
echo "   - Run supabase/schema.sql in your Supabase SQL editor"
echo "   - Run supabase/add_reminders_migration.sql"
echo "   - Optionally run supabase/seed.sql for sample data"
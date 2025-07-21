#!/bin/bash

echo "🚀 Setting up Supabase for your project..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.supabase.example..."
    cp .env.supabase.example .env
    echo "⚠️  Please update .env with your Supabase credentials!"
    echo ""
fi

# Generate migrations
echo "📦 Generating database migrations..."
bun db:generate

echo ""
echo "✅ Setup complete! Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run 'bun db:push' to push schema to Supabase"
echo "3. Or run 'bun db:migrate' to run migrations"
echo ""
echo "📚 See docs/SUPABASE_SETUP.md for detailed instructions"
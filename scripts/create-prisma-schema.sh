#!/bin/bash

# Create Prisma Schema Script
# Recreates missing schema.prisma file
# Usage: ./create-prisma-schema.sh

echo "🔧 Creating Prisma schema..."

# Navigate to project directory
cd /home/oyhumgag/retroboard

# Check current state
echo "📂 Current directory: $(pwd)"
echo "📂 Contents:"
ls -la

# Create prisma directory if not exists
if [ ! -d "prisma" ]; then
    echo "📁 Creating prisma directory..."
    mkdir -p prisma
fi

# Create migrations directory
mkdir -p prisma/migrations

# Create schema.prisma file
echo "📝 Creating schema.prisma..."
cat > prisma/schema.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Board {
  id          String        @id @default(cuid())
  title       String
  description String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  createdBy   String        // Email của user tạo board
  stickers    Sticker[]
  members     BoardMember[]
  presences   BoardPresence[]
}

model Sticker {
  id          String   @id @default(cuid())
  content     String
  stickerType String   // "went-well", "to-improve", "action-items"
  x           Float    @default(0)
  y           Float    @default(0)
  position    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String   // Email của user tạo sticker
  boardId     String
  board       Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  votes       Vote[]
  comments    Comment[]
}

model BoardMember {
  id        String   @id @default(cuid())
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  email     String   // Email của thành viên
  role      String   // "owner", "member"
  joinedAt  DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([boardId, email])
}

model Vote {
  id        String   @id @default(cuid())
  stickerId String
  sticker   Sticker  @relation(fields: [stickerId], references: [id], onDelete: Cascade)
  email     String   // Email của user vote
  createdAt DateTime @default(now())

  @@unique([stickerId, email])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  stickerId String
  sticker   Sticker  @relation(fields: [stickerId], references: [id], onDelete: Cascade)
  email     String   // Email của user comment
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BoardPresence {
  id        String   @id @default(cuid())
  boardId   String
  email     String
  role      String
  online    Boolean  @default(false)
  lastSeen  DateTime
  board     Board    @relation(fields: [boardId], references: [id])

  @@unique([boardId, email])
  @@index([boardId])
  @@index([email])
}
EOF

# Verify schema creation
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Schema file created successfully!"
    echo "📏 File size: $(wc -l < prisma/schema.prisma) lines"
    
    # Show first few lines
    echo "📝 Schema preview:"
    head -20 prisma/schema.prisma
    
    # Try generating client
    echo "🔄 Testing Prisma generate..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client generated successfully!"
    else
        echo "⚠️  Prisma generate failed, but schema is created"
    fi
else
    echo "❌ Failed to create schema file"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Create .env.production with DATABASE_URL"
echo "2. Run: npx prisma migrate deploy"
echo "3. Run: npm run build" 
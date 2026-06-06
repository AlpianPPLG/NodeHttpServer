/**
 * Database seed script
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - be careful in production!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');
    await prisma.postTag.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@velocity.dev',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      bio: 'System administrator',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create regular users
  const userPassword = await bcrypt.hash('user123', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        password: userPassword,
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        bio: 'Software developer passionate about Node.js and TypeScript',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: userPassword,
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        bio: 'Frontend developer and UI/UX enthusiast',
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@example.com',
        name: 'Moderator',
        password: userPassword,
        role: 'MODERATOR',
        status: 'ACTIVE',
        emailVerified: true,
        bio: 'Community moderator',
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} regular users`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { name: 'JavaScript', slug: 'javascript' },
    }),
    prisma.tag.create({
      data: { name: 'TypeScript', slug: 'typescript' },
    }),
    prisma.tag.create({
      data: { name: 'Node.js', slug: 'nodejs' },
    }),
    prisma.tag.create({
      data: { name: 'Express', slug: 'express' },
    }),
    prisma.tag.create({
      data: { name: 'Prisma', slug: 'prisma' },
    }),
    prisma.tag.create({
      data: { name: 'PostgreSQL', slug: 'postgresql' },
    }),
    prisma.tag.create({
      data: { name: 'REST API', slug: 'rest-api' },
    }),
    prisma.tag.create({
      data: { name: 'Docker', slug: 'docker' },
    }),
  ]);
  console.log(`✅ Created ${tags.length} tags`);

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        userId: users[0].id,
        title: 'Getting Started with Node.js and Express',
        slug: 'getting-started-with-nodejs-and-express',
        excerpt: 'Learn the fundamentals of building web applications with Node.js and Express framework.',
        content: `
# Getting Started with Node.js and Express

Node.js has revolutionized server-side JavaScript development. In this comprehensive guide, we'll explore how to build robust web applications using Node.js and Express.

## What is Node.js?

Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows developers to use JavaScript for server-side programming.

## Why Express?

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

## Installation

\`\`\`bash
npm install express
\`\`\`

## Your First Express App

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

Happy coding!
        `,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        viewCount: 125,
        likes: 15,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id,
        title: 'TypeScript Best Practices for 2026',
        slug: 'typescript-best-practices-2026',
        excerpt: 'Essential TypeScript patterns and best practices every developer should know.',
        content: `
# TypeScript Best Practices for 2026

TypeScript continues to be the go-to language for building scalable applications. Here are the best practices you should follow.

## 1. Use Strict Mode

Always enable strict mode in your \`tsconfig.json\`:

\`\`\`json
{
  "compilerOptions": {
    "strict": true
  }
}
\`\`\`

## 2. Avoid 'any' Type

Use 'unknown' instead of 'any' when the type is truly unknown.

## 3. Leverage Type Inference

Let TypeScript infer types when possible to reduce verbosity.

Stay typed, stay safe!
        `,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        viewCount: 98,
        likes: 23,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[0].id,
        title: 'Building REST APIs with Prisma and PostgreSQL',
        slug: 'building-rest-apis-prisma-postgresql',
        excerpt: 'A complete guide to building type-safe REST APIs using Prisma ORM and PostgreSQL.',
        content: `
# Building REST APIs with Prisma and PostgreSQL

Prisma is a next-generation ORM that makes database access easy and type-safe.

## Why Prisma?

- Type-safe database access
- Auto-generated migrations
- Excellent developer experience

## Setup

\`\`\`bash
npm install @prisma/client
npx prisma init
\`\`\`

## Define Your Schema

\`\`\`prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
}
\`\`\`

Happy building!
        `,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        viewCount: 87,
        likes: 19,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id,
        title: 'Docker for Node.js Developers',
        slug: 'docker-for-nodejs-developers',
        excerpt: 'Master containerization for your Node.js applications with Docker.',
        content: `
# Docker for Node.js Developers

Docker makes it easy to ship your applications consistently across environments.

## Why Docker?

- Consistent environments
- Easy deployment
- Isolation
- Scalability

Learn more about Docker today!
        `,
        status: 'DRAFT',
        viewCount: 0,
        likes: 0,
      },
    }),
  ]);
  console.log(`✅ Created ${posts.length} posts`);

  // Create post-tag relationships
  await Promise.all([
    prisma.postTag.create({ data: { postId: posts[0].id, tagId: tags[2].id } }), // Node.js
    prisma.postTag.create({ data: { postId: posts[0].id, tagId: tags[3].id } }), // Express
    prisma.postTag.create({ data: { postId: posts[1].id, tagId: tags[1].id } }), // TypeScript
    prisma.postTag.create({ data: { postId: posts[2].id, tagId: tags[4].id } }), // Prisma
    prisma.postTag.create({ data: { postId: posts[2].id, tagId: tags[5].id } }), // PostgreSQL
    prisma.postTag.create({ data: { postId: posts[2].id, tagId: tags[6].id } }), // REST API
    prisma.postTag.create({ data: { postId: posts[3].id, tagId: tags[7].id } }), // Docker
  ]);
  console.log('✅ Created post-tag relationships');

  // Create comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
        content: 'Great tutorial! Very helpful for beginners.',
        status: 'APPROVED',
        likes: 5,
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: admin.id,
        content: 'Thanks for sharing this comprehensive guide!',
        status: 'APPROVED',
        likes: 3,
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        userId: users[0].id,
        content: 'These TypeScript tips are gold! 🚀',
        status: 'APPROVED',
        likes: 8,
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id,
        userId: users[1].id,
        content: 'Prisma has been a game changer for my projects.',
        status: 'APPROVED',
        likes: 4,
      },
    }),
  ]);
  console.log(`✅ Created ${comments.length} comments`);

  // Update comment counts
  await prisma.post.update({
    where: { id: posts[0].id },
    data: { commentCount: 2 },
  });
  await prisma.post.update({
    where: { id: posts[1].id },
    data: { commentCount: 1 },
  });
  await prisma.post.update({
    where: { id: posts[2].id },
    data: { commentCount: 1 },
  });

  console.log('✅ Updated comment counts');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length + 1} (including admin)`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Tags: ${tags.length}`);
  console.log(`   Comments: ${comments.length}`);
  console.log('\n🔐 Test Credentials:');
  console.log(`   Admin: admin@velocity.dev / admin123`);
  console.log(`   User: john@example.com / user123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@domainfinder.io' },
    update: {},
    create: {
      email: 'admin@domainfinder.io',
      password: adminPassword,
      displayName: 'Admin',
      role: 'admin',
      theme: 'dark',
      accentColor: 'cyan',
    },
  });

  const userPassword = await bcrypt.hash('demo123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@domainfinder.io' },
    update: {},
    create: {
      email: 'demo@domainfinder.io',
      password: userPassword,
      displayName: 'Demo User',
      role: 'user',
      theme: 'dark',
      accentColor: 'emerald',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Bug Bounty Program',
      description: 'Main bug bounty reconnaissance project',
      userId: user.id,
    },
  });

  const targets = ['example.com', 'testsite.org', 'demoapp.io', 'security-test.net', 'vulnerable-app.com'];

  for (const domain of targets) {
    const target = await prisma.target.upsert({
      where: { domain },
      update: {},
      create: {
        domain,
        displayName: domain,
        userId: user.id,
        projectId: project.id,
        tags: domain.includes('test') ? ['testing', 'demo'] : ['production'],
        status: 'active',
      },
    });

    await prisma.dnsRecord.createMany({
      data: [
        { targetId: target.id, type: 'A', name: domain, value: '93.184.216.34' },
        { targetId: target.id, type: 'AAAA', name: domain, value: '2606:2800:220:1:248:1893:25c8:1946' },
        { targetId: target.id, type: 'NS', name: domain, value: 'ns1.example.com' },
        { targetId: target.id, type: 'MX', name: domain, value: 'mail.example.com', priority: 10 },
        { targetId: target.id, type: 'TXT', name: domain, value: 'v=spf1 include:_spf.example.com ~all' },
      ],
      skipDuplicates: true,
    });

    await prisma.techInfo.createMany({
      data: [
        { targetId: target.id, category: 'server', name: 'Nginx', version: '1.24.0' },
        { targetId: target.id, category: 'cdn', name: 'Cloudflare' },
        { targetId: target.id, category: 'js_library', name: 'React', version: '18.2.0' },
        { targetId: target.id, category: 'framework', name: 'Node.js' },
      ],
      skipDuplicates: true,
    });

    await prisma.subdomain.createMany({
      data: [
        { targetId: target.id, name: `www.${domain}`, ipAddress: '93.184.216.34', source: 'discovered', status: 'verified' },
        { targetId: target.id, name: `api.${domain}`, source: 'discovered', status: 'new' },
        { targetId: target.id, name: `mail.${domain}`, source: 'imported', status: 'verified' },
        { targetId: target.id, name: `dev.${domain}`, source: 'discovered', status: 'new' },
        { targetId: target.id, name: `staging.${domain}`, source: 'api', status: 'new' },
      ],
      skipDuplicates: true,
    });

    await prisma.scan.create({
      data: {
        targetId: target.id,
        userId: user.id,
        type: 'full',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(),
      },
    });
  }

  console.log('Seed data created!');
  console.log('Admin: admin@domainfinder.io / admin123!');
  console.log('Demo: demo@domainfinder.io / demo123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

/**
 * Prisma Seed Script
 * Populates the database with initial Admin user, sample categories, and products.
 * Run with: npm run db:seed (from apps/server)
 */

import { PrismaClient, UserRole, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ---- 1. Create Admin User ----
  const adminEmail = process.env['ADMIN_EMAIL'] ?? 'admin@stationery.com';
  const adminPassword = process.env['ADMIN_PASSWORD'] ?? 'Admin@123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Shop Owner',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin user already exists: ${adminEmail}`);
  }

  // ---- 2. Create Categories ----
  const categories = [
    { name: 'Notebooks & Diaries', description: 'All types of notebooks, diaries, and journals' },
    { name: 'Pens & Pencils', description: 'Ball pens, gel pens, pencils, and markers' },
    { name: 'Files & Folders', description: 'Folders, files, binders, and document organisers' },
    { name: 'Paper & Printing', description: 'A4 paper, printing paper, and copy paper' },
    { name: 'Desk Accessories', description: 'Staplers, punch machines, scissors, and tape dispensers' },
    { name: 'Correction Supplies', description: 'White fluid, correction tape, and erasers' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // ---- 3. Create Sample Products ----
  const notebookCategory = await prisma.category.findFirst({ where: { name: 'Notebooks & Diaries' } });
  const penCategory = await prisma.category.findFirst({ where: { name: 'Pens & Pencils' } });
  const paperCategory = await prisma.category.findFirst({ where: { name: 'Paper & Printing' } });

  const products = [
    {
      name: 'Single Line Notebook A4',
      description: '192 pages, single line, A4 size',
      sku: 'NB-A4-SL-001',
      unit: 'PCS',
      stockQuantity: 500,
      status: ProductStatus.ACTIVE,
      categoryId: notebookCategory!.id,
      imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Spiral Notebook A5',
      description: '100 pages, spiral bound, A5 size',
      sku: 'NB-A5-SP-001',
      unit: 'PCS',
      stockQuantity: 300,
      status: ProductStatus.ACTIVE,
      categoryId: notebookCategory!.id,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Ball Pen Blue (Box of 10)',
      description: 'Standard ball pen, smooth writing, blue ink',
      sku: 'PEN-BALL-BLU-10',
      unit: 'BOX',
      stockQuantity: 200,
      status: ProductStatus.ACTIVE,
      categoryId: penCategory!.id,
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Gel Pen Black (Box of 5)',
      description: 'Premium gel pen, 0.5mm tip, black ink',
      sku: 'PEN-GEL-BLK-05',
      unit: 'BOX',
      stockQuantity: 150,
      status: ProductStatus.ACTIVE,
      categoryId: penCategory!.id,
      imageUrl: 'https://images.unsplash.com/photo-1585336261026-7a466aad4079?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'A4 Copier Paper (Ream of 500)',
      description: '75 GSM, A4 size, bright white',
      sku: 'PAP-A4-75-500',
      unit: 'REAM',
      stockQuantity: 1000,
      status: ProductStatus.ACTIVE,
      categoryId: paperCategory!.id,
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        imageUrl: product.imageUrl,
        description: product.description,
      },
      create: product,
    });
  }
  console.log(`✅ ${products.length} sample products seeded`);

  // ---- 4. Create Sample Customers ----
  const sampleCustomers = [
    {
      name: 'Rajesh Sharma',
      email: 'rajesh@abccompany.com',
      password: 'Customer@123',
      companyName: 'ABC Company',
      phone: '9876543210',
      gstNumber: '29ABCDE1234F1Z5',
    },
    {
      name: 'Priya Nair',
      email: 'priya@xyzindustries.com',
      password: 'Customer@123',
      companyName: 'XYZ Industries',
      phone: '9876543211',
      gstNumber: '27XYZAB5678G1Z2',
    },
  ];

  for (const cust of sampleCustomers) {
    const existingUser = await prisma.user.findUnique({ where: { email: cust.email } });
    if (!existingUser) {
      const hashedPw = await bcrypt.hash(cust.password, 12);
      const user = await prisma.user.create({
        data: {
          email: cust.email,
          name: cust.name,
          password: hashedPw,
          role: UserRole.CUSTOMER,
        },
      });

      await prisma.customerProfile.create({
        data: {
          userId: user.id,
          companyName: cust.companyName,
          phone: cust.phone,
          gstNumber: cust.gstNumber,
          addresses: {
            create: [
              {
                type: 'BILLING',
                street: '123, MG Road',
                city: 'Bengaluru',
                state: 'Karnataka',
                pincode: '560001',
                isDefault: true,
              },
              {
                type: 'SHIPPING',
                street: '123, MG Road',
                city: 'Bengaluru',
                state: 'Karnataka',
                pincode: '560001',
                isDefault: true,
              },
            ],
          },
        },
      });

      console.log(`✅ Customer created: ${cust.email} (${cust.companyName})`);
    } else {
      console.log(`⏭️  Customer already exists: ${cust.email}`);
    }
  }

  // ---- 5. Assign Customer-Specific Pricing ----
  const customer1 = await prisma.customerProfile.findFirst({
    where: { user: { email: sampleCustomers[0]!.email } },
  });
  const customer2 = await prisma.customerProfile.findFirst({
    where: { user: { email: sampleCustomers[1]!.email } },
  });

  const allProducts = await prisma.product.findMany();

  const priceSeed = [
    // Customer 1 (ABC Company) prices
    { customerId: customer1!.id, productId: allProducts[0]!.id, price: 30 },
    { customerId: customer1!.id, productId: allProducts[1]!.id, price: 55 },
    { customerId: customer1!.id, productId: allProducts[2]!.id, price: 80 },
    { customerId: customer1!.id, productId: allProducts[3]!.id, price: 120 },
    { customerId: customer1!.id, productId: allProducts[4]!.id, price: 250 },
    // Customer 2 (XYZ Industries) prices — different pricing
    { customerId: customer2!.id, productId: allProducts[0]!.id, price: 35 },
    { customerId: customer2!.id, productId: allProducts[1]!.id, price: 60 },
    { customerId: customer2!.id, productId: allProducts[2]!.id, price: 90 },
    { customerId: customer2!.id, productId: allProducts[3]!.id, price: 130 },
    { customerId: customer2!.id, productId: allProducts[4]!.id, price: 270 },
  ];

  for (const p of priceSeed) {
    await prisma.customerPrice.upsert({
      where: { customerId_productId: { customerId: p.customerId, productId: p.productId } },
      update: { price: p.price },
      create: p,
    });
  }
  console.log(`✅ Customer-specific pricing seeded`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:       admin@stationery.com   / Admin@123');
  console.log('Customer 1:  rajesh@abccompany.com  / Customer@123');
  console.log('Customer 2:  priya@xyzindustries.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

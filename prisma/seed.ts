import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`;

type P = [string, string, number, number | null, number, string[], string[], boolean];

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.coupon.deleteMany();
  await db.user.deleteMany();

  await db.user.create({
    data: {
      name: "Admin",
      email: "admin@store.pk",
      passwordHash: await bcrypt.hash("Admin@12345", 10),
      role: "ADMIN",
    },
  });
  await db.user.create({
    data: {
      name: "Demo Customer",
      email: "customer@store.pk",
      phone: "03001234567",
      passwordHash: await bcrypt.hash("Customer@123", 10),
    },
  });

  const cats = await Promise.all(
    [
      ["Fashion", "fashion"],
      ["Electronics", "electronics"],
      ["Home & Living", "home-living"],
      ["Beauty", "beauty"],
    ].map(([name, slug]) => db.category.create({ data: { name, slug, image: img(slug) } }))
  );
  const c = Object.fromEntries(cats.map((x) => [x.slug, x.id]));

  const products: P[] = [
    ["Classic Cotton Shirt", "fashion", 3200, 2499, 40, ["S", "M", "L", "XL"], ["White", "Blue", "Black"], true],
    ["Slim Fit Denim Jeans", "fashion", 4500, null, 25, ["30", "32", "34", "36"], ["Blue", "Black"], true],
    ["Lawn Printed 3-Piece Suit", "fashion", 6800, 5900, 18, ["S", "M", "L"], ["Green", "Pink"], true],
    ["Casual Sneakers", "fashion", 5400, 4600, 30, ["40", "41", "42", "43", "44"], ["White", "Grey"], false],
    ["Wireless Earbuds", "electronics", 7500, 5999, 50, [], ["Black", "White"], true],
    ["Smart Watch Series X", "electronics", 12500, 9999, 20, [], ["Black", "Silver"], true],
    ["Power Bank 20000mAh", "electronics", 4200, null, 60, [], [], false],
    ["Bluetooth Speaker", "electronics", 5600, 4800, 35, [], ["Black", "Red"], false],
    ["Ceramic Dinner Set (24 pcs)", "home-living", 9800, 8500, 12, [], [], true],
    ["Cotton Bed Sheet Set", "home-living", 3900, null, 28, [], ["Beige", "Grey", "Blue"], false],
    ["LED Table Lamp", "home-living", 2400, 1899, 45, [], ["White"], false],
    ["Scented Candle Pack", "home-living", 1500, null, 70, [], [], false],
    ["Vitamin C Face Serum", "beauty", 2200, 1799, 80, [], [], true],
    ["Matte Lipstick Set", "beauty", 1800, null, 55, [], ["Red", "Nude", "Pink"], false],
    ["Argan Hair Oil", "beauty", 1400, 1199, 90, [], [], false],
    ["Perfume Eau de Parfum 100ml", "beauty", 6500, 5500, 22, [], [], true],
  ];

  for (const [name, cat, price, disc, stock, sizes, colors, featured] of products) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await db.product.create({
      data: {
        name,
        slug,
        description: `${name} - high quality, durable aur stylish. Cash on Delivery available. 7 din mein easy return.`,
        price,
        discountPrice: disc,
        stock,
        image: img(slug),
        images: JSON.stringify([img(slug), img(slug + "-2"), img(slug + "-3")]),
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),
        featured,
        categoryId: c[cat],
      },
    });
  }

  await db.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10, minOrder: 1000 },
      { code: "SAVE500", type: "FIXED", value: 500, minOrder: 5000 },
    ],
  });
  console.log("Seeded.");
}

main().finally(() => db.$disconnect());

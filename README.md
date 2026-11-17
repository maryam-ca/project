# ShopEasy - E-Commerce Store

Next.js 15 (App Router) + TypeScript + Tailwind + Prisma + **PostgreSQL**.

## Local par chalane ka tareeqa

1. PostgreSQL database chahiye. Sab se aasan: [Neon](https://neon.tech) par free database banayein
   (ya local Postgres / Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16`).
2. `.env.example` ko `.env` naam se copy karein aur `DATABASE_URL` aur `JWT_SECRET` bharein.
3. Phir:

```bash
npm install
npm run db:deploy   # migrations apply karta hai (tables banata hai)
npm run db:seed     # demo products, categories, coupons, admin (+ demo customer)
npm run dev         # http://localhost:3000
```

Demo seed ke default logins (sirf development mein):

| Role     | Email             | Password     |
| -------- | ----------------- | ------------ |
| Admin    | admin@store.pk    | Admin@12345  |
| Customer | customer@store.pk | Customer@123 |

Coupons: `WELCOME10` (10%, min Rs. 1,000), `SAVE500` (Rs. 500, min Rs. 5,000)

## Vercel par deploy karna

1. Neon (ya Supabase / Vercel Postgres) mein database banayein, connection string copy karein
   (`postgresql://...?sslmode=require`).
2. Vercel project, **Settings, Environment Variables** mein ye add karein (Production + Preview):

   | Name | Value |
   | ---- | ----- |
   | `DATABASE_URL` | Neon ki connection string |
   | `JWT_SECRET` | lamba random text (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

3. Deploy karein. Vercel khud `npm run vercel-build` chalata hai, jo pehle `prisma migrate deploy`
   (tables bana/update kar deta hai) aur phir `next build` chalata hai.
4. **Sirf pehli dafa** apna admin banayein (apne computer se, Neon ki string ke saath):

   ```bash
   # PowerShell
   $env:DATABASE_URL="postgresql://...neon..."; $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="strong-password"; $env:NODE_ENV="production"; npm run db:seed
   ```

   Production mode mein demo customer nahi banta, aur `ADMIN_PASSWORD` dena lazmi hai.
   Seed pehle se maujood data ko kabhi nahi mitata (jab tak `-- --reset` na do).
   Is se demo products bhi ban jate hain; unhein admin panel se delete / edit karein.

## Database commands

| Command | Kaam |
| ------- | ---- |
| `npm run db:deploy` | maujooda migrations apply karna (production-safe) |
| `npm run db:migrate` | schema badalne ke baad nayi migration banana (development) |
| `npm run db:seed` | demo data + admin (khali database par) |
| `npm run db:reset` | development database sab mita kar dobara banana |
| `npm run db:studio` | database browser UI |

Schema mein enums (Role, OrderStatus, PaymentStatus, PaymentMethod, CouponType), native arrays
(sizes / colors / images), indexes aur `updatedAt` timestamps hain. `PaymentMethod` mein
JAZZCASH / EASYPAISA / CARD pehle se hain taake gateway baad mein asaani se judd sake.

## Features

**Customer:** home, categories, search (case-insensitive) / filter / sort / pagination, product detail (variants, reviews, related), cart, wishlist, guest + registered checkout (COD), coupons, order tracking (order # + phone), cancel / return request, account + order history, reviews (sirf delivered orders par, ek product par ek review).

**Admin (`/admin`):** dashboard (sales, pending orders, low-stock alerts), product CRUD, order status + courier + tracking ID, printable invoice, coupons.

**Security:** bcrypt passwords, JWT httpOnly cookie, zod validation, rate limiting (login / register / order / track), server-side price + stock + coupon verification, atomic stock decrement, role checks (middleware + har admin action), security headers.

**SEO:** metadata per page, Product JSON-LD, sitemap.xml, robots.txt.

**Legal pages:** About, Contact, FAQ, Privacy, Terms, Returns (`app/[page]/page.tsx`).

## Live karne se pehle

1. `JWT_SECRET` lamba random string rakhein, `ADMIN_PASSWORD` mazboot rakhein.
2. `lib/ratelimit.ts` in-memory hai. Vercel (serverless) par har instance ka apna counter hota hai, is liye
   asli protection ke liye Upstash Redis use karein.
3. Product images ab URL se hain; production mein Cloudinary upload add karein.
4. Legal pages aur contact details ko apni asli maloomat se badlein.
5. Database backups (Neon mein point-in-time restore hota hai).

## Abhi shamil NAHI (agle phase)

- Online payment gateway (JazzCash / Easypaisa / Stripe / PayFast): account aur API keys chahiye.
- Courier API integration (TCS / Leopards / Trax): abhi admin khud tracking ID likhta hai.
- Email / SMS notifications (SMTP ya SMS provider chahiye).
- Google / phone-OTP login, forgot-password email.
- Image upload, admin reports export, Analytics / Meta Pixel IDs.

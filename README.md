# ShopEasy - E-Commerce Store

Next.js 15 (App Router) + TypeScript + Tailwind + Prisma. Guide document ke mutabiq banaya gaya.

## Chalane ka tareeqa

```bash
npm install
npm run db:push     # database tables banata hai (SQLite: prisma/dev.db)
npm run db:seed     # demo products, coupons aur users
npm run dev         # http://localhost:3000
```

## Demo accounts

| Role     | Email               | Password       |
| -------- | ------------------- | -------------- |
| Admin    | admin@store.pk      | Admin@12345    |
| Customer | customer@store.pk   | Customer@123   |

Coupons: `WELCOME10` (10%, min Rs. 1,000), `SAVE500` (Rs. 500, min Rs. 5,000)

## Features

**Customer:** home, categories, search / filter / sort / pagination, product detail (variants, reviews, related), cart, wishlist, guest + registered checkout (COD), coupons, order tracking (order # + phone), cancel / return request, account + order history, reviews (sirf delivered orders par).

**Admin (`/admin`):** dashboard (sales, pending orders, low-stock alerts), product CRUD, order status + courier + tracking ID, printable invoice, coupons.

**Security:** bcrypt passwords, JWT httpOnly cookie, zod validation, rate limiting (login / register / order / track), server-side price + stock + coupon verification, atomic stock decrement, role checks (middleware + har admin action), security headers.

**SEO:** metadata per page, Product JSON-LD, sitemap.xml, robots.txt.

**Legal pages:** About, Contact, FAQ, Privacy, Terms, Returns (`app/[page]/page.tsx`).

## Production se pehle zaroor karein

1. `.env` mein `JWT_SECRET` lamba random string se badlein.
2. `NEXT_PUBLIC_SITE_URL` apne domain par set karein.
3. SQLite ki jagah PostgreSQL: `prisma/schema.prisma` mein `provider = "postgresql"`, `DATABASE_URL` badlein, phir `npx prisma db push`.
4. Demo admin password badlein (ya seed ke baghair apna admin banayein).
5. `lib/ratelimit.ts` in-memory hai; multiple servers par Redis / Upstash use karein.
6. Product images ab URL se hain; production mein Cloudinary upload add karein.
7. Legal pages aur contact details ko apni asli maloomat se badlein.
8. HTTPS (Vercel / hosting par automatic) aur database backups.

## Abhi shamil NAHI (agle phase)

- Online payment gateway (JazzCash / Easypaisa / Stripe / PayFast): account aur API keys chahiye.
- Courier API integration (TCS / Leopards / Trax): abhi admin khud tracking ID likhta hai.
- Email / SMS notifications (SMTP ya SMS provider chahiye).
- Google / phone-OTP login, forgot-password email.
- Image upload, admin reports export, Analytics / Meta Pixel IDs.

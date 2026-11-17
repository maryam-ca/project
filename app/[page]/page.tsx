import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Section = { h: string; p: string };
const PAGES: Record<string, { title: string; intro: string; sections: Section[] }> = {
  about: {
    title: "About Us",
    intro: "ShopEasy Pakistan ka bharosemand online store hai jo fashion, electronics, home aur beauty products asaan Cash on Delivery ke saath pohanchata hai.",
    sections: [
      { h: "Hamara Mission", p: "Mayari products, munasib qeemat aur bharosemand service - har customer tak." },
      { h: "Kyun ShopEasy?", p: "Cash on Delivery, 7 din easy return, aur tez delivery poore Pakistan mein." },
    ],
  },
  contact: {
    title: "Contact Us",
    intro: "Hum se rabta karein, hum 24 ghanton mein jawab dete hain.",
    sections: [
      { h: "Email", p: "support@shopeasy.example" },
      { h: "Phone / WhatsApp", p: "0300-0000000 (Subah 10 se raat 8 baje)" },
      { h: "Address", p: "Apna business address yahan likhein." },
    ],
  },
  faq: {
    title: "FAQ",
    intro: "Aksar poochay jane walay sawalat.",
    sections: [
      { h: "Delivery mein kitna waqt lagta hai?", p: "Bray shehron mein 2-4 din, baqi Pakistan mein 4-7 din." },
      { h: "Delivery charges kya hain?", p: "Rs. 250. Rs. 5,000 se upar ke orders par delivery free hai." },
      { h: "Payment kaise karein?", p: "Abhi Cash on Delivery available hai. Online payment jald shamil hogi." },
      { h: "Order cancel kaise karein?", p: "Order ke PENDING hone tak apne order page se cancel kar sakte hain." },
      { h: "Order kaise track karein?", p: "Track Order page par order number aur phone number likhein." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Hum aap ki privacy ki hifazat karte hain.",
    sections: [
      { h: "Hum kya jama karte hain", p: "Naam, email, phone, delivery address aur order ki tafseelat, sirf order poora karne ke liye." },
      { h: "Istemal", p: "Order process karna, delivery, customer support aur order updates." },
      { h: "Sharing", p: "Aap ka data sirf courier companies aur payment partners ke saath share hota hai jitna delivery ke liye zaroori ho. Hum data bechte nahi." },
      { h: "Security", p: "Passwords hashed hote hain aur connection HTTPS se mehfooz hota hai." },
      { h: "Aap ke haqooq", p: "Aap apna data dekhne, theek karwane ya delete karwane ke liye hum se rabta kar sakte hain." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "Is website ko istemal karne ka matlab hai ke aap in sharait se ittefaq karte hain.",
    sections: [
      { h: "Orders", p: "Har order availability aur confirmation se mashroot hai. Hum ghalat qeemat ya stock ki surat mein order cancel kar sakte hain." },
      { h: "Qeematein", p: "Tamam qeematein Pakistani Rupees (PKR) mein hain aur baghair itla tabdeel ho sakti hain." },
      { h: "Account", p: "Apne account aur password ki hifazat aap ki zimmedari hai." },
      { h: "Qanooni dayra", p: "In sharait par Pakistan ke qawaneen laagu hon ge." },
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    intro: "Aap ki tasalli hamari tarjeeh hai.",
    sections: [
      { h: "7 Din Return", p: "Delivery ke 7 din ke andar unused product, asli packing ke saath wapis ki ja sakti hai." },
      { h: "Kab return nahi hoga", p: "Istemal shuda, kharab kiye gaye, ya hygiene products (khola gaya beauty product) return nahi hon ge." },
      { h: "Process", p: "Order page par 'Return / Refund Request' dabayein. Hum 24 ghanton mein rabta karein ge." },
      { h: "Refund", p: "Product wapis milne aur check hone ke baad 5-7 working days mein refund kiya jata hai." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const c = PAGES[page];
  return c ? { title: c.title, description: c.intro } : {};
}

export default async function InfoPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const c = PAGES[page];
  if (!c) notFound();
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">{c.title}</h1>
      <p className="text-gray-700">{c.intro}</p>
      {c.sections.map((s) => (
        <section key={s.h}>
          <h2 className="font-semibold">{s.h}</h2>
          <p className="text-gray-700">{s.p}</p>
        </section>
      ))}
    </article>
  );
}

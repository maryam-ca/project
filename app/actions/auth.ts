"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

export type FormState = { error?: string } | undefined;

const safeNext = (n: FormDataEntryValue | null) => {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name kam az kam 2 characters ka ho").max(60),
  email: z.string().trim().toLowerCase().email("Valid email likhein"),
  phone: z.string().trim().regex(/^(\+92|0)?3\d{9}$/, "Valid Pakistani mobile number likhein (03XXXXXXXXX)").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password kam az kam 8 characters ka ho")
    .regex(/[A-Za-z]/, "Password mein letter hona chahiye")
    .regex(/\d/, "Password mein number hona chahiye"),
});

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await rateLimit("register", 5, 15 * 60_000))) return { error: "Bohat zyada koshishein. Baad mein try karein." };
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, phone, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "Is email se account pehle se maujood hai" };
  const user = await db.user.create({
    data: { name, email, phone: phone || null, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession(user);
  redirect(safeNext(fd.get("next")));
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await rateLimit("login", 8, 15 * 60_000))) return { error: "Bohat zyada koshishein. 15 minute baad try karein." };
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  // Same error for both cases to avoid account enumeration
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !ok) return { error: "Email ya password ghalat hai" };
  await createSession(user);
  redirect(user.role === "ADMIN" && !fd.get("next") ? "/admin" : safeNext(fd.get("next")));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

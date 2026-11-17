import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <CheckoutForm user={user ? { name: user.name, email: user.email, phone: user.phone ?? "" } : null} />
    </div>
  );
}

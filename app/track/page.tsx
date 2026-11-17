import { ActionForm, inputCls } from "@/components/ActionForm";
import { lookupOrderAction } from "@/app/actions/orders";

export const metadata = { title: "Track Order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Order Track Karein</h1>
      <ActionForm action={lookupOrderAction} submitLabel="Track">
        <input name="orderId" type="number" placeholder="Order number" className={inputCls} required />
        <input name="phone" placeholder="Order mein diya gaya mobile number" className={inputCls} required />
      </ActionForm>
    </div>
  );
}

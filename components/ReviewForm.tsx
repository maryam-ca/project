import { addReviewAction } from "@/app/actions/reviews";
import { ActionForm, inputCls } from "./ActionForm";

export function ReviewForm({ productId }: { productId: number }) {
  return (
    <div className="mt-6 max-w-md">
      <h3 className="mb-2 font-semibold">Apna review likhein</h3>
      <ActionForm action={addReviewAction} submitLabel="Submit Review">
        <input type="hidden" name="productId" value={productId} />
        <select name="rating" defaultValue="" className={inputCls} required>
          <option value="" disabled>Rating</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
        </select>
        <textarea name="comment" rows={3} placeholder="Aap ka tajurba..." className={inputCls} required />
      </ActionForm>
    </div>
  );
}

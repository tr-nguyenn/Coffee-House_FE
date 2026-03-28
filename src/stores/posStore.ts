import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosInstance from "@/api/axiosInstance";

// ── Types ──────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  note?: string; // Tùy chọn ghi chú (VD: "Ít đá", "Không đường")
}

export interface OrderPayload {
  tableId: string | null;
  userId: string | null;
  note: string | null;
  paymentMethod: string;
  voucherId: string | null;
  pointsUsed: number;
  items: { productId: string; quantity: number; note: string | null }[];
}

export interface OrderResult {
  message: string;
  orderId: string;
  finalAmount: number;
  pointsEarned: number;
}

// ── Store ──────────────────────────────────────────────────────────────────
export const usePosStore = defineStore("pos", () => {
  // State
  const cart = ref<CartItem[]>([]);
  
  const userId = ref<string | null>(null);
  const tableId = ref<string | null>(null);
  
  // New pos inputs
  const orderNote = ref("");
  const paymentMethod = ref("Cash"); // Cash | Banking | Card
  const pointsUsed = ref(0);
  
  const voucherCode = ref("");
  const appliedVoucherId = ref<string | null>(null);
  const discountAmount = ref(0);
  const isSubmitting = ref(false);

  // Getters
  const itemCount = computed(() =>
    cart.value.reduce((sum, i) => sum + i.quantity, 0)
  );

  const subtotal = computed(() =>
    cart.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  const finalAmount = computed(() =>
    Math.max(0, subtotal.value - discountAmount.value)
  );

  const pointsEarned = computed(() =>
    Math.floor(finalAmount.value / 10000)
  );

  // Build DTO payload matching C# CreateOrderDto
  const buildPayload = (): OrderPayload => ({
    tableId: tableId.value || null,
    userId: userId.value || null,
    note: orderNote.value.trim() || null,
    paymentMethod: paymentMethod.value,
    pointsUsed: pointsUsed.value,
    voucherId: appliedVoucherId.value || null,
    items: cart.value.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      note: i.note && i.note.trim() !== "" ? i.note.trim() : null
    })),
  });

  // Actions
  function addItem(product: Omit<CartItem, "quantity" | "note">) {
    const existing = cart.value.find((i) => i.productId === product.productId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.value.push({ ...product, quantity: 1, note: "" });
    }
  }

  function updateItemNote(productId: string, note: string) {
    const item = cart.value.find((i) => i.productId === productId);
    if (item) item.note = note;
  }

  function increaseQty(productId: string) {
    const item = cart.value.find((i) => i.productId === productId);
    if (item) item.quantity++;
  }

  function decreaseQty(productId: string) {
    const idx = cart.value.findIndex((i) => i.productId === productId);
    if (idx === -1) return;
    const item = cart.value[idx];
    if (!item) return;
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      cart.value.splice(idx, 1);
    }
  }

  function removeItem(productId: string) {
    cart.value = cart.value.filter((i) => i.productId !== productId);
  }

  function clearCart() {
    cart.value = [];
    userId.value = null;
    tableId.value = null;
    orderNote.value = "";
    paymentMethod.value = "Cash";
    pointsUsed.value = 0;
    voucherCode.value = "";
    appliedVoucherId.value = null;
    discountAmount.value = 0;
  }

  function applyVoucher(id: string, discount: number) {
    appliedVoucherId.value = id;
    discountAmount.value = discount;
  }

  async function submitOrder(): Promise<OrderResult> {
    isSubmitting.value = true;
    try {
      const payload = buildPayload();
      const response = await axiosInstance.post<OrderResult>("/orders", payload);
      return response.data;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    cart,
    userId,
    tableId,
    orderNote,
    paymentMethod,
    pointsUsed,
    voucherCode,
    appliedVoucherId,
    discountAmount,
    isSubmitting,
    itemCount,
    subtotal,
    finalAmount,
    pointsEarned,
    addItem,
    updateItemNote,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    applyVoucher,
    submitOrder,
  };
});

/**
 * Shipping display constants — single source for every banner, progress bar
 * and checkout estimate on the storefront.
 *
 * The API is the true authority (it re-prices every order from Setting
 * `shipping.flatFee` / `shipping.freeAbove`). If you change those in
 * Admin → Settings, update these envs too so the storefront copy matches:
 *   NEXT_PUBLIC_SHIPPING_FEE / NEXT_PUBLIC_FREE_SHIPPING_ABOVE
 */
export const FREE_SHIPPING_ABOVE = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_ABOVE ?? 3000);
export const FLAT_SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE ?? 200);

export const shippingFor = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_ABOVE ? 0 : FLAT_SHIPPING_FEE;

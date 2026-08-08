export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode?: string | null;
  notes?: string | null;
  items: Array<{ productName: string; variantName?: string | null; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: Date;
}

const fmt = (n: number) => `Rs. ${n.toLocaleString('en-PK')}`;

const baseStyles = `margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#2d2a26;`;

function itemsTable(data: OrderEmailData): string {
  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee5d8;">
          <span style="font-weight:bold;">${i.productName}</span>
          ${i.variantName ? `<span style="color:#8a8378;font-size:13px;"> · ${i.variantName}</span>` : ''}
          <br/><span style="color:#8a8378;font-size:13px;">${fmt(i.unitPrice)} × ${i.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee5d8;text-align:right;font-weight:bold;">${fmt(i.lineTotal)}</td>
      </tr>`,
    )
    .join('');
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    ${rows}
    <tr><td style="padding:12px 0 4px;color:#8a8378;">Subtotal</td><td style="padding:12px 0 4px;text-align:right;">${fmt(data.subtotal)}</td></tr>
    <tr><td style="padding:4px 0;color:#8a8378;">Delivery</td><td style="padding:4px 0;text-align:right;">${data.shippingFee === 0 ? 'FREE' : fmt(data.shippingFee)}</td></tr>
    <tr><td style="padding:12px 0;font-size:18px;font-weight:bold;border-top:2px solid #3d5a3d;">Total</td><td style="padding:12px 0;text-align:right;font-size:18px;font-weight:bold;border-top:2px solid #3d5a3d;color:#3d5a3d;">${fmt(data.total)}</td></tr>
  </table>`;
}

export function orderCustomerEmail(data: OrderEmailData): string {
  return `<!doctype html><html><body style="${baseStyles}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:32px 16px;"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#3d5a3d;padding:32px;text-align:center;">
      <div style="color:#f7f3ea;font-size:24px;letter-spacing:4px;">BEYOUTIFUL</div>
      <div style="color:#c9d3c0;font-size:12px;letter-spacing:2px;margin-top:4px;">O R G A N I C S</div>
    </td></tr>
    <tr><td style="padding:40px 40px 16px;">
      <h1 style="font-size:22px;margin:0 0 8px;">Thank you, ${data.customerName.split(' ')[0]} 🌿</h1>
      <p style="color:#6b6459;line-height:1.6;margin:0;">Your order has been received and is being lovingly prepared. We'll confirm it on WhatsApp shortly.</p>
      <p style="margin:24px 0 0;padding:12px 16px;background:#f4efe6;border-radius:8px;font-size:14px;">
        Order number: <strong style="color:#3d5a3d;">${data.orderNumber}</strong><br/>
        Placed: ${data.createdAt.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })} · Payment: Cash on Delivery
      </p>
      ${itemsTable(data)}
      <h3 style="font-size:14px;letter-spacing:1px;color:#8a8378;margin:24px 0 8px;">DELIVERING TO</h3>
      <p style="margin:0;line-height:1.6;">${data.customerName}<br/>${data.address}<br/>${data.city}${data.postalCode ? ' ' + data.postalCode : ''}<br/>${data.customerPhone}</p>
      <p style="color:#6b6459;font-size:13px;line-height:1.6;margin:32px 0 0;">Questions? Just reply to this email or WhatsApp us at 0300-0527443 — we're real people and we answer quickly.</p>
    </td></tr>
    <tr><td style="background:#f4efe6;padding:24px 40px;text-align:center;color:#8a8378;font-size:12px;">
      Because no matter where you are in your beauty journey — you look BeYoutiful.<br/>© BeYoutiful Organics · Karachi, Pakistan
    </td></tr>
  </table></td></tr></table></body></html>`;
}

export function orderBusinessEmail(data: OrderEmailData): string {
  return `<!doctype html><html><body style="${baseStyles}">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;margin:24px auto;padding:8px;">
    <tr><td style="padding:24px 32px;">
      <h1 style="font-size:20px;margin:0;">🛍 New order <span style="color:#3d5a3d;">${data.orderNumber}</span></h1>
      <p style="margin:16px 0 0;line-height:1.7;">
        <strong>${data.customerName}</strong><br/>
        📞 ${data.customerPhone}<br/>
        ✉️ ${data.customerEmail}<br/>
        📍 ${data.address}, ${data.city}${data.postalCode ? ' ' + data.postalCode : ''}
        ${data.notes ? `<br/>📝 ${data.notes}` : ''}
      </p>
      ${itemsTable(data)}
      <p style="font-size:13px;color:#8a8378;">Payment: Cash on Delivery. Customer was redirected to WhatsApp for confirmation.</p>
    </td></tr>
  </table></body></html>`;
}

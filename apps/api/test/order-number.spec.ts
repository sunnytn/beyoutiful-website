/**
 * Order-domain invariants that don't need a database:
 * pricing math and WhatsApp message construction contract.
 */
describe('order pricing invariants', () => {
  const shippingFor = (subtotal: number, flat = 200, freeAbove = 3000) =>
    subtotal >= freeAbove ? 0 : flat;

  it('applies flat fee under threshold', () => {
    expect(shippingFor(2999)).toBe(200);
  });

  it('free shipping at/above threshold', () => {
    expect(shippingFor(3000)).toBe(0);
    expect(shippingFor(10000)).toBe(0);
  });

  it('line totals sum to subtotal', () => {
    const items = [
      { unitPrice: 550, quantity: 2 },
      { unitPrice: 199, quantity: 1 },
    ];
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    expect(subtotal).toBe(1299);
  });
});

describe('whatsapp url contract', () => {
  it('encodes multi-line order text into wa.me url', () => {
    const number = '923000527443';
    const text = ['*Order #:* BYO-260706-0001', 'Item 1 × 2 — Rs. 1,100'].join('\n');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    expect(url).toContain('wa.me/923000527443');
    expect(decodeURIComponent(url.split('text=')[1])).toContain('BYO-260706-0001');
  });
});

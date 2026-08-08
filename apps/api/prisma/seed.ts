/**
 * Seed — BeYoutiful Organics
 * Source of truth: data/crawl/site-content.json (real names, prices, images, story)
 * Product copy is original (legacy site copy was lorem ipsum).
 */
import { PrismaClient, AdvisorGoal } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const IMG = 'https://beyoutifulorganics.com/wp-content/uploads';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  console.log('Seeding…');

  // ── Admin user ──
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? 'BeYoutiful@2026';
  await prisma.user.upsert({
    where: { email: 'beyoutiful.organics@gmail.com' },
    update: {},
    create: {
      email: 'beyoutiful.organics@gmail.com',
      passwordHash: await bcrypt.hash(adminPass, 12),
      fullName: 'BeYoutiful Admin',
      role: 'ADMIN',
    },
  });

  // ── Categories ──
  const cats = [
    {
      name: 'Hair Care', slug: 'hair-care', sortOrder: 1,
      description: 'Cold-pressed oils and herbal cleansers that restore strength, shine and scalp health — the way nature intended.',
      imageUrl: 'http://localhost:4000/uploads/category-hair-care.png',
    },
    {
      name: 'Skin Care', slug: 'skin-care', sortOrder: 2,
      description: 'Pure botanical moisturizers, soaps and toners for naturally radiant skin, free from harsh chemicals.',
      imageUrl: 'http://localhost:4000/uploads/category-skin-care.png',
    },
    {
      name: 'Organic Pantry', slug: 'organic-pantry', sortOrder: 3,
      description: 'Wholesome organics for wellness from within — desi ghee, panjeeri, seeds and herbs sourced from local artisans.',
      imageUrl: 'http://localhost:4000/uploads/category-organic-pantry.png',
    },
  ];
  const catBySlug: Record<string, string> = {};
  for (const c of cats) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
    catBySlug[c.slug] = row.id;
  }

  // ── Collections ──
  const collections = [
    { name: 'Best Sellers', slug: 'best-sellers', sortOrder: 1, description: 'Customer favourites, loved across Pakistan.', imageUrl: 'http://localhost:4000/uploads/collection-best-sellers.png' },
    { name: 'New Arrivals', slug: 'new-arrivals', sortOrder: 2, description: 'Fresh from our small-batch kitchen.', imageUrl: 'http://localhost:4000/uploads/collection-new-arrivals.png' },
    { name: 'Hair Growth Ritual', slug: 'hair-growth-ritual', sortOrder: 3, description: 'Oils and herbs that team up for stronger, longer hair.', imageUrl: 'http://localhost:4000/uploads/collection-hair-growth-ritual.png' },
    { name: 'Glow Essentials', slug: 'glow-essentials', sortOrder: 4, description: 'Everything your skin needs for a natural glow.', imageUrl: 'http://localhost:4000/uploads/collection-glow-essentials.png' },
    { name: 'Gift Sets & Bundles', slug: 'gift-sets', sortOrder: 5, description: 'Thoughtful organic gifts, beautifully bundled.', imageUrl: 'http://localhost:4000/uploads/collection-gift-sets.png' },
  ];
  const colBySlug: Record<string, string> = {};
  for (const c of collections) {
    const row = await prisma.collection.upsert({ where: { slug: c.slug }, update: c, create: c });
    colBySlug[c.slug] = row.id;
  }

  // ── Ingredients library ──
  const ingredients = [
    { name: 'Shea Butter', description: 'A rich plant butter from the shea tree, deeply moisturizing and packed with vitamins A and E. It soothes dryness and supports the skin barrier.', benefits: ['Deep moisture', 'Barrier repair', 'Soothes irritation'], imageUrl: `${IMG}/2023/12/WhatsApp-Image-2023-12-26-at-18.24.21_80f2156c-1-430x300.jpg` },
    { name: 'Aloe Vera', description: 'A time-tested succulent whose gel hydrates, calms and cools. Ideal for sensitive or sun-exposed skin and an itchy scalp.', benefits: ['Hydration', 'Calms redness', 'Scalp relief'], imageUrl: `${IMG}/2023/12/WhatsApp-Image-2023-12-25-at-22.11.24_1ed5ddcb-430x300.jpg` },
    { name: 'Sweet Almond', description: 'Light, vitamin-E-rich oil that softens skin and adds silky shine to hair without weighing it down.', benefits: ['Softens skin', 'Adds shine', 'Rich in vitamin E'] },
    { name: 'Coconut', description: 'A classic deep conditioner. Its fatty acids penetrate the hair shaft to reduce protein loss and breakage.', benefits: ['Reduces breakage', 'Deep conditioning', 'Antimicrobial'] },
    { name: 'Rosemary', description: 'A fragrant herb shown to support circulation at the scalp, encouraging thicker, healthier-looking hair.', benefits: ['Supports growth', 'Scalp circulation', 'Reduces dandruff'] },
    { name: 'Castor', description: 'Thick, ricinoleic-acid-rich oil traditionally used for hair growth, brows and lashes.', benefits: ['Hair growth', 'Thickens brows', 'Locks moisture'] },
    { name: 'Mustard Seed', description: 'Warming desi oil used for generations in champi (head massage) to strengthen roots.', benefits: ['Strengthens roots', 'Warming massage', 'Natural conditioning'] },
    { name: 'Neem', description: 'Nature\'s purifier — antibacterial and anti-inflammatory, brilliant for acne-prone and troubled skin.', benefits: ['Fights acne', 'Purifies', 'Anti-inflammatory'] },
    { name: 'Rose', description: 'Steam-distilled rose water tones, refreshes and balances the skin\'s pH gently.', benefits: ['Tones', 'Balances pH', 'Refreshes'] },
    { name: 'Sandalwood', description: 'Prized in South Asian beauty rituals for brightening and evening skin tone.', benefits: ['Brightens', 'Evens tone', 'Cooling'] },
    { name: 'Kalonji (Black Seed)', description: 'The blessed seed — antioxidant-rich, supporting clear skin and a healthy scalp.', benefits: ['Antioxidant', 'Clears skin', 'Scalp health'] },
    { name: 'Amla', description: 'Indian gooseberry, a vitamin-C powerhouse that darkens, thickens and conditions hair naturally.', benefits: ['Thickens hair', 'Vitamin C', 'Natural conditioning'] },
    { name: 'Reetha', description: 'Soapnut — a gentle natural cleanser that lathers without stripping.', benefits: ['Gentle cleansing', 'Natural lather', 'Shine'] },
    { name: 'Sikakai', description: 'The "fruit for hair" — cleanses and detangles while keeping natural oils intact.', benefits: ['Detangles', 'Low-strip cleanse', 'Soft hair'] },
    { name: 'Jojoba', description: 'A liquid wax closest to skin\'s own sebum — balances oil production on face and scalp.', benefits: ['Balances sebum', 'Non-comedogenic', 'Lightweight'] },
    { name: 'Lemon', description: 'Bright citrus oil that clarifies oily skin and refreshes dull complexions.', benefits: ['Clarifies', 'Brightens', 'Refreshes'] },
    { name: 'Orange', description: 'Uplifting citrus oil rich in limonene, adds shine to hair and glow to skin.', benefits: ['Adds glow', 'Uplifting aroma', 'Shine'] },
    { name: 'Rice', description: 'Rice extracts brighten and smooth — the secret behind centuries of East Asian beauty.', benefits: ['Brightens', 'Smooths texture', 'Gentle'] },
    { name: 'Egg Yolk', description: 'Protein and biotin-rich nourishment that repairs brittle, damaged hair.', benefits: ['Protein repair', 'Biotin', 'Strengthens'] },
    { name: 'Chia Seed', description: 'Omega-3 rich seeds for wellness from within — great for skin, hair and digestion.', benefits: ['Omega-3', 'Fibre', 'Inner glow'] },
  ];
  const ingBySlug: Record<string, string> = {};
  for (const [i, ing] of ingredients.entries()) {
    const slug = slugify(ing.name);
    const row = await prisma.ingredient.upsert({
      where: { slug },
      update: { ...ing, slug },
      create: { ...ing, slug },
    });
    ingBySlug[slug] = row.id;
    void i;
  }

  // ── Products (real names/prices/images from crawl; original copy) ──
  type P = {
    name: string; price: number; compareAtPrice?: number; cats: string[]; cols?: string[];
    img?: string[]; short: string; desc: string; benefits: string[]; directions: string;
    concerns: string[]; ings: string[]; tags?: string[]; featured?: boolean; best?: boolean; newArrival?: boolean;
    variants?: Array<{ name: string; price: number }>;
    faqs?: Array<{ q: string; a: string }>;
  };
  const products: P[] = [
    {
      name: 'Almond Oil', price: 599, cats: ['hair-care', 'skin-care'], cols: ['best-sellers', 'glow-essentials'],
      img: ['http://localhost:4000/uploads/almond-oil.png'],
      short: 'Cold-pressed sweet almond oil for silky hair and soft, glowing skin.',
      desc: 'Our cold-pressed Almond Oil is a single-ingredient multitasker. Rich in vitamin E and essential fatty acids, it absorbs quickly to soften skin, brighten under-eyes and add a healthy, glassy shine to hair. Pressed in small batches from premium almonds — nothing added, nothing taken away.',
      benefits: ['Softens and smooths skin', 'Adds silky shine to hair', 'Lightens the look of dark circles', 'Fast-absorbing, non-greasy'],
      directions: 'Hair: massage a few drops into scalp and lengths, leave 1–2 hours or overnight, then wash. Skin: pat 2–3 drops onto damp skin morning and night.',
      concerns: ['dryness', 'dullness', 'frizz', 'dark-circles'], ings: ['sweet-almond'], featured: true, best: true,
      faqs: [
        { q: 'Is it pure almond oil?', a: 'Yes — 100% cold-pressed sweet almond oil with no carriers, fragrance or preservatives.' },
        { q: 'Can I use it under my eyes?', a: 'Absolutely. Pat one drop gently with your ring finger before sleep.' },
      ],
    },
    {
      name: 'Aloe Vera Gel', price: 399, cats: ['skin-care'], cols: ['glow-essentials'],
      img: ['http://localhost:4000/uploads/aloe-vera-gel.png'],
      short: 'Fresh, pure aloe gel that hydrates, soothes and cools on contact.',
      desc: 'Scooped from real aloe leaves — not reconstituted powder — our Aloe Vera Gel delivers instant, weightless hydration. It calms redness, cools sun-stressed skin and doubles as a soothing scalp mask for itchiness and flakes.',
      benefits: ['Instant lightweight hydration', 'Calms redness and irritation', 'Soothes sun-exposed skin', 'Relieves itchy scalp'],
      directions: 'Apply a thin layer to clean skin as a moisturizer or mask. For scalp: massage in, leave 30 minutes, rinse.',
      concerns: ['sensitivity', 'redness', 'dryness', 'itchy-scalp', 'sun-damage'], ings: ['aloe-vera'], best: true,
    },
    {
      name: 'Amla Reetha Sikakai', price: 429, cats: ['hair-care', 'organic-pantry'], cols: ['hair-growth-ritual'],
      img: ['http://localhost:4000/uploads/amla-reetha-sikakai.png'],
      short: 'The classic desi trio — a complete natural hair cleansing and strengthening ritual.',
      desc: 'Amla thickens, Reetha cleanses, Sikakai softens. This time-honoured trio has cared for South Asian hair for centuries. Use as a powder mask or brew into a gentle herbal shampoo that cleans without stripping.',
      benefits: ['Strengthens from root to tip', 'Gentle chemical-free cleansing', 'Adds volume and natural darkness', 'Reduces hair fall'],
      directions: 'Mix 2–3 tablespoons with warm water into a paste. Apply to wet hair and scalp, massage, leave 15–20 minutes, rinse thoroughly.',
      concerns: ['hair-fall', 'thinning', 'oily-scalp', 'dandruff'], ings: ['amla', 'reetha', 'sikakai'],
      variants: [{ name: '200g', price: 429 }, { name: '400g', price: 799 }],
    },
    {
      name: 'Castor Oil', price: 350, cats: ['hair-care', 'skin-care'], cols: ['hair-growth-ritual'],
      img: ['http://localhost:4000/uploads/castor-oil.png'],
      short: 'Thick, cold-pressed castor oil for hair growth, brows and lashes.',
      desc: 'The most trusted growth oil in the book. Our cold-pressed Castor Oil is rich in ricinoleic acid, coating each strand to lock in moisture while nourishing the follicle. A little goes a very long way.',
      benefits: ['Supports hair growth', 'Thickens brows and lashes', 'Seals in moisture', 'Strengthens brittle strands'],
      directions: 'Warm slightly, mix 1:1 with a lighter oil (almond or coconut), massage into scalp. Leave 2+ hours, wash out. Brows/lashes: apply with a clean spoolie at night.',
      concerns: ['hair-fall', 'thinning', 'sparse-brows'], ings: ['castor'],
    },
    {
      name: 'Chia Seeds', price: 560, cats: ['organic-pantry'],
      img: ['http://localhost:4000/uploads/chia-seeds.png'],
      short: 'Omega-rich chia seeds for glow that starts from within.',
      desc: 'Beauty is an inside job too. Our premium chia seeds are loaded with omega-3s, fibre and protein — supporting clearer skin, stronger hair and steady energy. Sprinkle over yogurt, blend into smoothies or soak overnight.',
      benefits: ['Omega-3 for skin and hair', 'High fibre and protein', 'Supports hydration', 'Versatile superfood'],
      directions: 'Soak 1 tablespoon in water, milk or yogurt for 15+ minutes. Enjoy daily.',
      concerns: ['dullness'], ings: ['chia-seed'],
    },
    {
      name: 'Coconut Oil', price: 399, cats: ['hair-care'], cols: ['best-sellers', 'hair-growth-ritual'],
      img: ['http://localhost:4000/uploads/coconut-oil.png'],
      short: 'Pure cold-pressed coconut oil — the classic deep conditioner.',
      desc: 'Some classics can\'t be improved. Cold-pressed from fresh coconuts, this oil penetrates the hair shaft to reduce protein loss, tame frizz and leave hair glossy and resilient. Equally lovely as a whole-body moisturizer.',
      benefits: ['Deeply conditions hair', 'Reduces protein loss and breakage', 'Tames frizz', 'Multi-purpose head-to-toe'],
      directions: 'Apply to dry hair before washing (30 min – overnight), focusing on lengths and ends. Rinse and shampoo as usual.',
      concerns: ['dryness', 'frizz', 'breakage'], ings: ['coconut'], best: true,
    },
    {
      name: 'Egg Yolk Oil', price: 199, cats: ['hair-care'],
      img: ['http://localhost:4000/uploads/egg-yolk-oil.png'],
      short: 'Protein-rich egg yolk oil that repairs brittle, damaged hair.',
      desc: 'A traditional remedy made modern. Slow-rendered from egg yolks, this oil is dense with biotin, protein and lecithin — the building blocks weak hair is missing. Ideal for chemically treated, heat-damaged or brittle hair.',
      benefits: ['Repairs damage', 'Rich in biotin and protein', 'Restores elasticity', 'Reduces split ends'],
      directions: 'Massage into scalp and damaged lengths twice a week. Leave 1 hour, then shampoo.',
      concerns: ['breakage', 'damage', 'thinning'], ings: ['egg-yolk'],
    },
    {
      name: 'Herbal Shampoo', price: 99, cats: ['hair-care'], cols: ['new-arrivals'],
      img: ['http://localhost:4000/uploads/herbal-shampoo.png'],
      short: 'A gentle herbal cleanse with reetha and sikakai — no sulphates, no stripping.',
      desc: 'Our small-batch Herbal Shampoo blends reetha, sikakai and amla into a low-lather cleanse that respects your scalp\'s natural balance. Hair feels clean, soft and full — never squeaky or stripped.',
      benefits: ['Sulphate-free cleansing', 'Balances oily scalp', 'Softens without silicones', 'Safe for daily use'],
      directions: 'Massage into wet scalp, leave one minute, rinse. Repeat if needed.',
      concerns: ['oily-scalp', 'dandruff', 'itchy-scalp'], ings: ['reetha', 'sikakai', 'amla'], newArrival: true,
      variants: [{ name: '100ml (Trial)', price: 99 }, { name: '250ml', price: 249 }],
    },
    {
      name: 'Kalonji Glycerine Soap', price: 280, cats: ['skin-care'],
      img: ['http://localhost:4000/uploads/kalonji-soap.png'],
      short: 'Handmade black seed soap for troubled, breakout-prone skin.',
      desc: 'Kalonji — the blessed seed — meets skin-loving glycerine in this handmade bar. It cleanses without tightness, helps calm breakouts and leaves skin balanced and comfortable.',
      benefits: ['Calms breakouts', 'Cleanses without drying', 'Antioxidant-rich', 'Handmade in small batches'],
      directions: 'Lather onto damp skin morning and evening. Rinse well. Store dry between uses.',
      concerns: ['acne', 'oiliness'], ings: ['kalonji-black-seed'],
    },
    {
      name: 'Khalis Desi Ghee', price: 2300, cats: ['organic-pantry'], cols: ['gift-sets'],
      img: ['http://localhost:4000/uploads/desi-ghee.png'],
      short: 'Pure, traditionally churned desi ghee from grass-fed cows.',
      desc: 'Khalis means pure — and we mean it. Slow-churned the traditional way from grass-fed cow\'s milk, our desi ghee is golden, grainy and fragrant. A spoonful of heritage for your table and wellness rituals.',
      benefits: ['100% pure and traditional', 'Grass-fed source', 'Rich, grainy texture', 'No adulteration ever'],
      directions: 'Use in cooking, on warm rotis, or a teaspoon in warm milk. Store at room temperature.',
      concerns: [], ings: [],
    },
    {
      name: 'Lemon Essential Oil', price: 450, cats: ['skin-care'],
      img: ['http://localhost:4000/uploads/lemon-oil.png'],
      short: 'Bright, clarifying lemon oil for oily and congested skin.',
      desc: 'Sunshine in a bottle. Our steam-distilled Lemon Essential Oil clarifies oily skin, brightens dull patches and lifts the mood with its crisp citrus aroma. Always dilute before applying.',
      benefits: ['Clarifies oily skin', 'Brightens dull complexion', 'Uplifting aroma', 'Natural astringent'],
      directions: 'Dilute 2–3 drops in a tablespoon of carrier oil before applying. Avoid sun exposure for 12 hours after use. Patch test first.',
      concerns: ['oiliness', 'dullness', 'acne'], ings: ['lemon'],
    },
    {
      name: 'Miracle Moisturizer', price: 199, cats: ['skin-care'], cols: ['best-sellers', 'glow-essentials'],
      img: ['http://localhost:4000/uploads/miracle-moisturizer.png'],
      short: 'Our beloved shea-aloe whip — deep moisture that feels like nothing at all.',
      desc: 'The product that started it all. Whipped shea butter and fresh aloe melt into skin, delivering all-day moisture without a trace of grease. One jar and you\'ll understand the name.',
      benefits: ['24-hour deep moisture', 'Whipped, fast-absorbing texture', 'Soothes dry patches', 'Suits face and body'],
      directions: 'Massage a small amount onto clean skin morning and night. Layers beautifully under sunscreen and makeup.',
      concerns: ['dryness', 'sensitivity', 'dullness'], ings: ['shea-butter', 'aloe-vera'], featured: true, best: true,
      variants: [{ name: '50g', price: 199 }, { name: '120g', price: 399 }],
      faqs: [
        { q: 'Is it suitable for oily skin?', a: 'Yes — use a pea-sized amount. The aloe base keeps it light and non-comedogenic.' },
      ],
    },
    {
      name: 'Mustard Oil', price: 450, cats: ['hair-care', 'skin-care'],
      img: ['http://localhost:4000/uploads/mustard-oil.png'],
      short: 'Kachi ghani mustard oil for the champi your roots have been craving.',
      desc: 'Nothing says home like a warm mustard oil champi. Cold-pressed (kachi ghani) from premium mustard seeds, this warming oil boosts circulation at the scalp, strengthens roots and leaves hair deeply nourished.',
      benefits: ['Strengthens roots', 'Warming scalp massage', 'Deep traditional nourishment', 'Cold-pressed purity'],
      directions: 'Warm gently, massage into scalp in circular motions for 10 minutes. Leave 1–2 hours, then wash.',
      concerns: ['hair-fall', 'thinning', 'dryness'], ings: ['mustard-seed'],
    },
    {
      name: 'Neem Soap', price: 250, cats: ['skin-care'],
      img: ['http://localhost:4000/uploads/neem-soap.png'],
      short: 'Purifying handmade neem bar for acne-prone and troubled skin.',
      desc: 'Neem is nature\'s answer to troubled skin. This handmade bar pairs neem\'s purifying, antibacterial power with a gentle, moisturizing base — clearing without the harshness of medicated washes.',
      benefits: ['Fights acne-causing bacteria', 'Calms inflammation', 'Gentle daily purification', 'Handmade, cruelty-free'],
      directions: 'Use morning and evening on damp skin. Follow with Aloe Vera Gel or Miracle Moisturizer.',
      concerns: ['acne', 'oiliness', 'redness'], ings: ['neem'],
    },
    {
      name: 'Orange Oil', price: 399, cats: ['hair-care'], cols: ['best-sellers'],
      img: ['http://localhost:4000/uploads/orange-oil.png'],
      short: 'Zesty orange-infused oil for shine, softness and a happy scalp.',
      desc: 'Cold-pressed orange goodness that wakes up dull, tired hair. Limonene-rich and gorgeously fragrant, it smooths the cuticle for mirror shine while keeping the scalp fresh.',
      benefits: ['High-gloss shine', 'Fresh, uplifting scent', 'Smooths rough cuticles', 'Lightweight feel'],
      directions: 'Apply a few drops to damp or dry hair as a finishing oil, or massage into scalp before washing.',
      concerns: ['dullness', 'frizz'], ings: ['orange'], best: true,
    },
    {
      name: 'Panjeeri', price: 1700, cats: ['organic-pantry'], cols: ['gift-sets'],
      img: ['http://localhost:4000/uploads/panjeeri.png'],
      short: 'Traditional panjeeri made with desi ghee, nuts and wholesome herbs.',
      desc: 'Grandmother-approved nourishment. Our panjeeri is slow-roasted in khalis desi ghee with premium nuts, seeds and traditional herbs — an energy-dense classic for new mothers, winter mornings and anyone who needs real strength.',
      benefits: ['Traditional recipe', 'Slow-roasted in desi ghee', 'Energy and strength', 'Premium nuts and herbs'],
      directions: 'Enjoy 1–2 tablespoons daily, on its own or with warm milk.',
      concerns: [], ings: [],
    },
    {
      name: 'Rice Soap', price: 280, cats: ['skin-care'],
      img: ['http://localhost:4000/uploads/rice-soap.png'],
      short: 'Brightening handmade rice soap for smooth, even-toned skin.',
      desc: 'Inspired by centuries of East Asian beauty wisdom, our Rice Soap gently polishes and brightens. Rice extracts smooth texture and even tone while a creamy lather keeps skin comfortable.',
      benefits: ['Brightens dull skin', 'Smooths uneven texture', 'Gentle daily exfoliation', 'Creamy handmade lather'],
      directions: 'Massage onto damp face and body daily. Rinse thoroughly.',
      concerns: ['dullness', 'uneven-tone'], ings: ['rice'],
    },
    {
      name: 'Rose Water', price: 199, cats: ['skin-care'], cols: ['best-sellers', 'glow-essentials'],
      img: ['http://localhost:4000/uploads/rose-water.png'],
      short: 'Steam-distilled pure rose water — the toner your skin has always known.',
      desc: 'Just roses and steam. Our 5-star-rated Rose Water tones, refreshes and balances in a single spritz. Use it as a toner, a midday pick-me-up, or the base of your ubtan masks.',
      benefits: ['Balances skin pH', 'Tightens the look of pores', 'Instant refreshment', 'Zero additives'],
      directions: 'Spritz onto clean skin morning and night, or apply with a cotton pad. Keep refrigerated for an extra-cooling toner.',
      concerns: ['dullness', 'oiliness', 'redness', 'sensitivity'], ings: ['rose'], featured: true, best: true,
    },
    {
      name: 'Rosemary Herb', price: 399, cats: ['hair-care', 'organic-pantry'], cols: ['hair-growth-ritual'],
      img: ['http://localhost:4000/uploads/rosemary-herb.png'],
      short: 'Dried rosemary for DIY hair rinses, teas and infusions.',
      desc: 'The herb every hair-growth ritual needs. Brew our sun-dried rosemary into a shine-boosting final rinse, infuse it into oils, or steep a fragrant wellness tea.',
      benefits: ['DIY hair rinse ready', 'Supports scalp health', 'Culinary grade', 'Sun-dried potency'],
      directions: 'Hair rinse: simmer 2 tbsp in 2 cups water for 15 minutes, cool, strain, and pour over hair after shampooing.',
      concerns: ['hair-fall', 'thinning', 'dandruff'], ings: ['rosemary'],
    },
    {
      name: 'Rosemary Oil', price: 550, cats: ['hair-care', 'skin-care'], cols: ['best-sellers', 'hair-growth-ritual'],
      img: ['http://localhost:4000/uploads/rosemary-oil.png'],
      short: 'The hair-growth hero — rosemary-infused oil for thicker, fuller hair.',
      desc: 'Backed by tradition and modern studies alike, rosemary is the botanical answer to thinning hair. Our infusion pairs potent rosemary with lightweight carrier oils for a scalp treatment that means business.',
      benefits: ['Clinically-loved growth support', 'Boosts scalp circulation', 'Reduces flakes', 'Light, non-greasy blend'],
      directions: 'Massage into scalp 3× a week. Leave a minimum of 1 hour or overnight. Consistency for 12+ weeks brings the best results.',
      concerns: ['hair-fall', 'thinning', 'dandruff'], ings: ['rosemary', 'jojoba'], featured: true, best: true,
      faqs: [
        { q: 'How long until I see results?', a: 'Most customers notice reduced fall in 4–6 weeks and visible density around 12 weeks with consistent use.' },
        { q: 'Can I leave it overnight?', a: 'Yes — overnight is ideal. Protect your pillow with a towel.' },
      ],
    },
    {
      name: 'Sandal Ubtan', price: 199, cats: ['skin-care'], cols: ['glow-essentials'],
      img: ['http://localhost:4000/uploads/sandal-ubtan.png'],
      short: 'Classic sandalwood ubtan for bridal-glow skin, any day of the year.',
      desc: 'The pre-wedding secret, bottled. Our Sandal Ubtan blends real sandalwood with gram flour and skin-brightening botanicals for the ritual glow South Asian beauty is famous for.',
      benefits: ['Bridal-glow brightening', 'Gently exfoliates', 'Evens skin tone', 'Time-honoured recipe'],
      directions: 'Mix 1 tbsp with rose water or milk into a paste. Apply, let semi-dry (10–15 min), then massage off gently with damp hands.',
      concerns: ['dullness', 'uneven-tone'], ings: ['sandalwood', 'rose'],
      variants: [{ name: '100g', price: 199 }, { name: '250g', price: 449 }],
    },
    {
      name: 'Unab Jojoba Oil', price: 480, cats: ['hair-care', 'skin-care'],
      img: ['http://localhost:4000/uploads/jojoba-oil.png'],
      short: 'Balancing jojoba blend — skin-identical moisture for face and scalp.',
      desc: 'Jojoba is the closest nature gets to your skin\'s own oil. Blended with traditional unab (jujube) extract, this featherweight oil balances oily complexions, hydrates dry ones and keeps scalps comfortable.',
      benefits: ['Balances oil production', 'Non-comedogenic', 'Hydrates without heaviness', 'Face, hair and beard friendly'],
      directions: 'Face: 2–3 drops on damp skin. Scalp: massage in, leave 1 hour, wash. Beard: 2 drops daily.',
      concerns: ['oiliness', 'dryness', 'sensitivity', 'itchy-scalp'], ings: ['jojoba'],
    },
  ];

  const prodBySlug: Record<string, string> = {};
  for (const p of products) {
    const slug = slugify(p.name);
    const created = await prisma.product.upsert({
      where: { slug },
      update: {
        images: {
          deleteMany: {},
          create: (p.img ?? []).map((url, i) => ({ url, alt: p.name, sortOrder: i })),
        },
      },
      create: {
        name: p.name,
        slug,
        shortDescription: p.short,
        description: p.desc,
        benefits: p.benefits,
        directions: p.directions,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        concerns: p.concerns,
        tags: p.tags ?? [],
        isFeatured: !!p.featured,
        isBestSeller: !!p.best,
        isNewArrival: !!p.newArrival,
        metaTitle: `${p.name} — BeYoutiful Organics`,
        metaDescription: p.short,
        images: { create: (p.img ?? []).map((url, i) => ({ url, alt: p.name, sortOrder: i })) },
        variants: { create: (p.variants ?? []).map((v, i) => ({ ...v, sortOrder: i })) },
        categories: { create: p.cats.map((c) => ({ categoryId: catBySlug[mapCat(c)] })) },
        collections: { create: (p.cols ?? []).map((c) => ({ collectionId: colBySlug[c] })) },
        ingredients: { create: p.ings.filter((i) => ingBySlug[i]).map((i) => ({ ingredientId: ingBySlug[i] })) },
        faqs: { create: (p.faqs ?? []).map((f, i) => ({ question: f.q, answer: f.a, sortOrder: i })) },
      },
    });
    prodBySlug[slug] = created.id;
  }

  function mapCat(oldSlug: string): string {
    return oldSlug; // categories already use new slugs in product defs
  }

  // Related products (simple cross-links within shared category)
  const related: Array<[string, string]> = [
    ['rosemary-oil', 'castor-oil'], ['rosemary-oil', 'rosemary-herb'], ['rosemary-oil', 'mustard-oil'],
    ['miracle-moisturizer', 'rose-water'], ['miracle-moisturizer', 'aloe-vera-gel'],
    ['neem-soap', 'kalonji-glycerine-soap'], ['neem-soap', 'aloe-vera-gel'],
    ['rose-water', 'sandal-ubtan'], ['coconut-oil', 'almond-oil'], ['herbal-shampoo', 'amla-reetha-sikakai'],
  ];
  for (const [a, b] of related) {
    if (prodBySlug[a] && prodBySlug[b]) {
      await prisma.relatedProduct.upsert({
        where: { productId_relatedId: { productId: prodBySlug[a], relatedId: prodBySlug[b] } },
        update: {}, create: { productId: prodBySlug[a], relatedId: prodBySlug[b] },
      });
      await prisma.relatedProduct.upsert({
        where: { productId_relatedId: { productId: prodBySlug[b], relatedId: prodBySlug[a] } },
        update: {}, create: { productId: prodBySlug[b], relatedId: prodBySlug[a] },
      });
    }
  }

  // ── Advisor concerns ──
  const concerns: Array<{ goal: AdvisorGoal; name: string; slug: string }> = [
    { goal: 'HAIR', name: 'Hair Fall', slug: 'hair-fall' },
    { goal: 'HAIR', name: 'Thinning & Slow Growth', slug: 'thinning' },
    { goal: 'HAIR', name: 'Dandruff & Flakes', slug: 'dandruff' },
    { goal: 'HAIR', name: 'Dry & Frizzy Hair', slug: 'frizz' },
    { goal: 'HAIR', name: 'Damage & Breakage', slug: 'breakage' },
    { goal: 'HAIR', name: 'Oily Scalp', slug: 'oily-scalp' },
    { goal: 'HAIR', name: 'Itchy Scalp', slug: 'itchy-scalp' },
    { goal: 'SKIN', name: 'Acne & Breakouts', slug: 'acne' },
    { goal: 'SKIN', name: 'Dryness', slug: 'dryness' },
    { goal: 'SKIN', name: 'Dullness', slug: 'dullness' },
    { goal: 'SKIN', name: 'Oily Skin', slug: 'oiliness' },
    { goal: 'SKIN', name: 'Uneven Tone', slug: 'uneven-tone' },
    { goal: 'SKIN', name: 'Redness & Sensitivity', slug: 'sensitivity' },
  ];
  for (const [i, c] of concerns.entries()) {
    await prisma.advisorConcern.upsert({ where: { slug: c.slug }, update: { ...c, sortOrder: i }, create: { ...c, sortOrder: i } });
  }

  // ── Advisor questions ──
  const questions = [
    { key: 'hairType', label: 'What is your hair type?', goal: 'HAIR' as AdvisorGoal, options: ['Straight', 'Wavy', 'Curly', 'Coily'] },
    { key: 'scalpType', label: 'How would you describe your scalp?', goal: 'HAIR' as AdvisorGoal, options: ['Dry', 'Normal', 'Oily'] },
    { key: 'hairLength', label: 'How long is your hair?', goal: 'HAIR' as AdvisorGoal, options: ['Short', 'Medium', 'Long'] },
    { key: 'skinType', label: 'What is your skin type?', goal: 'SKIN' as AdvisorGoal, options: ['Dry', 'Normal', 'Combination', 'Oily'] },
    { key: 'sensitivity', label: 'Is your skin sensitive?', goal: 'SKIN' as AdvisorGoal, options: ['Yes', 'Sometimes', 'No'] },
    { key: 'gender', label: 'How do you identify?', goal: null, options: ['Female', 'Male', 'Prefer not to say'] },
    { key: 'ageGroup', label: 'Your age group?', goal: null, options: ['Under 20', '20–29', '30–39', '40–49', '50+'] },
    { key: 'lifestyle', label: 'Which best describes your routine?', goal: null, options: ['Mostly indoors', 'Outdoors often', 'Heat styling / makeup daily', 'Active & sweaty'] },
  ];
  for (const [i, q] of questions.entries()) {
    const row = await prisma.advisorQuestion.upsert({
      where: { key: q.key },
      update: { label: q.label, goal: q.goal, sortOrder: i },
      create: { key: q.key, label: q.label, goal: q.goal, sortOrder: i },
    });
    await prisma.advisorOption.deleteMany({ where: { questionId: row.id } });
    await prisma.advisorOption.createMany({
      data: q.options.map((o, j) => ({ questionId: row.id, value: slugify(o), label: o, sortOrder: j })),
    });
  }

  // ── Advisor rules ──
  const rules = [
    {
      name: 'Hair fall — core ritual', priority: 100,
      conditions: { goal: 'HAIR', concerns: ['hair-fall', 'thinning'] },
      productSlugs: [
        { slug: 'rosemary-oil', weight: 10, reason: 'Rosemary is the most-loved botanical for growth support' },
        { slug: 'castor-oil', weight: 8, reason: 'Seals and strengthens weak roots' },
        { slug: 'mustard-oil', weight: 6, reason: 'Traditional warming champi for circulation' },
        { slug: 'amla-reetha-sikakai', weight: 5, reason: 'Gentle cleansing that doesn\'t stress roots' },
      ],
      routine: [
        { order: 1, title: 'Scalp massage', description: 'Massage Rosemary Oil into the scalp 3× a week, leave overnight.', productSlug: 'rosemary-oil', frequency: '3× / week' },
        { order: 2, title: 'Strengthening blend', description: 'Once a week, mix Castor Oil 1:1 with Rosemary Oil for a deeper treatment.', productSlug: 'castor-oil', frequency: '1× / week' },
        { order: 3, title: 'Gentle cleanse', description: 'Wash with Amla Reetha Sikakai paste or Herbal Shampoo.', productSlug: 'amla-reetha-sikakai', frequency: 'Wash days' },
      ],
      blogSlugs: ['diy-organic-hair-oil-boost-your-hairs-health'],
    },
    {
      name: 'Dandruff & itchy scalp', priority: 90,
      conditions: { goal: 'HAIR', concerns: ['dandruff', 'itchy-scalp'] },
      productSlugs: [
        { slug: 'rosemary-oil', weight: 9, reason: 'Calms flakes and refreshes the scalp' },
        { slug: 'aloe-vera-gel', weight: 8, reason: 'Instantly soothes itch and irritation' },
        { slug: 'herbal-shampoo', weight: 7, reason: 'Sulphate-free cleansing keeps the scalp balanced' },
      ],
      routine: [
        { order: 1, title: 'Soothe', description: 'Apply Aloe Vera Gel to the scalp, 30 minutes before washing.', productSlug: 'aloe-vera-gel', frequency: '2× / week' },
        { order: 2, title: 'Treat', description: 'Massage Rosemary Oil into the scalp on alternate days.', productSlug: 'rosemary-oil', frequency: '3× / week' },
        { order: 3, title: 'Cleanse', description: 'Wash with Herbal Shampoo — never hot water.', productSlug: 'herbal-shampoo', frequency: 'Wash days' },
      ],
      blogSlugs: [],
    },
    {
      name: 'Dry, frizzy or damaged hair', priority: 80,
      conditions: { goal: 'HAIR', concerns: ['frizz', 'breakage'] },
      productSlugs: [
        { slug: 'coconut-oil', weight: 9, reason: 'Reduces protein loss inside the strand' },
        { slug: 'egg-yolk-oil', weight: 8, reason: 'Protein repair for brittle lengths' },
        { slug: 'almond-oil', weight: 7, reason: 'Silky finishing shine' },
        { slug: 'orange-oil', weight: 5, reason: 'Gloss and cuticle smoothing' },
      ],
      routine: [
        { order: 1, title: 'Pre-wash mask', description: 'Coconut Oil on lengths 30+ minutes before washing.', productSlug: 'coconut-oil', frequency: 'Every wash' },
        { order: 2, title: 'Weekly repair', description: 'Egg Yolk Oil on damaged lengths once a week.', productSlug: 'egg-yolk-oil', frequency: '1× / week' },
        { order: 3, title: 'Finish', description: '2–3 drops of Almond Oil on damp ends after washing.', productSlug: 'almond-oil', frequency: 'After wash' },
      ],
      blogSlugs: ['diy-organic-hair-oil-boost-your-hairs-health'],
    },
    {
      name: 'Oily scalp balance', priority: 70,
      conditions: { goal: 'HAIR', concerns: ['oily-scalp'] },
      productSlugs: [
        { slug: 'herbal-shampoo', weight: 9, reason: 'Cleans thoroughly without triggering rebound oil' },
        { slug: 'amla-reetha-sikakai', weight: 8, reason: 'Traditional deep-clean ritual' },
        { slug: 'unab-jojoba-oil', weight: 6, reason: 'Jojoba teaches the scalp balance' },
      ],
      routine: [
        { order: 1, title: 'Cleanse smart', description: 'Wash with Herbal Shampoo every 2–3 days, not daily.', productSlug: 'herbal-shampoo', frequency: 'Every 2–3 days' },
        { order: 2, title: 'Balance', description: 'A few drops of Unab Jojoba Oil on the scalp after washing.', productSlug: 'unab-jojoba-oil', frequency: 'After wash' },
      ],
      blogSlugs: [],
    },
    {
      name: 'Acne & breakouts', priority: 100,
      conditions: { goal: 'SKIN', concerns: ['acne'] },
      productSlugs: [
        { slug: 'neem-soap', weight: 10, reason: 'Neem purifies and fights acne bacteria' },
        { slug: 'kalonji-glycerine-soap', weight: 8, reason: 'Kalonji calms active breakouts' },
        { slug: 'rose-water', weight: 7, reason: 'Balancing alcohol-free toner' },
        { slug: 'aloe-vera-gel', weight: 6, reason: 'Light hydration that never clogs' },
      ],
      routine: [
        { order: 1, title: 'Cleanse', description: 'Neem Soap morning and night.', productSlug: 'neem-soap', frequency: '2× / day' },
        { order: 2, title: 'Tone', description: 'Spritz Rose Water on clean skin.', productSlug: 'rose-water', frequency: '2× / day' },
        { order: 3, title: 'Hydrate', description: 'A thin layer of Aloe Vera Gel.', productSlug: 'aloe-vera-gel', frequency: '2× / day' },
      ],
      blogSlugs: ['best-organic-skincare-products-for-oily-skin', 'why-choose-all-natural-soap-over-commercial-soap'],
    },
    {
      name: 'Dry skin rescue', priority: 90,
      conditions: { goal: 'SKIN', concerns: ['dryness'] },
      productSlugs: [
        { slug: 'miracle-moisturizer', weight: 10, reason: 'Shea + aloe deep moisture, 24 hours' },
        { slug: 'almond-oil', weight: 8, reason: 'Vitamin-E softness for face and body' },
        { slug: 'aloe-vera-gel', weight: 6, reason: 'Hydrating base layer' },
      ],
      routine: [
        { order: 1, title: 'Hydrate', description: 'Aloe Vera Gel on damp skin.', productSlug: 'aloe-vera-gel', frequency: '2× / day' },
        { order: 2, title: 'Seal', description: 'Miracle Moisturizer while skin is still damp.', productSlug: 'miracle-moisturizer', frequency: '2× / day' },
        { order: 3, title: 'Night oil', description: '2–3 drops of Almond Oil as the last step.', productSlug: 'almond-oil', frequency: 'Nightly' },
      ],
      blogSlugs: ['best-oils-for-skin-moisturizing'],
    },
    {
      name: 'Glow & even tone', priority: 80,
      conditions: { goal: 'SKIN', concerns: ['dullness', 'uneven-tone'] },
      productSlugs: [
        { slug: 'sandal-ubtan', weight: 10, reason: 'The classic bridal-glow ritual' },
        { slug: 'rice-soap', weight: 8, reason: 'Daily gentle brightening' },
        { slug: 'rose-water', weight: 7, reason: 'Fresh, toned base' },
        { slug: 'miracle-moisturizer', weight: 6, reason: 'Dewy finish' },
      ],
      routine: [
        { order: 1, title: 'Cleanse', description: 'Rice Soap daily.', productSlug: 'rice-soap', frequency: 'Daily' },
        { order: 2, title: 'Ubtan ritual', description: 'Sandal Ubtan mask 2× a week, mixed with Rose Water.', productSlug: 'sandal-ubtan', frequency: '2× / week' },
        { order: 3, title: 'Glow finish', description: 'Rose Water + Miracle Moisturizer.', productSlug: 'rose-water', frequency: '2× / day' },
      ],
      blogSlugs: ['a-complete-guide-to-creating-your-diy-organic-skincare-routine'],
    },
    {
      name: 'Oily / combination skin', priority: 70,
      conditions: { goal: 'SKIN', concerns: ['oiliness'] },
      productSlugs: [
        { slug: 'unab-jojoba-oil', weight: 9, reason: 'Jojoba balances your skin\'s own oil' },
        { slug: 'lemon-essential-oil', weight: 7, reason: 'Clarifies congested skin (diluted)' },
        { slug: 'rose-water', weight: 8, reason: 'Mattifying, pore-tightening toner' },
        { slug: 'neem-soap', weight: 6, reason: 'Keeps pores purified' },
      ],
      routine: [
        { order: 1, title: 'Cleanse', description: 'Neem Soap morning and night.', productSlug: 'neem-soap', frequency: '2× / day' },
        { order: 2, title: 'Tone', description: 'Chilled Rose Water spritz.', productSlug: 'rose-water', frequency: '2× / day' },
        { order: 3, title: 'Balance', description: '2 drops Unab Jojoba Oil at night.', productSlug: 'unab-jojoba-oil', frequency: 'Nightly' },
      ],
      blogSlugs: ['best-organic-skincare-products-for-oily-skin'],
    },
    {
      name: 'Sensitive skin care', priority: 85,
      conditions: { goal: 'SKIN', concerns: ['sensitivity'] },
      productSlugs: [
        { slug: 'aloe-vera-gel', weight: 10, reason: 'The gentlest calm-down for reactive skin' },
        { slug: 'rose-water', weight: 8, reason: 'Alcohol-free, pH-balancing' },
        { slug: 'miracle-moisturizer', weight: 7, reason: 'Simple, fragrance-light moisture' },
      ],
      routine: [
        { order: 1, title: 'Calm', description: 'Aloe Vera Gel on any redness.', productSlug: 'aloe-vera-gel', frequency: 'As needed' },
        { order: 2, title: 'Tone', description: 'Rose Water, patted not rubbed.', productSlug: 'rose-water', frequency: '2× / day' },
        { order: 3, title: 'Protect', description: 'Miracle Moisturizer to lock everything in.', productSlug: 'miracle-moisturizer', frequency: '2× / day' },
      ],
      blogSlugs: [],
    },
  ];
  await prisma.advisorRule.deleteMany({});
  for (const r of rules) {
    await prisma.advisorRule.create({
      data: {
        name: r.name, priority: r.priority,
        conditions: r.conditions as object,
        productSlugs: r.productSlugs as object[],
        routine: (r.routine ?? []) as object[],
        blogSlugs: r.blogSlugs ?? [],
      },
    });
  }

  // ── Blog ──
  const blogCat = await prisma.blogCategory.upsert({
    where: { slug: 'organic-living' }, update: {}, create: { name: 'Organic Living', slug: 'organic-living' },
  });
  const posts = [
    {
      title: 'Understanding the Importance of Organic Sun Protection',
      slug: 'understanding-the-importance-of-organic-sun-protection',
      excerpt: 'Why mineral and botanical sun care deserves a place in every Pakistani beauty routine — and how to build it naturally.',
      coverImageUrl: `${IMG}/2024/01/sunprotct.jpg`,
      content: `## Why sun protection matters\n\nPakistan's sun is generous — sometimes too generous. Daily UV exposure is the single biggest external driver of premature aging, dark spots and uneven tone.\n\n## The organic approach\n\nOrganic sun care leans on physical barriers and antioxidant support rather than synthetic chemical filters:\n\n- **Shade, cover, timing** — the original SPF.\n- **Antioxidant-rich oils** like almond and jojoba help skin recover from oxidative stress.\n- **Aloe vera** cools and repairs sun-stressed skin after exposure.\n\n## Build your ritual\n\n1. Morning: lightweight hydration (Aloe Vera Gel) before sunscreen.\n2. Daytime: reapply protection; keep Rose Water handy for refreshing.\n3. Evening: repair with Almond Oil or Miracle Moisturizer.\n\nYour skin remembers every sunny day. Treat it kindly.`,
      publishedAt: new Date('2024-01-09'),
    },
    {
      title: 'A Complete Guide to Creating Your DIY Organic Skincare Routine',
      slug: 'a-complete-guide-to-creating-your-diy-organic-skincare-routine',
      excerpt: 'From cleanser to glow — build a complete routine with pure, single-ingredient organics you can trust.',
      coverImageUrl: `${IMG}/2024/01/DIY-2.jpg`,
      content: `## Start simple\n\nA good routine has four steps: cleanse, tone, treat, moisturize. You don't need twelve products — you need the right four.\n\n### 1. Cleanse\nHandmade soaps like Neem (for oily/acne-prone) or Rice (for dullness) clean without stripping.\n\n### 2. Tone\nPure Rose Water rebalances pH and preps skin.\n\n### 3. Treat\nThis is where ubtans and facial oils shine. Sandal Ubtan 2× a week gives that famous glow.\n\n### 4. Moisturize\nSeal it all with Miracle Moisturizer or a few drops of Almond Oil.\n\n## The golden rules\n\n- Patch test everything.\n- Introduce one product at a time.\n- Consistency beats intensity — six gentle weeks outperform one harsh weekend.`,
      publishedAt: new Date('2024-01-12'),
    },
    {
      title: 'Best Oils for Skin Moisturizing',
      slug: 'best-oils-for-skin-moisturizing',
      excerpt: 'Almond, jojoba, coconut — which oil belongs on your skin? A practical guide by skin type.',
      coverImageUrl: `${IMG}/2024/01/oilsforoilyskin-1300x750.jpg`,
      content: `## Match the oil to the skin\n\n**Dry skin** loves rich, occlusive oils: almond and coconut lock in moisture for hours.\n\n**Oily and combination skin** does better with jojoba — a liquid wax so similar to sebum that skin often produces *less* oil in response.\n\n**Sensitive skin** should start with a patch test and lean on aloe-based hydration first, adding oils slowly.\n\n## How to apply\n\nOils seal — they don't hydrate on their own. Always apply to **damp** skin: spritz Rose Water first, then press 2–3 drops of oil over it. That's the whole secret.`,
      publishedAt: new Date('2024-01-12'),
    },
    {
      title: 'Best Organic Skincare Products for Oily Skin',
      slug: 'best-organic-skincare-products-for-oily-skin',
      excerpt: 'Oily skin needs balance, not punishment. The organic way to clear, matte, healthy skin.',
      coverImageUrl: `${IMG}/2024/01/pexels-mikhail-nilov-6706901-533x800.jpg`,
      content: `## Stop stripping\n\nHarsh cleansers make oily skin oilier — the rebound effect is real. The organic approach is balance:\n\n1. **Neem Soap** — purifies without the squeaky-tight feeling.\n2. **Rose Water** — chills pores and mattifies (keep it in the fridge).\n3. **Jojoba Oil** — sounds counterintuitive; works brilliantly. Skin recognises it and calms its own production.\n4. **Kalonji Soap** — for breakout-prone weeks.\n\n## What to avoid\n\nAlcohol-heavy toners, over-washing, and daily scrubs. Twice-daily gentle care wins.`,
      publishedAt: new Date('2024-01-12'),
    },
    {
      title: "DIY Organic Hair Oil: Boost Your Hair's Health",
      slug: 'diy-organic-hair-oil-boost-your-hairs-health',
      excerpt: 'Blend your own champi oil at home — recipes for growth, shine and scalp comfort.',
      coverImageUrl: `${IMG}/2024/03/hair-150x150.jpeg`,
      content: `## The base\n\nStart with a carrier: coconut for deep conditioning, almond for lightness, mustard for warmth.\n\n## Growth blend\n\n- 2 parts Rosemary Oil\n- 1 part Castor Oil\n- 1 part Almond Oil\n\nWarm gently, massage into the scalp for 10 minutes, leave overnight.\n\n## Shine blend\n\n- 2 parts Coconut Oil\n- 1 part Orange Oil\n\nApply to lengths 30 minutes before washing.\n\n## The champi technique\n\nSmall circles with fingertips (never nails), moving from hairline to crown. Ten minutes, twice a week, changes everything.`,
      publishedAt: new Date('2024-03-07'),
    },
    {
      title: 'Why Choose All Natural Soap Over Commercial Soap',
      slug: 'why-choose-all-natural-soap-over-commercial-soap',
      excerpt: 'Most "soap" isn\'t soap at all. What handmade bars do differently for your skin.',
      coverImageUrl: `${IMG}/2024/03/soaps-150x150.jpg`,
      content: `## Detergent vs. soap\n\nMost commercial bars are synthetic detergents with the glycerine removed (it's sold separately — to moisturizer companies). Handmade soap keeps its natural glycerine, which is why it cleans without the tight, squeaky after-feel.\n\n## What's in ours\n\n- **Neem Soap** — purifying, for troubled skin\n- **Rice Soap** — brightening, for dullness\n- **Kalonji Glycerine Soap** — calming, for breakouts\n\nEach bar is made in small batches with food-grade oils. No SLS, no parabens, no synthetic fragrance.\n\n## Making the switch\n\nGive your skin two weeks to adjust. The difference in comfort is usually obvious by day three.`,
      publishedAt: new Date('2024-03-05'),
    },
    {
      title: 'The Benefits of Using Organic Teeth Whitening Paste',
      slug: 'the-benefits-of-using-organic-teeth-whitening-paste',
      excerpt: 'Gentler whitening with nature\'s own polishers — what works and what to skip.',
      coverImageUrl: `${IMG}/2024/03/teeth-wietning-150x150.jpg`,
      content: `## The gentle route to a brighter smile\n\nCommercial whiteners rely on peroxides that can spike sensitivity. Organic pastes use mild mechanical polishers and pH balancers instead.\n\n## What works\n\n- **Miswak extract** — centuries of dental tradition, validated by modern studies.\n- **Activated charcoal** — light surface-stain lifting (use max 2× a week).\n- **Clove oil** — natural comfort for gums.\n\n## Keep it realistic\n\nOrganic whitening restores your teeth's *natural* shade — it won't bleach beyond it. For deep discoloration, see your dentist. For everyday brightness and fresher breath, nature has you covered.`,
      publishedAt: new Date('2024-03-05'),
    },
  ];
  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: blogCat.id, metaTitle: `${p.title} — BeYoutiful Organics`, metaDescription: p.excerpt },
    });
  }

  // ── FAQs ──
  const faqs = [
    { category: 'Orders', question: 'How do I place an order?', answer: 'Add products to your cart, checkout with your details, and press Place Order. A WhatsApp message opens with your order pre-filled — just press Send and we\'ll confirm right away. You\'ll also receive an email confirmation.' },
    { category: 'Orders', question: 'What payment methods do you accept?', answer: 'We currently offer Cash on Delivery across Pakistan. You pay when your order arrives at your door.' },
    { category: 'Shipping', question: 'How long does delivery take?', answer: 'Orders are dispatched within 1–2 working days. Delivery takes 2–4 working days in major cities and 4–7 working days elsewhere in Pakistan.' },
    { category: 'Shipping', question: 'What are the delivery charges?', answer: 'Flat Rs. 200 nationwide. Orders above Rs. 3,000 ship free.' },
    { category: 'Orders', question: 'Can I change or cancel my order?', answer: 'Yes — message us on WhatsApp (0300-0527443) before your order is dispatched and we\'ll adjust or cancel it, no questions asked.' },
    { category: 'Products', question: 'Are your products really organic?', answer: 'Yes. We source single-origin, cold-pressed and handmade products from trusted local artisans and small businesses. No sulphates, parabens, mineral oils or synthetic fragrance — ever.' },
    { category: 'Products', question: 'Do your products have an expiry?', answer: 'Being preservative-free, our products are best used within 6–12 months of opening. Each label carries its batch date. Store cool, dry and away from direct sunlight.' },
    { category: 'Products', question: 'Are your products tested on animals?', answer: 'Never. Our products are cruelty-free and most are 100% vegetarian (egg yolk oil and desi ghee being the natural exceptions).' },
    { category: 'Hair', question: 'How often should I oil my hair?', answer: '2–3 times a week is ideal for most hair types. Leave oil in for at least an hour — overnight for deeper conditioning — then wash with a gentle, sulphate-free cleanser.' },
    { category: 'Hair', question: 'How long until rosemary oil shows results?', answer: 'With consistent use (3× a week), most customers notice reduced hair fall within 4–6 weeks and visible new growth around 10–12 weeks.' },
    { category: 'Skin', question: 'Should I patch test?', answer: 'Always. Apply a small amount to your inner forearm and wait 24 hours. Natural doesn\'t automatically mean allergy-proof — even roses disagree with someone.' },
    { category: 'Skin', question: 'Can I use facial oils on oily skin?', answer: 'Yes — choose jojoba. It mimics your skin\'s own sebum and can actually reduce oiliness over time. Avoid heavy butters on breakout-prone areas.' },
  ];
  await prisma.faq.deleteMany({});
  await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });

  // ── Testimonials ──
  const testimonials = [
    { name: 'Ayesha K.', location: 'Karachi', rating: 5, text: 'The Rosemary Oil is magic. My hair fall reduced noticeably within a month and my parting looks fuller. Third bottle ordered!', productSlug: 'rosemary-oil' },
    { name: 'Fatima S.', location: 'Lahore', rating: 5, text: 'Miracle Moisturizer lives up to its name. My winter-dry skin drinks it up and it never feels greasy under makeup.', productSlug: 'miracle-moisturizer' },
    { name: 'Hira M.', location: 'Islamabad', rating: 5, text: 'Rose Water so fresh it smells like a garden. I keep it in the fridge — best midday refresh ever.', productSlug: 'rose-water' },
    { name: 'Zainab A.', location: 'Karachi', rating: 4, text: 'Neem soap cleared my stubborn chin breakouts in three weeks. Gentle but it works.', productSlug: 'neem-soap' },
    { name: 'Sana R.', location: 'Faisalabad', rating: 5, text: 'Ordered the Sandal Ubtan before my sister\'s wedding — the glow was real. Guests kept asking about my skin!', productSlug: 'sandal-ubtan' },
    { name: 'Mahnoor T.', location: 'Multan', rating: 5, text: 'The WhatsApp ordering is so convenient, and delivery was faster than promised. Coconut oil quality is outstanding.', productSlug: 'coconut-oil' },
  ];
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({ data: testimonials.map((t, i) => ({ ...t, sortOrder: i })) });

  // ── Before/After (placeholders using brand imagery; admin replaces with real client photos) ──
  await prisma.beforeAfter.deleteMany({});
  await prisma.beforeAfter.createMany({
    data: [
      { title: 'Hair density — 12 week rosemary ritual', description: 'Consistent rosemary + castor oil massage, 3× weekly.', beforeUrl: `${IMG}/2023/12/WhatsApp-Image-2023-12-18-at-15.42.26_46db465d.jpg`, afterUrl: `${IMG}/2023/12/WhatsApp-Image-2023-12-18-at-15.42.31_b95b5c12.jpg`, durationLabel: '12 weeks', concern: 'hair-fall', productSlug: 'rosemary-oil', sortOrder: 0 },
      { title: 'Glow transformation — ubtan ritual', description: 'Sandal Ubtan twice weekly with rose water.', beforeUrl: `${IMG}/2023/12/WhatsApp-Image-2023-12-18-at-15.58.27_e6930f49.jpg`, afterUrl: `${IMG}/2023/12/WhatsApp-Image-2023-12-18-at-15.58.27_43d56c36.jpg`, durationLabel: '6 weeks', concern: 'dullness', productSlug: 'sandal-ubtan', sortOrder: 1 },
    ],
  });

  // ── Search synonyms (intent mapping incl. Urdu/Roman-Urdu) ──
  const synonyms: Array<{ term: string; mapsTo: string[] }> = [
    { term: 'khushki', mapsTo: ['dandruff', 'dryness'] },
    { term: 'baal girna', mapsTo: ['hair-fall'] },
    { term: 'hairfall', mapsTo: ['hair-fall'] },
    { term: 'hair loss', mapsTo: ['hair-fall', 'thinning'] },
    { term: 'ganja', mapsTo: ['hair-fall', 'thinning'] },
    { term: 'daane', mapsTo: ['acne'] },
    { term: 'pimples', mapsTo: ['acne'] },
    { term: 'nikhar', mapsTo: ['dullness', 'glow'] },
    { term: 'glow', mapsTo: ['dullness', 'sandal-ubtan', 'rice-soap'] },
    { term: 'gora', mapsTo: ['uneven-tone', 'dullness'] },
    { term: 'moisturiser', mapsTo: ['miracle-moisturizer'] },
    { term: 'lotion', mapsTo: ['miracle-moisturizer'] },
    { term: 'arq e gulab', mapsTo: ['rose-water'] },
    { term: 'gulab', mapsTo: ['rose-water', 'rose'] },
    { term: 'sarson', mapsTo: ['mustard-oil'] },
    { term: 'nariyal', mapsTo: ['coconut-oil'] },
    { term: 'badam', mapsTo: ['almond-oil'] },
    { term: 'ghee', mapsTo: ['khalis-desi-ghee'] },
    { term: 'ubtan', mapsTo: ['sandal-ubtan'] },
    { term: 'shampoo', mapsTo: ['herbal-shampoo', 'amla-reetha-sikakai'] },
    { term: 'dandruff', mapsTo: ['rosemary-oil', 'herbal-shampoo', 'aloe-vera-gel'] },
  ];
  await prisma.searchSynonym.deleteMany({});
  await prisma.searchSynonym.createMany({ data: synonyms });

  // ── Homepage sections ──
  const sections = [
    { key: 'hero', sortOrder: 0, title: 'Pure. Organic. BeYoutiful.', subtitle: 'Small-batch skincare & haircare from Mother Nature herself — made in Pakistan, made for you.', content: { ctaLabel: 'Shop Now', ctaHref: '/shop', secondaryLabel: 'Find My Perfect Products', secondaryHref: '/advisor' } },
    { key: 'categories', sortOrder: 1, title: 'Shop by Ritual', subtitle: 'Everything your hair, skin and home deserve.' },
    { key: 'featured', sortOrder: 2, title: 'Loved by You', subtitle: 'Our most-reordered organics.' },
    { key: 'ingredients', sortOrder: 3, title: 'Straight from Nature', subtitle: 'Single-origin ingredients, zero shortcuts.' },
    { key: 'story', sortOrder: 4, title: 'Beauty shouldn\'t be built in a boardroom', subtitle: 'It should be built by YOU and about YOU.' },
    { key: 'advisor', sortOrder: 5, title: 'Not sure where to start?', subtitle: 'Answer a few questions and get your personal routine.' },
    { key: 'testimonials', sortOrder: 6, title: 'Real People, Real Glow', subtitle: 'Stories from our community across Pakistan.' },
    { key: 'blog', sortOrder: 7, title: 'The Organic Edit', subtitle: 'Guides, rituals and honest ingredient talk.' },
    { key: 'newsletter', sortOrder: 8, title: 'Join the BeYoutiful family', subtitle: 'Rituals, launches and members-only offers. No spam, ever.' },
  ];
  for (const s of sections) {
    await prisma.homepageSection.upsert({ where: { key: s.key }, update: s, create: s });
  }

  // ── Settings ──
  const settings: Array<{ key: string; value: unknown; group: string }> = [
    { key: 'business.name', value: 'BeYoutiful Organics', group: 'general' },
    { key: 'business.email', value: 'beyoutiful.organics@gmail.com', group: 'contact' },
    { key: 'business.whatsapp', value: '923000527443', group: 'contact' },
    { key: 'business.whatsappDisplay', value: '0300-0527443', group: 'contact' },
    { key: 'business.city', value: 'Karachi, Pakistan', group: 'contact' },
    { key: 'social.facebook', value: 'https://m.facebook.com/beyoutifulorganics1', group: 'social' },
    { key: 'social.instagram', value: 'https://instagram.com/beyoutifulorganics', group: 'social' },
    { key: 'social.whatsappCatalog', value: 'https://wa.me/c/923000527443', group: 'social' },
    { key: 'shipping.flatFee', value: 200, group: 'shipping' },
    { key: 'shipping.freeAbove', value: 3000, group: 'shipping' },
    { key: 'shipping.dispatchDays', value: '1–2 working days', group: 'shipping' },
    { key: 'shipping.deliveryDays', value: '2–7 working days', group: 'shipping' },
    { key: 'advisor.strategy', value: 'rules', group: 'advisor' },
    { key: 'seo.defaultTitle', value: 'BeYoutiful Organics — Pure Organic Skincare & Haircare in Pakistan', group: 'seo' },
    { key: 'seo.defaultDescription', value: 'Small-batch organic skincare, haircare and wellness products made in Pakistan. Cold-pressed oils, handmade soaps, pure rose water and more. Cash on delivery nationwide.', group: 'seo' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value as object, group: s.group }, create: { key: s.key, value: s.value as object, group: s.group } });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

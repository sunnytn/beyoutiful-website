# How to Put Your Website Live on Hostinger (Beginner Guide)

This guide assumes you know nothing about servers. Follow it top to bottom, copy-pasting the commands.
Total time: about 1–2 hours. You only do this once.

---

## Part 0 — What you're buying and why

Your website has three parts that must run on a computer that never turns off:

1. The **website** people see (Next.js)
2. The **engine** behind it (the API — handles orders, products, admin)
3. The **database** (where products and orders are stored)

Hostinger's cheap "Web Hosting" plans **cannot** run this — they're for WordPress only.
You need a **VPS** (Virtual Private Server) — your own small computer in Hostinger's data center.

**What to buy:**

- Go to hostinger.com → **VPS Hosting**
- Choose **KVM 2** (2 CPU, 8 GB RAM) — the safe choice. KVM 1 also works to start.
- During setup, when asked for an **Operating System**, choose **Ubuntu 24.04** (plain, not a template).
- Set a **root password** when asked — write it down somewhere safe.

You also need your **domain** (beyoutifulorganics.com). If it's already at Hostinger, perfect.

---

## Part 1 — Point your domain at your new server

1. In Hostinger's panel (hpanel), open your **VPS** page. You'll see an **IP address** like `145.223.xx.xx`. Copy it.
2. Go to **Domains → beyoutifulorganics.com → DNS / Name Servers**.
3. Find the **A record** with name `@` → click Edit → paste your VPS IP → Save.
4. Add/edit another **A record**: name `www` → same IP.
5. Add one more **A record**: name `api` → same IP. (This makes `api.beyoutifulorganics.com` for the engine.)

DNS takes 10–60 minutes to update. Continue with Part 2 meanwhile.

---

## Part 2 — Open your server's terminal

In hpanel, on your VPS page, click **Browser terminal** (or use the SSH details with PuTTY if you prefer).
Log in as `root` with the password you set.

You'll see a black screen with a blinking cursor. That's normal — you'll paste commands there.
**Tip:** paste with right-click or Ctrl+Shift+V.

---

## Part 3 — Install the software (copy-paste each block)

**Block 1 — updates and basics:**

```bash
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib
```

**Block 2 — install Node.js 20:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

**Block 3 — create the database.** First pick a strong database password (example: `Byo!2026#SecretDb`) and use it instead of `YOUR_DB_PASSWORD` below:

```bash
sudo -u postgres psql -c "CREATE USER beyoutiful WITH PASSWORD 'YOUR_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE beyoutiful OWNER beyoutiful;"
```

---

## Part 4 — Put your website code on the server

**Easiest way (GitHub):** if the project folder is on GitHub, run:

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git beyoutiful
```

**No GitHub?** Zip the project folder on your PC (right-click → Compress; **don't** include `node_modules`), then in hpanel use the VPS **File Manager** to upload the zip into `/var/www/`, then in the terminal:

```bash
cd /var/www
apt install -y unzip
unzip YOUR_FILE.zip -d beyoutiful
```

Either way, you should now have `/var/www/beyoutiful` containing folders `apps`, `packages`, etc.

---

## Part 5 — Fill in the settings (the .env files)

**File 1 — the engine's settings:**

```bash
nano /var/www/beyoutiful/apps/api/.env
```

Paste this, **replacing the CAPITALIZED parts** (for the two JWT secrets just mash the keyboard — 40+ random characters each):

```
DATABASE_URL="postgresql://beyoutiful:YOUR_DB_PASSWORD@localhost:5432/beyoutiful?schema=public"
API_PORT=4000
WEB_URL=https://beyoutifulorganics.com
CORS_ORIGINS=https://beyoutifulorganics.com,https://www.beyoutifulorganics.com

JWT_ACCESS_SECRET=PASTE_40_RANDOM_CHARACTERS_HERE
JWT_REFRESH_SECRET=PASTE_DIFFERENT_40_RANDOM_CHARACTERS
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_SECRET
CLOUDINARY_UPLOAD_FOLDER=beyoutiful

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=beyoutiful.organics@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
MAIL_FROM="BeYoutiful Organics <beyoutiful.organics@gmail.com>"
BUSINESS_EMAIL=beyoutiful.organics@gmail.com

WHATSAPP_NUMBER=923000527443
SEED_ADMIN_PASSWORD=CHOOSE_YOUR_ADMIN_LOGIN_PASSWORD
```

Save: press **Ctrl+X**, then **Y**, then **Enter**.

> **Where do these come from?**
> - **Cloudinary** (free): sign up at cloudinary.com → Dashboard shows Cloud name, API Key, API Secret. Needed for uploading product photos from the admin panel.
> - **Gmail App Password**: Google Account → Security → turn on 2-Step Verification → search "App passwords" → create one for "Mail". This lets the site send order emails. (Your normal Gmail password will NOT work.)

**File 2 — the website's settings:**

```bash
nano /var/www/beyoutiful/apps/web/.env.local
```

Paste:

```
NEXT_PUBLIC_API_URL=https://api.beyoutifulorganics.com
NEXT_PUBLIC_SITE_URL=https://beyoutifulorganics.com
NEXT_PUBLIC_WHATSAPP_NUMBER=923000527443
NEXT_PUBLIC_SHIPPING_FEE=200
NEXT_PUBLIC_FREE_SHIPPING_ABOVE=3000
```

(The last two control the delivery-fee text shown on the site. If you ever change delivery
charges in Admin → Settings, change these here too and rebuild.)

Save with Ctrl+X, Y, Enter.

---

## Part 6 — Build and fill the database

```bash
cd /var/www/beyoutiful
npm install
```

(This takes a few minutes — it's downloading building blocks.)

```bash
cd apps/api
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
npx prisma db seed
```

You should see "Seed complete." — your shop now has all 22 products, blog posts, FAQs and advisor rules loaded.

```bash
cd /var/www/beyoutiful
npm run build
```

(This takes a few minutes too. If it ends without red "error" text, you're good.)

---

## Part 7 — Start everything (and keep it running forever)

```bash
cd /var/www/beyoutiful
pm2 start apps/api/dist/src/main.js --name byo-api
pm2 start "npm run start -w apps/web" --name byo-web
pm2 save
pm2 startup
```

The last command prints one long command — **copy and run it** (it makes everything restart automatically if the server reboots).

Check both say "online":

```bash
pm2 status
```

---

## Part 8 — Connect the domain to the apps (nginx)

```bash
nano /etc/nginx/sites-available/beyoutiful
```

Paste exactly:

```
server {
    listen 80;
    server_name beyoutifulorganics.com www.beyoutifulorganics.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
server {
    listen 80;
    server_name api.beyoutifulorganics.com;
    client_max_body_size 10m;
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Save (Ctrl+X, Y, Enter), then:

```bash
ln -s /etc/nginx/sites-available/beyoutiful /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Now visit **http://beyoutifulorganics.com** — your new website should appear! 🎉

---

## Part 9 — Add the padlock (free SSL certificate)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d beyoutifulorganics.com -d www.beyoutifulorganics.com -d api.beyoutifulorganics.com
```

Answer the questions (enter your email, agree, choose "redirect"). Certbot renews itself automatically.

Your site is now live at **https://beyoutifulorganics.com** with the padlock. ✅

---

## Part 10 — First things to do on your live site

1. Go to `https://beyoutifulorganics.com/admin`
2. Log in: email `beyoutiful.organics@gmail.com`, password = whatever you set as `SEED_ADMIN_PASSWORD` (default `BeYoutiful@2026`).
3. **Change the password immediately**: Admin → Users → Edit your account → set a new password.
4. Place a small **test order** from your phone — check that the WhatsApp message opens and both emails arrive.
5. Start replacing product photos: Admin → Products → Edit → upload fresh images.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| Site shows "502 Bad Gateway" | `pm2 status` — if something is "errored", run `pm2 logs byo-web` (or `byo-api`) to see the reason |
| Changed a setting in .env | `pm2 restart byo-api byo-web` |
| Updated the code | `cd /var/www/beyoutiful && git pull && npm install && npm run build && pm2 restart all` |
| Emails not arriving | Recheck the Gmail App Password; look at `pm2 logs byo-api` |
| Want to see errors live | `pm2 logs` (Ctrl+C to exit) |

**Monthly habit:** `apt update && apt upgrade -y` keeps the server secure.

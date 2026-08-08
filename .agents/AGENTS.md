# Workspace Rules & Deployment Workflow

## Deployment Rule (Mandatory for Every Code / Content Amendment)
Whenever any modification, fix, update, or feature amendment is made to the website codebase:

1. **Rebuild the project:**
   Run `npm run build` to update the `dist/` directory.

2. **Generate Both Deployment ZIP Packages:**
   Use Python's `zipfile` module (or equivalent cross-platform tool) to generate Linux-compatible ZIP archives with forward-slash (`/`) relative entry paths for both:
   - `cati_website_deployment.zip`
   - `cati_website_hostinger_deployment.zip`

3. **Required Package Contents:**
   Ensure both ZIP archives include:
   - `dist/` production assets & pages (`index.html`, `about.html`, `courses.html`, `schools.html`, `campus-life.html`, `gallery.html`, `news.html`, `contact.html`, `cati-admin.html`, `course-details.html`, `facility-details.html`)
   - `assets/` (bundled JS, CSS, images, animated GIF, video)
   - `.htaccess` (Apache rewrite rules & security headers)
   - `robots.txt` & `sitemap.xml`
   - `api/data.php` (PHP server data sync API)

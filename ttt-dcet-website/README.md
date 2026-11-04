# T.T.T Academy — Premium DCET Coaching Website

A complete, production-ready PHP 8 + MySQL website for **T.T.T Academy (Technical Teaching & Training Academy)**, rebuilt as a premium, cinematic DCET coaching brand. All content, photos, toppers, results and videos come from the existing site at <https://tttacademics.com> and its official DCET result posters. Nothing is invented.

## Highlights

- **Cinematic home page**: “Your DCET Rank Starts Here.” hero with a Three.js scene (rotating knowledge globe, floating books, gears and engineering solids), floating maths formulas, a Ken Burns slideshow of real T.T.T classrooms, real topper portraits and animated counters.
- **GSAP motion system**: scroll reveals, parallax, a pinned horizontal achievers gallery, scroll-scrubbed image zooms, 3D tilt cards and animated charts. Everything respects `prefers-reduced-motion`, and the 3D scene pauses when off-screen.
- **Verified results dashboard**: DCET 2022–2026 rank-band data (Top 10 / 100 / 200 / 500 / 1000 / 1500 / 2000). Interactive SVG charts use a colour-blind-validated palette and include tooltips and a table view.
- **Our Toppers**: a hall of fame, state top-rank holder cards, and a searchable wall of **301 named rank holders** transcribed from the official 2023–2026 posters.
- **Tools**: a DCET rank predictor (T.T.T’s published formula and cutoffs), a college cutoff finder (DCET 2026 Round-1 cutoffs for the top 50 colleges), a syllabus explorer, a course comparison and FAQs with FAQPage schema.
- **Conversion**: AJAX admission, demo-booking and contact forms; a WhatsApp hand-off; a sticky mobile action dock; a floating WhatsApp button.
- **Admin panel** (`/admin/`): an enquiries CRM (status, notes, CSV export, WhatsApp link), student logins and CRUD for every content type, including image uploads that are auto-converted to WebP. It also manages site settings and passwords.
- **Student zone** (`/student/login`): downloads for students only, served from non-public storage.

## Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/about` | About T.T.T (institution, mission, management messages, branches) |
| `/dcet-coaching` | DCET Coaching (exam pattern, application steps, centres, documents, strategy) |
| `/dcet-coaching/pratigna-long-term-batch` | Pratigna — Long Term Batch (12 months) |
| `/dcet-coaching/jnana-short-term-batch` | Jnana — Short Term Batch (6 months) |
| `/dcet-coaching/pragathi-crash-course` | Pragathi — Crash Course (2 months) |
| `/dcet-results` | DCET Results dashboard + official posters |
| `/our-toppers` | Our Toppers (hall of fame, rank holders wall, topper interviews) |
| `/student-testimonials` | Student Testimonials (written + video) |
| `/faculty` | Faculty & leadership |
| `/study-materials` | Study Materials & PYQ downloads |
| `/demo-classes` | Demo Classes + demo booking |
| `/gallery` | Gallery (filterable masonry + lightbox) |
| `/admission` | Admission |
| `/contact` | Contact Us (3 branches with maps) |
| `/dcet-rank-predictor`, `/dcet-syllabus`, `/college-cutoffs`, `/compare-courses`, `/faq` | Interactive tools |
| `/student/login`, `/student/dashboard` | Student zone |
| `/admin/` | Admin panel |

Old URLs from the previous site (`/d-cet`, `/dcet-2027-jnana-short-term-course`, `/faculties`, …) 301-redirect to the new pages.

## Tech stack

PHP 8.1+ (no framework, no Composer), MySQL 5.7+/MariaDB 10.4+ (PDO, prepared statements), HTML5, CSS3, Bootstrap 5.3, vanilla JavaScript, GSAP 3.12 + ScrollTrigger, Three.js r160 (ES module, home page only), and AJAX via `fetch`.

```
index.php            Front controller + SEO routes + legacy redirects
.htaccess            Rewrites, blocks internal folders, caching, compression
app/                 bootstrap, helpers, DB, auth, content repository, entity definitions
config/              config.php (+ config.local.php — not committed)
data/seed.php        Verified content (seed + read-only fallback when DB is down)
data/colleges.json   Top-50 college guide + DCET 2026 Round-1 cutoffs
pages/               Page templates
templates/           Layout + partials
handlers/            /api/enquiry, /api/cutoffs, sitemap.xml, robots.txt
admin/               Admin panel
assets/              css, js, img (all images optimised WebP)
database/            install.php (CLI) + ttt_dcet.sql (schema + seed)
uploads/public/      Admin uploads (served, never executed)
storage/private/     Student-only PDFs (not web-accessible)
```

## Installation

1. **Requirements:** PHP 8.1+ with `pdo_mysql`, `mbstring`, `fileinfo`, and `gd` (with WebP); Apache with `mod_rewrite`, or nginx.
2. **Create the database and user:**
   ```sql
   CREATE DATABASE ttt_dcet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ttt_dcet'@'localhost' IDENTIFIED BY 'a-strong-password';
   GRANT ALL ON ttt_dcet.* TO 'ttt_dcet'@'localhost';
   ```
3. **Configure:** `cp config/config.local.example.php config/config.local.php`, then fill in your DB credentials, `APP_URL` and `MAIL_NOTIFY_TO`.
4. **Install the schema, verified content and admin account:**
   ```bash
   php database/install.php --admin-user=admin --admin-pass='Choose-A-Strong-Passphrase'
   ```
   On shared hosting, import `database/ttt_dcet.sql` through phpMyAdmin instead. Then run the command above once over SSH to create the admin, or insert a row into `admins` with a `password_hash()` value.
5. **Permissions:** the web server must be able to write to `uploads/public/` and `storage/private/`.
6. **Production:** uncomment the HTTPS redirect in `.htaccess` and keep `APP_ENV=production`.

**XAMPP (Windows):** put the folder at `C:\xampp\htdocs\ttt-dcet-website` (not nested inside another folder). Import `database/ttt_dcet.sql` into a `ttt_dcet` database in phpMyAdmin, then open `http://localhost/ttt-dcet-website/`. The sub-folder is detected automatically, and the default database login is XAMPP's `root` with no password. Create the admin with `C:\xampp\php\php.exe database\install.php --admin-user=admin --admin-pass=...`.

**Local development:**

```bash
php -S 127.0.0.1:8080 index.php
```

The pages also render without a database, using `data/seed.php`. Forms, the admin panel and the student zone need MySQL.

**Nginx** (equivalent of `.htaccess`):

```nginx
location ~ ^/(app|config|data|database|templates|pages|handlers|storage)(/|$) { deny all; }
location ~ /\. { deny all; }
location ~ ^/uploads/.*\.(php|phtml|phar|html?|svg)$ { deny all; }
location ~* \.(webp|png|jpe?g|svg|ico|woff2?|css|js)$ { expires 1y; add_header Cache-Control "public, immutable"; try_files $uri =404; }
location / { try_files $uri /index.php?$query_string; }
location ~ \.php$ { include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; fastcgi_pass unix:/run/php/php8.3-fpm.sock; }
```

**CDN:** set `ASSET_URL` to serve `/assets` from a CDN origin. Asset URLs include a content-hash query string, so you can cache them as immutable.

## Security measures

- All SQL uses PDO prepared statements (native, not emulated).
- All output is HTML-escaped through `e()`.
- CSRF tokens protect every POST: public forms, admin and student.
- Passwords use `password_hash` with automatic rehash, the session ID is regenerated on login, and sessions time out after 2 hours of inactivity.
- Logins are throttled: 5 failures per 15 minutes per IP and username, for both admins and students.
- Enquiries go through server-side validation (Indian mobile, email, whitelisted course, demo-date range), a honeypot field and a per-IP hourly rate limit.
- Uploads are checked by content (`finfo`), images are re-encoded to WebP to strip payloads, and only PDFs are accepted for materials. Students-only PDFs go to `storage/private/` and are streamed only after login.
- Session cookies are HttpOnly, SameSite=Lax and Secure on HTTPS. The site also sends HSTS, a Content-Security-Policy, X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy headers.
- The CSV export neutralises spreadsheet formula injection.
- Internal folders are blocked at the web-server level.

## Content provenance and editorial rules

- **Results 2023–2026** (rank bands up to Top 2000) were read from T.T.T’s official result posters. **2022** (State 8th rank, 14 under rank 100, 69 under rank 500) comes from T.T.T’s published figures. Categories that were not published are shown as “—”, not estimated.
- **Toppers and the rank holders wall** were transcribed from the 2023–2026 posters. Portraits are cropped from the same posters or taken from the existing site.
- **Testimonials** are the existing published quotes, attributed to the student’s real name and result. **Videos** are T.T.T’s own YouTube videos.
- **Course details, batch timings, features, prizes, branches, faculty and management** come from the existing pages. Pratigna and Pragathi did not publish exact clock times, so the site says that timings are confirmed at counselling.
- **College cutoffs** are DCET 2026 Round-1 (General / Rest of Karnataka) figures from T.T.T’s cutoff portal. College fees and packages come from T.T.T’s “Top 50 Engineering Colleges” guide.
- **Syllabus focus areas** are indicative, and the page tells students to verify them against the official KEA syllabus.
- The admin panel reminds editors to publish only verified achievements and genuine testimonials.

## Admin quick guide

- **Enquiries:** filter by status or type, update the status and add notes, WhatsApp the student, and export to CSV.
- **Students:** create logins (a one-time temporary password is shown), reset passwords and disable access.
- **Content:** courses, toppers, yearly results, the rank holders wall, college admissions, testimonials, videos, faculty, gallery, study materials, syllabus, FAQs and branches. Toggle visibility and set the sort order.
- **Settings:** phone and WhatsApp numbers, email, the admission year label, cash prizes, social and app links. You can also set an optional **hero background video** (MP4 URL). Without one, the hero uses a cinematic slideshow of real classroom photos, because the old site had no classroom video file.

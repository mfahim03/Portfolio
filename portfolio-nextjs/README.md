# Muhammad Fahim — Portfolio

A full-stack personal portfolio built with Next.js 16, React 19 and Firebase. The public site reads portfolio content from Cloud Firestore. The private admin area uses Firebase Authentication and provides CRUD controls for the portfolio collections.

## Contents

- [Technology](#technology)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Configure Firebase](#configure-firebase)
- [Seed portfolio data](#seed-portfolio-data)
- [Use the admin area](#use-the-admin-area)
- [Manage project images](#manage-project-images)
- [API routes](#api-routes)
- [Checks and deployment](#checks-and-deployment)

## Technology

- **Frontend:** Next.js App Router, React, JavaScript, CSS
- **Backend:** Next.js server components and route handlers, organized with an MVC-inspired model/controller structure
- **Database:** Cloud Firestore
- **Authentication:** Firebase Authentication (email and password)
- **Image storage:** Firebase Storage for uploads, with an optional code-managed image approach using `public/`

## Project structure

```text
portfolio-nextjs/
├── app/                          # Next.js pages, layouts, styles and API routes
│   ├── admin/                    # Admin sign-in and content management UI
│   ├── api/                      # Server endpoints for records, uploads and auth
│   ├── works/                    # Featured project browser and project gallery UI
│   ├── globals.css               # Site styles and responsive layouts
│   ├── layout.js                 # Root layout and metadata
│   ├── page.js                   # Public portfolio home page
│   ├── tech-icon.js              # Technology and social icons
│   └── theme-toggle.js           # Light/dark theme control
├── controllers/
│   └── portfolio-controller.js   # Request validation, auth checks and responses
├── lib/
│   ├── admin-auth.js             # Firebase sign-in, verification and admin session
│   ├── portfolio-content.js      # Initial portfolio records for seeding/fallback
│   └── project-media.js          # Optional code-managed portraits and screenshots
├── models/
│   └── portfolio-model.js        # Firestore reads/writes and record validation
├── public/                       # Static images served from the site root
├── scripts/
│   └── seed-firestore.mjs        # Adds missing initial records to Firestore
├── .env.example                  # Environment variable template (no credentials)
├── eslint.config.mjs             # ESLint configuration
├── firebase.json                 # Firebase CLI configuration
├── firestore.rules               # Firestore client access rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and npm scripts
└── README.md
```

### MVC-inspired request flow

The App Router page or API route receives the request. API route handlers delegate to `controllers/portfolio-controller.js`, which checks admin access for changes and formats responses. The controller calls `models/portfolio-model.js` for Firestore operations. The model owns collection names, supported fields, validation and persistence.

## Run locally

Use Node.js 22 or newer and npm. From this folder:

```powershell
npm install
Copy-Item .env.example .env.local
```

Fill in `.env.local` as described in [Configure Firebase](#configure-firebase), then start the development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the portfolio and [http://localhost:3000/admin](http://localhost:3000/admin) for admin sign-in.

Available npm scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build (run `npm run build` first) |
| `npm run lint` | Run ESLint |
| `npm run seed` | Add initial records that are missing from Firestore |

## Configure Firebase

1. In the Firebase Console, select or create the Firebase project. Enable **Cloud Firestore** and **Email/Password** under **Authentication → Sign-in method**.
2. Add the admin account under **Authentication → Users**. Verify that account’s email before signing in. The verified email must exactly match `ADMIN_EMAIL` (email comparison is case-insensitive).
3. In **Project settings → General**, copy the **Web API key**. In the project settings, also note the Firebase project ID.
4. Create a service account key with access to Firestore and Cloud Storage. Use its `project_id`, `client_email` and `private_key` values for the matching settings below. Keep the private key secret.
5. If you want to upload images through the admin page, enable Firebase Storage and use the bucket name shown by Firebase.
6. Copy `.env.example` to `.env.local` and provide these values:

   | Variable | Value |
   | --- | --- |
   | `FIREBASE_PROJECT_ID` | Project ID for the same Firebase project |
   | `FIREBASE_API_KEY` | Firebase Web API key for Authentication |
   | `FIREBASE_STORAGE_BUCKET` | Storage bucket name; required for admin image uploads |
   | `FIREBASE_CLIENT_EMAIL` | Service account `client_email` |
   | `FIREBASE_PRIVATE_KEY` | Service account `private_key`; preserve newlines as `\n` if placing it on one line |
   | `ADMIN_EMAIL` | Full email address of the verified admin account |

   `.env.local` is ignored by Git. Never commit it or share the service account private key. Restart the development server after changing environment variables.

7. From this project folder, deploy the included rules if you use the Firebase CLI and are logged into the correct project:

   ```powershell
   firebase deploy --only firestore:rules
   ```

   The rules deny direct browser access. The server uses the service account to read and write Firestore; admin write routes separately verify the authenticated, verified email against `ADMIN_EMAIL`.

The app uses these Firestore collections: `education`, `work_experience`, `certifications`, `tech_categories`, `tech_items`, and `projects`. It also stores the profile portrait URL in `site_settings/portfolio` when the portrait is uploaded through the admin area.

## Seed portfolio data

After `.env.local` has valid Firestore service-account settings, run:

```powershell
npm run seed
```

The script reads starter content from `lib/portfolio-content.js`. It adds only starter documents whose IDs are not already present, so rerunning it does not overwrite existing records. It does not remove or update records.

If npm reports `Missing script: "seed"`, make sure the terminal is in the `portfolio-nextjs` folder and that `package.json` contains the `seed` script. Run `npm run` to list the scripts npm sees.

## Use the admin area

1. Open `/admin` and enter the verified email configured as `ADMIN_EMAIL` plus its Firebase Authentication password.
2. Use the collection menu to manage education, work experience, certifications, tech categories, tech items and projects. Each collection has create, edit and delete controls; the public lists are ordered by `sort_order`.
3. Manage the profile photo from **Profile photo**. Uploading a photo needs Firebase Storage configured. Alternatively, use a code-managed portrait as described below.
4. Sign out when finished.

Only authenticated requests for the configured verified admin email can create, update or delete records. Public portfolio reads do not require a visitor to sign in.

## Manage project images

### Upload through the admin area

Open a project record, choose one or more screenshots and save. Images are uploaded to Firebase Storage and their download URLs are saved in the project record. Mobile projects render in phone frames; other project types render in browser-style frames.

### Keep images in the codebase

Place files in `public/` (or a subfolder such as `public/projects/`). For example, `public/projects/my-app-1.png` is served at `/projects/my-app-1.png`. Then map the Firestore project document ID to the image paths in `lib/project-media.js`:

```js
export const codeProjectImages = {
  "YOUR_FIRESTORE_PROJECT_ID": [
    "/projects/my-app-1.png",
    "/projects/my-app-2.png",
  ],
};
```

The paths are listed in gallery order. A mapping for a project takes precedence over that project’s Firestore `image_urls`. Remove the mapping if you want the saved Firestore URLs to display again.

For the profile portrait, add `public/profile.jpg` and set `codeProfilePortrait` in `lib/project-media.js` to `"/profile.jpg"`. The current code-managed portrait path takes precedence over the portrait URL saved by the admin tool. Set it to an empty string (`""`) to use the saved URL instead.

## API routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/{resource}` | `GET`, `POST` | List records; create a record (admin required) |
| `/api/{resource}/{id}` | `GET`, `PATCH`, `DELETE` | Read, update or delete a record; changes require admin |
| `/api/admin/session` | `POST`, `DELETE` | Sign in and end the admin session |
| `/api/admin/verification-email` | `POST` | Request a Firebase verification email |
| `/api/admin/upload` | `POST` | Upload a project or profile image to Firebase Storage |
| `/api/admin/portrait` | `GET`, `PUT` | Read or update the saved profile portrait URL |

The `{resource}` path uses `work-experience`, `tech-categories` and `tech-items` for the Firestore collections `work_experience`, `tech_categories` and `tech_items` respectively. Other resource names match their collection names.

## Checks and deployment

Run ESLint and create a production build before deploying:

```powershell
npm run lint
npm run build
```

Deploy the project folder as the Next.js app root. Configure the same environment variables from `.env.local` in the hosting provider’s server environment. Keep service-account credentials private, and set `ADMIN_EMAIL` to the verified admin account you intend to use.

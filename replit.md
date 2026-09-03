# Cash Register Reconciliation Application

## Overview

A professional web application designed for accurate daily cash register reconciliation and sales tracking. The system enables employees to systematically count cash denominations, record sales data, and compare physical cash counts against expected totals. It features automated discrepancy detection (including both cash AND checks), digital record keeping, comprehensive reporting capabilities (PDF and Excel exports), Google Sheets cloud submission, and edit prevention after final submission. Built with a focus on error prevention, financial accuracy, and audit-ready documentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, built using Vite for development and production bundling.

**UI Framework**: Utilizes shadcn/ui component library (New York style variant) built on Radix UI primitives, providing accessible and customizable components. The design follows Fluent Design System principles emphasizing clarity, efficiency, and professional reliability for business applications.

**Styling**: TailwindCSS with custom design tokens for theming. Supports both light and dark modes with extensive color customization through CSS variables. Typography uses Segoe UI font family for consistency with Microsoft design language.

**State Management**: React Query (@tanstack/react-query) for server state management with configured query client for data fetching, caching, and synchronization. Local component state managed via React hooks.

**Routing**: wouter library for lightweight client-side routing. Routes include landing page (unauthenticated), dashboard (authenticated), and admin panel.

**Form Handling**: React Hook Form with Zod validation (@hookform/resolvers) for type-safe form validation and error handling.

**Key Components**:
- Multi-step reconciliation workflow: Sales entry → Cash counting (with checks) → Results display
- Sales entry form: Cash sales and check sales input with read-only starting cash (from settings)
- Denomination input system displaying smallest to largest with automatic calculation
- Check entry component: Dynamic entry system (starts with 1 check, add up to 3 with plus button, submit button located under checks)
- Reconciliation results: Displays expected deposit vs actual deposit (both including cash + checks), discrepancy calculation, and final submission to Google Sheets
- Back navigation: Buttons between all workflow steps with edit prevention after final submission
- Settings dialog: Configurable starting cash, tolerance, manager approval requirements, and Google Sheets ID
- Validation: Check sales amount must match sum of individual checks entered

### Backend Architecture

**Server Framework**: Express.js on Node.js with TypeScript, serving both API endpoints and static assets.

**API Design**: RESTful API architecture with the following endpoints:
- `/api/auth/*` - Authentication and user management
- `/api/settings` - System configuration (starting cash, tolerance, approval requirements, Google Sheets ID)
- `/api/reconciliations` - Create and retrieve reconciliation records
- `/api/reconciliations/:id/submit` - Submit reconciliation to Google Sheets (POST)
- `/api/reports/*` - Generate PDF and Excel reports

**Authentication**: PIN-based login. Employees pick their name from a list and enter a 4-5 digit PIN (bcrypt-hashed at rest) that acts as their digital signature; the login endpoint is rate-limited per IP. Session-based authentication with PostgreSQL session store (connect-pg-simple). Sessions configured with 7-day TTL and secure HTTP-only cookies. A `role` field ('employee' | 'manager' | 'admin') gates the admin panel and its APIs.

**Database ORM**: Drizzle ORM with the standard `pg` (node-postgres) driver, compatible with any Postgres host (Azure Database for PostgreSQL, Neon, etc.). Schema-first approach with TypeScript type generation. Migrations managed via drizzle-kit.

**Report Generation**: 
- PDF reports using jsPDF library (named import for version 3.x compatibility)
- Excel exports using XLSX library
- Both formats include detailed cash breakdowns, denomination counts, and reconciliation metadata

**Google Sheets Integration**: 
- Uses google-spreadsheet package with service account authentication
- Submits reconciliation data to configured Google Sheet
- Prevents duplicate submissions via isSubmitted flag
- Edit prevention: Users cannot navigate back or modify data after final submission

**Middleware**: Express middleware for JSON parsing, URL encoding, request logging with response time tracking, and error handling with appropriate status codes.

### Data Storage

**Database**: PostgreSQL (any standard host — Azure Database for PostgreSQL in production)

**Schema Design**:

1. **employees** table: Stores employee login records
   - Fields: id (UUID), name, pinHash (bcrypt), role, active, timestamps
   - Role determines access to the admin panel and its APIs

2. **sessions** table: Manages authenticated user sessions
   - Fields: sid (primary key), sess (JSONB), expire (timestamp)
   - Indexed on expiration for efficient cleanup

3. **settings** table: Global application configuration
   - Fields: startingCash (decimal), tolerance (decimal), requireManagerApproval (boolean), googleSheetId (text)
   - Single-row configuration pattern

4. **reconciliations** table: Core business data storing cash reconciliation records
   - User identification: userId, userName, userEmail
   - Sales data: cashSales, checkSales, cashOut, startingCash (fetched from settings)
   - Check details: Support for up to 3 checks with check1Date, check1Number, check1Name, check1Amount (and check2/check3 equivalents)
   - Denomination counts: Individual fields for all coin and bill denominations ordered from smallest to largest (pennies, nickels, dimes, quarters, ones, fives, tens, twenties, fifties, hundreds)
   - Calculated fields: cashCount, expectedCash, difference, status
   - Submission tracking: isSubmitted (boolean), submittedAt (timestamp)
   - Metadata: notes, createdAt timestamp
   - Status values: 'matched', 'within_tolerance', 'discrepancy', 'requires_approval'
   - Discrepancy calculation: expectedDeposit = startingCash + cashSales + checkSales - cashOut; actualDeposit = cashCount + totalChecks; difference = actualDeposit - expectedDeposit

**Data Validation**: Zod schemas (drizzle-zod integration) ensure type safety and validation at database boundary. Decimal precision set to 10 digits with 2 decimal places for all monetary values.

**Storage**: DatabaseStorage is the sole runtime implementation, backed by Postgres via Drizzle — there is no in-memory fallback, so `DATABASE_URL` is required to run the app at all (including locally).

### Authentication & Authorization

**Provider**: Self-hosted PIN login (no external identity provider)

**Flow**: 
1. Unauthenticated users see a landing page; "Employee Login" opens a picker of active employee names
2. Employee selects their name and enters their PIN on a numeric keypad
3. Server verifies the PIN against the bcrypt hash and creates a server-side session
4. Session cookie enables authenticated API access

**Session Management**: 
- Server-side sessions stored in PostgreSQL
- 7-day expiration with automatic renewal
- Secure, HTTP-only cookies prevent XSS attacks
- Session secret configured via environment variable

**Authorization**: `isAuthenticated` middleware loads the employee fresh from the DB on every request (so deactivating an employee revokes access immediately). `requireRole(['admin','manager'])` gates employee management, settings writes, and the all-history reports/reconciliations endpoints. Plain employees can only read/export their own reconciliations.

**Bootstrapping the first admin**: since employees can only be created from the admin panel, and the admin panel requires an admin to log in, run `npm run seed:admin -- "Full Name" <PIN>` once against the target database to create the first admin account.

### External Dependencies

**Third-Party Services**:
1. **Postgres**: Any standard Postgres host works; requires the `DATABASE_URL` environment variable
2. **Google Sheets API**: Cloud data submission using service account authentication (requires `GOOGLE_SERVICE_ACCOUNT_EMAIL`/`GOOGLE_PRIVATE_KEY` and a sheet ID configured in Settings)

**Key NPM Packages**:
- **UI Components**: @radix-ui/* (accordion, dialog, dropdown, popover, toast, alert, etc.)
- **State Management**: @tanstack/react-query
- **Database**: @neondatabase/serverless, drizzle-orm, drizzle-zod
- **Authentication**: openid-client, passport, express-session
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Forms**: react-hook-form, zod
- **Date Handling**: date-fns
- **Reporting**: jspdf, xlsx
- **Google Sheets**: google-spreadsheet, google-auth-library
- **Development**: vite, typescript, @replit/vite-plugin-* (development tools)

**Build & Deployment**:
- Development: Vite dev server with HMR and custom middleware mode
- Production: Vite builds client bundle to dist/public, esbuild bundles server to dist/index.js
- Environment: Requires NODE_ENV, DATABASE_URL, SESSION_SECRET, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY (see .env.example)
- Target host: Azure App Service (Node.js), database on Azure Database for PostgreSQL
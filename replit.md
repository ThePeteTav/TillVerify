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

**Authentication**: OpenID Connect (OIDC) integration with Replit authentication service using Passport.js strategy. Session-based authentication with PostgreSQL session store (connect-pg-simple). Sessions configured with 7-day TTL and secure HTTP-only cookies.

**Database ORM**: Drizzle ORM with Neon serverless PostgreSQL driver. Schema-first approach with TypeScript type generation. Migrations managed via drizzle-kit.

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

**Database**: PostgreSQL (Neon serverless)

**Schema Design**:

1. **users** table: Stores user profiles with OIDC integration
   - Fields: id (UUID), email, firstName, lastName, profileImageUrl, timestamps
   - Authentication data linked via OIDC subject identifier

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

**In-Memory Fallback**: MemStorage class provides development/testing environment without requiring database provisioning. Implements same IStorage interface for consistency.

### Authentication & Authorization

**Provider**: Replit OIDC (OpenID Connect) authentication service

**Flow**: 
1. Unauthenticated users see landing page with login button
2. Login redirects to Replit OIDC provider
3. Successful authentication creates server-side session
4. User profile synced to local database on first login
5. Session cookie enables authenticated API access

**Session Management**: 
- Server-side sessions stored in PostgreSQL
- 7-day expiration with automatic renewal
- Secure, HTTP-only cookies prevent XSS attacks
- Session secret configured via environment variable

**Authorization**: isAuthenticated middleware protects sensitive routes. Current implementation focuses on employee-level access; admin/manager role differentiation present in UI but not enforced at API level.

### External Dependencies

**Third-Party Services**:
1. **Replit Authentication (OIDC)**: Primary authentication provider requiring REPL_ID, ISSUER_URL, and SESSION_SECRET environment variables
2. **Neon PostgreSQL**: Serverless database requiring DATABASE_URL environment variable
3. **Google Sheets API**: Cloud data submission using service account authentication (requires credentials JSON and sheet ID configuration)

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
- Environment: Requires NODE_ENV, DATABASE_URL, REPL_ID, SESSION_SECRET, ISSUER_URL, REPLIT_DOMAINS
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"pin_hash" varchar NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reconciliations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"user_name" text NOT NULL,
	"cash_sales" numeric(10, 2) NOT NULL,
	"check_sales" numeric(10, 2) NOT NULL,
	"cash_out" numeric(10, 2) NOT NULL,
	"starting_cash" numeric(10, 2) NOT NULL,
	"check1_date" text,
	"check1_number" text,
	"check1_name" text,
	"check1_amount" numeric(10, 2) DEFAULT '0.00',
	"check2_date" text,
	"check2_number" text,
	"check2_name" text,
	"check2_amount" numeric(10, 2) DEFAULT '0.00',
	"check3_date" text,
	"check3_number" text,
	"check3_name" text,
	"check3_amount" numeric(10, 2) DEFAULT '0.00',
	"hundreds" integer DEFAULT 0 NOT NULL,
	"fifties" integer DEFAULT 0 NOT NULL,
	"twenties" integer DEFAULT 0 NOT NULL,
	"tens" integer DEFAULT 0 NOT NULL,
	"fives" integer DEFAULT 0 NOT NULL,
	"ones" integer DEFAULT 0 NOT NULL,
	"quarters" integer DEFAULT 0 NOT NULL,
	"dimes" integer DEFAULT 0 NOT NULL,
	"nickels" integer DEFAULT 0 NOT NULL,
	"pennies" integer DEFAULT 0 NOT NULL,
	"cash_count" numeric(10, 2) NOT NULL,
	"expected_cash" numeric(10, 2) NOT NULL,
	"difference" numeric(10, 2) NOT NULL,
	"notes" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"is_submitted" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"starting_cash" numeric(10, 2) DEFAULT '200.00' NOT NULL,
	"tolerance" numeric(10, 2) DEFAULT '5.00' NOT NULL,
	"require_manager_approval" boolean DEFAULT true NOT NULL,
	"google_sheet_id" text,
	"company_logo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
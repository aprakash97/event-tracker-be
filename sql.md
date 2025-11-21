CREATE TABLE "entries" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "habit_id" uuid NOT NULL,
        "completed_date" timestamp DEFAULT now() NOT NULL,
        "note" text,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "habitTags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "habit_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "habits" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text,
        "frequency" varchar(20) NOT NULL,
        "target_count" integer DEFAULT 1,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(50) NOT NULL,
        "color" varchar(7) DEFAULT '#ffffff',
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar(255) NOT NULL,
        "username" varchar(50) NOT NULL,
        "password" varchar(255) NOT NULL,
        "first_name" varchar(50),
        "last_name" varchar(50),
);

ALTER TABLE "entries" ADD CONSTRAINT "entries_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "habitTags" ADD CONSTRAINT "habitTags_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "habitTags" ADD CONSTRAINT "habitTags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
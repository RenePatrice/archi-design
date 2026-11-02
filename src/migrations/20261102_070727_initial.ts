import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('nouvelle', 'contactee', 'confirmee', 'livree', 'annulee');
  CREATE TYPE "public"."enum_orders_service" AS ENUM('architecture', 'peinture', 'calligraphie', 'serigraphie', 'dessin', 'formation', 'boutique', 'prestation', 'simulateur', 'contact');
  CREATE TYPE "public"."enum_orders_company_email_status" AS ENUM('attente', 'envoye', 'echec', 'sansEmail');
  CREATE TYPE "public"."enum_orders_customer_email_status" AS ENUM('attente', 'envoye', 'echec', 'sansEmail');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('nouveau', 'contacte', 'traite');
  CREATE TYPE "public"."enum_contact_messages_preferred_contact" AS ENUM('whatsapp', 'appel', 'email');
  CREATE TYPE "public"."enum_email_templates_service" AS ENUM('architecture', 'peinture', 'calligraphie', 'serigraphie', 'dessin', 'formation', 'boutique', 'prestation', 'simulateur', 'contact');
  CREATE TYPE "public"."enum_client_projects_stages_status" AS ENUM('aVenir', 'enCours', 'termine');
  CREATE TYPE "public"."enum_client_projects_status" AS ENUM('etude', 'enCours', 'pause', 'livre');
  CREATE TYPE "public"."enum_client_files_kind" AS ENUM('photo', 'plan', 'devis', 'facture', 'contrat', 'autre');
  CREATE TYPE "public"."enum_poles_key" AS ENUM('architecture', 'peinture', 'calligraphie', 'serigraphie', 'dessin', 'formation', 'commerce', 'prestation');
  CREATE TYPE "public"."enum_poles_tone" AS ENUM('accent', 'deep', 'creative');
  CREATE TYPE "public"."enum_projects_type" AS ENUM('residentiel', 'commercial', 'institutionnel', 'renovation', 'interieur', 'mobilier', 'decoratif', 'signaletique');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_type" AS ENUM('residentiel', 'commercial', 'institutionnel', 'renovation', 'interieur', 'mobilier', 'decoratif', 'signaletique');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_products_category" AS ENUM('peinture', 'enduit', 'materiel', 'impression');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_category" AS ENUM('peinture', 'enduit', 'materiel', 'impression');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_trainings_level" AS ENUM('debutant', 'intermediaire', 'avance', 'tous');
  CREATE TYPE "public"."enum_training_sessions_status" AS ENUM('ouverte', 'complete', 'annulee');
  CREATE TYPE "public"."enum_users_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'equipe', 'client');
  CREATE TYPE "public"."enum_site_settings_socials_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'tiktok', 'youtube');
  CREATE TYPE "public"."enum_impact_page_figures_axis" AS ENUM('emploi', 'formation', 'durable', 'territoire');
  CREATE TYPE "public"."enum_print_pricing_supports_key" AS ENUM('textile', 'affiche', 'bache', 'carte', 'autocollant', 'cachet');
  CREATE TYPE "public"."enum_print_pricing_supports_pricing" AS ENUM('unit', 'area');
  CREATE TYPE "public"."enum_simulator_pricing_types_key" AS ENUM('villa', 'immeuble', 'commerce', 'bureaux', 'renovation', 'interieur');
  CREATE TYPE "public"."enum_simulator_pricing_zones_key" AS ENUM('conakry', 'interieur', 'sousRegion');
  CREATE TABLE "orders_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "orders_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"reference" varchar,
  	"name" varchar,
  	"quantity" numeric,
  	"unit_price" numeric,
  	"subtotal" numeric
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'nouvelle' NOT NULL,
  	"service" "enum_orders_service" NOT NULL,
  	"pole_id" integer,
  	"internal_notes" varchar,
  	"customer_name" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"customer_email" varchar,
  	"customer_city" varchar,
  	"customer_address" varchar,
  	"preferred_contact" varchar,
  	"reception_mode" varchar,
  	"payment_mode" varchar,
  	"message" varchar,
  	"locale" varchar,
  	"consent" boolean,
  	"estimated_total" numeric,
  	"session_id" integer,
  	"company_email_status" "enum_orders_company_email_status" DEFAULT 'attente',
  	"customer_email_status" "enum_orders_customer_email_status" DEFAULT 'attente',
  	"email_attempts" numeric DEFAULT 0,
  	"email_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"order_files_id" integer
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_contact_messages_status" DEFAULT 'nouveau',
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"city" varchar,
  	"preferred_contact" "enum_contact_messages_preferred_contact",
  	"pole_id" integer,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"locale" varchar,
  	"source_page" varchar,
  	"consent" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "order_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT 'prive/demandes',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "email_templates_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "email_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"service" "enum_email_templates_service" NOT NULL,
  	"subject" varchar NOT NULL,
  	"intro" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_templates_locales" (
  	"ack_subject" varchar NOT NULL,
  	"ack_intro" varchar NOT NULL,
  	"ack_delay" varchar,
  	"ack_outro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "client_projects_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_client_projects_stages_status" DEFAULT 'aVenir',
  	"date" timestamp(3) with time zone,
  	"note" varchar
  );
  
  CREATE TABLE "client_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_client_projects_status" DEFAULT 'enCours',
  	"progress" numeric DEFAULT 0,
  	"location" varchar,
  	"start_date" timestamp(3) with time zone,
  	"expected_end_date" timestamp(3) with time zone,
  	"manager_id" integer,
  	"order_id" integer,
  	"project_id" integer,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "client_projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "project_updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_project_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"text" varchar NOT NULL,
  	"notify_client" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_updates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"client_files_id" integer
  );
  
  CREATE TABLE "client_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"client_project_id" integer NOT NULL,
  	"kind" "enum_client_files_kind" DEFAULT 'photo' NOT NULL,
  	"visible_to_client" boolean DEFAULT true,
  	"notify_client" boolean DEFAULT false,
  	"prefix" varchar DEFAULT 'prive/clients',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "project_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_project_id" integer NOT NULL,
  	"body" varchar NOT NULL,
  	"excerpt" varchar,
  	"author_id" integer,
  	"from_staff" boolean,
  	"read_by_client" boolean DEFAULT false,
  	"read_by_staff" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "poles_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "poles_services_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "poles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"key" "enum_poles_key" NOT NULL,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"has_service_page" boolean DEFAULT true,
  	"tone" "enum_poles_tone" DEFAULT 'accent',
  	"image_id" integer,
  	"reception_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "poles_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"description" jsonb,
  	"pack" varchar,
  	"whatsapp_message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_materials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_materials_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"pole_id" integer,
  	"type" "enum_projects_type",
  	"city" varchar,
  	"country" varchar DEFAULT 'Guinée',
  	"year" numeric,
  	"surface" numeric,
  	"latitude" numeric,
  	"longitude" numeric,
  	"cover_image_id" integer,
  	"model_id" integer,
  	"before_image_id" integer,
  	"after_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"client_quote" varchar,
  	"duration" varchar,
  	"budget_range" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_materials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_materials_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_pole_id" integer,
  	"version_type" "enum__projects_v_version_type",
  	"version_city" varchar,
  	"version_country" varchar DEFAULT 'Guinée',
  	"version_year" numeric,
  	"version_surface" numeric,
  	"version_latitude" numeric,
  	"version_longitude" numeric,
  	"version_cover_image_id" integer,
  	"version_model_id" integer,
  	"version_before_image_id" integer,
  	"version_after_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_client_quote" varchar,
  	"version_duration" varchar,
  	"version_budget_range" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar NOT NULL,
  	"pole_id" integer,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar NOT NULL,
  	"context" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_members_locales" (
  	"role" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"url" varchar,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"show_in_footer" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"poster_id" integer,
  	"camera_orbit" varchar DEFAULT '35deg 70deg auto',
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "models_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"reference" varchar,
  	"category" "enum_products_category",
  	"price" numeric,
  	"stock" numeric DEFAULT 0,
  	"color_hex" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"name" varchar,
  	"unit" varchar,
  	"summary" varchar,
  	"technical_sheet" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_reference" varchar,
  	"version_category" "enum__products_v_version_category",
  	"version_price" numeric,
  	"version_stock" numeric DEFAULT 0,
  	"version_color_hex" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_name" varchar,
  	"version_unit" varchar,
  	"version_summary" varchar,
  	"version_technical_sheet" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "trainings_program" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "trainings_program_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "trainings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"price" numeric,
  	"level" "enum_trainings_level" DEFAULT 'debutant',
  	"trainer" varchar,
  	"certificate" boolean DEFAULT true,
  	"image_id" integer,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trainings_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"duration" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "training_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"training_id" integer NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"location" varchar DEFAULT 'Conakry',
  	"seats" numeric DEFAULT 15,
  	"status" "enum_training_sessions_status" DEFAULT 'ouverte',
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"locale" "enum_users_locale" DEFAULT 'fr',
  	"role" "enum_users_role" DEFAULT 'client' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"orders_id" integer,
  	"contact_messages_id" integer,
  	"order_files_id" integer,
  	"email_templates_id" integer,
  	"client_projects_id" integer,
  	"project_updates_id" integer,
  	"client_files_id" integer,
  	"project_messages_id" integer,
  	"poles_id" integer,
  	"projects_id" integer,
  	"testimonials_id" integer,
  	"team_members_id" integer,
  	"partners_id" integer,
  	"pages_id" integer,
  	"media_id" integer,
  	"models_id" integer,
  	"products_id" integer,
  	"trainings_id" integer,
  	"training_sessions_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_socials_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar DEFAULT 'ARCHI-DESIGN Guinée SARL' NOT NULL,
  	"whatsapp_number" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"default_inbox" varchar,
  	"address" varchar DEFAULT 'Conakry, Guinée',
  	"latitude" numeric,
  	"longitude" numeric,
  	"rccm" varchar,
  	"nif" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"tagline" varchar DEFAULT 'Construire mieux avec les ressources et les réalités de notre territoire.',
  	"opening_hours" varchar DEFAULT 'Lundi – samedi, 8 h 30 – 18 h',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "key_figures_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric NOT NULL,
  	"suffix" varchar
  );
  
  CREATE TABLE "key_figures_figures_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "key_figures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_page_values_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_history_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_commitments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_page_commitments_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"intro" varchar,
  	"vision" varchar,
  	"mission" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "impact_page_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric NOT NULL,
  	"suffix" varchar,
  	"axis" "enum_impact_page_figures_axis" DEFAULT 'emploi'
  );
  
  CREATE TABLE "impact_page_figures_locales" (
  	"label" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "impact_page_stories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "impact_page_stories_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "impact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "impact_page_locales" (
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "print_pricing_supports_discounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from_quantity" numeric NOT NULL,
  	"percent" numeric NOT NULL
  );
  
  CREATE TABLE "print_pricing_supports" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_print_pricing_supports_key" NOT NULL,
  	"pricing" "enum_print_pricing_supports_pricing" DEFAULT 'unit' NOT NULL,
  	"price" numeric NOT NULL,
  	"min_quantity" numeric DEFAULT 1,
  	"setup_fee" numeric DEFAULT 0
  );
  
  CREATE TABLE "print_pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "simulator_pricing_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_simulator_pricing_types_key" NOT NULL,
  	"economique_min" numeric NOT NULL,
  	"economique_max" numeric NOT NULL,
  	"standard_min" numeric NOT NULL,
  	"standard_max" numeric NOT NULL,
  	"haut_de_gamme_min" numeric NOT NULL,
  	"haut_de_gamme_max" numeric NOT NULL,
  	"base_months" numeric NOT NULL,
  	"months_per100m2" numeric NOT NULL,
  	"min_surface" numeric DEFAULT 10,
  	"max_surface" numeric DEFAULT 5000
  );
  
  CREATE TABLE "simulator_pricing_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_simulator_pricing_zones_key" NOT NULL,
  	"coefficient" numeric DEFAULT 1 NOT NULL,
  	"extra_months" numeric DEFAULT 0
  );
  
  CREATE TABLE "simulator_pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders_details" ADD CONSTRAINT "orders_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_pole_id_poles_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."poles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_order_files_fk" FOREIGN KEY ("order_files_id") REFERENCES "public"."order_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_pole_id_poles_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."poles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_templates_recipients" ADD CONSTRAINT "email_templates_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_templates_locales" ADD CONSTRAINT "email_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "client_projects_stages" ADD CONSTRAINT "client_projects_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "client_projects_rels" ADD CONSTRAINT "client_projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "client_projects_rels" ADD CONSTRAINT "client_projects_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_client_project_id_client_projects_id_fk" FOREIGN KEY ("client_project_id") REFERENCES "public"."client_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_updates_rels" ADD CONSTRAINT "project_updates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_updates_rels" ADD CONSTRAINT "project_updates_rels_client_files_fk" FOREIGN KEY ("client_files_id") REFERENCES "public"."client_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "client_files" ADD CONSTRAINT "client_files_client_project_id_client_projects_id_fk" FOREIGN KEY ("client_project_id") REFERENCES "public"."client_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_messages" ADD CONSTRAINT "project_messages_client_project_id_client_projects_id_fk" FOREIGN KEY ("client_project_id") REFERENCES "public"."client_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_messages" ADD CONSTRAINT "project_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "poles_services" ADD CONSTRAINT "poles_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."poles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "poles_services_locales" ADD CONSTRAINT "poles_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."poles_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "poles" ADD CONSTRAINT "poles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "poles_locales" ADD CONSTRAINT "poles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."poles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_materials" ADD CONSTRAINT "projects_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_materials_locales" ADD CONSTRAINT "projects_materials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_pole_id_poles_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."poles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_before_image_id_media_id_fk" FOREIGN KEY ("before_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_after_image_id_media_id_fk" FOREIGN KEY ("after_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_materials" ADD CONSTRAINT "_projects_v_version_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_materials_locales" ADD CONSTRAINT "_projects_v_version_materials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_pole_id_poles_id_fk" FOREIGN KEY ("version_pole_id") REFERENCES "public"."poles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_model_id_models_id_fk" FOREIGN KEY ("version_model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_before_image_id_media_id_fk" FOREIGN KEY ("version_before_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_after_image_id_media_id_fk" FOREIGN KEY ("version_after_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_pole_id_poles_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."poles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_locales" ADD CONSTRAINT "team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "models" ADD CONSTRAINT "models_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "models_locales" ADD CONSTRAINT "models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trainings_program" ADD CONSTRAINT "trainings_program_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trainings_program_locales" ADD CONSTRAINT "trainings_program_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trainings_program"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trainings" ADD CONSTRAINT "trainings_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trainings_locales" ADD CONSTRAINT "trainings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_order_files_fk" FOREIGN KEY ("order_files_id") REFERENCES "public"."order_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk" FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_client_projects_fk" FOREIGN KEY ("client_projects_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_updates_fk" FOREIGN KEY ("project_updates_id") REFERENCES "public"."project_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_client_files_fk" FOREIGN KEY ("client_files_id") REFERENCES "public"."client_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_messages_fk" FOREIGN KEY ("project_messages_id") REFERENCES "public"."project_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_poles_fk" FOREIGN KEY ("poles_id") REFERENCES "public"."poles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_models_fk" FOREIGN KEY ("models_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trainings_fk" FOREIGN KEY ("trainings_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_training_sessions_fk" FOREIGN KEY ("training_sessions_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_socials" ADD CONSTRAINT "site_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "key_figures_figures" ADD CONSTRAINT "key_figures_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."key_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "key_figures_figures_locales" ADD CONSTRAINT "key_figures_figures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."key_figures_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values" ADD CONSTRAINT "about_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values_locales" ADD CONSTRAINT "about_page_values_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_history" ADD CONSTRAINT "about_page_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_history_locales" ADD CONSTRAINT "about_page_history_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_commitments" ADD CONSTRAINT "about_page_commitments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_commitments_locales" ADD CONSTRAINT "about_page_commitments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_commitments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_figures" ADD CONSTRAINT "impact_page_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_figures_locales" ADD CONSTRAINT "impact_page_figures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_stories" ADD CONSTRAINT "impact_page_stories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impact_page_stories" ADD CONSTRAINT "impact_page_stories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_stories_locales" ADD CONSTRAINT "impact_page_stories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_locales" ADD CONSTRAINT "impact_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "print_pricing_supports_discounts" ADD CONSTRAINT "print_pricing_supports_discounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."print_pricing_supports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "print_pricing_supports" ADD CONSTRAINT "print_pricing_supports_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."print_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "simulator_pricing_types" ADD CONSTRAINT "simulator_pricing_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."simulator_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "simulator_pricing_zones" ADD CONSTRAINT "simulator_pricing_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."simulator_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_details_order_idx" ON "orders_details" USING btree ("_order");
  CREATE INDEX "orders_details_parent_id_idx" ON "orders_details" USING btree ("_parent_id");
  CREATE INDEX "orders_lines_order_idx" ON "orders_lines" USING btree ("_order");
  CREATE INDEX "orders_lines_parent_id_idx" ON "orders_lines" USING btree ("_parent_id");
  CREATE INDEX "orders_lines_product_idx" ON "orders_lines" USING btree ("product_id");
  CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("number");
  CREATE INDEX "orders_pole_idx" ON "orders" USING btree ("pole_id");
  CREATE INDEX "orders_session_idx" ON "orders" USING btree ("session_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "orders_rels_order_idx" ON "orders_rels" USING btree ("order");
  CREATE INDEX "orders_rels_parent_idx" ON "orders_rels" USING btree ("parent_id");
  CREATE INDEX "orders_rels_path_idx" ON "orders_rels" USING btree ("path");
  CREATE INDEX "orders_rels_order_files_id_idx" ON "orders_rels" USING btree ("order_files_id");
  CREATE INDEX "contact_messages_pole_idx" ON "contact_messages" USING btree ("pole_id");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "order_files_updated_at_idx" ON "order_files" USING btree ("updated_at");
  CREATE INDEX "order_files_created_at_idx" ON "order_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "order_files_filename_idx" ON "order_files" USING btree ("filename");
  CREATE INDEX "email_templates_recipients_order_idx" ON "email_templates_recipients" USING btree ("_order");
  CREATE INDEX "email_templates_recipients_parent_id_idx" ON "email_templates_recipients" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "email_templates_service_idx" ON "email_templates" USING btree ("service");
  CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");
  CREATE INDEX "email_templates_created_at_idx" ON "email_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "email_templates_locales_locale_parent_id_unique" ON "email_templates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "email_templates_locales_parent_id_idx" ON "email_templates_locales" USING btree ("_parent_id");
  CREATE INDEX "client_projects_stages_order_idx" ON "client_projects_stages" USING btree ("_order");
  CREATE INDEX "client_projects_stages_parent_id_idx" ON "client_projects_stages" USING btree ("_parent_id");
  CREATE INDEX "client_projects_manager_idx" ON "client_projects" USING btree ("manager_id");
  CREATE INDEX "client_projects_order_idx" ON "client_projects" USING btree ("order_id");
  CREATE INDEX "client_projects_project_idx" ON "client_projects" USING btree ("project_id");
  CREATE INDEX "client_projects_updated_at_idx" ON "client_projects" USING btree ("updated_at");
  CREATE INDEX "client_projects_created_at_idx" ON "client_projects" USING btree ("created_at");
  CREATE INDEX "client_projects_rels_order_idx" ON "client_projects_rels" USING btree ("order");
  CREATE INDEX "client_projects_rels_parent_idx" ON "client_projects_rels" USING btree ("parent_id");
  CREATE INDEX "client_projects_rels_path_idx" ON "client_projects_rels" USING btree ("path");
  CREATE INDEX "client_projects_rels_users_id_idx" ON "client_projects_rels" USING btree ("users_id");
  CREATE INDEX "project_updates_client_project_idx" ON "project_updates" USING btree ("client_project_id");
  CREATE INDEX "project_updates_updated_at_idx" ON "project_updates" USING btree ("updated_at");
  CREATE INDEX "project_updates_created_at_idx" ON "project_updates" USING btree ("created_at");
  CREATE INDEX "project_updates_rels_order_idx" ON "project_updates_rels" USING btree ("order");
  CREATE INDEX "project_updates_rels_parent_idx" ON "project_updates_rels" USING btree ("parent_id");
  CREATE INDEX "project_updates_rels_path_idx" ON "project_updates_rels" USING btree ("path");
  CREATE INDEX "project_updates_rels_client_files_id_idx" ON "project_updates_rels" USING btree ("client_files_id");
  CREATE INDEX "client_files_client_project_idx" ON "client_files" USING btree ("client_project_id");
  CREATE INDEX "client_files_updated_at_idx" ON "client_files" USING btree ("updated_at");
  CREATE INDEX "client_files_created_at_idx" ON "client_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "client_files_filename_idx" ON "client_files" USING btree ("filename");
  CREATE INDEX "client_files_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "client_files" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "client_files_sizes_large_sizes_large_filename_idx" ON "client_files" USING btree ("sizes_large_filename");
  CREATE INDEX "project_messages_client_project_idx" ON "project_messages" USING btree ("client_project_id");
  CREATE INDEX "project_messages_author_idx" ON "project_messages" USING btree ("author_id");
  CREATE INDEX "project_messages_updated_at_idx" ON "project_messages" USING btree ("updated_at");
  CREATE INDEX "project_messages_created_at_idx" ON "project_messages" USING btree ("created_at");
  CREATE INDEX "poles_services_order_idx" ON "poles_services" USING btree ("_order");
  CREATE INDEX "poles_services_parent_id_idx" ON "poles_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "poles_services_locales_locale_parent_id_unique" ON "poles_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "poles_services_locales_parent_id_idx" ON "poles_services_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "poles_slug_idx" ON "poles" USING btree ("slug");
  CREATE UNIQUE INDEX "poles_key_idx" ON "poles" USING btree ("key");
  CREATE INDEX "poles_image_idx" ON "poles" USING btree ("image_id");
  CREATE INDEX "poles_updated_at_idx" ON "poles" USING btree ("updated_at");
  CREATE INDEX "poles_created_at_idx" ON "poles" USING btree ("created_at");
  CREATE UNIQUE INDEX "poles_locales_locale_parent_id_unique" ON "poles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "poles_locales_parent_id_idx" ON "poles_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_materials_order_idx" ON "projects_materials" USING btree ("_order");
  CREATE INDEX "projects_materials_parent_id_idx" ON "projects_materials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_materials_locales_locale_parent_id_unique" ON "projects_materials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_materials_locales_parent_id_idx" ON "projects_materials_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_pole_idx" ON "projects" USING btree ("pole_id");
  CREATE INDEX "projects_cover_image_idx" ON "projects" USING btree ("cover_image_id");
  CREATE INDEX "projects_model_idx" ON "projects" USING btree ("model_id");
  CREATE INDEX "projects_before_image_idx" ON "projects" USING btree ("before_image_id");
  CREATE INDEX "projects_after_image_idx" ON "projects" USING btree ("after_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_materials_order_idx" ON "_projects_v_version_materials" USING btree ("_order");
  CREATE INDEX "_projects_v_version_materials_parent_id_idx" ON "_projects_v_version_materials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_materials_locales_locale_parent_id_uniqu" ON "_projects_v_version_materials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_materials_locales_parent_id_idx" ON "_projects_v_version_materials_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_pole_idx" ON "_projects_v" USING btree ("version_pole_id");
  CREATE INDEX "_projects_v_version_version_cover_image_idx" ON "_projects_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_projects_v_version_version_model_idx" ON "_projects_v" USING btree ("version_model_id");
  CREATE INDEX "_projects_v_version_version_before_image_idx" ON "_projects_v" USING btree ("version_before_image_id");
  CREATE INDEX "_projects_v_version_version_after_image_idx" ON "_projects_v" USING btree ("version_after_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_locales_parent_id_idx" ON "_projects_v_locales" USING btree ("_parent_id");
  CREATE INDEX "testimonials_pole_idx" ON "testimonials" USING btree ("pole_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_locales_parent_id_idx" ON "testimonials_locales" USING btree ("_parent_id");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_members_locales_locale_parent_id_unique" ON "team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_members_locales_parent_id_idx" ON "team_members_locales" USING btree ("_parent_id");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "models_poster_idx" ON "models" USING btree ("poster_id");
  CREATE INDEX "models_updated_at_idx" ON "models" USING btree ("updated_at");
  CREATE INDEX "models_created_at_idx" ON "models" USING btree ("created_at");
  CREATE UNIQUE INDEX "models_filename_idx" ON "models" USING btree ("filename");
  CREATE UNIQUE INDEX "models_locales_locale_parent_id_unique" ON "models_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "models_locales_parent_id_idx" ON "models_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE UNIQUE INDEX "products_reference_idx" ON "products" USING btree ("reference");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_locales_parent_id_idx" ON "products_locales" USING btree ("_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_reference_idx" ON "_products_v" USING btree ("version_reference");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_locales_parent_id_idx" ON "_products_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "trainings_program_order_idx" ON "trainings_program" USING btree ("_order");
  CREATE INDEX "trainings_program_parent_id_idx" ON "trainings_program" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "trainings_program_locales_locale_parent_id_unique" ON "trainings_program_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "trainings_program_locales_parent_id_idx" ON "trainings_program_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "trainings_slug_idx" ON "trainings" USING btree ("slug");
  CREATE INDEX "trainings_image_idx" ON "trainings" USING btree ("image_id");
  CREATE INDEX "trainings_updated_at_idx" ON "trainings" USING btree ("updated_at");
  CREATE INDEX "trainings_created_at_idx" ON "trainings" USING btree ("created_at");
  CREATE UNIQUE INDEX "trainings_locales_locale_parent_id_unique" ON "trainings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "trainings_locales_parent_id_idx" ON "trainings_locales" USING btree ("_parent_id");
  CREATE INDEX "training_sessions_training_idx" ON "training_sessions" USING btree ("training_id");
  CREATE INDEX "training_sessions_updated_at_idx" ON "training_sessions" USING btree ("updated_at");
  CREATE INDEX "training_sessions_created_at_idx" ON "training_sessions" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_order_files_id_idx" ON "payload_locked_documents_rels" USING btree ("order_files_id");
  CREATE INDEX "payload_locked_documents_rels_email_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("email_templates_id");
  CREATE INDEX "payload_locked_documents_rels_client_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("client_projects_id");
  CREATE INDEX "payload_locked_documents_rels_project_updates_id_idx" ON "payload_locked_documents_rels" USING btree ("project_updates_id");
  CREATE INDEX "payload_locked_documents_rels_client_files_id_idx" ON "payload_locked_documents_rels" USING btree ("client_files_id");
  CREATE INDEX "payload_locked_documents_rels_project_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("project_messages_id");
  CREATE INDEX "payload_locked_documents_rels_poles_id_idx" ON "payload_locked_documents_rels" USING btree ("poles_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_models_id_idx" ON "payload_locked_documents_rels" USING btree ("models_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_trainings_id_idx" ON "payload_locked_documents_rels" USING btree ("trainings_id");
  CREATE INDEX "payload_locked_documents_rels_training_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("training_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_socials_order_idx" ON "site_settings_socials" USING btree ("_order");
  CREATE INDEX "site_settings_socials_parent_id_idx" ON "site_settings_socials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "key_figures_figures_order_idx" ON "key_figures_figures" USING btree ("_order");
  CREATE INDEX "key_figures_figures_parent_id_idx" ON "key_figures_figures" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "key_figures_figures_locales_locale_parent_id_unique" ON "key_figures_figures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "key_figures_figures_locales_parent_id_idx" ON "key_figures_figures_locales" USING btree ("_parent_id");
  CREATE INDEX "about_page_values_order_idx" ON "about_page_values" USING btree ("_order");
  CREATE INDEX "about_page_values_parent_id_idx" ON "about_page_values" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_values_locales_locale_parent_id_unique" ON "about_page_values_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_values_locales_parent_id_idx" ON "about_page_values_locales" USING btree ("_parent_id");
  CREATE INDEX "about_page_history_order_idx" ON "about_page_history" USING btree ("_order");
  CREATE INDEX "about_page_history_parent_id_idx" ON "about_page_history" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_history_locales_locale_parent_id_unique" ON "about_page_history_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_history_locales_parent_id_idx" ON "about_page_history_locales" USING btree ("_parent_id");
  CREATE INDEX "about_page_commitments_order_idx" ON "about_page_commitments" USING btree ("_order");
  CREATE INDEX "about_page_commitments_parent_id_idx" ON "about_page_commitments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_commitments_locales_locale_parent_id_unique" ON "about_page_commitments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_commitments_locales_parent_id_idx" ON "about_page_commitments_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_locales_parent_id_idx" ON "about_page_locales" USING btree ("_parent_id");
  CREATE INDEX "impact_page_figures_order_idx" ON "impact_page_figures" USING btree ("_order");
  CREATE INDEX "impact_page_figures_parent_id_idx" ON "impact_page_figures" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "impact_page_figures_locales_locale_parent_id_unique" ON "impact_page_figures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impact_page_figures_locales_parent_id_idx" ON "impact_page_figures_locales" USING btree ("_parent_id");
  CREATE INDEX "impact_page_stories_order_idx" ON "impact_page_stories" USING btree ("_order");
  CREATE INDEX "impact_page_stories_parent_id_idx" ON "impact_page_stories" USING btree ("_parent_id");
  CREATE INDEX "impact_page_stories_image_idx" ON "impact_page_stories" USING btree ("image_id");
  CREATE UNIQUE INDEX "impact_page_stories_locales_locale_parent_id_unique" ON "impact_page_stories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impact_page_stories_locales_parent_id_idx" ON "impact_page_stories_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "impact_page_locales_locale_parent_id_unique" ON "impact_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impact_page_locales_parent_id_idx" ON "impact_page_locales" USING btree ("_parent_id");
  CREATE INDEX "print_pricing_supports_discounts_order_idx" ON "print_pricing_supports_discounts" USING btree ("_order");
  CREATE INDEX "print_pricing_supports_discounts_parent_id_idx" ON "print_pricing_supports_discounts" USING btree ("_parent_id");
  CREATE INDEX "print_pricing_supports_order_idx" ON "print_pricing_supports" USING btree ("_order");
  CREATE INDEX "print_pricing_supports_parent_id_idx" ON "print_pricing_supports" USING btree ("_parent_id");
  CREATE INDEX "simulator_pricing_types_order_idx" ON "simulator_pricing_types" USING btree ("_order");
  CREATE INDEX "simulator_pricing_types_parent_id_idx" ON "simulator_pricing_types" USING btree ("_parent_id");
  CREATE INDEX "simulator_pricing_zones_order_idx" ON "simulator_pricing_zones" USING btree ("_order");
  CREATE INDEX "simulator_pricing_zones_parent_id_idx" ON "simulator_pricing_zones" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "orders_details" CASCADE;
  DROP TABLE "orders_lines" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "orders_rels" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "order_files" CASCADE;
  DROP TABLE "email_templates_recipients" CASCADE;
  DROP TABLE "email_templates" CASCADE;
  DROP TABLE "email_templates_locales" CASCADE;
  DROP TABLE "client_projects_stages" CASCADE;
  DROP TABLE "client_projects" CASCADE;
  DROP TABLE "client_projects_rels" CASCADE;
  DROP TABLE "project_updates" CASCADE;
  DROP TABLE "project_updates_rels" CASCADE;
  DROP TABLE "client_files" CASCADE;
  DROP TABLE "project_messages" CASCADE;
  DROP TABLE "poles_services" CASCADE;
  DROP TABLE "poles_services_locales" CASCADE;
  DROP TABLE "poles" CASCADE;
  DROP TABLE "poles_locales" CASCADE;
  DROP TABLE "projects_materials" CASCADE;
  DROP TABLE "projects_materials_locales" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "_projects_v_version_materials" CASCADE;
  DROP TABLE "_projects_v_version_materials_locales" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_locales" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "models" CASCADE;
  DROP TABLE "models_locales" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "trainings_program" CASCADE;
  DROP TABLE "trainings_program_locales" CASCADE;
  DROP TABLE "trainings" CASCADE;
  DROP TABLE "trainings_locales" CASCADE;
  DROP TABLE "training_sessions" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_socials" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "key_figures_figures" CASCADE;
  DROP TABLE "key_figures_figures_locales" CASCADE;
  DROP TABLE "key_figures" CASCADE;
  DROP TABLE "about_page_values" CASCADE;
  DROP TABLE "about_page_values_locales" CASCADE;
  DROP TABLE "about_page_history" CASCADE;
  DROP TABLE "about_page_history_locales" CASCADE;
  DROP TABLE "about_page_commitments" CASCADE;
  DROP TABLE "about_page_commitments_locales" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TABLE "impact_page_figures" CASCADE;
  DROP TABLE "impact_page_figures_locales" CASCADE;
  DROP TABLE "impact_page_stories" CASCADE;
  DROP TABLE "impact_page_stories_locales" CASCADE;
  DROP TABLE "impact_page" CASCADE;
  DROP TABLE "impact_page_locales" CASCADE;
  DROP TABLE "print_pricing_supports_discounts" CASCADE;
  DROP TABLE "print_pricing_supports" CASCADE;
  DROP TABLE "print_pricing" CASCADE;
  DROP TABLE "simulator_pricing_types" CASCADE;
  DROP TABLE "simulator_pricing_zones" CASCADE;
  DROP TABLE "simulator_pricing" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_service";
  DROP TYPE "public"."enum_orders_company_email_status";
  DROP TYPE "public"."enum_orders_customer_email_status";
  DROP TYPE "public"."enum_contact_messages_status";
  DROP TYPE "public"."enum_contact_messages_preferred_contact";
  DROP TYPE "public"."enum_email_templates_service";
  DROP TYPE "public"."enum_client_projects_stages_status";
  DROP TYPE "public"."enum_client_projects_status";
  DROP TYPE "public"."enum_client_files_kind";
  DROP TYPE "public"."enum_poles_key";
  DROP TYPE "public"."enum_poles_tone";
  DROP TYPE "public"."enum_projects_type";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_type";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_products_category";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_category";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_trainings_level";
  DROP TYPE "public"."enum_training_sessions_status";
  DROP TYPE "public"."enum_users_locale";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_site_settings_socials_platform";
  DROP TYPE "public"."enum_impact_page_figures_axis";
  DROP TYPE "public"."enum_print_pricing_supports_key";
  DROP TYPE "public"."enum_print_pricing_supports_pricing";
  DROP TYPE "public"."enum_simulator_pricing_types_key";
  DROP TYPE "public"."enum_simulator_pricing_zones_key";`)
}

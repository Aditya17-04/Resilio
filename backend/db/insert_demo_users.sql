-- Run this in the Supabase SQL Editor to manually insert the demo users:

-- 1. TechCorp
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'techcorp.rebel@gmail.com',
  crypt('Demo1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"org":"techcorp","company":"TechCorp Solutions","industry":"Semiconductors"}',
  now(),
  now(),
  '', '', '', ''
);

-- 2. PharmaCo
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pharma.rebel@gmail.com',
  crypt('Demo1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"org":"pharma","company":"PharmaCo Industries","industry":"Chemicals"}',
  now(),
  now(),
  '', '', '', ''
);

-- 3. AutoMotive
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'auto.rebel@gmail.com',
  crypt('Demo1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"org":"auto","company":"AutoMotive Global","industry":"Batteries"}',
  now(),
  now(),
  '', '', '', ''
);

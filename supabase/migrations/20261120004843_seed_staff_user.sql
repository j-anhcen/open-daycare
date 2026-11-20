insert into auth.users (
  instance_id, id, aud, role, email, email_confirmed_at,
  encrypted_password, raw_user_meta_data, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'john@gmail.com',
  now(),
  crypt('Abc123456', gen_salt('bf')),
  jsonb_build_object(
    'daycare_id', (select id from public.daycares where name = 'Guardería Sala Soles'),
    'role', 'staff',
    'full_name', 'John'
  ),
  now(), now()
);

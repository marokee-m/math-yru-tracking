-- ========================================================
-- MATH-YRU Tracking System — Supabase Setup Script
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ แล้ววางใน
--   Supabase Console → SQL Editor → กด Run
-- ========================================================

-- 1. สร้างตารางทั้งหมด
create table if not exists students (
  id text primary key,
  "studentId" text,
  name text,
  username text,
  password text,
  "advisorId" text,
  year int2,
  "currentSemester" int2,
  enrollments jsonb default '[]'::jsonb,
  "advisorNotes" jsonb default '[]'::jsonb,
  "licenseExam" jsonb default '{}'::jsonb
);

create table if not exists advisors (
  id text primary key,
  name text,
  username text,
  password text,
  email text,
  department text,
  phone text,
  "studentIds" jsonb default '[]'::jsonb
);

create table if not exists courses (
  code text primary key,
  name text,
  credits int2,
  category text,
  year int2,
  semester int2,
  "isElective" boolean default false
);

create table if not exists settings (
  id text primary key,
  data jsonb
);

create table if not exists equipment (
  id text primary key,
  code text,
  name text,
  "totalQuantity" int2 default 0,
  "availableQuantity" int2 default 0,
  "imageUrl" text,
  description text,
  "borrowType" text default 'borrow'
);

create table if not exists borrow_requests (
  id text primary key,
  "studentId" text,
  "studentName" text,
  "equipmentId" text,
  "equipmentName" text,
  quantity int2 default 1,
  status text default 'pending',
  "borrowType" text default 'borrow',
  "requestDate" text,
  "returnDate" text,
  "createdAt" text,
  note text,
  "returnedAt" text,
  "approvedAt" text,
  "rejectedAt" text
);

-- 2. ปิด Row Level Security (app จัดการ auth เอง)
alter table students disable row level security;
alter table advisors disable row level security;
alter table courses disable row level security;
alter table settings disable row level security;
alter table equipment disable row level security;
alter table borrow_requests disable row level security;

-- 3. สร้าง Storage Buckets
insert into storage.buckets (id, name, public)
  values ('equipment-images', 'equipment-images', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('license-exams', 'license-exams', true)
  on conflict (id) do nothing;

-- 4. Storage Policies (อนุญาต upload/read จาก browser)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Public read equipment-images') then
    create policy "Public read equipment-images" on storage.objects for select using (bucket_id = 'equipment-images');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Anon upload equipment-images') then
    create policy "Anon upload equipment-images" on storage.objects for insert with check (bucket_id = 'equipment-images');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Anon update equipment-images') then
    create policy "Anon update equipment-images" on storage.objects for update using (bucket_id = 'equipment-images');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Anon delete equipment-images') then
    create policy "Anon delete equipment-images" on storage.objects for delete using (bucket_id = 'equipment-images');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Public read license-exams') then
    create policy "Public read license-exams" on storage.objects for select using (bucket_id = 'license-exams');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Anon upload license-exams') then
    create policy "Anon upload license-exams" on storage.objects for insert with check (bucket_id = 'license-exams');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='Anon update license-exams') then
    create policy "Anon update license-exams" on storage.objects for update using (bucket_id = 'license-exams');
  end if;
end $$;

select 'Setup complete! ✅ Tables + Storage ready.' as result;

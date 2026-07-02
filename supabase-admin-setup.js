// ============================================================
// supabase-admin-setup.js
// ตั้งค่า Supabase (disable RLS + สร้าง Storage buckets)
//
// วิธีใช้:
//   1. ไปที่ https://supabase.com/dashboard/account/tokens
//   2. กด "Generate new token" → ตั้งชื่อ → Copy token
//   3. รันคำสั่ง: node supabase-admin-setup.js <TOKEN>
// ============================================================

const token = process.argv[2];
if (!token) {
  console.error('❌ ต้องใส่ Personal Access Token');
  console.error('   วิธีรัน: node supabase-admin-setup.js <TOKEN>');
  console.error('   รับ token: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const PROJECT_REF = 'vtcbpiayiwafyjptrvtx';

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SQL failed (${res.status}): ${text}`);
  return text;
}

async function main() {
  console.log('🔑 กำลังเชื่อมต่อ Supabase Management API...\n');

  // 1. สร้างตาราง (ถ้ายังไม่มี)
  console.log('📋 สร้างตาราง...');
  await runSQL(`
    create table if not exists students (
      id text primary key,
      "studentId" text, name text, username text, password text,
      "advisorId" text, year int2, "currentSemester" int2,
      enrollments jsonb default '[]'::jsonb,
      "advisorNotes" jsonb default '[]'::jsonb,
      "licenseExam" jsonb default '{}'::jsonb
    );
    create table if not exists advisors (
      id text primary key, name text, username text, password text,
      email text, department text, phone text,
      "studentIds" jsonb default '[]'::jsonb
    );
    create table if not exists courses (
      code text primary key, name text, credits int2,
      category text, year int2, semester int2,
      "isElective" boolean default false
    );
    create table if not exists settings (id text primary key, data jsonb);
    create table if not exists equipment (
      id text primary key, code text, name text,
      "totalQuantity" int2 default 0, "availableQuantity" int2 default 0,
      "imageUrl" text, description text, "borrowType" text default 'borrow'
    );
    create table if not exists borrow_requests (
      id text primary key, "studentId" text, "studentName" text,
      "equipmentId" text, "equipmentName" text,
      quantity int2 default 1, status text default 'pending',
      "borrowType" text default 'borrow',
      "requestDate" text, "returnDate" text, "createdAt" text,
      note text, "returnedAt" text, "approvedAt" text, "rejectedAt" text
    );
  `);
  console.log('   ✅ ตารางพร้อม');

  // 2. Disable RLS ทุกตาราง
  console.log('🔓 ปิด Row Level Security...');
  await runSQL(`
    alter table students disable row level security;
    alter table advisors disable row level security;
    alter table courses disable row level security;
    alter table settings disable row level security;
    alter table equipment disable row level security;
    alter table borrow_requests disable row level security;
  `);
  console.log('   ✅ RLS ปิดแล้ว');

  // 3. Storage buckets
  console.log('🗂️  สร้าง Storage buckets...');
  await runSQL(`
    insert into storage.buckets (id, name, public)
      values ('equipment-images', 'equipment-images', true)
      on conflict (id) do nothing;
    insert into storage.buckets (id, name, public)
      values ('license-exams', 'license-exams', true)
      on conflict (id) do nothing;
  `);
  console.log('   ✅ Storage buckets พร้อม');

  // 4. Storage policies
  console.log('🔐 ตั้งค่า Storage policies...');
  await runSQL(`
    do $$ begin
      if not exists (select 1 from pg_policies where tablename='objects' and policyname='allow all equipment-images') then
        create policy "allow all equipment-images" on storage.objects for all using (bucket_id = 'equipment-images') with check (bucket_id = 'equipment-images');
      end if;
      if not exists (select 1 from pg_policies where tablename='objects' and policyname='allow all license-exams') then
        create policy "allow all license-exams" on storage.objects for all using (bucket_id = 'license-exams') with check (bucket_id = 'license-exams');
      end if;
    end $$;
  `);
  console.log('   ✅ Storage policies พร้อม');

  // 5. แสดง anon key
  console.log('\n🔑 กำลังดึง API keys...');
  const keysRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (keysRes.ok) {
    const keys = await keysRes.json();
    const anon = keys.find(k => k.name === 'anon');
    if (anon) {
      console.log('\n📋 Anon Key (ใช้ใน supabase-config.js):');
      console.log('   ' + anon.api_key);
    }
  }

  console.log('\n🎉 Setup เสร็จสมบูรณ์! refresh หน้าเว็บได้เลย');
}

main().catch(function(err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

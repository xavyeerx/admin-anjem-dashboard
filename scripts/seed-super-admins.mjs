const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": KEY,
  "Authorization": `Bearer ${KEY}`,
};

const targets = [
  { email: "anugrahdwikiar@gmail.com", password: "admindiki123",    nama: "Anugrah Dwiki" },
  { email: "restubintang28@gmail.com",  password: "adminbintang123", nama: "Restu Bintang"  },
];

// 1. List all users
const listRes = await fetch(`${BASE}/auth/v1/admin/users?per_page=1000`, { headers: HEADERS });
const listJson = await listRes.json();
const allUsers = listJson.users ?? [];

for (const target of targets) {
  const existing = allUsers.find(u => u.email === target.email);

  if (existing) {
    // Update metadata to super_admin
    const patchRes = await fetch(`${BASE}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({
        password: target.password,
        email_confirm: true,
        user_metadata: { role: "super_admin", nama: target.nama, cabang_id: null },
      }),
    });
    const patchJson = await patchRes.json();
    if (!patchRes.ok) {
      console.error(`✗  Update ${target.email}: ${patchJson.msg || JSON.stringify(patchJson)}`);
    } else {
      console.log(`✓  Updated ${target.email} → role=super_admin`);
    }
  } else {
    // Create new
    const createRes = await fetch(`${BASE}/auth/v1/admin/users`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        email: target.email,
        password: target.password,
        email_confirm: true,
        user_metadata: { role: "super_admin", nama: target.nama, cabang_id: null },
      }),
    });
    const createJson = await createRes.json();
    if (!createRes.ok) {
      console.error(`✗  Create ${target.email}: ${createJson.msg || JSON.stringify(createJson)}`);
    } else {
      console.log(`✓  Created ${target.email} (${createJson.id})`);
    }
  }
}

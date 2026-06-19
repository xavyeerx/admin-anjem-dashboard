import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

async function requireSuperAdmin() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.user_metadata?.role !== "super_admin") return null;
  return user;
}

// GET /api/super/users — list all auth users
export async function GET() {
  return withErrorHandler(async () => {
    if (!(await requireSuperAdmin())) return jsonErr("Akses ditolak", 403);
    const admin = createServiceClient();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) return jsonErr(error.message);
    return jsonOk(data.users);
  });
}

// POST /api/super/users — create new user
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    if (!(await requireSuperAdmin())) return jsonErr("Akses ditolak", 403);
    const { email, password, role, cabang_id, nama } = await req.json();

    if (!email?.trim() || !password?.trim()) return jsonErr("Email dan password wajib diisi");
    if (!role || !["super_admin", "admin"].includes(role)) return jsonErr("Role tidak valid");
    if (role === "admin" && !cabang_id?.trim()) return jsonErr("Admin harus memiliki cabang");

    const admin = createServiceClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        role,
        cabang_id: role === "admin" ? cabang_id.trim() : null,
        nama: nama?.trim() || null,
      },
    });
    if (error) return jsonErr(error.message);
    return jsonOk(data.user, 201);
  });
}

import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

async function requireSuperAdmin() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.user_metadata?.role !== "super_admin") return null;
  return user;
}

// PATCH /api/super/users/[id] — update role, cabang, nama, or reset password
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const currentUser = await requireSuperAdmin();
    if (!currentUser) return jsonErr("Akses ditolak", 403);
    const { id } = await params;
    const { role, cabang_id, nama, password } = await req.json();

    if (role && !["super_admin", "admin"].includes(role)) return jsonErr("Role tidak valid");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (password?.trim()) updates.password = password.trim();

    const meta: Record<string, unknown> = {};
    if (role !== undefined) {
      meta.role = role;
      meta.cabang_id = role === "admin" ? (cabang_id?.trim() || null) : null;
    } else if (cabang_id !== undefined) {
      meta.cabang_id = cabang_id?.trim() || null;
    }
    if (nama !== undefined) meta.nama = nama?.trim() || null;
    if (Object.keys(meta).length > 0) updates.user_metadata = meta;

    const admin = createServiceClient();
    const { data, error } = await admin.auth.admin.updateUserById(id, updates);
    if (error) return jsonErr(error.message);
    return jsonOk(data.user);
  });
}

// DELETE /api/super/users/[id] — delete user
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const currentUser = await requireSuperAdmin();
    if (!currentUser) return jsonErr("Akses ditolak", 403);
    const { id } = await params;
    if (currentUser.id === id) return jsonErr("Tidak bisa menghapus akun sendiri");

    const admin = createServiceClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return jsonErr(error.message);
    return jsonOk({ deleted: true });
  });
}

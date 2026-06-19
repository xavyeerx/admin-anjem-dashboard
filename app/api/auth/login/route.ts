import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, cabang } = body;

  if (!email || !password) {
    return NextResponse.json({ data: null, error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 401 });
  }

  // If a cabang is specified (branch login), enforce that the user belongs to it.
  // Super admins may sign in to any branch.
  const role = data.user?.user_metadata?.role as string | undefined;
  const userCabang = data.user?.user_metadata?.cabang_id as string | undefined;

  if (cabang && role !== "super_admin" && userCabang !== cabang) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { data: null, error: "Akun ini tidak memiliki akses ke cabang tersebut." },
      { status: 403 },
    );
  }

  return NextResponse.json({ data: { user: data.user }, error: null });
}

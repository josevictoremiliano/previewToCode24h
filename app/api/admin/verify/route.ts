import { withAdminAuthSimple } from "@/lib/admin-auth"

async function handler() {
  return Response.json({ success: true, message: "Usuário é administrador" })
}

export const GET = withAdminAuthSimple(handler)
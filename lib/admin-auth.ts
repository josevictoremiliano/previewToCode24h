import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { isAdmin: false, user: null }
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  })

  return { 
    isAdmin: user?.role === 'ADMIN', 
    user 
  }
}

export function withAdminAuth(handler: (req: NextRequest, context: { params: Record<string, string> }) => Promise<Response>) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const { isAdmin } = await verifyAdmin()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem acessar este recurso." },
        { status: 403 }
      )
    }

    return handler(req, context)
  }
}

export function withAdminAuthSimple(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    const { isAdmin } = await verifyAdmin()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem acessar este recurso." },
        { status: 403 }
      )
    }

    return handler(req)
  }
}
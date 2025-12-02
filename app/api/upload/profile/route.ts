import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadGenericImage } from "@/lib/storage"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const data = await req.json()
        const { image } = data

        if (!image) {
            return new NextResponse("Image is required", { status: 400 })
        }

        // Validar tamanho (ex: 5MB)
        const base64Length = image.length - (image.indexOf(',') + 1);
        const padding = (image.charAt(image.length - 1) === '=') ? (image.charAt(image.length - 2) === '=' ? 2 : 1) : 0;
        const fileSizeInBytes = (base64Length * 0.75) - padding;

        if (fileSizeInBytes > 5 * 1024 * 1024) {
            return new NextResponse("Image too large (max 5MB)", { status: 400 })
        }

        const bucketName = "ProfileImagens" // Mantendo compatibilidade com bucket existente se necessário, mas idealmente usaríamos um bucket unificado
        // No entanto, o helper usa o bucket configurado no sistema.
        // Vamos usar o prefixo 'profiles/' para organizar.

        const fileName = `${session.user.id}-${Date.now()}`
        const result = await uploadGenericImage(image, `profiles/${fileName}`)

        return NextResponse.json({ url: result.url })
    } catch (error) {
        console.error("Error uploading profile image:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

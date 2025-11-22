import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Client } from "minio"

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
})

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

        // Remove header data URL
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
        const buffer = Buffer.from(base64Data, 'base64')

        const bucketName = "ProfileImagens"
        const fileName = `${session.user.id}-${Date.now()}.png`

        // Ensure bucket exists
        const bucketExists = await minioClient.bucketExists(bucketName)
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName)
        }

        await minioClient.putObject(bucketName, fileName, buffer)

        // Construct URL (assuming public access or similar setup)
        // In a real scenario, you might need a presigned URL or a proxy
        const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http"
        const url = `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`

        return NextResponse.json({ url })
    } catch (error) {
        console.error("Error uploading profile image:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

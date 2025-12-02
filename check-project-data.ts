
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting...')
    const projectId = 'cmi8vnlig0001gdmw1qsrj8po'
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    })

    if (!project) {
        console.log('Project not found')
        return
    }

    const data = project.data as any
    const output = {
        visualIdentity: data?.visualIdentity,
        additionalResourcesImages: data?.additionalResources?.images,
        rootImages: data?.images
    }

    fs.writeFileSync('project-data.json', JSON.stringify(output, null, 2))
    console.log('Data written to project-data.json')
    console.log('DONE')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

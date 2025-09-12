import { prisma } from "../src/prisma"

async function createPublicMap() {
    const publicMap = await prisma.map.findFirst({
        where: { name: "Public" }
    })

    if (publicMap) {
        console.log(`"Public" map already exists`)
        return
    }

    await prisma.map.create({
        data: { name: "Public" }
    })

    console.log("Created public map")
}

createPublicMap()
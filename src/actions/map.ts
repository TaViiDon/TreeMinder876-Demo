"use server"

import { auth } from "@/auth"
import { createMapSchema } from "@/lib/schema"
import { prisma } from "@/prisma"
import { headers } from "next/headers"
import z from "zod"

export async function createMap(data: z.infer<typeof createMapSchema>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return Promise.reject("Not authenticated")
    }

    const existingMap = await prisma.map.findFirst({
        where: { name: data.name }
    })

    if (existingMap) {
        return Promise.reject("A map with this name already exists")
    }

    await prisma.map.create({
        data: {
            name: data.name,
            ownerId: session.user.id
        }
    })

    return true
}
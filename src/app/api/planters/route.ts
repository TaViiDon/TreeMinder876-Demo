import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../prisma'

export async function GET(req: NextRequest) {
  try {
    // Return users who have planted trees, with their counts and list
    const planters = await prisma.user.findMany({
      where: { plantedTrees: { some: {} } },
      include: {
        plantedTrees: { orderBy: { createdAt: 'desc' }, include: { planter: true } }
      }
    })

    // Map to summary
    const summary = planters.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      // assume profile picture stored on user.imageUrl if present
      imageUrl: u.profileImage || null,
      count: (u.plantedTrees || []).length,
      plants: u.plantedTrees
    }))

    return NextResponse.json(summary)
  } catch (e) {
    console.error('GET /api/planters error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch trees with planter and latest image
    const trees = await prisma.tree.findMany({
      include: {
        planter: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        images: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { plantedDate: 'desc' }
    })

    const out = trees.map((t: any) => ({
      id: t.id,
      treeId: t.treeId,
      species: t.species || '',
      plantedDate: t.plantedDate.toISOString(),
      latitude: t.latitude,
      longitude: t.longitude,
      status: t.status,
      planter: t.planter ? {
        id: t.planter.id,
        name: t.planter.name || null,
        profileImage: t.planter.profileImage || null,
        plantedTrees: [] as Array<{ id: string }>
      } : null,
      images: (t.images || []).map((i: any) => ({ url: i.url, caption: i.caption || '' }))
    }))

    // populate plantedTrees counts for each planter
    const planterMap: Record<string, Array<{ id: string }>> = {}
    out.forEach((t: any) => {
      if (t.planter) {
        planterMap[t.planter.id] = planterMap[t.planter.id] || []
        planterMap[t.planter.id].push({ id: t.id })
      }
    })
    out.forEach((t: any) => {
      if (t.planter) t.planter.plantedTrees = planterMap[t.planter.id] || []
    })

    return NextResponse.json({ trees: out })
  } catch (e) {
    console.error('GET /api/supplier/trees error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
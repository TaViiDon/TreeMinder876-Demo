import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'CUSTODIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trees = await prisma.tree.findMany({
      where: { planterId: session.user.id },
      include: {
        images: true,
        updates: { orderBy: { createdAt: 'desc' } }
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
      images: (t.images || []).map((i: any) => ({ url: i.url, caption: i.caption || '' })),
      updates: (t.updates || []).map((u: any) => ({ description: u.description, imageUrl: u.imageUrl || null, createdAt: u.createdAt.toISOString() }))
    }))

    return NextResponse.json({ trees: out })
  } catch (e) {
    console.error('GET /api/custodian/trees error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
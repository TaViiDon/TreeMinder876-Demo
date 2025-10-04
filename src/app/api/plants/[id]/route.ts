import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BlobServiceClient } from '@azure/storage-blob'

const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION
const AZ_CONTAINER = process.env.AZURE_STORAGE_CONTAINER_NAME || process.env.AZURE_STORAGE_CONTAINER

let containerClient: any = null
if (AZ_CONN && AZ_CONTAINER) {
  try {
    const svc = BlobServiceClient.fromConnectionString(AZ_CONN)
    containerClient = svc.getContainerClient(AZ_CONTAINER)
  } catch (e) {
    console.warn('Azure init failed for patch route', e)
  }
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    // Use NextAuth session instead of JWT token
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
    const id = String(params?.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const form = await req.formData()
    const name = form.get('name') as string | null
    const plantedAtRaw = form.get('plantedAt') as string | null
    const image = form.get('image') as File | null

    const plant = await prisma.tree.findUnique({ where: { id } })
    if (!plant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // only planter can update
    if (!plant.planterId || plant.planterId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // previous single-image field moved to images[]; initialize to null
    let imageUrl: string | null = null
    if (image && image.size > 0 && containerClient) {
      try {
        const buffer = Buffer.from(await image.arrayBuffer())
        const blobName = `plant-${Date.now()}-${image.name}`
        const blk = containerClient.getBlockBlobClient(blobName)
        await blk.uploadData(buffer, { blobHTTPHeaders: { blobContentType: image.type || 'image/jpeg' } })
        imageUrl = blk.url
      } catch (e) {
        console.warn('image upload failed in patch', e)
      }
    }

    const data: any = {}
    if (name) data.species = name
    if (plantedAtRaw) data.plantedDate = new Date(plantedAtRaw)
    // attach new image if uploaded
    if (imageUrl) data.images = { create: [{ url: imageUrl }] }

    const updated = await prisma.tree.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/plants/[id] error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    // Use NextAuth session instead of JWT token
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
    const id = String(params?.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const plant = await prisma.tree.findUnique({ where: { id } })
    if (!plant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!plant.planterId || plant.planterId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.tree.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/plants/[id] error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
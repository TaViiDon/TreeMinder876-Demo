import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { prisma } from '../../../prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Azure blob configuration (support both env names)
const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION;
const AZ_CONTAINER = process.env.AZURE_STORAGE_CONTAINER_NAME || process.env.AZURE_CONTAINER_NAME || process.env.AZURE_CONTAINER;

let containerClient: ReturnType<BlobServiceClient['getContainerClient']> | null = null;
if (AZ_CONN && AZ_CONTAINER) {
  try {
    const blobSvc = BlobServiceClient.fromConnectionString(AZ_CONN);
    containerClient = blobSvc.getContainerClient(AZ_CONTAINER);
  } catch (err) {
    console.warn('Azure blob init failed:', err);
    containerClient = null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const planterId = url.searchParams.get('planterId')

    const findOpts: any = {
      include: { planter: true, images: true },
      orderBy: { createdAt: 'desc' }
    }
    if (planterId) findOpts.where = { planterId }

  const plants = await prisma.tree.findMany(findOpts)
  return NextResponse.json(plants)
  } catch (error) {
    console.error('GET /api/plants error', error)
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use NextAuth session instead of getTokenPayload
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const nameRaw = formData.get('name');
    const latRaw = formData.get('latitude');
    const lngRaw = formData.get('longitude');
    const plantedAtRaw = formData.get('plantedAt');
    const planterIdRaw = formData.get('planterId');
    const image = formData.get('image') as File | null;

    if (!nameRaw || !latRaw || !lngRaw) {
      return NextResponse.json({ error: 'name, latitude and longitude are required' }, { status: 400 });
    }

    const name = String(nameRaw);
    const latitude = Number(String(latRaw));
    const longitude = Number(String(lngRaw));

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json({ error: 'latitude and longitude must be numbers' }, { status: 400 });
    }

    const plantedAt = plantedAtRaw ? new Date(String(plantedAtRaw)) : new Date();
    // Use the authenticated user's ID as planterId
    const planterId = session.user.id;

    let imageUrl: string | null = null;

    if (image && image instanceof File && image.size > 0 && containerClient) {
      try {
        const buffer = Buffer.from(await image.arrayBuffer());
        const blobName = `plant-${Date.now()}-${image.name}`;
        const blockClient = containerClient.getBlockBlobClient(blobName);

        await blockClient.uploadData(buffer, {
          blobHTTPHeaders: { blobContentType: image.type || 'image/jpeg' }
        });

        imageUrl = blockClient.url;
      } catch (uploadErr) {
        console.warn('Blob upload failed, continuing without image:', uploadErr);
        imageUrl = null;
      }
    }

    const tree = await prisma.tree.create({
      data: {
        treeId: `T-${Date.now()}`,
        species: name,
        latitude,
        longitude,
        plantedDate: plantedAt,
        planterId,
        images: imageUrl ? { create: [{ url: imageUrl }] } : undefined
      },
      include: { planter: true, images: true },
    });
    return NextResponse.json(tree, { status: 201 });
  } catch (error) {
    console.error('Plant creation error:', error);
    return NextResponse.json({ error: 'Failed to create plant' }, { status: 500 });
  }
}
import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound, unauthorized } from "next/navigation"
import MapViewer from "@/components/MapViewer"
import { prisma } from "@/prisma"

export default async function Page({ params }: { params: Promise<{ map: string }> }) {
  let { map: mapName } = await params

  mapName = decodeURI(mapName)

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return unauthorized()
  }

  const p: any = prisma
  const mapModel = await p.map.findFirst({
    where: { name: mapName },
    include: { InvitedUsers: true }
  })

  if (!mapModel) {
    return notFound()
  }

  const isOwner = session.user.id === mapModel.ownerId
  const isInvited = mapModel.ownerId == null || mapModel.InvitedUsers.find((user: any) => user.id === session.user.id)

  if (!isOwner && !isInvited) {
    return unauthorized()
  }

  return (
    <>
    <MapViewer />
    </>
  )
}
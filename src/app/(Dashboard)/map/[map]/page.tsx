import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound, unauthorized } from "next/navigation"
import Map from "@/components/features/Dashboard/Map"
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

  const mapModel = await prisma.map.findFirst({
    where: { name: mapName },
    include: { InvitedUsers: true }
  })

  if (!mapModel) {
    return notFound()
  }

  const isOwner = session.user.id === mapModel.ownerId
  const isInvited = mapModel.ownerId == null || mapModel.InvitedUsers.find(user => user.id === session.user.id)

  if (!isOwner && !isInvited) {
    return unauthorized()
  }

  return (
    <>
      <Map />
    </>
  )
}
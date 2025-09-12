import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sidebar, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import type { Map as MapModel } from "@/generated/prisma";
import { prisma } from "@/prisma";
import { BotMessageSquare, ChartNoAxesCombined, ChevronsUpDown, UserStar } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import CreateMapDialog from "@/components/features/Dashboard/CreateMapDialog";
import ProfilePopover from "@/components/features/Dashboard/ProfilePopover";
import SidebarButton from "@/components/features/Dashboard/SidebarButton";
import Link from "next/link";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ map: string }>
}>) {
  let { map } = await params
  map = decodeURI(map)

  const session = (await auth.api.getSession({
    headers: await headers()
  }))!

  const prismaUser = (await prisma.user.findFirst({
    where: { id: session.user.id },
    include: { OwnedMaps: true, InvitedMaps: true }
  }))!

  const publicMap = (await prisma.map.findFirst({
    where: { name: "Public" }
  }))!

  let accessibleMaps: Array<MapModel> = [publicMap]
  accessibleMaps.push(...prismaUser.OwnedMaps)
  accessibleMaps.push(...prismaUser.InvitedMaps)

  accessibleMaps = accessibleMaps.filter(mapEntry => mapEntry.name !== map)

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" variant="inset" className="justify-between">
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>Map</SidebarGroupLabel>
            <SidebarGroupContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="w-full flex justify-between">
                    {map}
                    <ChevronsUpDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-2 p-4">
                  <h4 className="leading-none font-medium">Choose map</h4>
                  <div className="text-muted-foreground text-sm">Select a map to view</div>
                  <CreateMapDialog>
                    <Button>+ Create Map</Button>
                  </CreateMapDialog>
                  {accessibleMaps.map(map => (
                    <Link href={`/map/${map.name}`} key={map.id} className="w-full">
                      <Button variant="ghost" className="text-left font-normal w-full">{map.name}</Button>
                    </Link>
                  ))}
                </PopoverContent>
              </Popover>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton>
              <UserStar />
              Manage Users
            </SidebarMenuButton>
            <SidebarMenuButton>
              <BotMessageSquare />
              Ask AI
            </SidebarMenuButton>
            <SidebarMenuButton>
              <ChartNoAxesCombined />
              View Analytics
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupLabel>Your Profile</SidebarGroupLabel>
            <SidebarGroupContent>
              <ProfilePopover>
                <Button className="flex w-full justify-between" variant="ghost">
                  <div className="flex gap-2">
                    <Image
                      src={session?.user.image ?? ""}
                      height={24} width={24}
                      alt={`${session?.user.name}'s profile image`} className="rounded-full" />
                    {session?.user.name}
                  </div>
                  <ChevronsUpDown />
                </Button>
              </ProfilePopover>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarButton />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

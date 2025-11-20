"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Keyboard, MousePointer2, Settings2, Bot } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";

function AppHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const menuItems = [
    { href: "/", label: "Touchpad" },
    { href: "/keyboard", label: "Keyboard" },
    { href: "/settings", label: "Settings" },
  ];

  const hideHeader = pathname === "/" || pathname === "/keyboard";

  if (hideHeader) return null;

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {menuItems.find((item) => item.href === pathname)?.label}
        </h1>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Touchpad", icon: MousePointer2 },
    { href: "/keyboard", label: "Keyboard", icon: Keyboard },
    { href: "/settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader>
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/">
              <Bot className="size-5 text-primary" />
              <span className="sr-only">Pocket Mouse</span>
            </Link>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

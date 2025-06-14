
"use client";

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import Logo from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, UtensilsCrossed, BookOpenText, ShoppingCart, Lightbulb, Settings, LogOut, PanelLeftOpen, PanelLeftClose, Archive, ScanSearch } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/meal-plans', label: 'Meal Plans', icon: UtensilsCrossed },
  { href: '/recipes', label: 'Recipes', icon: BookOpenText },
  { href: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
  { href: '/pantry', label: 'Pantry', icon: Archive },
  { href: '/smart-suggestions', label: 'Smart Suggestions', icon: Lightbulb },
  { href: '/meal-analyzer', label: 'Meal Analyzer', icon: ScanSearch },
];

const MobileHeader = () => {
  const { toggleSidebar, openMobile } = useSidebar();
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="text-primary h-7 w-auto" />
      </Link>
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle menu">
        {openMobile ? <PanelLeftClose /> : <PanelLeftOpen />}
      </Button>
    </div>
  );
};


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r bg-sidebar">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="PlatePilot Home">
              <Logo className="text-primary h-8 w-auto hidden group-data-[state=expanded]:block"/>
              <UtensilsCrossed className="text-primary h-8 w-8 group-data-[state=collapsed]:block hidden"/>
            </Link>
            <SidebarTrigger className="hidden md:flex" />
          </SidebarHeader>
          <SidebarContent className="flex-grow p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right', className: 'ml-2' }}
                  >
                    <Link href={item.href}>
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: "Settings", side: 'right', className: 'ml-2' }}>
                  <Settings aria-hidden="true" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton tooltip={{ children: "Logout", side: 'right', className: 'ml-2' }}>
                  <LogOut aria-hidden="true" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1 flex flex-col bg-background">
          <MobileHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

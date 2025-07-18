import { AppSidebar } from './app-sidebar';
import { AppNavbar } from './app-navbar';
import { SidebarProvider, SidebarTrigger } from '../../ui/sidebar';

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-full flex-col overflow-hidden">
        <SidebarTrigger className="absolute z-10" />
        {children}
        <AppNavbar />
      </main>
    </SidebarProvider>
  );
}

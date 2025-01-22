import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full">
        <SidebarTrigger />
        <div className="flex-1 flex flex-col h-screen overflow-hidden items-center">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

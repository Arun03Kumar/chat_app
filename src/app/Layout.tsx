import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ userDetails, otherUsers, setSelectedUser, children }: { userDetails: any, otherUsers: any, children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar userDetails={userDetails} otherUsers={otherUsers} setSelectedUser={setSelectedUser} />
      <main className="flex w-full">
        <SidebarTrigger />
        <div className="flex-1 flex flex-col h-screen overflow-hidden items-center">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

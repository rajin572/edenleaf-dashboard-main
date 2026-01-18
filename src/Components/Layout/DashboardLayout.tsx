import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../Shared/app-sidebar";
import Container from "../ui/CustomUi/Container";
import Topbar from "./Topbar";

export default function DashboardLayout() {


  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-w-0 relative">
        <div className="p-4 flex items-center justify-between gap-4 border-b w-full bg-background z-10 sticky! top-0">
          <Topbar />
        </div>
        <div className="">
          <Container>
            <Outlet />
          </Container>
        </div>
      </main>
    </SidebarProvider>
  );
}

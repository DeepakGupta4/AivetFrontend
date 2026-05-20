import Sidebar from "@/components/sidebar/Sidebar";
import Preloader from "@/components/shared/Preloader";
import SessionBootstrap from "@/components/shared/SessionBootstrap";
import ProductTour from "@/components/shared/ProductTour";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh", display: "flex" }}>
      <SessionBootstrap />
      <ProductTour />
      <Preloader />

      {/* Sidebar — fixed, always visible */}
      <Sidebar />

      {/* Main content — offset by exact sidebar width */}
      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          minHeight: "100vh",
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}

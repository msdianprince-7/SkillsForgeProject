import type { ReactNode } from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
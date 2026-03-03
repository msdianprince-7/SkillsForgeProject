import type { ReactNode } from "react";
import Navbar from "./NAvbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">{children}</div>
    </div>
  );
};

export default Layout;
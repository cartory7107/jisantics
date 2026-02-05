import { ReactNode, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Package,
  Settings,
  Shield,
  BarChart3,
  ChevronLeft,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo.png";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, hasPermission, isLoading: roleLoading } = useUserRole();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin", show: true },
    { icon: Users, label: "Users", path: "/admin/users", show: hasPermission('manage_users') || isSuperAdmin },
    { icon: Store, label: "Vendors", path: "/admin/vendors", show: hasPermission('manage_vendors') || isSuperAdmin },
    { icon: ShoppingBag, label: "Products", path: "/admin/products", show: hasPermission('manage_products') || isSuperAdmin },
    { icon: Package, label: "Orders", path: "/admin/orders", show: hasPermission('manage_orders') || isSuperAdmin },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics", show: hasPermission('view_analytics') || isSuperAdmin },
    { icon: Shield, label: "Roles & Permissions", path: "/admin/roles", show: hasPermission('manage_roles') || isSuperAdmin },
    { icon: Settings, label: "Settings", path: "/admin/settings", show: hasPermission('manage_settings') || isSuperAdmin },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="NEXTEN" className="h-10 w-auto rounded-lg" />
            {sidebarOpen && (
              <span className="font-bold text-lg">Admin</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all mb-2"
          >
            <ChevronLeft className="h-5 w-5" />
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all w-full"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-[260px]" : "ml-20"
        }`}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;

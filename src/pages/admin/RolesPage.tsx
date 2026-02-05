import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "./AdminLayout";

const ROLE_DESCRIPTIONS = {
  super_admin: {
    title: "Super Admin",
    description: "Full access to everything. Can manage all roles and permissions.",
    color: "bg-red-500/20 text-red-500 border-red-500/30",
  },
  admin: {
    title: "Admin",
    description: "Administrative access based on assigned permissions.",
    color: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  },
  vendor: {
    title: "Vendor",
    description: "Can manage their own store, products, and orders.",
    color: "bg-green-500/20 text-green-500 border-green-500/30",
  },
  shareholder: {
    title: "Shareholder",
    description: "Can view analytics and financial reports.",
    color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  },
  developer: {
    title: "Developer",
    description: "Technical access for development and debugging.",
    color: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  },
  user: {
    title: "User",
    description: "Standard customer access.",
    color: "bg-gray-500/20 text-gray-500 border-gray-500/30",
  },
};

const PERMISSION_DESCRIPTIONS = {
  manage_users: "Create, edit, and delete user accounts",
  manage_vendors: "Approve, reject, and manage vendor applications",
  manage_products: "Create, edit, and delete products",
  manage_orders: "View and manage customer orders",
  manage_categories: "Create and organize product categories",
  view_analytics: "Access dashboards and analytics data",
  manage_settings: "Configure system settings",
  manage_roles: "Assign and remove user roles",
  manage_permissions: "Grant and revoke individual permissions",
  manage_payments: "Access payment settings and transactions",
  view_reports: "Generate and view business reports",
  manage_inventory: "Track and update product inventory",
};

const RolesPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Understanding the role and permission system
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">How to Manage Roles & Permissions</h3>
                <p className="text-muted-foreground">
                  Go to <strong>Users</strong> page → Click the <strong>⋮</strong> menu on any user → 
                  Select <strong>"Manage Roles"</strong> or <strong>"Manage Permissions"</strong>. 
                  Super Admins have access to all permissions automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Available Roles</CardTitle>
            <CardDescription>
              Roles define the type of user and their general access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ROLE_DESCRIPTIONS).map(([key, role]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className={role.color}>
                      {role.title}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Available Permissions</CardTitle>
            <CardDescription>
              Granular permissions that can be assigned to any user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PERMISSION_DESCRIPTIONS).map(([key, description]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RolesPage;

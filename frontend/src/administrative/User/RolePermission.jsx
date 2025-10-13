// hooks/usePermissions.js
import { createContext, useContext, useState, useEffect } from 'react';

// Permission definitions
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_MANAGE_ROLES: 'user.manage_roles',
  
  // Account Management
  ACCOUNT_VIEW_ALL: 'account.view_all',
  ACCOUNT_VIEW_OWN: 'account.view_own',
  ACCOUNT_EDIT_ALL: 'account.edit_all',
  ACCOUNT_EDIT_OWN: 'account.edit_own',
  
  // System Administration
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_LOGS: 'system.logs',
  
  // Reports & Analytics
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  ANALYTICS_VIEW: 'analytics.view',
};

// Role definitions with their permissions
export const ROLES = {
  admin: {
    name: 'Administrator',
    permissions: Object.values(PERMISSIONS), // All permissions
    color: '#ef4444', // red
    description: 'Full system access'
  },
  manager: {
    name: 'Manager',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_MANAGE_ROLES,
      PERMISSIONS.ACCOUNT_VIEW_ALL,
      PERMISSIONS.ACCOUNT_EDIT_ALL,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.ANALYTICS_VIEW,
    ],
    color: '#3b82f6', // blue
    description: 'Management oversight and user administration'
  },
  Employee: {
    name: 'Employee',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ACCOUNT_VIEW_OWN,
      PERMISSIONS.ACCOUNT_EDIT_OWN,
      PERMISSIONS.REPORTS_VIEW,
    ],
    color: '#10b981', // green
    description: 'Standard employee access'
  },
  'tour guide': {
    name: 'Tour Guide',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ACCOUNT_VIEW_OWN,
      PERMISSIONS.ACCOUNT_EDIT_OWN,
    ],
    color: '#f59e0b', // yellow
    description: 'Tour guide specific access'
  },
  accountant: {
    name: 'Accountant',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ACCOUNT_VIEW_ALL,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.ANALYTICS_VIEW,
    ],
    color: '#8b5cf6', // purple
    description: 'Financial management and reporting'
  },
  'customer service': {
    name: 'Customer Service',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ACCOUNT_VIEW_ALL,
      PERMISSIONS.ACCOUNT_EDIT_ALL,
    ],
    color: '#06b6d4', // cyan
    description: 'Customer support and basic user management'
  }
};

// Permission Context
const PermissionContext = createContext();

export function PermissionProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current user from localStorage or API
    const loadCurrentUser = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          // Fallback: fetch from API or set default
          // For demo purposes, setting a default admin user
          const defaultUser = {
            id: 1,
            name: 'Current User',
            email: 'admin@example.com',
            role: 'admin' // Change this based on your needs
          };
          setCurrentUser(defaultUser);
          localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.role) return false;
    const userRole = ROLES[currentUser.role];
    return userRole?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getUserPermissions = () => {
    if (!currentUser || !currentUser.role) return [];
    return ROLES[currentUser.role]?.permissions || [];
  };

  const canAccessResource = (resource, action = 'read') => {
    const permissionKey = `${resource}.${action}`;
    return hasPermission(permissionKey);
  };

  const value = {
    currentUser,
    setCurrentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    canAccessResource,
    loading,
    PERMISSIONS,
    ROLES
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
}

// Permission Guard Component
export function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return fallback || (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-2xl mb-2">🔒</div>
        <p>You don't have permission to access this feature.</p>
      </div>
    );
  }

  return children;
}

// Role Badge Component
export function RoleBadge({ role, showName = true }) {
  const roleConfig = ROLES[role];
  
  if (!roleConfig) {
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Unknown Role</span>;
  }

  return (
    <span 
      className="px-2 py-1 rounded text-xs font-medium text-white"
      style={{ backgroundColor: roleConfig.color }}
      title={roleConfig.description}
    >
      {showName ? roleConfig.name : role}
    </span>
  );
}

// Permission List Component
export function PermissionList({ role }) {
  const roleConfig = ROLES[role];
  
  if (!roleConfig) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Permissions for {roleConfig.name}:</h4>
      <div className="grid grid-cols-1 gap-1 text-xs">
        {roleConfig.permissions.map(permission => (
          <div key={permission} className="flex items-center space-x-2 p-1 bg-gray-50 rounded">
            <span className="text-green-600">✓</span>
            <span>{permission.replace(/\./g, ' → ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add a default page component so imports expecting a default export work.
export default function RolePermissionPage() {
  return (
    <PermissionProvider>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Roles & Permissions</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.keys(ROLES).map((roleKey) => (
            <div key={roleKey} className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{ROLES[roleKey].name}</h3>
                <RoleBadge role={roleKey} />
              </div>
              <PermissionList role={roleKey} />
            </div>
          ))}
        </div>
      </div>
    </PermissionProvider>
  );
}
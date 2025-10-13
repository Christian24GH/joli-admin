import React, { useEffect, useState, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import UserForm from "./components/UserForm.jsx";
import UserTable from "./components/UserTable.jsx";
import UserFilter from "./components/UserFilter.jsx";
import UserStats from "./components/UserStats.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Filter,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  Plane,
  MapPin,
  CreditCard,
  UserCheck,
  Truck
} from "lucide-react";
import { fetchUsers as apiFetchUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from "@/api/administrative";

// Travel & Tours EIS Department Configuration
const DEPARTMENTS = {
  hr: { 
    name: "Human Resources", 
    icon: UserCheck, 
    color: "bg-blue-500", 
    description: "Employee management, recruitment, and HR operations",
    roles: ["HR Manager", "HR Specialist", "Recruiter", "HR Assistant"]
  },
  financial: { 
    name: "Financial", 
    icon: CreditCard, 
    color: "bg-green-500", 
    description: "Accounting, budgeting, and financial operations",
    roles: ["Finance Manager", "Accountant", "Financial Analyst", "Bookkeeper"]
  },
  core: { 
    name: "Core Operations", 
    icon: Plane, 
    color: "bg-purple-500", 
    description: "Tour operations, customer service, and booking management",
    roles: ["Operations Manager", "Tour Coordinator", "Travel Consultant", "Customer Service Rep"]
  },
  logistics: { 
    name: "Logistics", 
    icon: Truck, 
    color: "bg-orange-500", 
    description: "Transportation, accommodation, and vendor coordination",
    roles: ["Logistics Manager", "Transport Coordinator", "Vendor Manager", "Logistics Assistant"]
  },
  administrative: { 
    name: "Administrative", 
    icon: Building2, 
    color: "bg-gray-500", 
    description: "General administration, IT support, and system management",
    roles: ["Admin Manager", "System Administrator", "IT Support", "Office Manager"]
  }
};

const USER_STATUS = {
  active: { name: "Active", color: "bg-green-100 text-green-800", icon: CheckCircle },
  inactive: { name: "Inactive", color: "bg-gray-100 text-gray-800", icon: XCircle },
  pending: { name: "Pending", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  suspended: { name: "Suspended", color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function Accounts() {
  // Core state
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Enhanced UI state
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // init filter state: use sentinel "__all__" instead of empty string
  const [filterConfig, setFilterConfig] = useState({
    department: '__all__',
    role: '__all__',
    status: '__all__',
    dateRange: { start: '', end: '' }
  });
  
  // Error handling and notifications
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auto-refresh control
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Enhanced loadUsers with better error handling
  const loadUsers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const data = await apiFetchUsers();
      setUsers(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      
      if (notification?.type === 'error') {
        setNotification(null); // Clear error notifications on successful load
      }
    } catch (err) {
      console.error("loadUsers:", err);
      setError(err.message || "Failed to load users");
      setNotification({
        type: 'error',
        message: "Failed to load users. Please try again.",
        timestamp: new Date()
      });
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notification?.type]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((searchQuery) => {
      setQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  // Auto-refresh with interval control
  useEffect(() => {
    loadUsers();
    
    if (!autoRefresh) return;
    
    const id = setInterval(() => loadUsers(true), refreshInterval);
    return () => clearInterval(id);
  }, [loadUsers, autoRefresh, refreshInterval]);

  // Enhanced CRUD operations with notifications
  const showNotification = (type, message) => {
    setNotification({ type, message, timestamp: new Date() });
    setTimeout(() => setNotification(null), 5000);
  };

  async function addUser(payload) {
    try {
      // Validate required fields
      if (!payload.department || !DEPARTMENTS[payload.department]) {
        throw new Error('Valid department is required');
      }

      // Persist to backend
      const res = await apiCreateUser(payload); // expects { ok: true, id: number }

      // Refresh list from server to get canonical data (preferred):
      await loadUsers(true);

      setShowUserForm(false);
      showNotification('success', `User "${payload.name}" created`);

      // Return created user shape for the form (id from server if present)
      return { id: res?.id || Date.now(), ...payload, createdAt: new Date().toISOString() };
    } catch (err) {
      console.error('addUser error', err);
      showNotification('error', `Failed to create user: ${err.message || err}`);
      throw err;
    }
  }

  async function updateUser(id, updates) {
    try {
      // persist to backend
      await apiUpdateUser(id, updates);
      // refresh canonical list
      await loadUsers(true);
      showNotification('success', 'User updated successfully');
      return { ...updates, id };
    } catch (err) {
      console.error('updateUser error', err);
      showNotification('error', 'Failed to update user');
      throw err;
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return false;
    try {
      await apiDeleteUser(id);
      // refresh list
      await loadUsers(true);
      showNotification('success', 'User deleted');
      return true;
    } catch (err) {
      console.error('deleteUser error', err);
      showNotification('error', 'Failed to delete user');
      throw err;
    }
  }

  // Toggle active/inactive
  async function toggleActive(id, currentlyActive) {
    try {
      const newActive = currentlyActive ? 0 : 1;
      await apiUpdateUser(id, { active: newActive });
      await loadUsers(true);
      showNotification('success', `User ${newActive ? 'activated' : 'deactivated'}`);
      return true;
    } catch (err) {
      console.error('toggleActive error', err);
      showNotification('error', 'Failed to change user status');
      throw err;
    }
  }

  async function bulkDelete() {
    if (selectedUsers.size === 0) return;
    const ids = Array.from(selectedUsers);
    try {
      await Promise.all(ids.map(id => apiDeleteUser(id)));
      await loadUsers(true);
      setSelectedUsers(new Set());
      showNotification('success', `Deleted ${ids.length} user(s)`);
    } catch (err) {
      console.error('bulkDelete error', err);
      showNotification('error', 'Failed to delete selected users');
    }
  }

  // Enhanced filtering and sorting for travel & tours EIS
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Text search across relevant fields
      const searchMatch = query === '' || [
        user.name, user.email, user.role, user.department, user.employeeId
      ].some(field => field?.toLowerCase().includes(query.toLowerCase()));
      
      // Department filter
      const departmentMatch = filterConfig.department === '__all__' || user.department === filterConfig.department;
      
      // Role filter
      const roleMatch = filterConfig.role === '__all__' || user.role === filterConfig.role;
      
      // Status filter
      const statusMatch = filterConfig.status === '__all__' || user.status === filterConfig.status;
      
      // Date range filter
      let dateMatch = true;
      if (filterConfig.dateRange.start || filterConfig.dateRange.end) {
        const userDate = new Date(user.createdAt);
        const startDate = filterConfig.dateRange.start ? new Date(filterConfig.dateRange.start) : null;
        const endDate = filterConfig.dateRange.end ? new Date(filterConfig.dateRange.end) : null;
        
        if (startDate && userDate < startDate) dateMatch = false;
        if (endDate && userDate > endDate) dateMatch = false;
      }
      
      return searchMatch && departmentMatch && roleMatch && statusMatch && dateMatch;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, query, filterConfig, sortConfig]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);

  // Export functionality for travel & tours EIS
  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Department', 'Role', 'Status', 'Employee ID', 'Created At', 'Last Login'].join(','),
      ...filteredAndSortedUsers.map(user => [
        user.name, 
        user.email, 
        DEPARTMENTS[user.department]?.name || user.department, 
        user.role, 
        user.status,
        user.employeeId || '',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-tours-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', `Exported ${filteredAndSortedUsers.length} users to CSV`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Plane className="w-6 h-6 mr-2 text-blue-600" />
            Travel & Tours - User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Administrative module for managing employee accounts across all departments
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
            Auto-refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsers}
            disabled={filteredAndSortedUsers.length === 0}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          
          <Button
            onClick={() => setShowUserForm(!showUserForm)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <Alert className={`${
          notification.type === 'error' ? 'border-red-200 bg-red-50' : 
          notification.type === 'success' ? 'border-green-200 bg-green-50' : 
          'border-blue-200 bg-blue-50'
        }`}>
          {notification.type === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> :
           notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
           <AlertCircle className="h-4 w-4 text-blue-600" />}
          <AlertDescription className={
            notification.type === 'error' ? 'text-red-800' :
            notification.type === 'success' ? 'text-green-800' :
            'text-blue-800'
          }>
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(DEPARTMENTS).map(([key, dept]) => {
          const Icon = dept.icon;
          const deptUsers = users.filter(user => user.department === key);
          const activeUsers = deptUsers.filter(user => user.status === 'active');
          
          return (
            <Card 
              key={key} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setFilterConfig(prev => ({ ...prev, department: key }))}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${dept.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="secondary">
                    {deptUsers.length}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{dept.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">{activeUsers.length} active</span>
                  <span className="text-gray-400">{deptUsers.length - activeUsers.length} inactive</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {showUserForm && (
        <Card className="border-2 border-dashed border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm 
              onCreate={addUser}
              onCancel={() => setShowUserForm(false)}
              departments={DEPARTMENTS}
              userStatus={USER_STATUS}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Users Table - Takes up 3/4 of the space */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Accounts
                <Badge variant="secondary" className="ml-2">
                  {filteredAndSortedUsers.length}
                </Badge>
              </CardTitle>
              
              {selectedUsers.size > 0 && (
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedUsers.size} selected
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={bulkDelete}
                  >
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Search and Filter Bar */}
            <div className="space-y-4 mb-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, role, or employee ID..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex gap-4 flex-wrap items-center">
                {/* Department Filter */}
                <Select 
                  value={filterConfig.department} 
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Departments</SelectItem>
                    {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <dept.icon className="w-4 h-4" />
                          {dept.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Role Filter */}
                <Select 
                  value={filterConfig.role} 
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Roles</SelectItem>
                    {filterConfig.department && DEPARTMENTS[filterConfig.department]?.roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    )) || Object.values(DEPARTMENTS).flatMap(dept => dept.roles).filter((r, i, a) => a.indexOf(r) === i).map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select 
                  value={filterConfig.status} 
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Status</SelectItem>
                    {Object.entries(USER_STATUS).map(([key, status]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <status.icon className="w-4 h-4" />
                          {status.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Clear Filters */}
                {(filterConfig.department !== '__all__' || filterConfig.role !== '__all__' || filterConfig.status !== '__all__') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFilterConfig({ department: '__all__', role: '__all__', status: '__all__', dateRange: { start: '', end: '' } })}
                  >
                    Clear Filters
                  </Button>
                )}

                <div className="flex-1" />
                
                {/* Page Size Selector */}
                <Select 
                  value={pageSize.toString()} 
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold text-sm text-blue-600 bg-blue-100 rounded-lg">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading users...
                </div>
              </div>
            ) : (
              <>
                {/* Users Table */}
                <UserTable 
                  users={paginatedUsers}
                  onUpdate={updateUser}
                  onToggleActive={toggleActive}
                  onDelete={deleteUser}
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  sortConfig={sortConfig}
                  onSort={setSortConfig}
                  loading={refreshing}
                  departments={DEPARTMENTS}
                  userStatus={USER_STATUS}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                      {Math.min(currentPage * pageSize, filteredAndSortedUsers.length)} of{' '}
                      {filteredAndSortedUsers.length} users
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Department Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserStats 
              users={users}
              filteredUsers={filteredAndSortedUsers}
              loading={loading}
              departments={DEPARTMENTS}
              userStatus={USER_STATUS}
            />
            
            {/* Quick Department Actions */}
            <div className="mt-6 space-y-2">
              <h4 className="font-medium text-sm text-gray-700 mb-3">Quick Actions</h4>
              {Object.entries(DEPARTMENTS).map(([key, dept]) => {
                const Icon = dept.icon;
                const deptUserCount = users.filter(u => u.department === key).length;
                
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setFilterConfig(prev => ({ ...prev, department: key }));
                      setCurrentPage(1);
                    }}
                  >
                    <Icon className="w-3 h-3 mr-2" />
                    {dept.name} ({deptUserCount})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
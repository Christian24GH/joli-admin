// components/ActivityLog.jsx - Comprehensive Activity Log System
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Activity Types and Categories
const ACTIVITY_TYPES = {
  // User Account Activities
  USER_CREATED: { icon: '👤➕', color: 'green', category: 'User Management', description: 'New user account created' },
  USER_UPDATED: { icon: '👤✏️', color: 'blue', category: 'User Management', description: 'User profile updated' },
  USER_DELETED: { icon: '👤🗑️', color: 'red', category: 'User Management', description: 'User account deleted' },
  USER_ACTIVATED: { icon: '👤✅', color: 'green', category: 'User Management', description: 'User account activated' },
  USER_DEACTIVATED: { icon: '👤❌', color: 'orange', category: 'User Management', description: 'User account deactivated' },
  USER_SUSPENDED: { icon: '👤⏸️', color: 'red', category: 'User Management', description: 'User account suspended' },
  
  // Authentication Activities
  LOGIN_SUCCESS: { icon: '🔐✅', color: 'green', category: 'Authentication', description: 'Successful login' },
  LOGIN_FAILED: { icon: '🔐❌', color: 'red', category: 'Authentication', description: 'Failed login attempt' },
  LOGOUT: { icon: '🔐↩️', color: 'gray', category: 'Authentication', description: 'User logout' },
  PASSWORD_CHANGED: { icon: '🔑✏️', color: 'blue', category: 'Authentication', description: 'Password changed' },
  PASSWORD_RESET_REQUEST: { icon: '🔑📧', color: 'yellow', category: 'Authentication', description: 'Password reset requested' },
  PASSWORD_RESET_SUCCESS: { icon: '🔑✅', color: 'green', category: 'Authentication', description: 'Password reset completed' },
  ACCOUNT_LOCKED: { icon: '🔒', color: 'red', category: 'Security', description: 'Account locked due to failed attempts' },
  ACCOUNT_UNLOCKED: { icon: '🔓', color: 'green', category: 'Security', description: 'Account unlocked' },
  
  // Role and Permission Activities
  ROLE_ASSIGNED: { icon: '👑➕', color: 'purple', category: 'Role Management', description: 'Role assigned to user' },
  ROLE_REMOVED: { icon: '👑➖', color: 'orange', category: 'Role Management', description: 'Role removed from user' },
  ROLE_CHANGED: { icon: '👑🔄', color: 'blue', category: 'Role Management', description: 'User role changed' },
  PERMISSION_GRANTED: { icon: '🔐➕', color: 'green', category: 'Permission Management', description: 'Permission granted' },
  PERMISSION_REVOKED: { icon: '🔐➖', color: 'red', category: 'Permission Management', description: 'Permission revoked' },
  
  // Profile Activities
  PROFILE_UPDATED: { icon: '📝✏️', color: 'blue', category: 'Profile Management', description: 'Profile information updated' },
  EMAIL_CHANGED: { icon: '📧🔄', color: 'blue', category: 'Profile Management', description: 'Email address changed' },
  EMAIL_VERIFIED: { icon: '📧✅', color: 'green', category: 'Profile Management', description: 'Email address verified' },
  PHONE_UPDATED: { icon: '📱✏️', color: 'blue', category: 'Profile Management', description: 'Phone number updated' },
  
  // Security Activities
  TWO_FA_ENABLED: { icon: '🛡️✅', color: 'green', category: 'Security', description: 'Two-factor authentication enabled' },
  TWO_FA_DISABLED: { icon: '🛡️❌', color: 'orange', category: 'Security', description: 'Two-factor authentication disabled' },
  SESSION_EXPIRED: { icon: '⏰❌', color: 'yellow', category: 'Security', description: 'Session expired' },
  SUSPICIOUS_LOGIN: { icon: '🚨', color: 'red', category: 'Security', description: 'Suspicious login detected' },
  
  // Administrative Activities
  BULK_UPDATE: { icon: '📊🔄', color: 'blue', category: 'Administration', description: 'Bulk user update performed' },
  BULK_DELETE: { icon: '📊🗑️', color: 'red', category: 'Administration', description: 'Bulk user deletion performed' },
  DATA_EXPORT: { icon: '📤', color: 'gray', category: 'Administration', description: 'User data exported' },
  DATA_IMPORT: { icon: '📥', color: 'gray', category: 'Administration', description: 'User data imported' },
  
  // System Activities
  SYSTEM_MAINTENANCE: { icon: '⚙️', color: 'yellow', category: 'System', description: 'System maintenance performed' },
  BACKUP_CREATED: { icon: '💾', color: 'blue', category: 'System', description: 'System backup created' },
  SETTINGS_CHANGED: { icon: '⚙️✏️', color: 'blue', category: 'System', description: 'System settings modified' }
};

// Sample Activity Log Data
const SAMPLE_ACTIVITIES = [
  {
    id: 1,
    type: 'USER_CREATED',
    userId: 123,
    userName: 'John Smith',
    actorId: 456,
    actorName: 'Admin User',
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      targetEmail: 'john.smith@company.com',
      role: 'Employee',
      department: 'HR'
    },
    success: true
  },
  {
    id: 2,
    type: 'LOGIN_SUCCESS',
    userId: 789,
    userName: 'Jane Manager',
    actorId: 789,
    actorName: 'Jane Manager',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      sessionId: 'sess_abc123',
      location: 'Manila, Philippines'
    },
    success: true
  },
  {
    id: 3,
    type: 'ROLE_CHANGED',
    userId: 234,
    userName: 'Bob Employee',
    actorId: 456,
    actorName: 'Admin User',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      oldRole: 'Employee',
      newRole: 'Manager',
      reason: 'Promotion'
    },
    success: true
  },
  {
    id: 4,
    type: 'LOGIN_FAILED',
    userId: null,
    userName: 'Unknown',
    actorId: null,
    actorName: 'System',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    details: {
      attemptedEmail: 'hacker@suspicious.com',
      reason: 'Invalid credentials',
      attempts: 3
    },
    success: false
  }
];

export default function ActivityLog() {
  const [activities, setActivities] = useState(SAMPLE_ACTIVITIES);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    userId: '',
    success: '',
    ipAddress: ''
  });
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter activities based on current filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !filters.search || 
      activity.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.actorName.toLowerCase().includes(filters.search.toLowerCase()) ||
      ACTIVITY_TYPES[activity.type]?.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = !filters.category || 
      ACTIVITY_TYPES[activity.type]?.category === filters.category;

    const matchesDateFrom = !filters.dateFrom || 
      new Date(activity.timestamp) >= new Date(filters.dateFrom);

    const matchesDateTo = !filters.dateTo || 
      new Date(activity.timestamp) <= new Date(filters.dateTo);

    const matchesUserId = !filters.userId || 
      activity.userId?.toString() === filters.userId;

    const matchesSuccess = !filters.success || 
      (filters.success === 'true' && activity.success) ||
      (filters.success === 'false' && !activity.success);

    const matchesIP = !filters.ipAddress || 
      activity.ipAddress.includes(filters.ipAddress);

    return matchesSearch && matchesCategory && matchesDateFrom && 
           matchesDateTo && matchesUserId && matchesSuccess && matchesIP;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'timestamp') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate results
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get activity statistics
  const getStatistics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: activities.length,
      today: activities.filter(a => new Date(a.timestamp) >= today).length,
      thisWeek: activities.filter(a => new Date(a.timestamp) >= thisWeek).length,
      thisMonth: activities.filter(a => new Date(a.timestamp) >= thisMonth).length,
      failed: activities.filter(a => !a.success).length,
      categories: Object.values(ACTIVITY_TYPES).reduce((acc, type) => {
        acc[type.category] = (acc[type.category] || 0) + 
          activities.filter(a => ACTIVITY_TYPES[a.type]?.category === type.category).length;
        return acc;
      }, {})
    };
  };

  const stats = getStatistics();

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    };
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Export activities
  const exportActivities = (format) => {
    const data = filteredActivities.map(activity => ({
      Timestamp: new Date(activity.timestamp).toLocaleString(),
      Activity: ACTIVITY_TYPES[activity.type]?.description,
      Category: ACTIVITY_TYPES[activity.type]?.category,
      User: activity.userName,
      Actor: activity.actorName,
      Success: activity.success ? 'Yes' : 'No',
      'IP Address': activity.ipAddress,
      Details: JSON.stringify(activity.details)
    }));

    if (format === 'csv') {
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Activities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.today}</div>
            <div className="text-sm text-gray-500">Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
            <div className="text-sm text-gray-500">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.thisMonth}</div>
            <div className="text-sm text-gray-500">This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full border rounded-md px-3 py-2"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {Object.keys(stats.categories).map(category => (
                  <option key={category} value={category}>
                    {category} ({stats.categories[category]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters({
                  search: '', category: '', dateFrom: '', dateTo: '', 
                  userId: '', success: '', ipAddress: ''
                })}
              >
                Clear Filters
              </Button>
              <span className="text-sm text-gray-500">
                {filteredActivities.length} of {activities.length} activities
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => exportActivities('csv')}>
                📊 Export CSV
              </Button>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="timestamp-desc">Latest First</option>
                <option value="timestamp-asc">Oldest First</option>
                <option value="userName-asc">User A-Z</option>
                <option value="userName-desc">User Z-A</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No activities found matching your criteria</p>
              </div>
            ) : (
              paginatedActivities.map(activity => {
                const activityType = ACTIVITY_TYPES[activity.type];
                const timestamp = formatTimestamp(activity.timestamp);
                
                return (
                  <div
                    key={activity.id}
                    className={`p-4 border rounded-lg ${
                      activity.success ? 'border-gray-200' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{activityType?.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{activityType?.description}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                activityType?.color === 'green' ? 'border-green-200 text-green-700' :
                                activityType?.color === 'red' ? 'border-red-200 text-red-700' :
                                activityType?.color === 'blue' ? 'border-blue-200 text-blue-700' :
                                activityType?.color === 'yellow' ? 'border-yellow-200 text-yellow-700' :
                                'border-gray-200 text-gray-700'
                              }`}
                            >
                              {activityType?.category}
                            </Badge>
                            {!activity.success && (
                              <Badge variant="destructive" className="text-xs">
                                Failed
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <strong>User:</strong> {activity.userName} 
                              {activity.actorName !== activity.userName && (
                                <span> • <strong>By:</strong> {activity.actorName}</span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>🕒 {timestamp.relative}</span>
                              <span>📅 {timestamp.date} {timestamp.time}</span>
                              <span>🌐 {activity.ipAddress}</span>
                              {activity.details?.location && (
                                <span>📍 {activity.details.location}</span>
                              )}
                            </div>

                            {activity.details && Object.keys(activity.details).length > 0 && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                  Show Details
                                </summary>
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  {Object.entries(activity.details).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="font-medium">{key}:</span>
                                      <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
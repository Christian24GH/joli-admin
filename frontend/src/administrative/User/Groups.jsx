import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  Search, 
  Filter,
  Building2,
  TreePine,
  Crown,
  Shield,
  User,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Folder,
  FolderOpen
} from "lucide-react";
import {
  loadAllGroupsData,
  createGroup as apiCreateGroup,
  deleteGroup as apiDeleteGroup,
  addGroupMember as apiAddMember,
  removeGroupMember as apiRemoveMember,
} from "@/api/administrative";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newDept, setNewDept] = useState("");

  // Enhanced UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // grid or tree
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      const { groups: g, users: u, members: m } = await loadAllGroupsData();
      setGroups(Array.isArray(g) ? g : []);
      setUsers(Array.isArray(u) ? u : []);
      setMembers(Array.isArray(m) ? m : []);
      setError(null);
    } catch (e) {
      console.error("loadAll:", e);
      setError(e.message || "Load error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 5000);
    return () => clearInterval(id);
  }, []);

  const membersByGroup = groups.reduce((acc, g) => {
    acc[g.id] = (members || [])
      .filter(m => String(m.group_id) === String(g.id))
      .map(m => users.find(u => String(u.id) === String(m.user_id)))
      .filter(Boolean);
    return acc;
  }, {});

  // Enhanced computed values
  const departments = useMemo(() => {
    const depts = [...new Set(groups.map(g => g.department).filter(Boolean))];
    return depts.sort();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch = !searchTerm || 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.department && group.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = selectedDepartment === "all" || 
        group.department === selectedDepartment ||
        (!group.department && selectedDepartment === "none");
      
      return matchesSearch && matchesDepartment;
    });
  }, [groups, searchTerm, selectedDepartment]);

  const groupStats = useMemo(() => {
    const totalMembers = Object.values(membersByGroup).reduce((sum, members) => sum + members.length, 0);
    const avgMembersPerGroup = groups.length > 0 ? Math.round(totalMembers / groups.length) : 0;
    const largestGroup = groups.reduce((max, group) => {
      const memberCount = membersByGroup[group.id]?.length || 0;
      return memberCount > (membersByGroup[max?.id]?.length || 0) ? group : max;
    }, null);

    return {
      totalGroups: groups.length,
      totalMembers,
      avgMembersPerGroup,
      largestGroup: largestGroup ? { name: largestGroup.name, count: membersByGroup[largestGroup.id]?.length || 0 } : null,
      departments: departments.length
    };
  }, [groups, membersByGroup, departments]);

  async function createGroup() {
    if (!newName.trim()) return;
    try {
      const parentValue = newParent === "__none__" ? null : newParent;
      await apiCreateGroup({ name: newName.trim(), parent: parentValue, department: newDept || null });
      setNewName(""); setNewParent(""); setNewDept("");
      setShowCreateForm(false);
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteGroup(id) {
    if (!window.confirm("Delete group? This cannot be undone.")) return;
    try {
      await apiDeleteGroup(id);
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  async function addMember(groupId, userId) {
    try {
      await apiAddMember(groupId, userId);
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeMember(groupId, userId) {
    try {
      await apiRemoveMember(groupId, userId);
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-600" />;
      case 'manager': return <Shield className="w-3 h-3 text-blue-600" />;
      default: return <User className="w-3 h-3 text-gray-600" />;
    }
  };

  const getDepartmentColor = (department) => {
    if (!department) return "bg-gray-100 text-gray-800";
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];
    const index = department.length % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Groups Management
          </h2>
          <p className="text-sm text-slate-600">Live-connected groups and membership</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadAll} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{groupStats.totalGroups}</p>
                <p className="text-xs text-slate-600">Total Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{groupStats.totalMembers}</p>
                <p className="text-xs text-slate-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{groupStats.departments}</p>
                <p className="text-xs text-slate-600">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{groupStats.avgMembersPerGroup}</p>
                <p className="text-xs text-slate-600">Avg per Group</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-lg font-bold">{groupStats.largestGroup?.name || "—"}</p>
                <p className="text-xs text-slate-600">Largest Group ({groupStats.largestGroup?.count || 0})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="none">No Department</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "tree" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("tree")}
              >
                Tree
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Group Form - Enhanced */}
      {showCreateForm && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Plus className="w-5 h-5" />
              Create New Group
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input 
                  id="groupName"
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="Enter group name"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentGroup">Parent Group</Label>
                <Select value={newParent} onValueChange={setNewParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (Root Level)</SelectItem>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department"
                  value={newDept} 
                  onChange={e => setNewDept(e.target.value)} 
                  placeholder="Enter department"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createGroup} disabled={!newName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid/Tree View */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-500">Loading groups...</p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
          {filteredGroups.map(group => {
            const groupMembers = membersByGroup[group.id] || [];
            const availableUsers = users.filter(u => !groupMembers.some(m => String(m.id) === String(u.id)));
            const isExpanded = expandedGroups.has(group.id);

            return (
              <Card key={group.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupExpansion(group.id)}
                        className="p-1"
                      >
                        {isExpanded ? 
                          <FolderOpen className="w-4 h-4 text-blue-600" /> : 
                          <Folder className="w-4 h-4 text-slate-600" />
                        }
                      </Button>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {group.name}
                          {group.parent && <Badge variant="outline" className="text-xs">Child</Badge>}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getDepartmentColor(group.department)}`}>
                            {group.department || "No Department"}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(userId) => {
                          if (userId) {
                            addMember(group.id, userId);
                          }
                        }}
                      >
                        <SelectTrigger className="w-36">
                          <UserPlus className="w-4 h-4 mr-1" />
                          <SelectValue placeholder="Add member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(user.role)}
                                <span>{user.name}</span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {user.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteGroup(group.id)}
                        className="hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {group.parent && (
                    <div className="text-sm text-slate-500 ml-7">
                      Parent: {groups.find(g => String(g.id) === String(group.parent))?.name || "Unknown"}
                    </div>
                  )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    {groupMembers.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Group Members</Label>
                        <div className="grid gap-2">
                          {groupMembers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                  <AvatarFallback className="text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{user.name}</span>
                                    {getRoleIcon(user.role)}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {user.role}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMember(group.id, user.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserMinus className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No members in this group</p>
                        <p className="text-xs">Add members using the dropdown above</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {filteredGroups.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No groups found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {searchTerm || selectedDepartment !== "all" 
                ? "Try adjusting your filters or search terms"
                : "Create your first group to get started"
              }
            </p>
            {(!searchTerm && selectedDepartment === "all") && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState, useContext } from "react";
import NotificationModal from "../NotificationModal.jsx";
import { NotificationContext } from "../notification-context.jsx";
import UserAuthApp from "../user-auth.jsx";
import UserGroupsHierarchy from "../user-groups-hierarchy.jsx";
import RolePermissionManagement from "../role-permission-management.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";

const ROLES = ["admin", "Employee", "manager", "tour guide"];
const DEPARTMENTS = ["HR", "Core Transaction", "Logistics", "Administrative", "Financials"];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Employee", department: "HR" });
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState({ open: false, action: null, user: null });
  const { addNotification } = useContext(NotificationContext);

  // Fetch users from backend
  async function fetchUsers() {
    try {
      const res = await fetch("http://localhost:4000/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      addNotification({ type: "error", message: "Could not load users." });
    }
  }

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Add user via backend
  function generatePassword(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  async function addUser(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/users/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to add user");
      addNotification({ type: "info", message: `User created and credentials sent to email.` });
      window.alert(`User "${form.name}" registered successfully!\nCredentials have been sent to ${form.email}.`);
      setUsers(users => [
        ...users,
        {
          id: result.id || Date.now(),
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          department: form.department,
          active: true,
          status: "pending"
        }
      ]);
      setForm({ name: "", email: "", phone: "", role: "Employee", department: "HR" });
    } catch (err) {
      addNotification({ type: "error", message: "Failed to add user." });
    }
  }

  // Update user (activate/deactivate/change role)
  async function updateUser(id, updates) {
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;
      const res = await fetch(`http://localhost:4000/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...updates })
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updated = await res.json();
      setUsers(users => users.map(u => u.id === id ? updated : u));
      addNotification({ type: "info", message: `User updated: ${updated.name} (${updated.email})` });
    } catch (err) {
      addNotification({ type: "error", message: "Failed to update user." });
    }
  }

  function deactivateUser(id) {
    updateUser(id, { active: false, status: "suspended" });
  }
  function activateUser(id) {
    updateUser(id, { active: true, status: "active" });
  }
  function changeUserRole(id, role) {
    updateUser(id, { role });
  }

  // Delete user via backend
  async function deleteUser(id) {
    try {
      const res = await fetch(`http://localhost:4000/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users => users.filter(u => u.id !== id));
      addNotification({ type: "error", message: `User deleted: ${users.find(u => u.id === id)?.name || id}` });
    } catch (err) {
      addNotification({ type: "error", message: "Failed to delete user." });
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <NotificationModal />
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">User Management</h1>
      <Tabs defaultValue="accounts" className="mb-8">
        <TabsList className="flex justify-center gap-2 mb-6">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="groups">Groups & Hierarchy</TabsTrigger>
          <TabsTrigger value="security">Authentication & Security</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="profile">Profile & Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* User Accounts */}
        <TabsContent value="accounts">
          <Card className="p-6 mb-8 bg-white shadow-md rounded-lg">
            <CardContent>
              <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="col-span-1 md:col-span-6 mb-2">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-4 py-3 w-full max-w-2xl mx-auto text-blue-900 text-center break-words">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <span>
                        Fill out the form to register a new user.<br />
                        Credentials will be sent to the user's email automatically.
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@gmail.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxxx" />
                </div>
                <div>
                  <Label>Role</Label>
                  <select className="border rounded p-2 w-full" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Department</Label>
                  <select className="border rounded p-2 w-full" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>
                <div className="md:col-span-6 text-right">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">
                    Register User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="mb-4 flex justify-between items-center">
            <Input className="w-1/3" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-slate-500 text-sm">{filteredUsers.length} user(s) found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Phone</th>
                  <th className="py-2 px-4 text-left">Role</th>
                  <th className="py-2 px-4 text-left">Department</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">{user.phone}</td>
                      <td className="py-2 px-4">
                        <select className="border rounded p-1" value={user.role}
                          onChange={e => changeUserRole(user.id, e.target.value)}>
                          {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-4">{user.department}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button variant="outline" onClick={() => setConfirm({ open: true, action: "activate", user })}>
                          Activate
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirm({ open: true, action: "deactivate", user })}>
                          Deactivate
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirm({ open: true, action: "delete", user })}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles">
          <RolePermissionManagement />
        </TabsContent>

        {/* Groups & Hierarchy */}
        <TabsContent value="groups">
          <UserGroupsHierarchy users={users} />
        </TabsContent>

        {/* Authentication & Security */}
        <TabsContent value="security">
          <UserAuthApp />
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="logs">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Activity Logs & Audit Trail</h2>
            <ul className="list-disc ml-6">
              <li>Track user actions (logins, bookings, cancellations, edits)</li>
              <li>History of changes (who modified reservations, payments, or itineraries)</li>
              <li>Security monitoring</li>
            </ul>
          </Card>
        </TabsContent>

        {/* Profile & Preferences */}
        <TabsContent value="profile">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Profile & Preferences</h2>
            <ul className="list-disc ml-6">
              <li>Update contact info, password, and preferences</li>
              <li>Language, timezone, notification settings</li>
              <li>Travel preferences (for customers)</li>
            </ul>
          </Card>
        </TabsContent>

        {/* Notifications & Communication */}
        <TabsContent value="notifications">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Notifications & Communication</h2>
            <ul className="list-disc ml-6">
              <li>Manage notification settings (email, SMS, in-app)</li>
              <li>Email/SMS/app notifications for account activities</li>
              <li>Templates for automated messages</li>
              <li>View communication history with users</li>
              <li>Password reset links, login alerts, booking confirmations</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Are you sure?</h2>
            <p className="mb-4">
              {confirm.action === "delete" && `Delete user "${confirm.user?.name}"? This cannot be undone.`}
              {confirm.action === "activate" && `Activate user "${confirm.user?.name}"?`}
              {confirm.action === "deactivate" && `Deactivate user "${confirm.user?.name}"?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm({ open: false, action: null, user: null })}>
                Cancel
              </Button>
              <Button
                variant={confirm.action === "delete" ? "destructive" : "default"}
                onClick={() => {
                  if (confirm.action === "delete") deleteUser(confirm.user.id);
                  if (confirm.action === "activate") activateUser(confirm.user.id);
                  if (confirm.action === "deactivate") deactivateUser(confirm.user.id);
                  setConfirm({ open: false, action: null, user: null });
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
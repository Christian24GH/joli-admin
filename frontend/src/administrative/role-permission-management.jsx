// src/administrative/role-permission-management.jsx
import React, { useState, useContext } from "react";
import { NotificationContext } from "./notification-context.jsx";
import { Card } from "@/components/ui/card";

const DEFAULT_ROLES = [
  { name: "Admin", permissions: ["view", "book", "cancel", "approve", "edit_payments"] },
  { name: "Travel Agent", permissions: ["view", "book", "cancel", "approve"] },
  { name: "Tour Guide", permissions: ["view", "book"] },
  { name: "Customer", permissions: ["view", "book", "cancel"] },
  { name: "Staff", permissions: ["view"] },
];
const ALL_PERMISSIONS = ["view", "book", "cancel", "approve", "edit_payments"];

export default function RolePermissionManagement() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] });
  const { addNotification } = useContext(NotificationContext);
  // Example usage: addNotification({ type: "info", message: "Role updated successfully" });

  function handlePermissionChange(roleIdx, perm) {
    setRoles(roles => roles.map((role, idx) =>
      idx === roleIdx
        ? {
            ...role,
            permissions: role.permissions.includes(perm)
              ? role.permissions.filter(p => p !== perm)
              : [...role.permissions, perm],
          }
        : role
    ));
  }

  function handleAddRole(e) {
    e.preventDefault();
    if (!newRole.name.trim()) return;
    setRoles([...roles, { ...newRole }]);
    setNewRole({ name: "", permissions: [] });
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Role & Permission Management</h2>
      <Card className="p-4 mb-6">
        <form onSubmit={handleAddRole} className="flex gap-4 items-center mb-4">
          <input
            className="border rounded p-2"
            placeholder="Role name"
            value={newRole.name}
            onChange={e => setNewRole({ ...newRole, name: e.target.value })}
          />
          <div className="flex gap-2">
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={newRole.permissions.includes(perm)}
                  onChange={e => {
                    setNewRole(nr => ({
                      ...nr,
                      permissions: e.target.checked
                        ? [...nr.permissions, perm]
                        : nr.permissions.filter(p => p !== perm),
                    }));
                  }}
                />
                {perm}
              </label>
            ))}
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Role</button>
        </form>
        <div>
          <h3 className="font-semibold mb-2">Defined Roles</h3>
          <table className="w-full text-left border rounded">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Role</th>
                {ALL_PERMISSIONS.map(perm => (
                  <th key={perm} className="p-2">{perm}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role, idx) => (
                <tr key={role.name} className="border-b">
                  <td className="p-2 font-bold">{role.name}</td>
                  {ALL_PERMISSIONS.map(perm => (
                    <td key={perm} className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(perm)}
                        onChange={() => handlePermissionChange(idx, perm)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mb-4">
        <ul className="list-disc ml-6">
          <li>Define roles (Travel Agent, Tour Guide, Customer, Admin, etc.)</li>
          <li>Assign permissions per role (view, book, cancel, approve)</li>
          <li>Fine-grained control (e.g., staff can view reservations but not edit payments)</li>
        </ul>
      </div>
    </div>
  );
}

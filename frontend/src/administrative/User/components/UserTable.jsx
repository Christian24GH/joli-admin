import React from "react";
import { Button } from "@/components/ui/button";

export default function UserTable({ users = [], onUpdate, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.phone}</td>
              <td className="p-2">{user.role}</td>
              <td className="px-4 py-2 text-right">
                {/* Primary toggle action: Activate or Deactivate (only one primary action shown) */}
                {user.active ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm(`Deactivate user "${user.name}"?`)) return;
                      try {
                        await onUpdate(user.id, { active: !user.active });
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await onUpdate(user.id, { active: !user.active });
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Activate
                  </Button>
                )}

                {/* Small spacer */}
                <span style={{ width: 8, display: "inline-block" }} />

                {/* Delete is always available */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
                    try {
                      await onDelete(user.id);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
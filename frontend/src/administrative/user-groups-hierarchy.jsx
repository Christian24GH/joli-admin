// src/administrative/user-groups-hierarchy.jsx
import React, { useState, useContext } from "react";
import { NotificationContext } from "./notification-context.jsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_DEPARTMENTS = ["HR", "Core Transaction", "Logistics", "Administrative", "Financials"];

export default function UserGroupsHierarchy({ users = [], onUpdate }) {
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", department: departments[0], parent: "" });
  const { addNotification } = useContext(NotificationContext);
  // Example usage: addNotification({ type: "info", message: "Group created successfully" });

  function handleAddGroup(e) {
    e.preventDefault();
    if (!newGroup.name.trim()) return;
    setGroups([...groups, { ...newGroup, id: Date.now() }]);
    setNewGroup({ name: "", department: departments[0], parent: "" });
  }

  function handleParentChange(groupId, parentId) {
    setGroups(groups => groups.map(g => g.id === groupId ? { ...g, parent: parentId } : g));
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">User Groups & Hierarchy</h2>
      <Card className="p-4 mb-6">
        <form onSubmit={handleAddGroup} className="flex gap-4 items-center mb-4">
          <input
            className="border rounded p-2"
            placeholder="Group/Team name"
            value={newGroup.name}
            onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
          />
          <select
            className="border rounded p-2"
            value={newGroup.department}
            onChange={e => setNewGroup({ ...newGroup, department: e.target.value })}
          >
            {departments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={newGroup.parent}
            onChange={e => setNewGroup({ ...newGroup, parent: e.target.value })}
          >
            <option value="">No Parent</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <Button type="submit">Add Group</Button>
        </form>
        <div>
          <h3 className="font-semibold mb-2">Groups & Hierarchy</h3>
          <table className="w-full text-left border rounded">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Group/Team</th>
                <th className="p-2">Department</th>
                <th className="p-2">Parent Group</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id} className="border-b">
                  <td className="p-2 font-bold">{g.name}</td>
                  <td className="p-2">{g.department}</td>
                  <td className="p-2">
                    <select
                      className="border rounded p-2"
                      value={g.parent}
                      onChange={e => handleParentChange(g.id, e.target.value)}
                    >
                      <option value="">No Parent</option>
                      {groups.filter(gr => gr.id !== g.id).map(gr => (
                        <option key={gr.id} value={gr.id}>{gr.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mb-4">
        <ul className="list-disc ml-6">
          <li>Organize users under departments/teams</li>
          <li>Parent-child relationships (agency manager → sub-agents)</li>
        </ul>
      </div>
    </div>
  );
}

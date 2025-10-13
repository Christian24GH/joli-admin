import React from "react";

export default function TasksTab({ tasks = [], form = {}, setForm, addTask }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Legal Tasks</h2>
      <form onSubmit={addTask} className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Task</label>
          <input
            className="border rounded p-2"
            value={form.task || ""}
            onChange={e => setForm(f => ({ ...f, task: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Due Date</label>
          <input
            type="date"
            className="border rounded p-2"
            value={form.due || ""}
            onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow">
          Add Task
        </button>
      </form>
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-slate-100 text-slate-700">
            <th className="py-2 px-4 text-left">Task</th>
            <th className="py-2 px-4 text-left">Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-6 text-slate-400">No tasks found.</td>
            </tr>
          ) : (
            tasks.map(t => (
              <tr key={t._id || t.id}>
                <td className="py-2 px-4">{t.task}</td>
                <td className="py-2 px-4">{t.due}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
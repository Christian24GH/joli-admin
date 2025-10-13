import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserForm({ onCreate }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Employee", department: "HR" });

  async function submit(e) {
    e.preventDefault();
    if (onCreate) await onCreate(form);
    setForm({ name: "", email: "", phone: "", role: "Employee", department: "HR" });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <Label>Department</Label>
        <select
          name="department"
          value={form.department || ""}
          onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
          required
          className="w-full border rounded-md p-2"
        >
          <option value="">Choose a department</option>
          <option value="hr">Human Resources</option>
          <option value="financial">Financial</option>
          <option value="core">Core Operations</option>
          <option value="logistics">Logistics</option>
          <option value="administrative">Administrative</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">Create</Button>
      </div>
    </form>
  );
}
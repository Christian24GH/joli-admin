import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CASE_TYPES = [
  "Civil",
  "Labor",
  "Corporate",
  "Criminal",
  "Administrative",
  "Other",
];

export default function CasesTab() {
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({ status: "open" });

  // Fetch cases from backend
  useEffect(() => {
    async function fetchCases() {
      const res = await fetch("http://localhost:4000/cases");
      const data = await res.json();
      setCases(data);
    }
    fetchCases();
  }, []);

  // Add case to backend
  async function addCase(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newCase = await res.json();
    setCases((prev) => [...prev, newCase]);
    setForm({});
  }

  return (
    <Card className="p-6 mb-6 shadow-lg border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <CardContent>
        <h3 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
          🏛️ Case Management
        </h3>
        <form
          onSubmit={addCase}
          className="mb-6 flex flex-wrap gap-4 items-end bg-white/80 p-4 rounded-xl shadow"
        >
          <div className="w-full md:w-auto">
            <Label>Title</Label>
            <Input
              required
              value={form.title || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="w-full md:w-auto">
            <Label>Type</Label>
            <select
              className="border rounded p-2"
              value={form.caseType || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, caseType: e.target.value }))
              }
              required
            >
              <option value="">Select type</option>
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <Label>Due / Hearing Date</Label>
            <Input
              type="date"
              value={form.due || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, due: e.target.value }))
              }
            />
          </div>
          <div className="w-full md:w-auto">
            <Label>Status</Label>
            <select
              className="block w-full p-2 border rounded"
              value={form.status || "open"}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="md:col-span-4 text-right">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Add Case
            </Button>
          </div>
        </form>
        <div className="space-y-6">
          {CASE_TYPES.map((type) => {
            const filteredCases = cases.filter((c) => c.caseType === type);
            if (filteredCases.length === 0) return null;
            return (
              <div key={type} className="bg-white rounded-xl shadow border border-purple-100">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="font-bold text-purple-700">{type} Cases</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="p-2">Title</th>
                        <th className="p-2">Due/Hearing</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((c) => (
                        <tr key={c._id} className="hover:bg-purple-50 transition">
                          <td className="p-2">{c.title}</td>
                          <td className="p-2">{c.due}</td>
                          <td className="p-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold
                                ${
                                  c.status === "open"
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-red-100 text-red-700 border border-red-300"
                                }`}
                            >
                              {c.status === "open" ? "Open" : "Closed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
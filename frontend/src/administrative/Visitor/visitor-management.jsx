import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";

const STORAGE_KEY = 'visitor_mgmt_v1';

// Dropdown options
const purposeOptions = [
  "Meeting",
  "Interview",
  "Delivery",
  "Maintenance",
  "Consultation",
  "Other"
];

const hostOptions = [
  "Reception",
  "HR Department",
  "IT Department",
  "Facilities",
  "Security",
  "Manager",
  "Other"
];

function genPassId() {
  return 'VP-' + Math.random().toString(36).slice(2, 9).toUpperCase();
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d) {
  return startOfDay(d).toISOString();
}

export default function VisitorManagement() {
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({ name: '', host: '', purpose: '', datetime: '', idNumber: '', nda: false });
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [reportRange, setReportRange] = useState('daily');


  // Fetch visitors from backend
  useEffect(() => {
    async function fetchVisitors() {
      try {
        const res = await fetch("http://localhost:4000/visitors");
        const data = await res.json();
        setVisitors(data);
      } catch (e) {
        setToast({ type: 'error', text: 'Failed to fetch visitors.' });
      }
    }
    fetchVisitors();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);


  async function addVisitor(e) {
    e.preventDefault();
    if (!form.name || !form.host || !form.datetime) {
      setToast({ type: 'error', text: 'Please fill name, host and date/time.' });
      return;
    }

    const v = {
      passId: genPassId(),
      name: form.name,
      host: form.host,
      purpose: form.purpose,
      scheduledAt: form.datetime,
      idNumber: form.idNumber,
      nda: form.nda,
      status: 'scheduled'
    };

    try {
      const res = await fetch("http://localhost:4000/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v)
      });
      const newVisitor = await res.json();
      setVisitors((s) => [newVisitor, ...s]);
      setForm({ name: '', host: '', purpose: '', datetime: '', idNumber: '', nda: false });
      setToast({ type: 'success', text: `Visitor registered — Pass ${newVisitor.passId}` });
      setNotifications((n) => [{ id: Date.now(), text: `Visitor ${newVisitor.name} pre-registered for ${newVisitor.host}`, time: new Date().toISOString() }, ...n]);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to save visitor.' });
    }
  }


  async function checkIn(id) {
    try {
      const checkInAt = new Date().toISOString();
      const res = await fetch(`http://localhost:4000/visitors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "checked-in", checkInAt })
      });
      const updated = await res.json();
      setVisitors((s) => s.map((v) => v.id === id ? updated : v));
      setToast({ type: 'info', text: `${updated.name} checked in. Notifying ${updated.host}...` });
      setNotifications((n) => [{ id: Date.now(), text: `Host ${updated.host} notified: ${updated.name} has arrived.`, time: new Date().toISOString() }, ...n]);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to check in visitor.' });
    }
  }

  async function checkOut(id) {
    try {
      const checkOutAt = new Date().toISOString();
      const res = await fetch(`http://localhost:4000/visitors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "checked-out", checkOutAt })
      });
      const updated = await res.json();
      setVisitors((s) => s.map((v) => v.id === id ? updated : v));
      setToast({ type: 'info', text: `${updated.name} checked out.` });
      setNotifications((n) => [{ id: Date.now(), text: `Visitor ${updated.name} checked out.`, time: new Date().toISOString() }, ...n]);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to check out visitor.' });
    }
  }

  async function cancelVisitor(id) {
    try {
      const res = await fetch(`http://localhost:4000/visitors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" })
      });
      const updated = await res.json();
      setVisitors((s) => s.map((v) => v.id === id ? updated : v));
      setToast({ type: 'warning', text: 'Visitor cancelled.' });
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to cancel visitor.' });
    }
  }

  const reportData = useMemo(() => {
    const counts = {};
    const now = new Date();

    visitors.forEach((v) => {
      const date = new Date(v.scheduledAt || v.checkInAt || v.checkOutAt || now);
      let key;
      if (reportRange === 'daily') {
        key = isoDate(date).slice(0, 10);
      } else if (reportRange === 'weekly') {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
        const week1 = new Date(d.getFullYear(), 0, 4);
        const weekNo = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
        key = `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.keys(counts).sort().map((k) => ({ period: k, count: counts[k] }));
    return sorted;
  }, [visitors, reportRange]);

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Visitor Management</h2>
      <Tabs defaultValue="registration" className="mb-8">
        <TabsContent value="registration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Register Visitor Card */}
            <Card className="p-4">
              <CardContent>
                <h3 className="font-semibold text-lg mb-3 text-blue-700">Register Visitor</h3>
                <form onSubmit={addVisitor} className="grid grid-cols-1 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Host</Label>
                    <select
                      className="block w-full p-2 border rounded"
                      value={form.host}
                      onChange={(e) => setForm({ ...form, host: e.target.value })}
                      required
                    >
                      <option value="">Select host...</option>
                      {hostOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Purpose</Label>
                    <select
                      className="block w-full p-2 border rounded"
                      value={form.purpose}
                      onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                      required
                    >
                      <option value="">Select purpose...</option>
                      {purposeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Visit Date & Time</Label>
                    <Input type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} required />
                  </div>
                  <div>
                    <Label>ID Number</Label>
                    <Input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="nda" type="checkbox" checked={form.nda} onChange={(e) => setForm({ ...form, nda: e.target.checked })} />
                    <Label htmlFor="nda">Signed NDA</Label>
                  </div>
                  <div className="text-right">
                    <Button type="submit">Register Visitor</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            {/* Issue Pass Card */}
            <Card className="p-4">
              <CardContent>
                <h3 className="font-semibold text-lg mb-3 text-purple-700">Issue Visitor Pass</h3>
                <ul className="list-disc ml-6 mb-2">
                  <li>Temporary visitor passes/badges are issued after registration.</li>
                  <li>Pass ID is generated and shown in the visitor log.</li>
                </ul>
                <div className="mt-2">
                  <span className="text-sm text-slate-600">
                    Latest Issued Pass:&nbsp;
                    <span className="font-bold text-blue-700">
                      {visitors.length > 0 ? visitors[0].passId : '—'}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="idpass">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">ID/Pass Issuance</h2>
            <ul className="list-disc ml-6">
              <li>Temporary visitor passes/badges</li>
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="checkin">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Check-in/Check-out System</h2>
            <ul className="list-disc ml-6">
              <li>Log visitor entry and exit</li>
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="notification">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Host Notification</h2>
            <ul className="list-disc ml-6">
              <li>Notify staff when their visitor arrives</li>
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Security & Compliance</h2>
            <ul className="list-disc ml-6">
              <li>Capture visitor ID, signatures, and NDAs if needed</li>
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Alert variant="info" className="mb-4">
            <span className="font-semibold">Visitor Reports</span>
            <ul className="list-disc ml-6 mt-2">
              <li>Daily, weekly, monthly visitor logs</li>
            </ul>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Notifications Panel */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-3">
          <CardContent>
            <h3 className="font-semibold">In-Page Notifications</h3>
            <div className="text-sm">
              <button className="text-xs text-slate-500 underline" onClick={clearNotifications}>Clear</button>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {notifications.length === 0 && <li className="text-slate-500">No notifications</li>}
              {notifications.map((n) => (
                <li key={n.id} className="mb-1">{n.text} <span className="text-xs text-slate-400">({new Date(n.time).toLocaleString()})</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="p-3 col-span-2">
          <CardContent>
            <h3 className="font-semibold mb-2">Visitor Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2">Pass ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Host</th>
                    <th className="p-2">Scheduled</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="p-2">{v.passId}</td>
                      <td className="p-2">{v.name}</td>
                      <td className="p-2">{v.host}</td>
                      <td className="p-2">{new Date(v.scheduledAt).toLocaleString()}</td>
                      <td className="p-2">
                        <span
                          className={
                            "px-3 py-1 rounded-full text-xs font-bold " +
                            (v.status === "scheduled"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : v.status === "checked-in"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : v.status === "checked-out"
                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                              : "bg-red-100 text-red-700 border border-red-300")
                          }
                        >
                          {v.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="p-2 flex gap-2">
                        {v.status === 'scheduled' && <Button size="sm" onClick={() => checkIn(v.id)}>Check In</Button>}
                        {v.status === 'checked-in' && <Button size="sm" variant="secondary" onClick={() => checkOut(v.id)}>Check Out</Button>}
                        {v.status !== 'cancelled' && <Button size="sm" variant="ghost" onClick={() => cancelVisitor(v.id)}>Cancel</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Card className="p-4 mb-6">
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Visitor Reports</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="range">Range</Label>
              <select id="range" className="border rounded p-2" value={reportRange} onChange={(e) => setReportRange(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {reportData.length === 0 ? (
            <p className="text-sm text-slate-500">No data for selected range.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={reportData}>
                  <XAxis dataKey="period" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast (ephemeral) */}
      {toast && (
        <div
          className={`fixed right-6 bottom-6 p-3 rounded shadow-lg ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : toast.type === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
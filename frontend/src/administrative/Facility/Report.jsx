import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HotelIcon, Building2Icon, BusIcon } from "lucide-react";

export default function ReportTab() {
  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const [fRes, rRes] = await Promise.all([
          fetch('http://localhost:4000/facilities'),
          fetch('http://localhost:4000/facility-reservations')
        ]);
        if (!fRes.ok) throw new Error('Failed to load facilities');
        if (!rRes.ok) throw new Error('Failed to load reservations');
        const fJson = await fRes.json();
        const rJson = await rRes.json();
        if (!mounted) return;
        setFacilities(Array.isArray(fJson) ? fJson : []);
        setReservations(Array.isArray(rJson) ? rJson : []);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Card className="p-6 mb-4">
        <CardContent>Loading reports...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 mb-4">
        <CardContent>
          <div className="text-red-700 font-bold">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h3 className="font-bold mb-6 text-xl text-blue-700">Reports & Analytics</h3>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Reservations */}
          <div className="bg-blue-50 rounded-xl shadow p-5 flex flex-col items-center">
            <HotelIcon className="text-blue-400 mb-2" size={32} />
            <div className="text-3xl font-extrabold text-blue-700">{reservations.length}</div>
            <div className="text-sm text-slate-600">Total Reservations</div>
          </div>
          {/* Most Booked */}
          <div className="bg-purple-50 rounded-xl shadow p-5 flex flex-col items-center">
            <Building2Icon className="text-purple-400 mb-2" size={32} />
            <div className="text-lg font-bold text-purple-700">
              {facilities.reduce((max, f) => {
                const count = reservations.filter(r => r.facilityId === f.id).length;
                return count > max.count ? { name: f.name, count } : max;
              }, { name: "—", count: 0 }).name}
            </div>
            <div className="text-sm text-slate-600">Most Booked Facility</div>
          </div>
          {/* Revenue */}
          <div className="bg-green-50 rounded-xl shadow p-5 flex flex-col items-center">
            <BusIcon className="text-green-400 mb-2" size={32} />
            <div className="text-2xl font-extrabold text-green-700">
              ${reservations.reduce((sum, r) => sum + (r.price || 0), 0)}
            </div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
        </div>
        {/* Reservation History Table */}
        <div className="mb-8">
          <h4 className="font-semibold mb-2 text-purple-700">Reservation History</h4>
          <table className="w-full text-left rounded overflow-hidden shadow">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Facility</th>
                <th className="p-2">Customer/Group</th>
                <th className="p-2">Start</th>
                <th className="p-2">End</th>
                <th className="p-2">Status</th>
                <th className="p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-slate-500 text-center p-2">No reservations yet.</td>
                </tr>
              ) : (
                reservations.map(r => {
                  const facility = facilities.find(f => f.id === r.facilityId);
                  return (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{facility?.name || r.facilityId}</td>
                      <td className="p-2">{r.group || r.customer || "—"}</td>
                      <td className="p-2">{r.start}</td>
                      <td className="p-2">{r.end}</td>
                      <td className="p-2">
                        <span className={
                          "px-2 py-1 rounded-full text-xs font-bold " +
                          (r.status === "approved"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : r.status === "cancelled"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-300")
                        }>
                          {r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "—"}
                        </span>
                      </td>
                      <td className="p-2">${r.price}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Utilization & Revenue by Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-purple-700">Utilization Report</h4>
            <div className="space-y-4">
              {facilities.map(f => {
                const count = reservations.filter(r => r.facilityId === f.id).length;
                const maxBookings = Math.max(...facilities.map(fac => reservations.filter(r => r.facilityId === fac.id).length), 1);
                const percent = Math.round((count / maxBookings) * 100);
                return (
                  <div key={f.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700">{f.name}</span>
                      <span className="text-xs text-slate-500">{count} booking{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded">
                      <div
                        className={
                          "h-3 rounded " +
                          (percent > 70
                            ? "bg-green-400"
                            : percent > 30
                            ? "bg-yellow-400"
                            : "bg-red-400")
                        }
                        style={{ width: `${percent}%`, minWidth: count > 0 ? "16px" : "0" }}
                      />
                    </div>
                    <div className="text-xs text-slate-400">{percent}% utilization</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <b>Least Booked:</b>{" "}
              {facilities.reduce((min, f) => {
                const count = reservations.filter(r => r.facilityId === f.id).length;
                return (min.count === null || count < min.count) ? { name: f.name, count } : min;
              }, { name: "—", count: null }).name}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-purple-700">Revenue by Facility Type</h4>
            <ul className="list-disc ml-6">
              {["Hotel", "Function Room", "Vehicle", "Attraction"].map(type => {
                const revenue = reservations
                  .filter(r => facilities.find(f => f.id === r.facilityId)?.type === type)
                  .reduce((sum, r) => sum + (r.price || 0), 0);
                return (
                  <li key={type} className="mb-1">
                    <span className="font-bold text-blue-700">{type}</span>: ${revenue}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserIcon, HotelIcon, Building2Icon, BusIcon, LandmarkIcon } from "lucide-react";

export default function ReservationTab() {
  const defaultFacilities = [
    { id: 'hotel-1', type: 'Hotel', name: 'Sunrise Hotel', capacity: 100, amenities: ['Pool', 'WiFi'], price: 120, photos: [], description: '4-star hotel in city center.' },
    { id: 'room-a', type: 'Function Room', name: 'Conference Room A', capacity: 12, amenities: ['Projector', 'Whiteboard'], price: 50, photos: [], description: 'Ideal for meetings.' },
    { id: 'bus-1', type: 'Vehicle', name: 'Tour Bus #1', capacity: 40, amenities: ['AC', 'TV'], price: 200, photos: [], description: 'Comfortable bus for group tours.' },
    { id: 'museum', type: 'Attraction', name: 'City Museum', capacity: 200, amenities: ['Guided Tours'], price: 10, photos: [], description: 'Explore local history.' },
  ];

  const [facilities, setFacilities] = useState(defaultFacilities);
  const [reservations, setReservations] = useState([]);
  const initialFacilityId = defaultFacilities.length > 0 ? defaultFacilities[0].id : '';
  const [form, setForm] = useState({ facilityId: initialFacilityId, start: '', end: '', group: '', customer: '', payment: 0, paymentStatus: 'pending', purpose: '' });
  const [loadError, setLoadError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const notificationId = useRef(1);

  const purposeOptions = ["Meeting", "Training", "Presentation", "Event", "Tour", "Other"];

  const facilityIcons = {
    Hotel: <HotelIcon className="text-blue-500" />,
    "Function Room": <Building2Icon className="text-purple-500" />,
    Vehicle: <BusIcon className="text-green-500" />,
    Attraction: <LandmarkIcon className="text-pink-500" />,
  };

  async function fetchReservations() {
    try {
      const res = await fetch("http://localhost:4000/facility-reservations");
      if (!res.ok) throw new Error('Failed to fetch reservations');
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setReservations(data.map(r => ({
        ...r,
        price: typeof r.price === 'string' ? parseFloat(r.price) : r.price
      })));
    } catch (err) {
      setReservations([]);
      setLoadError('Could not load reservations from backend.');
    }
  }

  async function fetchFacilities() {
    try {
      const res = await fetch("http://localhost:4000/facilities");
      if (!res.ok) throw new Error('Failed to fetch facilities');
      let data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data = data.map(f => ({
          ...f,
          price: typeof f.price === 'string' ? parseFloat(f.price) : f.price,
          amenities: Array.isArray(f.amenities) ? f.amenities : (typeof f.amenities === 'string' ? f.amenities.split(',').map(a => a.trim()).filter(Boolean) : [])
        }));
        setFacilities(data);
        setForm(f => ({ ...f, facilityId: data[0].id }));
      } else {
        setFacilities(defaultFacilities);
        setForm(f => ({ ...f, facilityId: defaultFacilities[0].id }));
      }
    } catch (err) {
      setFacilities(defaultFacilities);
      setForm(f => ({ ...f, facilityId: defaultFacilities[0].id }));
      setLoadError('Could not load facilities from backend. Showing defaults.');
    }
  }

  useEffect(() => {
    fetchFacilities();
    fetchReservations();
  }, []);

  async function addReservation(e) {
    e.preventDefault();
    const start = new Date(form.start);
    const end = new Date(form.end);
    if (isNaN(start) || isNaN(end) || end <= start) {
      setNotifications(n => [...n, { id: notificationId.current++, type: 'error', text: 'End must be after start.' }]);
      return;
    }
    const facility = facilities.find(f => f.id === form.facilityId);
    const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
    const price = facility ? facility.price * hours : 0;
    const reservation = {
      facility_id: form.facilityId,
      start: form.start,
      end: form.end,
      group_name: form.group,
      customer: form.customer,
      purpose: form.purpose,
      price,
      payment: form.payment,
      payment_status: form.paymentStatus,
      status: 'pending'
    };
    try {
      await fetch("http://localhost:4000/facility-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation)
      });
      await fetchReservations();
      setNotifications(n => [...n, { id: notificationId.current++, type: 'info', text: 'Reservation requested.' }]);
      setForm({ facilityId: facilities.length > 0 ? facilities[0].id : '', start: '', end: '', group: '', customer: '', payment: 0, paymentStatus: 'pending', purpose: '' });
    } catch (err) {
      setNotifications(n => [...n, { id: notificationId.current++, type: 'error', text: 'Failed to save reservation.' }]);
    }
  }

  async function approveReservation(id) {
    try {
      await fetch(`http://localhost:4000/facility-reservations/${id}/approve`, { method: 'PUT' });
      await fetchReservations();
      setNotifications(n => [...n, { id: notificationId.current++, type: 'info', text: 'Reservation approved.' }]);
    } catch (err) {
      setNotifications(n => [...n, { id: notificationId.current++, type: 'error', text: 'Failed to approve reservation.' }]);
    }
  }

  async function cancelReservation(id) {
    try {
      await fetch(`http://localhost:4000/facility-reservations/${id}/cancel`, { method: 'PUT' });
      await fetchReservations();
      setNotifications(n => [...n, { id: notificationId.current++, type: 'info', text: 'Reservation cancelled.' }]);
    } catch (err) {
      setNotifications(n => [...n, { id: notificationId.current++, type: 'error', text: 'Failed to cancel reservation.' }]);
    }
  }

  return (
    <Card className="p-4 mb-4">
      <CardContent>
        {loadError && <div className="mb-3 text-red-700 font-semibold">{loadError}</div>}
        <form onSubmit={addReservation} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label>Facility</Label>
            <select className="block w-full p-2 border rounded" value={form.facilityId} onChange={(e) => setForm({ ...form, facilityId: e.target.value })}>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Start</Label>
            <Input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required />
          </div>
          <div>
            <Label>End</Label>
            <Input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} required />
          </div>
          <div>
            <Label>Group/Customer</Label>
            <Input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="Group or Customer Name" />
          </div>
          <div>
            <Label>Purpose</Label>
            <select className="block w-full p-2 border rounded" value={form.purpose || ""} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              <option value="">Select purpose...</option>
              {purposeOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
            </select>
          </div>
          <div className="md:col-span-5 text-right mt-2">
            <Button type="submit">Book Facility</Button>
          </div>
        </form>

        <div className="mt-4">
          <h4 className="font-semibold mb-4 text-lg">Current Reservations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.length === 0 ? (
              <div className="text-slate-500 text-center col-span-full">No reservations yet.</div>
            ) : (
              reservations.map(r => {
                const facility = facilities.find(f => f.id === (r.facilityId || r.facility_id));
                return (
                  <Card
                    key={r.id}
                    className={`p-5 shadow border-2 flex flex-col justify-between
                      ${r.status === "approved" ? "border-green-300" : r.status === "cancelled" ? "border-red-300" : "border-yellow-300"}
                    `}
                  >
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {facilityIcons[facility?.type] || null}
                        <span className="font-bold text-blue-700 text-lg">{facility?.name || r.facilityId || r.facility_id}</span>
                        <span className={"ml-auto px-3 py-1 rounded-full text-xs font-bold " + (r.status === "approved" ? "bg-green-100 text-green-700 border border-green-300" : r.status === "cancelled" ? "bg-red-100 text-red-700 border border-red-300" : "bg-yellow-100 text-yellow-700 border border-yellow-300")}>{r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "—"}</span>
                      </div>
                      <div className="mb-1 text-sm text-slate-600"><b>Start:</b> {r.start}</div>
                      <div className="mb-1 text-sm text-slate-600"><b>End:</b> {r.end}</div>
                      <div className="mb-1 text-sm text-slate-600 flex items-center gap-1"><UserIcon className="size-4 text-slate-400" /><span><b>Group/Customer:</b> {r.group || r.group_name || "—"}</span></div>
                      <div className="mb-1 text-sm text-slate-600"><b>Purpose:</b> {r.purpose}</div>
                      <div className="mb-2 text-sm text-slate-600"><b>Price:</b> ${r.price}</div>
                      <div className="flex gap-2 mt-2">
                        {r.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => approveReservation(r.id)}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => cancelReservation(r.id)}>Cancel</Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold">Notifications</h5>
            <ul className="text-sm">
              {notifications.map(n => <li key={n.id} className={n.type === 'error' ? 'text-red-600' : 'text-slate-700'}>{n.text}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

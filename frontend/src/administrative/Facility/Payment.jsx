import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentTab() {
  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const [fRes, rRes] = await Promise.all([
          fetch("http://localhost:4000/facilities"),
          fetch("http://localhost:4000/facility-reservations")
        ]);
        if (!fRes.ok) throw new Error("Failed to load facilities");
        if (!rRes.ok) throw new Error("Failed to load reservations");
        const fJson = await fRes.json();
        const rJson = await rRes.json();
        if (!mounted) return;
        setFacilities(Array.isArray(fJson) ? fJson : []);
        setReservations(Array.isArray(rJson) ? rJson : []);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  async function handlePaymentStatus(id, status) {
    try {
      const res = await fetch(`http://localhost:4000/facility-reservations/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      const updated = await res.json();
      setReservations((prev) => prev.map(r => (r.id === id ? { ...r, paymentStatus: updated.paymentStatus || status } : r)));
      setNotifications((n) => [{ id: Date.now(), type: 'success', text: `Payment status updated to ${status}` }, ...n]);
    } catch (err) {
      console.error(err);
      setNotifications((n) => [{ id: Date.now(), type: 'error', text: err.message || 'Failed to update payment' }, ...n]);
    }
  }

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <CardContent>Loading payments...</CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-4 mb-4">
        <CardContent>
          <h3 className="font-semibold mb-3 text-xl text-blue-700">Payments & Billing</h3>
          <ul className="list-disc ml-6 mb-6 text-slate-700">
            <li>Price computation (per night, per hour, per use)</li>
            <li>Discounts, promotions, loyalty rewards</li>
            <li>Payment tracking (advance, installment, full)</li>
            <li>Refunds and cancellation policies</li>
          </ul>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.length === 0 ? (
              <div className="text-slate-500 text-center col-span-full">No reservations yet.</div>
            ) : (
              reservations.map(r => {
                const facility = facilities.find(f => f.id === (r.facilityId || r.facility_id));
                const discount = (r.group === 'VIP' || r.group_name === 'VIP') ? 0.1 : 0;
                const price = r.price ?? (facility ? facility.price : 0);
                const discountedPrice = price - price * discount;
                const paymentStatus = r.paymentStatus || r.payment_status || 'pending';
                return (
                  <Card key={r.id} className="p-5 shadow border border-slate-200">
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-blue-700 text-lg">{facility?.name || r.facilityId || r.facility_id}</span>
                      </div>
                      <div className="mb-1 text-sm text-slate-600">
                        <b>Customer/Group:</b> {r.group || r.group_name || "—"}
                      </div>
                      <div className="mb-1 text-sm text-slate-600">
                        <b>Purpose:</b> {r.purpose}
                      </div>
                      <div className="mb-1 text-sm text-slate-600">
                        <b>Start:</b> {r.start}
                      </div>
                      <div className="mb-1 text-sm text-slate-600">
                        <b>End:</b> {r.end}</div>
                      <div className="mb-1 text-sm text-slate-600">
                        <b>Base Price:</b> ${price}
                      </div>
                      {discount > 0 && (
                        <div className="mb-1 text-sm text-green-700">
                          <b>Discount:</b> {discount * 100}% (Loyalty)
                        </div>
                      )}
                      <div className="mb-1 text-sm text-blue-700 font-bold">
                        <b>Total Due:</b> ${discountedPrice}
                      </div>
                      <div className="mb-1 text-sm">
                        <b>Payment Status:</b>{" "}
                        <span
                          className={
                            "px-2 py-1 rounded-full text-xs font-bold " +
                            (paymentStatus === "paid"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-red-100 text-red-700 border border-red-300")
                          }
                        >
                          {paymentStatus ? (paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)) : "—"}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {paymentStatus !== "paid" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePaymentStatus(r.id, "paid")}
                            >
                              Mark as Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatus(r.id, "refunded")}
                            >
                              Refund
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {notifications.length > 0 && (
        <Card className="p-3 mb-4 bg-slate-50">
          <CardContent>
            <h3 className="font-semibold">Notifications</h3>
            <ul className="list-disc pl-5 text-sm">
              {notifications.map(n => (
                <li key={n.id} className={n.type === 'error' ? 'text-red-600' : 'text-slate-700'}>{n.text}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {error && (
        <div className="text-red-700 font-bold mt-2">{error}</div>
      )}
    </div>
  );
}
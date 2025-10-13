import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DocumentTab() {
  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptContent, setReceiptContent] = useState('');
  const [receiptTitle, setReceiptTitle] = useState('');

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

  async function handleShowReceipt(id, facilityName) {
    try {
      const safeId = encodeURIComponent(id);
      const endpoints = [
        `http://localhost:4000/facility-reservations/${safeId}`,
        `http://localhost:4000/facility-reservations/${safeId}/receipt`
      ];
      let lastError = null;
      for (const url of endpoints) {
        let res;
        try {
          res = await fetch(url);
        } catch (fetchErr) {
          lastError = fetchErr;
          continue;
        }
        if (!res.ok) {
          lastError = new Error(`Server returned ${res.status} for ${url}`);
          continue;
        }
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
          const data = await res.json();
          const content = `Receipt\n\nFacility: ${facilityName || data.facilityId || data.facility_id}\nCustomer/Group: ${data.group || data.group_name || data.customer || '—'}\nStart: ${data.start}\nEnd: ${data.end}\nPurpose: ${data.purpose || '—'}\nPrice: $${data.price || 0}\nPayment Status: ${data.paymentStatus || data.payment_status || '—'}`;
          setReceiptTitle(`Receipt_${facilityName || data.facilityId || data.facility_id}`);
          setReceiptContent(content);
          setShowReceipt(true);
          setError(null);
          return;
        }
        // fallback to text/plain or other text response
        try {
          const text = await res.text();
          const title = facilityName || `Reservation_${id}`;
          setReceiptTitle(`Receipt_${title}`);
          setReceiptContent(text);
          setShowReceipt(true);
          setError(null);
          return;
        } catch (txtErr) {
          lastError = txtErr;
          continue;
        }
      }
      // If none of the endpoints returned usable content
      throw lastError || new Error('Failed to fetch reservation');
    } catch (err) {
      console.error('handleShowReceipt error:', err);
      setError(err.message || 'Failed to load receipt');
    }
  }

  function handleDownloadReceipt() {
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receiptTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <CardContent>Loading documents...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <CardContent>
        <h3 className="font-semibold mb-3">Documents & Confirmation</h3>
        <div className="mb-4 text-slate-700">View and download reservation documents below.</div>
        {reservations.length === 0 ? (
          <div className="text-slate-500 text-center">No reservations yet.</div>
        ) : (
          <table className="w-full text-left rounded overflow-hidden shadow mb-4">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Facility</th>
                <th className="p-2">Customer/Group</th>
                <th className="p-2">Start</th>
                <th className="p-2">End</th>
                <th className="p-2">Documents</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => {
                const facility = facilities.find(f => f.id === (r.facilityId || r.facility_id));
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{facility?.name || r.facilityId || r.facility_id}</td>
                    <td className="p-2">{r.group || r.group_name || r.customer || "—"}</td>
                    <td className="p-2">{r.start}</td>
                    <td className="p-2">{r.end}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleShowReceipt(r.id, facility?.name || r.facilityId || r.facility_id)}>Receipt</Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`/evoucher/${r.id}`, '_blank')}>E-voucher</Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`/travel-docs/${r.id}`, '_blank')}>Travel Docs</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <h4 className="font-bold mb-2 text-lg">{receiptTitle}</h4>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded mb-3">{error}</div>
              )}
              <pre className="bg-slate-100 p-3 rounded text-sm mb-4 max-h-96 overflow-auto">{receiptContent || 'No receipt available.'}</pre>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={handleDownloadReceipt} disabled={!receiptContent}>Download</Button>
                <Button size="sm" variant="destructive" onClick={() => setShowReceipt(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-700 font-bold mt-2">{error}</div>
        )}
      </CardContent>
    </Card>
  );
}
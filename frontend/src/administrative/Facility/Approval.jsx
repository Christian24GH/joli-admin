import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ApprovalTab({ reservations, facilities, approveReservation, cancelReservation, facilityIcons }) {
  return (
    <Card className="p-6 mb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow border-0">
      <CardContent>
        <h3 className="font-bold text-xl mb-4 text-purple-700">Approval Workflow</h3>
        <div className="flex flex-col gap-6">
          {/* Stepper */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
              <span className="mt-2 text-sm font-semibold text-blue-700">Request</span>
            </div>
            <span className="text-2xl text-slate-400">→</span>
            <div className="flex flex-col items-center">
              <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
              <span className="mt-2 text-sm font-semibold text-purple-700">Approval</span>
            </div>
            <span className="text-2xl text-slate-400">→</span>
            <div className="flex flex-col items-center">
              <span className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
              <span className="mt-2 text-sm font-semibold text-pink-700">Confirmation</span>
            </div>
          </div>
          {/* Approval Actions */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-purple-700">Pending Reservations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.filter(r => r.status === "pending").length === 0 ? (
                <div className="text-slate-500">No pending reservations.</div>
              ) : (
                reservations.filter(r => r.status === "pending").map(r => {
                  const facility = facilities.find(f => f.id === r.facilityId);
                  return (
                    <Card key={r.id} className="p-4 border border-yellow-300">
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          {facilityIcons[facility?.type] || null}
                          <span className="font-bold text-blue-700">{facility?.name || r.facilityId}</span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          <b>Customer/Group:</b> {r.group || r.customer || "—"}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => approveReservation(r.id)}>Approve</button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => cancelReservation(r.id)}>Cancel</button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
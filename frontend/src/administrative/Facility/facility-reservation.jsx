import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReservationTab from './Reservation';
import SchedulingTab from './Scheduling';
import PaymentTab from './Payment';
import DocumentTab from './Document';
import CatalogTab from './Catalog';
import ReportTab from './Report';
import ApprovalTab from './Approval';

export default function FacilityReservation() {
  // The child tabs (Reservation, Scheduling, Payment, Document, Catalog, Report)
  // are self-contained and fetch their own data. This wrapper now only handles
  // tab layout and high-level presentation.

  // Wrapper handles only layout; child tabs are self-contained.

  return (
    <div className="p-6">
      {/* Top-level page header */}
      <h2 className="text-2xl font-semibold mb-4">Facility Reservation</h2>
  <Tabs defaultValue={"catalog"} className="mb-8">

        {/* Facility Catalog */}
        <TabsContent value="catalog">
          <CatalogTab />
        </TabsContent>

        {/* Reservation & Booking Management (migrated to `Reservation.jsx`) */}
        <TabsContent value="booking">
          <ReservationTab />
        </TabsContent>

        {/* Scheduling & Calendar Integration (migrated to `Scheduling.jsx`) */}
        <TabsContent value="calendar">
          <SchedulingTab />
        </TabsContent>

        {/* Approval & Workflow */}
        <TabsContent value="approval">
          <ApprovalTab />
        </TabsContent>

        {/* Payments & Billing (migrated to `Payment.jsx`) */}
        <TabsContent value="payments">
          <PaymentTab />
        </TabsContent>

        {/* Documents & Confirmation (migrated to `Document.jsx`) */}
        <TabsContent value="docs">
          <DocumentTab />
        </TabsContent>

        {/* Reports & Analytics (migrated to `Report.jsx`) */}
        <TabsContent value="reports">
          <ReportTab />
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// NOTE: Do not import package-specific CSS files here if your installed @fullcalendar
// version does not expose ".../main.css". Import FullCalendar styles globally (e.g. add a
// <link> in index.html or import a global CSS file), or install matching @fullcalendar v5 packages.
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';
 
export default function SchedulingTab() {
  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fRes, rRes] = await Promise.all([
          fetch('http://localhost:4000/facilities'),
          fetch('http://localhost:4000/facility-reservations')
        ]);
        const fData = fRes.ok ? await fRes.json() : [];
        const rData = rRes.ok ? await rRes.json() : [];
        setFacilities(Array.isArray(fData) ? fData : []);
        setReservations(Array.isArray(rData) ? rData : []);
      } catch (err) {
        setLoadError('Failed to load calendar data.');
      }
    }
    fetchData();
  }, []);

  const events = useMemo(() => reservations.map(r => ({
    id: r.id,
    title: `${(facilities.find(f => f.id === (r.facilityId || r.facility_id))?.name) || r.facilityId || r.facility_id} (${r.status || 'pending'})`,
    start: r.start,
    end: r.end,
    extendedProps: { reservation: r }
  })), [reservations, facilities]);

  function handleEventClick(info) {
    setSelectedEvent(info.event.extendedProps.reservation || null);
  }

  return (
    <Card className="p-4 mb-4">
      <CardContent>
        {loadError && <div className="mb-3 text-red-700 font-semibold">{loadError}</div>}
        <h3 className="font-semibold mb-3">Availability Calendar</h3>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          eventClick={handleEventClick}
          height="600px"
        />

        {selectedEvent && (
          <div className="mt-4 p-3 border rounded bg-white">
            <h4 className="font-semibold">Reservation Details</h4>
            <div><b>Facility:</b> {selectedEvent.facilityName || selectedEvent.facilityId || selectedEvent.facility_id}</div>
            <div><b>Start:</b> {selectedEvent.start}</div>
            <div><b>End:</b> {selectedEvent.end}</div>
            <div><b>Group:</b> {selectedEvent.group || selectedEvent.group_name || '—'}</div>
            <div className="mt-2"><button className="underline text-sm" onClick={() => setSelectedEvent(null)}>Close</button></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
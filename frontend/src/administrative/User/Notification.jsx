import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Notification() {
  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="font-semibold mb-2">Notifications & Communication</h2>
        <p className="text-sm text-slate-600">Templates, channels (email/SMS/in-app) and history (scaffold).</p>
      </CardContent>
    </Card>
  );
}
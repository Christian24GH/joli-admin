
import React, { useContext, useState } from "react";
import { NotificationContext } from "./notification-context.jsx";

export default function NotificationModal() {
	const { notifications, removeNotification } = useContext(NotificationContext);
	const [open, setOpen] = useState(false);
	const unreadCount = notifications.length;

	return (
		<div style={{ position: "fixed", top: 16, right: 32, zIndex: 1000 }}>
			<button
				aria-label="Show notifications"
				className="relative bg-white rounded-full shadow p-2 hover:bg-slate-100"
				onClick={() => setOpen((o) => !o)}
				style={{ border: "none", outline: "none" }}
			>
				{/* Bell Icon SVG */}
				<svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1" style={{ minWidth: 18 }}>
						{unreadCount}
					</span>
				)}
			</button>
			{open && unreadCount > 0 && (
				<div className="mt-2 w-full flex flex-col items-end">
					<div className="shadow-lg rounded px-6 py-3 bg-white border border-slate-300" style={{ minWidth: 300, maxWidth: 500 }}>
						<div className="flex justify-between items-center mb-2">
							<span className="font-semibold">Notifications</span>
							<button className="text-xs text-slate-500 hover:text-black" onClick={() => setOpen(false)}>
								×
							</button>
						</div>
						<ul className="space-y-2">
							{notifications.map((n) => (
								<li key={n.id} className={`flex justify-between items-center border-b pb-2 ${n.type === "error" ? "text-red-700" : n.type === "warning" ? "text-yellow-700" : "text-green-700"}`}>
									<span>{n.message || n.text}</span>
									<button className="ml-2 text-xs text-slate-400 hover:text-black" onClick={() => removeNotification(n.id)}>
										×
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}

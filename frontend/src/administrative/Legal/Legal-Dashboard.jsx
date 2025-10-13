import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScaleIcon, BookOpenCheckIcon, PieChartIcon } from "lucide-react";

const CASE_TYPES = [
	"Civil",
	"Labor",
	"Corporate",
	"Criminal",
	"Administrative",
	"Other",
];

export default function LegalManagement() {
	// State for each module
	const [cases, setCases] = useState([]);
	const [contracts, setContracts] = useState([]);
	const [documents, setDocuments] = useState([]);
	const [compliance, setCompliance] = useState([]);
	const [advisories, setAdvisories] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [alerts, setAlerts] = useState([]);
	const [analytics, setAnalytics] = useState({});
	const [contractForm, setContractForm] = useState({});

	// Fetch all data on mount
	useEffect(() => {
		fetchAll();
	}, []);

	async function fetchAll() {
		// Replace with your backend endpoints
		const [
			casesRes,
			contractsRes,
			docsRes,
			complianceRes,
			advisoriesRes,
			tasksRes,
			analyticsRes,
		] = await Promise.all([
			fetch("http://localhost:4000/cases").then((r) => r.json()),
			fetch("http://localhost:4000/contracts").then((r) => r.json()),
			fetch("http://localhost:4000/documents").then((r) => r.json()),
			fetch("http://localhost:4000/compliance").then((r) => r.json()),
			fetch("http://localhost:4000/advisories")
				.then((r) => r.json())
				.catch(() => ({ advisories: [] })),
			fetch("http://localhost:4000/tasks")
				.then((r) => r.json())
				.catch(() => ({ tasks: [] })),
			fetch("http://localhost:4000/analytics")
				.then((r) => r.json())
				.catch(() => ({})),
		]);
		setCases(casesRes.cases || []);
		setContracts(contractsRes.contracts || []);
		setDocuments(docsRes.documents || []);
		setCompliance(complianceRes.compliance || []);
		setAdvisories(advisoriesRes.advisories || []);
		setTasks(tasksRes.tasks || []);
		setAnalytics(analyticsRes || {});
	}

	// Alerts & Reminders (expiring contracts, hearings, compliance deadlines)
	useEffect(() => {
		const today = new Date();
		const soon = new Date();
		soon.setDate(today.getDate() + 7);
		const dueSoon = [...contracts, ...cases, ...compliance].filter(
			(r) => r.due && new Date(r.due) <= soon && new Date(r.due) >= today
		);
		setAlerts(dueSoon);
	}, [contracts, cases, compliance]);

	// Auto-dismiss alerts after 5 seconds
	useEffect(() => {
		if (alerts.length === 0) return;
		const timers = alerts.map((a, i) =>
			setTimeout(() => {
				setAlerts((prev) => prev.filter((_, idx) => idx !== i));
			}, 5000)
		);
		return () => timers.forEach(clearTimeout);
	}, [alerts]);

	return (
		<div className="p-6">
			{/* Notification-style Alerts (top right, auto-dismiss) */}
			<div className="fixed top-8 right-8 z-50 flex flex-col gap-4">
				{alerts.length > 0 &&
					alerts.map((a, i) => (
						<div
							key={a._id || i}
							className="bg-red-100 border-l-4 border-red-500 shadow-lg rounded-md px-5 py-4 min-w-[260px] max-w-xs animate-fade-in"
						>
							<div className="flex items-center gap-2 mb-1">
								<span className="text-red-600 text-xl">⚠️</span>
								<span className="font-semibold text-red-700">Alert</span>
							</div>
							<div className="text-sm text-slate-700">
								<span className="font-medium">{a.title}</span> is due on{" "}
								<b>{a.due}</b>
							</div>
						</div>
					))}
			</div>

			<h2 className="text-2xl font-semibold mb-4">Legal Management</h2>

			{/* Analytics Dashboard Summary */}
			<Card className="">
				<CardContent>
					<h3 className="font-bold text-2xl mb-6 text-purple-700 flex items-center gap-2">
						<PieChartIcon className="text-purple-500" /> Legal Analytics Dashboard
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="rounded-xl bg-white/80 shadow flex flex-col items-center p-6 border border-purple-200">
							<ScaleIcon className="size-10 text-pink-500 mb-2" />
							<div className="text-4xl font-extrabold text-pink-700">
								{cases.filter((c) => c.status === "open").length}
							</div>
							<div className="text-sm text-slate-600 mb-1">Ongoing Cases</div>
							<div className="text-2xl font-bold text-pink-400">
								{cases.filter((c) => c.status === "closed").length}
							</div>
							<div className="text-xs text-slate-400">Closed Cases</div>
						</div>
						<div className="rounded-xl bg-white/80 shadow flex flex-col items-center p-6 border border-blue-200">
							<BookOpenCheckIcon className="size-10 text-blue-500 mb-2" />
							<div className="text-4xl font-extrabold text-blue-700">
								{contracts.filter((c) => c.status === "pending").length}
							</div>
							<div className="text-sm text-slate-600 mb-1">Pending Contracts</div>
							<div className="flex gap-2 mt-2">
								<span className="text-green-600 font-bold">
									{contracts.filter((c) => c.status === "approved").length} Approved
								</span>
								<span className="text-red-500 font-bold">
									{contracts.filter((c) => c.status === "expired").length} Expired
								</span>
							</div>
						</div>
						<div className="rounded-xl bg-white/80 shadow flex flex-col items-center p-6 border border-green-200">
							<PieChartIcon className="size-10 text-green-500 mb-2" />
							<div className="text-3xl font-extrabold text-green-700">
								$
								{contracts
									.reduce((sum, c) => sum + (Number(c.value) || 0), 0)
									.toLocaleString()}
							</div>
							<div className="text-sm text-slate-600 mb-1">Financial Exposure</div>
							<div className="mt-2">
								<span className="text-xs text-green-500 font-semibold">
									Total Contract Value
								</span>
							</div>
						</div>
					</div>
					{/* Risk Analysis */}
					<div className="mt-8">
						<h4 className="font-semibold text-lg mb-2 text-purple-700">
							Risk Analysis
						</h4>
						<div className="flex flex-wrap gap-4">
							{(() => {
								const typeCounts = {};
								cases.forEach((c) => {
									typeCounts[c.caseType] = (typeCounts[c.caseType] || 0) + 1;
								});
								const sortedTypes = Object.entries(typeCounts).sort(
									(a, b) => b[1] - a[1]
								);
								return sortedTypes.length === 0 ? (
									<span className="text-slate-500">No cases available.</span>
								) : (
									sortedTypes.map(([type, count]) => (
										<span
											key={type}
											className="px-4 py-2 rounded-full bg-purple-200 text-purple-800 font-bold shadow"
										>
											{type}: {count}
										</span>
									))
								);
							})()}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Alerts Section */}
			{alerts.length > 0 && (
				<Card className="p-4 mb-6 border-red-500 border-2">
					<CardContent>
						<h3 className="font-semibold text-lg mb-2 text-red-600">
							⚠️ Alerts & Reminders
						</h3>
						<ul className="list-disc pl-5 text-sm">
							{alerts.map((a, i) => (
								<li key={a._id || i}>
									<span className="font-medium">{a.title}</span> is due on{" "}
									{a.due}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{/* You can add a default message or dashboard content here */}
			<div className="mt-8 text-center text-slate-500">
				Select a feature from the sidebar to manage Legal Cases, Contracts, Documents, Compliance, Advisories, Analytics, or Tasks.
			</div>
		</div>
	);
}
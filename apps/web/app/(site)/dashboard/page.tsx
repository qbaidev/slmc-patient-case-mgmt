"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Stats { total: number; open: number; slaBreached: number; byStatus: Record<string, number>; byPriority: Record<string, number>; byDept: Record<string, number> }

const PRIORITY_COLOR: Record<string, string> = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-green-500" }
const STATUS_COLOR: Record<string, string> = { new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", escalated: "bg-red-100 text-red-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600", pending_patient: "bg-purple-100 text-purple-700" }

export default function DashboardPage() {
	const [stats, setStats] = useState<Stats | null>(null)
	const [incidents, setIncidents] = useState<{ id: string; title: string; status: string; severity: string }[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		Promise.all([
			fetch(`${API}/${V}/cases/stats`).then(r => r.json()),
			fetch(`${API}/${V}/major-incidents`).then(r => r.json()),
		]).then(([s, inc]) => {
			setStats(s)
			setIncidents(Array.isArray(inc) ? inc.filter((i: { status: string }) => i.status === "active").slice(0, 3) : [])
			setLoading(false)
		}).catch(() => setLoading(false))
	}, [])

	if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />)}</div>

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">SLMC Case Management Dashboard</h1>
				<p className="text-muted-foreground mt-1">St. Luke's Medical Center — Patient Case Management System</p>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{[
					{ label: "Total Cases", value: stats?.total ?? 0, icon: "📋", color: "bg-blue-500" },
					{ label: "Open Cases", value: stats?.open ?? 0, icon: "🔓", color: "bg-orange-500" },
					{ label: "SLA Breached", value: stats?.slaBreached ?? 0, icon: "⚠️", color: "bg-red-500" },
					{ label: "Resolved", value: (stats?.byStatus?.["resolved"] ?? 0) + (stats?.byStatus?.["closed"] ?? 0), icon: "✅", color: "bg-green-500" },
				].map(c => (
					<div key={c.label} className="bg-card border rounded-xl p-4">
						<div className={`${c.color} text-white rounded-lg w-10 h-10 flex items-center justify-center text-xl mb-3`}>{c.icon}</div>
						<div className="text-3xl font-bold">{c.value}</div>
						<div className="text-muted-foreground text-sm">{c.label}</div>
					</div>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{/* By Status */}
				<div className="bg-card border rounded-xl p-5">
					<h2 className="font-semibold mb-4">Cases by Status</h2>
					<div className="space-y-2">
						{Object.entries(stats?.byStatus ?? {}).map(([status, count]) => (
							<div key={status} className="flex items-center justify-between">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700"}`}>{status.replace(/_/g, " ")}</span>
								<span className="font-semibold text-sm">{count as number}</span>
							</div>
						))}
					</div>
				</div>

				{/* By Priority */}
				<div className="bg-card border rounded-xl p-5">
					<h2 className="font-semibold mb-4">Cases by Priority</h2>
					<div className="space-y-3">
						{Object.entries(stats?.byPriority ?? {}).map(([priority, count]) => (
							<div key={priority} className="flex items-center gap-3">
								<div className={`w-3 h-3 rounded-full ${PRIORITY_COLOR[priority] ?? "bg-gray-400"}`} />
								<span className="capitalize text-sm flex-1">{priority}</span>
								<span className="font-semibold text-sm">{count as number}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Active Major Incidents */}
			{incidents.length > 0 && (
				<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
					<h2 className="font-semibold text-red-700 dark:text-red-400 mb-3">🚨 Active Major Incidents</h2>
					<div className="space-y-2">
						{incidents.map(inc => (
							<div key={inc.id} className="flex items-center justify-between bg-white dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-100 dark:border-red-800">
								<span className="text-sm font-medium">{inc.title}</span>
								<span className={`text-xs px-2 py-1 rounded-full font-medium ${inc.severity === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{inc.severity}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Quick Actions */}
			<div className="bg-card border rounded-xl p-5">
				<h2 className="font-semibold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{[
						{ label: "New Case", href: "/cases", icon: "➕" },
						{ label: "All Cases", href: "/cases", icon: "📋" },
						{ label: "Patients", href: "/patients", icon: "🏥" },
						{ label: "Knowledge Base", href: "/knowledge-base", icon: "📚" },
					].map(a => (
						<a key={a.label} href={a.href} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
							<span className="text-2xl">{a.icon}</span><span className="text-sm font-medium">{a.label}</span>
						</a>
					))}
				</div>
			</div>
		</div>
	)
}

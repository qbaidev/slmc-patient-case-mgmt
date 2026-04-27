"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Incident { id: string; title: string; description: string; status: string; severity: string; affectedDepartment: string; createdAt: string }

const SEV_BADGE: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" }
const STATUS_BADGE: Record<string, string> = { active: "bg-red-100 text-red-700", monitoring: "bg-yellow-100 text-yellow-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600" }

export default function IncidentsPage() {
	const [incidents, setIncidents] = useState<Incident[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch(`${API}/${V}/major-incidents`).then(r => r.json()).then(d => { setIncidents(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
	}, [])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div><h1 className="text-2xl font-bold">Major Incidents</h1><p className="text-muted-foreground mt-1">{incidents.filter(i => i.status === "active").length} active incidents</p></div>
				<button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">🚨 Declare Incident</button>
			</div>
			{loading ? <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />)}</div> : (
				<div className="grid gap-4">
					{incidents.length === 0 ? <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">No major incidents on record. 🎉</div> : incidents.map(inc => (
						<div key={inc.id} className={`bg-card border rounded-xl p-5 ${inc.status === "active" ? "border-red-300 dark:border-red-700" : ""}`}>
							<div className="flex items-start justify-between mb-2">
								<h3 className="font-semibold text-lg">{inc.status === "active" ? "🚨 " : ""}{inc.title}</h3>
								<div className="flex gap-2">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${SEV_BADGE[inc.severity] ?? ""}`}>{inc.severity}</span>
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[inc.status] ?? ""}`}>{inc.status}</span>
								</div>
							</div>
							<p className="text-muted-foreground text-sm">{inc.description}</p>
							<div className="mt-3 flex gap-4 text-xs text-muted-foreground">
								<span>📍 {inc.affectedDepartment || "Multiple departments"}</span>
								<span>📅 {new Date(inc.createdAt).toLocaleString()}</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

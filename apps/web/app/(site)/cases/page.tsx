"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Case { id: string; caseNo: string; title: string; caseType: string; priority: string; status: string; department: string; channelOrigin: string; aiSentiment: string; createdAt: string; slaDeadline: string }

const PRIORITY_BADGE: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" }
const STATUS_BADGE: Record<string, string> = { new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", escalated: "bg-red-100 text-red-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600", pending_patient: "bg-purple-100 text-purple-700" }
const CHANNEL_ICON: Record<string, string> = { portal: "🌐", email: "📧", phone: "📞", in_person: "🏥", referral: "🔗" }
const SENTIMENT_ICON: Record<string, string> = { urgent: "🔴", negative: "🟠", neutral: "⚪", positive: "🟢" }

export default function CasesPage() {
	const [cases, setCases] = useState<Case[]>([])
	const [loading, setLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState("")
	const [priorityFilter, setPriorityFilter] = useState("")
	const [search, setSearch] = useState("")

	const loadCases = () => {
		const params = new URLSearchParams()
		if (statusFilter) params.set("status", statusFilter)
		if (priorityFilter) params.set("priority", priorityFilter)
		if (search) params.set("search", search)
		fetch(`${API}/${V}/cases?${params}`)
			.then(r => r.json()).then(d => { setCases(Array.isArray(d) ? d : []); setLoading(false) })
			.catch(() => setLoading(false))
	}

	useEffect(() => { loadCases() }, [statusFilter, priorityFilter])
	useEffect(() => { setLoading(true); const t = setTimeout(loadCases, 400); return () => clearTimeout(t) }, [search])

	const isSlaBreached = (c: Case) => c.slaDeadline && new Date(c.slaDeadline) < new Date() && !["resolved","closed"].includes(c.status)

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div><h1 className="text-2xl font-bold">Patient Cases</h1><p className="text-muted-foreground mt-1">{cases.length} cases</p></div>
				<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">➕ New Case</button>
			</div>

			<div className="flex flex-wrap gap-3">
				<input type="text" placeholder="Search cases..." className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
				<select className="border rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
					<option value="">All Statuses</option>
					{["new","in_progress","pending_patient","escalated","resolved","closed"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
				</select>
				<select className="border rounded-lg px-3 py-2 text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
					<option value="">All Priorities</option>
					{["critical","high","medium","low"].map(p => <option key={p} value={p}>{p}</option>)}
				</select>
			</div>

			{loading ? <div className="space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />)}</div> : (
				<div className="bg-card border rounded-xl overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-muted/50">
							<tr>{["Case No","Title","Type","Priority","Status","Dept","Channel","SLA","Created"].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
						</thead>
						<tbody className="divide-y">
							{cases.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No cases found</td></tr> : cases.map(c => (
								<tr key={c.id} className={`hover:bg-muted/30 cursor-pointer ${isSlaBreached(c) ? "border-l-2 border-l-red-500" : ""}`}>
									<td className="px-4 py-3 font-mono text-xs">{c.caseNo}</td>
									<td className="px-4 py-3"><div className="font-medium max-w-[200px] truncate">{c.title}</div>{c.aiSentiment && <span className="text-xs">{SENTIMENT_ICON[c.aiSentiment]}</span>}</td>
									<td className="px-4 py-3 text-muted-foreground capitalize text-xs">{c.caseType?.replace(/_/g," ")}</td>
									<td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[c.priority] ?? ""}`}>{c.priority}</span></td>
									<td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] ?? ""}`}>{c.status.replace(/_/g," ")}</span></td>
									<td className="px-4 py-3 text-xs text-muted-foreground">{c.department}</td>
									<td className="px-4 py-3 text-lg">{CHANNEL_ICON[c.channelOrigin] ?? "?"}</td>
									<td className="px-4 py-3 text-xs">{isSlaBreached(c) ? <span className="text-red-600 font-semibold">⚠ Breached</span> : c.slaDeadline ? new Date(c.slaDeadline).toLocaleDateString() : "—"}</td>
									<td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

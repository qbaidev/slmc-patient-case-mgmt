"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Case { id: string; caseNo: string; title: string; caseType: string; priority: string; status: string; department: string; channelOrigin: string; aiSentiment: string; createdAt: string; slaDeadline: string }
interface Patient { id: string; patientNo: string; fullName: string }

const PRIORITY_BADGE: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" }
const STATUS_BADGE: Record<string, string> = { new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", escalated: "bg-red-100 text-red-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600", pending_patient: "bg-purple-100 text-purple-700" }
const CHANNEL_ICON: Record<string, string> = { portal: "🌐", email: "📧", phone: "📞", in_person: "🏥", referral: "🔗" }
const SENTIMENT_ICON: Record<string, string> = { urgent: "🔴", negative: "🟠", neutral: "⚪", positive: "🟢" }
const DEPARTMENTS = ["Billing","Pharmacy","Emergency","Surgery","Radiology","Laboratory","Nursing","Medical Records","ICU","Outpatient","Admissions","Dietary"]

function NewCaseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [patients, setPatients] = useState<Patient[]>([])
	const [form, setForm] = useState({ patientId: "", title: "", description: "", caseType: "general_inquiry", priority: "medium", channelOrigin: "portal", department: "" })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		fetch(`${API}/${V}/patients`).then(r => r.json()).then(d => setPatients(Array.isArray(d) ? d : [])).catch(() => {})
	}, [])

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.title.trim()) { setError("Title is required"); return }
		setSaving(true); setError("")
		try {
			const res = await fetch(`${API}/${V}/cases`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, patientId: form.patientId || undefined }) })
			if (!res.ok) throw new Error(await res.text())
			onCreated()
			onClose()
		} catch (e) { setError(e instanceof Error ? e.message : "Failed to create case") }
		setSaving(false)
	}

	const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-background rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="font-semibold text-lg">➕ New Patient Case</h2>
					<button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
				</div>
				<form onSubmit={submit} className="p-6 space-y-4">
					{error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

					<div>
						<label className="block text-sm font-medium mb-1">Patient</label>
						<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.patientId} onChange={e => set("patientId", e.target.value)}>
							<option value="">— Walk-in / Unknown patient —</option>
							{patients.map(p => <option key={p.id} value={p.id}>{p.patientNo} — {p.fullName}</option>)}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Case Title <span className="text-red-500">*</span></label>
						<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Brief description of the concern" value={form.title} onChange={e => set("title", e.target.value)} />
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Description</label>
						<textarea className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="Detailed description..." value={form.description} onChange={e => set("description", e.target.value)} />
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Case Type</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.caseType} onChange={e => set("caseType", e.target.value)}>
								{["general_inquiry","complaint","billing","medical_concern","pharmacy","scheduling","emergency","feedback"].map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Priority</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={e => set("priority", e.target.value)}>
								{["low","medium","high","critical"].map(p => <option key={p} value={p}>{p}</option>)}
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Channel</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.channelOrigin} onChange={e => set("channelOrigin", e.target.value)}>
								{["portal","email","phone","in_person","referral"].map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Department</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.department} onChange={e => set("department", e.target.value)}>
								<option value="">— Select —</option>
								{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
							</select>
						</div>
					</div>

					<div className="flex gap-3 pt-2">
						<button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted">Cancel</button>
						<button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-50">
							{saving ? "Creating…" : "Create Case"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default function CasesPage() {
	const [cases, setCases] = useState<Case[]>([])
	const [loading, setLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState("")
	const [priorityFilter, setPriorityFilter] = useState("")
	const [search, setSearch] = useState("")
	const [showNew, setShowNew] = useState(false)

	const loadCases = (st = statusFilter, pr = priorityFilter, q = search) => {
		setLoading(true)
		const params = new URLSearchParams()
		if (st) params.set("status", st)
		if (pr) params.set("priority", pr)
		if (q) params.set("search", q)
		fetch(`${API}/${V}/cases?${params}`)
			.then(r => r.json()).then(d => { setCases(Array.isArray(d) ? d : []); setLoading(false) })
			.catch(() => setLoading(false))
	}

	useEffect(() => { loadCases() }, [statusFilter, priorityFilter])
	useEffect(() => { const t = setTimeout(() => loadCases(statusFilter, priorityFilter, search), 400); return () => clearTimeout(t) }, [search])

	const isSlaBreached = (c: Case) => c.slaDeadline && new Date(c.slaDeadline) < new Date() && !["resolved","closed"].includes(c.status)

	return (
		<div className="space-y-6">
			{showNew && <NewCaseModal onClose={() => setShowNew(false)} onCreated={() => loadCases()} />}

			<div className="flex items-center justify-between">
				<div><h1 className="text-2xl font-bold">Patient Cases</h1><p className="text-muted-foreground mt-1">{cases.length} cases</p></div>
				<button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">➕ New Case</button>
			</div>

			<div className="flex flex-wrap gap-3">
				<input type="text" placeholder="Search cases..." className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
				<select className="border rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value) }}>
					<option value="">All Statuses</option>
					{["new","in_progress","pending_patient","escalated","resolved","closed"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
				</select>
				<select className="border rounded-lg px-3 py-2 text-sm" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value) }}>
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

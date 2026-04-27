"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Incident { id: string; title: string; description: string; status: string; severity: string; affectedDepartment: string; createdAt: string; resolvedAt?: string }

const SEV_BADGE: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" }
const STATUS_BADGE: Record<string, string> = { active: "bg-red-100 text-red-700", monitoring: "bg-yellow-100 text-yellow-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600" }
const DEPARTMENTS = ["Pharmacy","Billing","Emergency","Surgery","Radiology","Laboratory","Nursing","Medical Records","ICU","Outpatient","Admissions","IT","All Departments"]

function DeclareIncidentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [form, setForm] = useState({ title: "", description: "", severity: "high", affectedDepartment: "" })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.title.trim()) { setError("Incident title is required"); return }
		if (!form.affectedDepartment) { setError("Affected department is required"); return }
		setSaving(true); setError("")
		try {
			const res = await fetch(`${API}/${V}/major-incidents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
			if (!res.ok) throw new Error(await res.text())
			onCreated(); onClose()
		} catch (e) { setError(e instanceof Error ? e.message : "Failed to declare incident") }
		setSaving(false)
	}

	const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-background rounded-xl border shadow-xl w-full max-w-lg">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="font-semibold text-lg">🚨 Declare Major Incident</h2>
					<button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
				</div>
				<form onSubmit={submit} className="p-6 space-y-4">
					{error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

					<div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-700">
						⚠️ A Major Incident groups multiple patient cases under one record. Use this for widespread issues affecting multiple patients.
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Incident Title <span className="text-red-500">*</span></label>
						<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Pharmacy System Downtime" value={form.title} onChange={e => set("title", e.target.value)} />
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Description</label>
						<textarea className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="What is happening? How many patients affected? What is the impact?" value={form.description} onChange={e => set("description", e.target.value)} />
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Severity</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.severity} onChange={e => set("severity", e.target.value)}>
								<option value="low">🟢 Low</option>
								<option value="medium">🟡 Medium</option>
								<option value="high">🟠 High</option>
								<option value="critical">🔴 Critical</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Affected Department <span className="text-red-500">*</span></label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.affectedDepartment} onChange={e => set("affectedDepartment", e.target.value)}>
								<option value="">— Select —</option>
								{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
							</select>
						</div>
					</div>

					<div className="flex gap-3 pt-2">
						<button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted">Cancel</button>
						<button type="submit" disabled={saving} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 hover:bg-red-700">
							{saving ? "Declaring…" : "🚨 Declare Incident"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

function UpdateStatusModal({ incident, onClose, onUpdated }: { incident: Incident; onClose: () => void; onUpdated: () => void }) {
	const [status, setStatus] = useState(incident.status)
	const [saving, setSaving] = useState(false)

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		setSaving(true)
		await fetch(`${API}/${V}/major-incidents/${incident.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
		onUpdated(); onClose()
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-background rounded-xl border shadow-xl w-full max-w-sm">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="font-semibold">Update Incident Status</h2>
					<button onClick={onClose} className="text-muted-foreground text-xl">✕</button>
				</div>
				<form onSubmit={submit} className="p-6 space-y-4">
					<p className="text-sm text-muted-foreground">{incident.title}</p>
					<select className="w-full border rounded-lg px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
						<option value="active">🔴 Active</option>
						<option value="monitoring">🟡 Monitoring</option>
						<option value="resolved">🟢 Resolved</option>
						<option value="closed">⬛ Closed</option>
					</select>
					<div className="flex gap-3">
						<button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm">Cancel</button>
						<button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm disabled:opacity-50">{saving ? "Saving…" : "Update"}</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default function IncidentsPage() {
	const [incidents, setIncidents] = useState<Incident[]>([])
	const [loading, setLoading] = useState(true)
	const [showNew, setShowNew] = useState(false)
	const [updating, setUpdating] = useState<Incident | null>(null)

	const load = () => {
		setLoading(true)
		fetch(`${API}/${V}/major-incidents`).then(r => r.json()).then(d => { setIncidents(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
	}

	useEffect(() => { load() }, [])

	const active = incidents.filter(i => i.status === "active").length

	return (
		<div className="space-y-6">
			{showNew && <DeclareIncidentModal onClose={() => setShowNew(false)} onCreated={load} />}
			{updating && <UpdateStatusModal incident={updating} onClose={() => setUpdating(null)} onUpdated={load} />}

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Major Incidents</h1>
					<p className="text-muted-foreground mt-1">{active} active · {incidents.length} total</p>
				</div>
				<button onClick={() => setShowNew(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">🚨 Declare Incident</button>
			</div>

			{loading ? <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />)}</div> : (
				<div className="grid gap-4">
					{incidents.length === 0 ? (
						<div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">No major incidents on record. 🎉</div>
					) : incidents.map(inc => (
						<div key={inc.id} className={`bg-card border rounded-xl p-5 ${inc.status === "active" ? "border-red-300 dark:border-red-700" : ""}`}>
							<div className="flex items-start justify-between mb-2">
								<h3 className="font-semibold text-lg">{inc.status === "active" ? "🚨 " : ""}{inc.title}</h3>
								<div className="flex items-center gap-2 shrink-0 ml-3">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${SEV_BADGE[inc.severity] ?? ""}`}>{inc.severity}</span>
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[inc.status] ?? ""}`}>{inc.status}</span>
									<button onClick={() => setUpdating(inc)} className="text-xs border rounded px-2 py-1 hover:bg-muted">Update Status</button>
								</div>
							</div>
							<p className="text-muted-foreground text-sm">{inc.description}</p>
							<div className="mt-3 flex gap-4 text-xs text-muted-foreground">
								<span>📍 {inc.affectedDepartment || "Multiple departments"}</span>
								<span>📅 Declared: {new Date(inc.createdAt).toLocaleString()}</span>
								{inc.resolvedAt && <span>✅ Resolved: {new Date(inc.resolvedAt).toLocaleString()}</span>}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

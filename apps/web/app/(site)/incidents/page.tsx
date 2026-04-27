"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, AlertTriangle, Shield, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Textarea } from "@/core/components/ui/textarea"
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/core/components/ui/dialog"
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/core/components/ui/select"
import { Skeleton } from "@/core/components/ui/skeleton"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Incident {
	id: string; title: string; description: string; severity: string
	status: string; affectedDepts: string[]; createdAt: string; resolvedAt?: string
}

const SEVERITY_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	critical: "destructive", high: "destructive", medium: "secondary", low: "outline",
}
const STATUS_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	active: "destructive", monitoring: "secondary", resolved: "outline", closed: "outline",
}
const SEVERITIES = ["low", "medium", "high", "critical"]
const STATUSES = ["active", "monitoring", "resolved", "closed"]
const DEPARTMENTS = ["Billing","Pharmacy","Emergency","Surgery","Radiology","Laboratory","Nursing","Medical Records","ICU","Outpatient","Admissions","Dietary"]

function DeclareIncidentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [form, setForm] = useState({ title: "", description: "", severity: "medium", affectedDepts: [] as string[] })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	function toggleDept(d: string) {
		setForm(f => ({
			...f,
			affectedDepts: f.affectedDepts.includes(d) ? f.affectedDepts.filter(x => x !== d) : [...f.affectedDepts, d],
		}))
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.title.trim()) { setError("Title is required"); return }
		setSaving(true); setError("")
		try {
			const res = await fetch(`${API}/${V}/major-incidents`, {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...form, status: "active" }),
			})
			if (!res.ok) throw new Error(await res.text())
			onCreated()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to declare incident")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Declare Major Incident</DialogTitle>
				</DialogHeader>
				<form onSubmit={submit} className="space-y-4">
					<div className="space-y-1.5">
						<Label>Title *</Label>
						<Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief description of the incident" />
					</div>
					<div className="space-y-1.5">
						<Label>Severity</Label>
						<Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
							<SelectTrigger><SelectValue /></SelectTrigger>
							<SelectContent>
								{SEVERITIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>Description</Label>
						<Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What happened? What is affected?" />
					</div>
					<div className="space-y-1.5">
						<Label>Affected Departments</Label>
						<div className="flex flex-wrap gap-2">
							{DEPARTMENTS.map(d => (
								<button key={d} type="button" onClick={() => toggleDept(d)}
									className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
										form.affectedDepts.includes(d)
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-background text-muted-foreground hover:border-primary/60"
									}`}
								>{d}</button>
							))}
						</div>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
						<Button type="submit" variant="destructive" disabled={saving}>
							{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
							Declare Incident
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

function UpdateStatusModal({ incident, onClose, onUpdated }: { incident: Incident; onClose: () => void; onUpdated: () => void }) {
	const [status, setStatus] = useState(incident.status)
	const [saving, setSaving] = useState(false)

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		setSaving(true)
		try {
			const res = await fetch(`${API}/${V}/major-incidents/${incident.id}`, {
				method: "PATCH", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			})
			if (!res.ok) throw new Error(await res.text())
			onUpdated()
		} catch { /* ignore */ } finally { setSaving(false) }
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-sm">
				<DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
				<form onSubmit={submit} className="space-y-4">
					<p className="text-sm text-muted-foreground truncate">{incident.title}</p>
					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger><SelectValue /></SelectTrigger>
						<SelectContent>
							{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
						</SelectContent>
					</Select>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
							Update
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default function IncidentsPage() {
	const [incidents, setIncidents] = useState<Incident[]>([])
	const [loading, setLoading] = useState(true)
	const [showNew, setShowNew] = useState(false)
	const [updating, setUpdating] = useState<Incident | null>(null)

	const load = useCallback(() => {
		setLoading(true)
		fetch(`${API}/${V}/major-incidents`).then(r => r.json())
			.then(d => setIncidents(Array.isArray(d) ? d : []))
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => { load() }, [load])

	const active = incidents.filter(i => i.status === "active")
	const others = incidents.filter(i => i.status !== "active")

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Major Incidents</h1>
					<p className="text-sm text-muted-foreground">{active.length} active · {incidents.length} total</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={load}>
						<RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
					</Button>
					<Button size="sm" variant="destructive" onClick={() => setShowNew(true)}>
						<Plus className="mr-1.5 h-4 w-4" /> Declare Incident
					</Button>
				</div>
			</div>

			{/* Active incidents banner */}
			{!loading && active.length > 0 && (
				<Card className="border-destructive/40 bg-destructive/5">
					<CardHeader className="pb-2 flex flex-row items-center gap-2">
						<AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
						<CardTitle className="text-sm font-medium text-destructive">{active.length} Active Incident{active.length > 1 ? "s" : ""}</CardTitle>
					</CardHeader>
				</Card>
			)}

			{/* Incident cards */}
			{loading ? (
				<div className="grid gap-4 md:grid-cols-2">
					{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
				</div>
			) : incidents.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center">
						<div className="flex flex-col items-center gap-2 text-muted-foreground">
							<Shield className="h-10 w-10" />
							<p className="font-medium">No incidents reported</p>
							<p className="text-sm">All systems operational</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{[...active, ...others].map(inc => (
						<Card key={inc.id} className={inc.status === "active" ? "border-destructive/40" : undefined}>
							<CardHeader className="pb-2">
								<div className="flex items-start justify-between gap-2">
									<CardTitle className="text-sm font-semibold leading-snug">{inc.title}</CardTitle>
									<div className="flex shrink-0 gap-1.5">
										<Badge variant={SEVERITY_VARIANT[inc.severity] ?? "secondary"} className="text-xs capitalize">{inc.severity}</Badge>
										<Badge variant={STATUS_VARIANT[inc.status] ?? "secondary"} className="text-xs capitalize">{inc.status}</Badge>
									</div>
								</div>
								<CardDescription className="text-xs">{new Date(inc.createdAt).toLocaleString()}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{inc.description && <p className="text-sm text-muted-foreground line-clamp-2">{inc.description}</p>}
								{(inc.affectedDepts ?? []).length > 0 && (
									<div className="flex flex-wrap gap-1">
										{inc.affectedDepts.map(d => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
									</div>
								)}
								<div className="flex justify-end">
									<Button variant="outline" size="sm" onClick={() => setUpdating(inc)}>
										<RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Update Status
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{showNew && <DeclareIncidentModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
			{updating && <UpdateStatusModal incident={updating} onClose={() => setUpdating(null)} onUpdated={() => { setUpdating(null); load() }} />}
		</div>
	)
}

"use client"
import { useEffect, useState, useCallback } from "react"
import {
	Plus, Search, Filter, AlertCircle, Clock, CheckCircle2,
	ChevronDown, X, Loader2, FolderOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/core/components/ui/dialog"
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/core/components/ui/select"
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/core/components/ui/table"
import { Skeleton } from "@/core/components/ui/skeleton"
import { Separator } from "@/core/components/ui/separator"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Case {
	id: string; caseNo: string; title: string; caseType: string
	priority: string; status: string; department: string
	channelOrigin: string; createdAt: string; slaDeadline: string
}
interface Patient { id: string; patientNo: string; fullName: string }

const PRIORITY_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	critical: "destructive", high: "destructive", medium: "secondary", low: "outline",
}
const STATUS_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	new: "default", open: "default", in_review: "secondary", pending: "secondary",
	resolved: "outline", closed: "outline", escalated: "destructive",
}
const DEPARTMENTS = ["Billing","Pharmacy","Emergency","Surgery","Radiology","Laboratory","Nursing","Medical Records","ICU","Outpatient","Admissions","Dietary"]
const CASE_TYPES = ["general_inquiry","billing","clinical","pharmacy","referral","complaint","feedback"]
const CHANNELS = ["portal","email","phone","in_person","referral"]
const PRIORITIES = ["low","medium","high","critical"]

function isSlaBreached(deadline: string) {
	return deadline && new Date(deadline) < new Date()
}

function NewCaseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [patients, setPatients] = useState<Patient[]>([])
	const [form, setForm] = useState({
		patientId: "", title: "", description: "",
		caseType: "general_inquiry", priority: "medium",
		channelOrigin: "portal", department: "",
	})
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
			const res = await fetch(`${API}/${V}/cases`, {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			})
			if (!res.ok) throw new Error(await res.text())
			onCreated()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create case")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>New Case</DialogTitle>
				</DialogHeader>
				<form onSubmit={submit} className="space-y-4">
					<div className="space-y-1.5">
						<Label>Title *</Label>
						<Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief description of the case" />
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>Patient</Label>
							<Select value={form.patientId} onValueChange={v => setForm(f => ({ ...f, patientId: v }))}>
								<SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
								<SelectContent>
									{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Department</Label>
							<Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
								<SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
								<SelectContent>
									{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Type</Label>
							<Select value={form.caseType} onValueChange={v => setForm(f => ({ ...f, caseType: v }))}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									{CASE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Priority</Label>
							<Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									{PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Channel</Label>
							<Select value={form.channelOrigin} onValueChange={v => setForm(f => ({ ...f, channelOrigin: v }))}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									{CHANNELS.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, " ")}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label>Description</Label>
						<textarea
							value={form.description}
							onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
							rows={3}
							className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
							placeholder="Additional details…"
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
							Create Case
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default function CasesPage() {
	const [cases, setCases] = useState<Case[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [filterStatus, setFilterStatus] = useState("all")
	const [filterPriority, setFilterPriority] = useState("all")
	const [showNew, setShowNew] = useState(false)

	const load = useCallback(() => {
		setLoading(true)
		fetch(`${API}/${V}/cases`).then(r => r.json())
			.then(d => setCases(Array.isArray(d) ? d : []))
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => { load() }, [load])

	const filtered = cases.filter(c => {
		const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.caseNo?.toLowerCase().includes(search.toLowerCase())
		const matchStatus = filterStatus === "all" || c.status === filterStatus
		const matchPriority = filterPriority === "all" || c.priority === filterPriority
		return matchSearch && matchStatus && matchPriority
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
					<p className="text-sm text-muted-foreground">{cases.length} total cases</p>
				</div>
				<Button size="sm" onClick={() => setShowNew(true)}>
					<Plus className="mr-1.5 h-4 w-4" /> New Case
				</Button>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-wrap items-center gap-3">
						<div className="relative flex-1 min-w-48">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input className="pl-8 h-9" placeholder="Search cases…" value={search} onChange={e => setSearch(e.target.value)} />
						</div>
						<Select value={filterStatus} onValueChange={setFilterStatus}>
							<SelectTrigger className="h-9 w-36">
								<Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								{["new","open","in_review","pending","resolved","closed","escalated"].map(s => (
									<SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={filterPriority} onValueChange={setFilterPriority}>
							<SelectTrigger className="h-9 w-36">
								<ChevronDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
								<SelectValue placeholder="Priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All priorities</SelectItem>
								{PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
							</SelectContent>
						</Select>
						{(filterStatus !== "all" || filterPriority !== "all" || search) && (
							<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all") }}>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</CardHeader>
				<Separator />
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Case No.</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Department</TableHead>
								<TableHead>SLA</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								[...Array(5)].map((_, i) => (
									<TableRow key={i}>
										{[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
									</TableRow>
								))
							) : filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="py-12 text-center">
										<div className="flex flex-col items-center gap-2 text-muted-foreground">
											<FolderOpen className="h-8 w-8" />
											<p className="text-sm">No cases found</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								filtered.map(c => (
									<TableRow key={c.id}>
										<TableCell className="font-mono text-xs text-muted-foreground">{c.caseNo}</TableCell>
										<TableCell className="font-medium max-w-48 truncate">{c.title}</TableCell>
										<TableCell>
											<Badge variant={STATUS_VARIANT[c.status] ?? "secondary"} className="capitalize text-xs">
												{c.status.replace(/_/g, " ")}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={PRIORITY_VARIANT[c.priority] ?? "secondary"} className="capitalize text-xs">
												{c.priority}
											</Badge>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">{c.department || "—"}</TableCell>
										<TableCell>
											{c.slaDeadline ? (
												isSlaBreached(c.slaDeadline) ? (
													<div className="flex items-center gap-1 text-destructive">
														<AlertCircle className="h-3.5 w-3.5" />
														<span className="text-xs font-medium">Breached</span>
													</div>
												) : (
													<div className="flex items-center gap-1 text-muted-foreground">
														<Clock className="h-3.5 w-3.5" />
														<span className="text-xs">{new Date(c.slaDeadline).toLocaleDateString()}</span>
													</div>
												)
											) : (
												<span className="text-xs text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{new Date(c.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{showNew && <NewCaseModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
		</div>
	)
}

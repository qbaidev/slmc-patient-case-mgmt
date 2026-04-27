"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, Search, User, X, Loader2, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/core/components/ui/card"
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
import {
	Avatar, AvatarFallback,
} from "@/core/components/ui/avatar"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Patient {
	id: string; patientNo: string; fullName: string; gender: string
	dateOfBirth: string; contactNo: string; email: string
	entitlementTypes: string[]; admissionStatus: string
}

const ENTITLEMENT_LABELS: Record<string, string> = {
	philhealth: "PhilHealth", hmo: "HMO", cash: "Cash", senior_citizen: "Senior",
	pwd: "PWD", ofw: "OFW", diplomat: "Diplomat",
}
const GENDERS = ["male", "female", "other", "prefer_not_to_say"]
const ENTITLEMENTS = ["philhealth", "hmo", "cash", "senior_citizen", "pwd", "ofw", "diplomat"]

function RegisterPatientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [form, setForm] = useState({
		fullName: "", gender: "male", dateOfBirth: "",
		contactNo: "", email: "", address: "",
		entitlementTypes: [] as string[],
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	function toggleEntitlement(e: string) {
		setForm(f => ({
			...f,
			entitlementTypes: f.entitlementTypes.includes(e)
				? f.entitlementTypes.filter(x => x !== e)
				: [...f.entitlementTypes, e],
		}))
	}

	async function submit(ev: React.FormEvent) {
		ev.preventDefault()
		if (!form.fullName.trim()) { setError("Full name is required"); return }
		setSaving(true); setError("")
		try {
			const res = await fetch(`${API}/${V}/patients`, {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			})
			if (!res.ok) throw new Error(await res.text())
			onCreated()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to register patient")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Register Patient</DialogTitle>
				</DialogHeader>
				<form onSubmit={submit} className="space-y-4">
					<div className="space-y-1.5">
						<Label>Full Name *</Label>
						<Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Juan Dela Cruz" />
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>Gender</Label>
							<Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									{GENDERS.map(g => <SelectItem key={g} value={g} className="capitalize">{g.replace(/_/g, " ")}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Date of Birth</Label>
							<Input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
						</div>
						<div className="space-y-1.5">
							<Label>Contact No.</Label>
							<Input value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} placeholder="09XX XXX XXXX" />
						</div>
						<div className="space-y-1.5">
							<Label>Email</Label>
							<Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="patient@email.com" />
						</div>
					</div>
					<div className="space-y-1.5">
						<Label>Address</Label>
						<Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, City, Province" />
					</div>
					<div className="space-y-1.5">
						<Label>Entitlements</Label>
						<div className="flex flex-wrap gap-2">
							{ENTITLEMENTS.map(e => (
								<button
									key={e} type="button"
									onClick={() => toggleEntitlement(e)}
									className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
										form.entitlementTypes.includes(e)
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-background text-muted-foreground hover:border-primary/60"
									}`}
								>
									{ENTITLEMENT_LABELS[e]}
								</button>
							))}
						</div>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
							Register
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default function PatientsPage() {
	const [patients, setPatients] = useState<Patient[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [showNew, setShowNew] = useState(false)

	const load = useCallback(() => {
		setLoading(true)
		fetch(`${API}/${V}/patients`).then(r => r.json())
			.then(d => setPatients(Array.isArray(d) ? d : []))
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => { load() }, [load])

	const filtered = patients.filter(p =>
		!search || p.fullName.toLowerCase().includes(search.toLowerCase()) || p.patientNo?.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
					<p className="text-sm text-muted-foreground">{patients.length} registered patients</p>
				</div>
				<Button size="sm" onClick={() => setShowNew(true)}>
					<Plus className="mr-1.5 h-4 w-4" /> Register Patient
				</Button>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input className="pl-8 h-9" placeholder="Search by name or patient no…" value={search} onChange={e => setSearch(e.target.value)} />
						</div>
						{search && (
							<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearch("")}>
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
								<TableHead>Patient</TableHead>
								<TableHead>Patient No.</TableHead>
								<TableHead>Gender</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Entitlements</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								[...Array(5)].map((_, i) => (
									<TableRow key={i}>
										{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
									</TableRow>
								))
							) : filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-12 text-center">
										<div className="flex flex-col items-center gap-2 text-muted-foreground">
											<Users className="h-8 w-8" />
											<p className="text-sm">No patients found</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								filtered.map(p => (
									<TableRow key={p.id}>
										<TableCell>
											<div className="flex items-center gap-2.5">
												<Avatar className="h-7 w-7">
													<AvatarFallback className="text-xs">
														{p.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium text-sm">{p.fullName}</span>
											</div>
										</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">{p.patientNo}</TableCell>
										<TableCell className="text-sm capitalize text-muted-foreground">{p.gender?.replace(/_/g, " ") || "—"}</TableCell>
										<TableCell className="text-sm text-muted-foreground">{p.contactNo || "—"}</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												{(p.entitlementTypes ?? []).slice(0, 3).map(e => (
													<Badge key={e} variant="secondary" className="text-xs">
														{ENTITLEMENT_LABELS[e] ?? e}
													</Badge>
												))}
												{(p.entitlementTypes ?? []).length > 3 && (
													<Badge variant="outline" className="text-xs">+{p.entitlementTypes.length - 3}</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={p.admissionStatus === "admitted" ? "default" : "outline"} className="text-xs capitalize">
												{p.admissionStatus || "outpatient"}
											</Badge>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{showNew && <RegisterPatientModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
		</div>
	)
}

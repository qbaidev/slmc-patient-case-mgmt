"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Patient { id: string; patientNo: string; fullName: string; dateOfBirth: string; gender: string; contactEmail: string; contactPhone: string; hmoProvider: string; bloodType: string; isActive: boolean; createdAt: string }

function RegisterPatientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [form, setForm] = useState({ fullName: "", dateOfBirth: "", gender: "", contactEmail: "", contactPhone: "", address: "", hmoProvider: "", insurancePolicy: "", bloodType: "", allergies: "" })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.fullName.trim()) { setError("Full name is required"); return }
		setSaving(true); setError("")
		try {
			const res = await fetch(`${API}/${V}/patients`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
			if (!res.ok) throw new Error(await res.text())
			onCreated(); onClose()
		} catch (e) { setError(e instanceof Error ? e.message : "Failed to register patient") }
		setSaving(false)
	}

	const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-background rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="font-semibold text-lg">🏥 Register New Patient</h2>
					<button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
				</div>
				<form onSubmit={submit} className="p-6 space-y-4">
					{error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

					<div>
						<label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
						<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Maria Santos" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Date of Birth</label>
							<input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Gender</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.gender} onChange={e => set("gender", e.target.value)}>
								<option value="">— Select —</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Email</label>
							<input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="patient@email.com" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Phone</label>
							<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="09XX-XXX-XXXX" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Address</label>
						<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Street, City" value={form.address} onChange={e => set("address", e.target.value)} />
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">HMO Provider</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.hmoProvider} onChange={e => set("hmoProvider", e.target.value)}>
								<option value="">None</option>
								{["PhilCare","Maxicare","Medicard","Intellicare","Caritas Health","HMO Philippines","PNB Life","Cigna"].map(h => <option key={h} value={h}>{h}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Blood Type</label>
							<select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.bloodType} onChange={e => set("bloodType", e.target.value)}>
								<option value="">Unknown</option>
								{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Insurance Policy No.</label>
						<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. INS-2025-XXXXX" value={form.insurancePolicy} onChange={e => set("insurancePolicy", e.target.value)} />
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Known Allergies</label>
						<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Penicillin, Sulfa drugs" value={form.allergies} onChange={e => set("allergies", e.target.value)} />
					</div>

					<div className="flex gap-3 pt-2">
						<button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted">Cancel</button>
						<button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-50">
							{saving ? "Registering…" : "Register Patient"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default function PatientsPage() {
	const [patients, setPatients] = useState<Patient[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [showNew, setShowNew] = useState(false)

	const load = (s?: string) => {
		setLoading(true)
		const url = s ? `${API}/${V}/patients?search=${encodeURIComponent(s)}` : `${API}/${V}/patients`
		fetch(url).then(r => r.json()).then(d => { setPatients(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
	}

	useEffect(() => { load() }, [])
	useEffect(() => { const t = setTimeout(() => load(search), 400); return () => clearTimeout(t) }, [search])

	return (
		<div className="space-y-6">
			{showNew && <RegisterPatientModal onClose={() => setShowNew(false)} onCreated={() => load()} />}

			<div className="flex items-center justify-between">
				<div><h1 className="text-2xl font-bold">Patients</h1><p className="text-muted-foreground mt-1">{patients.length} registered patients</p></div>
				<button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">➕ Register Patient</button>
			</div>

			<input type="text" placeholder="Search by name, patient no, or email..." className="w-full border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} />

			{loading ? <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />)}</div> : (
				<div className="bg-card border rounded-xl overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-muted/50">
							<tr>{["Patient No","Full Name","Date of Birth","Gender","Contact","HMO","Blood Type","Status"].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
						</thead>
						<tbody className="divide-y">
							{patients.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No patients found</td></tr> : patients.map(p => (
								<tr key={p.id} className="hover:bg-muted/30 cursor-pointer">
									<td className="px-4 py-3 font-mono text-xs">{p.patientNo}</td>
									<td className="px-4 py-3 font-medium">🏥 {p.fullName}</td>
									<td className="px-4 py-3 text-muted-foreground text-xs">{p.dateOfBirth || "—"}</td>
									<td className="px-4 py-3 text-muted-foreground capitalize text-xs">{p.gender || "—"}</td>
									<td className="px-4 py-3"><div className="text-xs">{p.contactEmail}</div><div className="text-xs text-muted-foreground">{p.contactPhone}</div></td>
									<td className="px-4 py-3 text-xs">{p.hmoProvider || <span className="text-muted-foreground">None</span>}</td>
									<td className="px-4 py-3 text-xs font-mono">{p.bloodType || "—"}</td>
									<td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

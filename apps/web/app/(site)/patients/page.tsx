"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Patient { id: string; patientNo: string; fullName: string; dateOfBirth: string; gender: string; contactEmail: string; contactPhone: string; hmoProvider: string; bloodType: string; isActive: boolean; createdAt: string }

export default function PatientsPage() {
	const [patients, setPatients] = useState<Patient[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")

	const load = (s?: string) => {
		const url = s ? `${API}/${V}/patients?search=${encodeURIComponent(s)}` : `${API}/${V}/patients`
		fetch(url).then(r => r.json()).then(d => { setPatients(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
	}

	useEffect(() => { load() }, [])
	useEffect(() => { const t = setTimeout(() => load(search), 400); return () => clearTimeout(t) }, [search])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div><h1 className="text-2xl font-bold">Patients</h1><p className="text-muted-foreground mt-1">{patients.length} registered patients</p></div>
				<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">➕ Register Patient</button>
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

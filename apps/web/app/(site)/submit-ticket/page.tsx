"use client"
import { useState, useEffect } from "react"
import { Ticket, CheckCircle2, Loader2, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Textarea } from "@/core/components/ui/textarea"
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/core/components/ui/select"
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/core/components/ui/table"
import { Separator } from "@/core/components/ui/separator"
import { Skeleton } from "@/core/components/ui/skeleton"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface SupportTicket {
	id: string; ticketNo: string; subject: string; category: string
	priority: string; status: string; createdAt: string
}

const CATEGORIES = ["billing", "clinical", "pharmacy", "it_support", "housekeeping", "dietary", "general"]
const CATEGORY_LABELS: Record<string, string> = {
	billing: "Billing", clinical: "Clinical", pharmacy: "Pharmacy",
	it_support: "IT Support", housekeeping: "Housekeeping", dietary: "Dietary", general: "General",
}
const PRIORITIES = ["low", "medium", "high", "critical"]
const STATUS_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	open: "default", in_progress: "secondary", resolved: "outline", closed: "outline",
}

export default function SubmitTicketPage() {
	const [tickets, setTickets] = useState<SupportTicket[]>([])
	const [loadingTickets, setLoadingTickets] = useState(true)
	const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "medium" })
	const [submitting, setSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [error, setError] = useState("")

	function loadTickets() {
		setLoadingTickets(true)
		fetch(`${API}/${V}/tickets`).then(r => r.json())
			.then(d => setTickets(Array.isArray(d) ? d.slice(0, 10) : []))
			.catch(() => {})
			.finally(() => setLoadingTickets(false))
	}

	useEffect(() => { loadTickets() }, [])

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.subject.trim()) { setError("Subject is required"); return }
		setSubmitting(true); setError("")
		try {
			const res = await fetch(`${API}/${V}/tickets`, {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			})
			if (!res.ok) throw new Error(await res.text())
			setSubmitted(true)
			setForm({ subject: "", description: "", category: "general", priority: "medium" })
			loadTickets()
			setTimeout(() => setSubmitted(false), 4000)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to submit ticket")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="space-y-6 max-w-3xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Support</h1>
				<p className="text-sm text-muted-foreground">Submit a support request or track existing tickets</p>
			</div>

			{/* Submit form */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Ticket className="h-4 w-4 text-muted-foreground" />
						<CardTitle className="text-sm font-medium">Submit a Request</CardTitle>
					</div>
					<CardDescription>Describe your issue or request and we'll get back to you.</CardDescription>
				</CardHeader>
				<Separator />
				<CardContent className="pt-5">
					{submitted ? (
						<div className="flex flex-col items-center gap-3 py-8 text-center">
							<CheckCircle2 className="h-10 w-10 text-primary" />
							<p className="font-medium">Ticket submitted successfully</p>
							<p className="text-sm text-muted-foreground">We'll review your request shortly.</p>
						</div>
					) : (
						<form onSubmit={submit} className="space-y-4">
							<div className="space-y-1.5">
								<Label>Subject *</Label>
								<Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" />
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Category</Label>
									<Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
										<SelectTrigger><SelectValue /></SelectTrigger>
										<SelectContent>
											{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
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
							</div>
							<div className="space-y-1.5">
								<Label>Description</Label>
								<Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Please provide as much detail as possible…" />
							</div>
							{error && <p className="text-sm text-destructive">{error}</p>}
							<div className="flex justify-end">
								<Button type="submit" disabled={submitting}>
									{submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-1.5 h-4 w-4" />}
									Submit Request
								</Button>
							</div>
						</form>
					)}
				</CardContent>
			</Card>

			{/* Recent tickets */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Recent Tickets</CardTitle>
				</CardHeader>
				<Separator />
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Ticket No.</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loadingTickets ? (
								[...Array(3)].map((_, i) => (
									<TableRow key={i}>
										{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
									</TableRow>
								))
							) : tickets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No tickets yet</TableCell>
								</TableRow>
							) : (
								tickets.map(t => (
									<TableRow key={t.id}>
										<TableCell className="font-mono text-xs text-muted-foreground">{t.ticketNo}</TableCell>
										<TableCell className="font-medium text-sm max-w-40 truncate">{t.subject}</TableCell>
										<TableCell className="text-sm text-muted-foreground">{CATEGORY_LABELS[t.category] ?? t.category}</TableCell>
										<TableCell>
											<Badge variant={t.priority === "critical" || t.priority === "high" ? "destructive" : "secondary"} className="text-xs capitalize">
												{t.priority}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={STATUS_VARIANT[t.status] ?? "secondary"} className="text-xs capitalize">
												{t.status.replace(/_/g, " ")}
											</Badge>
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{new Date(t.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}

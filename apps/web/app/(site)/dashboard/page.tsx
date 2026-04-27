"use client"
import { useEffect, useState } from "react"
import {
	FolderOpen,
	AlertTriangle,
	CheckCircle2,
	Clock,
	TrendingUp,
	Plus,
	ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card"
import { Badge } from "@/core/components/ui/badge"
import { Button } from "@/core/components/ui/button"
import { Skeleton } from "@/core/components/ui/skeleton"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Stats {
	total: number
	open: number
	slaBreached: number
	byStatus: Record<string, number>
	byPriority: Record<string, number>
	byDept: Record<string, number>
}

interface Incident {
	id: string
	title: string
	status: string
	severity: string
}

const PRIORITY_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	critical: "destructive",
	high: "destructive",
	medium: "secondary",
	low: "outline",
}

const STATUS_VARIANT: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
	new: "default",
	open: "default",
	in_review: "secondary",
	pending: "secondary",
	resolved: "outline",
	closed: "outline",
	escalated: "destructive",
}

const KPI_CARDS = [
	{ key: "total", label: "Total Cases", icon: FolderOpen, desc: "All time" },
	{ key: "open", label: "Open Cases", icon: Clock, desc: "Awaiting resolution" },
	{ key: "slaBreached", label: "SLA Breached", icon: AlertTriangle, desc: "Requires attention" },
	{ key: "resolved", label: "Resolved", icon: CheckCircle2, desc: "Closed + resolved" },
]

export default function DashboardPage() {
	const [stats, setStats] = useState<Stats | null>(null)
	const [incidents, setIncidents] = useState<Incident[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		Promise.all([
			fetch(`${API}/${V}/cases/stats`).then(r => r.json()),
			fetch(`${API}/${V}/major-incidents`).then(r => r.json()),
		])
			.then(([s, inc]) => {
				setStats(s)
				setIncidents(Array.isArray(inc) ? inc.filter((i: Incident) => i.status === "active").slice(0, 3) : [])
			})
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [])

	const kpiValues: Record<string, number> = {
		total: stats?.total ?? 0,
		open: stats?.open ?? 0,
		slaBreached: stats?.slaBreached ?? 0,
		resolved: (stats?.byStatus?.["resolved"] ?? 0) + (stats?.byStatus?.["closed"] ?? 0),
	}

	return (
		<div className="space-y-6">
			{/* Page header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
					<p className="text-sm text-muted-foreground">SLMC Patient Case Management overview</p>
				</div>
				<Link href="/cases">
					<Button size="sm">
						<Plus className="mr-1.5 h-4 w-4" />
						New Case
					</Button>
				</Link>
			</div>

			{/* KPI cards */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{KPI_CARDS.map(({ key, label, icon: Icon, desc }) =>
					loading ? (
						<Skeleton key={key} className="h-28 rounded-xl" />
					) : (
						<Card key={key}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
								<Icon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold">{kpiValues[key]}</p>
								<p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
							</CardContent>
						</Card>
					)
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{/* By Status */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Cases by Status</CardTitle>
						<CardDescription>Current distribution</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
						) : (
							<div className="space-y-2">
								{Object.entries(stats?.byStatus ?? {}).map(([status, count]) => (
									<div key={status} className="flex items-center justify-between">
										<Badge variant={STATUS_VARIANT[status] ?? "secondary"} className="capitalize">
											{status.replace(/_/g, " ")}
										</Badge>
										<span className="text-sm font-semibold tabular-nums">{count as number}</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* By Priority */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Cases by Priority</CardTitle>
						<CardDescription>Risk breakdown</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
						) : (
							<div className="space-y-3">
								{Object.entries(stats?.byPriority ?? {}).map(([priority, count]) => {
									const total = stats?.total ?? 1
									const pct = Math.round(((count as number) / total) * 100)
									return (
										<div key={priority} className="space-y-1">
											<div className="flex items-center justify-between text-sm">
												<span className="capitalize font-medium">{priority}</span>
												<span className="text-muted-foreground tabular-nums">{count as number}</span>
											</div>
											<div className="h-1.5 w-full rounded-full bg-muted">
												<div
													className="h-1.5 rounded-full bg-primary transition-all"
													style={{ width: `${pct}%` }}
												/>
											</div>
										</div>
									)
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Active Major Incidents */}
			{!loading && incidents.length > 0 && (
				<Card className="border-destructive/40 bg-destructive/5">
					<CardHeader className="flex flex-row items-center gap-2 pb-3">
						<AlertTriangle className="h-4 w-4 text-destructive" />
						<CardTitle className="text-sm font-medium text-destructive">Active Major Incidents</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{incidents.map(inc => (
							<div key={inc.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
								<span className="text-sm font-medium">{inc.title}</span>
								<Badge variant={inc.severity === "critical" ? "destructive" : "secondary"} className="capitalize">
									{inc.severity}
								</Badge>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
						{[
							{ label: "New Case", href: "/cases", icon: Plus },
							{ label: "All Cases", href: "/cases", icon: FolderOpen },
							{ label: "Patients", href: "/patients", icon: TrendingUp },
							{ label: "Knowledge Base", href: "/knowledge-base", icon: ArrowRight },
						].map(({ label, href, icon: Icon }) => (
							<Link key={label} href={href}>
								<Button variant="outline" className="w-full justify-start gap-2">
									<Icon className="h-4 w-4" />
									{label}
								</Button>
							</Link>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

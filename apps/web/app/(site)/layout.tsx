import Link from "next/link"
import { redirect } from "next/navigation"
import {
	LayoutDashboard,
	FolderOpen,
	Users,
	AlertTriangle,
	BookOpen,
	Ticket,
	LogOut,
} from "lucide-react"
import { getSession } from "@/services/better-auth/auth-server"
import { Button } from "@/core/components/ui/button"

const NAV = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/cases", label: "Cases", icon: FolderOpen },
	{ href: "/patients", label: "Patients", icon: Users },
	{ href: "/incidents", label: "Major Incidents", icon: AlertTriangle },
	{ href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
	{ href: "/submit-ticket", label: "Support", icon: Ticket },
]

function SlmcLogo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="SLMC Logo"
		>
			{/* Circular seal background */}
			<circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.12" />
			<circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
			{/* Cross */}
			<rect x="21" y="11" width="6" height="26" rx="1.5" fill="currentColor" />
			<rect x="11" y="21" width="26" height="6" rx="1.5" fill="currentColor" />
		</svg>
	)
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession()
	if (!session) redirect("/login")
	return (
		<div className="min-h-screen bg-background">
			{/* Top nav */}
			<header className="sticky top-0 z-40 border-b bg-primary text-primary-foreground shadow-sm">
				<div className="flex h-14 items-center justify-between px-6">
					<div className="flex items-center gap-3">
						<SlmcLogo className="h-8 w-8 text-primary-foreground" />
						<div>
							<p className="text-sm font-bold leading-none tracking-wide">St. Luke's Medical Center</p>
							<p className="text-xs opacity-70">Patient Case Management System</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm opacity-80">{session.user?.name ?? session.user?.email}</span>
						<Link href="/logout">
							<Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10">
								<LogOut className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<div className="flex">
				{/* Sidebar */}
				<aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r bg-card md:block">
					{/* Sidebar header */}
					<div className="border-b px-4 py-3">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Navigation</p>
					</div>
					<nav className="flex flex-col gap-0.5 p-3">
						{NAV.map(({ href, label, icon: Icon }) => (
							<Link
								key={href}
								href={href}
								className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<Icon className="h-4 w-4 shrink-0" />
								{label}
							</Link>
						))}
					</nav>
				</aside>

				{/* Main content */}
				<main className="min-w-0 flex-1 p-6">{children}</main>
			</div>
		</div>
	)
}

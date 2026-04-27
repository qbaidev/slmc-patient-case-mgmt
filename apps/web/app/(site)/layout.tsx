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
	Activity,
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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession()
	if (!session) redirect("/login")
	return (
		<div className="min-h-screen bg-background">
			{/* Top nav */}
			<header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
				<div className="flex h-14 items-center justify-between px-6">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Activity className="h-4 w-4 text-primary-foreground" />
						</div>
						<div>
							<p className="text-sm font-semibold leading-none">SLMC Case Management</p>
							<p className="text-xs text-muted-foreground">St. Luke's Medical Center</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-muted-foreground">{session.user?.name ?? session.user?.email}</span>
						<Link href="/logout">
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<LogOut className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<div className="flex">
				{/* Sidebar */}
				<aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r bg-card md:block">
					<nav className="flex flex-col gap-0.5 p-3">
						{NAV.map(({ href, label, icon: Icon }) => (
							<Link
								key={href}
								href={href}
								className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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

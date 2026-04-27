import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/services/better-auth/auth-server"

const NAV = [
	{ href: "/dashboard", label: "Dashboard", icon: "🏠" },
	{ href: "/cases", label: "Cases", icon: "📋" },
	{ href: "/patients", label: "Patients", icon: "🏥" },
	{ href: "/incidents", label: "Major Incidents", icon: "🚨" },
	{ href: "/knowledge-base", label: "Knowledge Base", icon: "📚" },
	{ href: "/submit-ticket", label: "Support", icon: "🎫" },
]

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession()
	if (!session) redirect("/login")
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card px-6 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-2xl">🏨</span>
					<div>
						<div className="font-bold text-sm">SLMC Case Management</div>
						<div className="text-xs text-muted-foreground">St. Luke's Medical Center</div>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm text-muted-foreground">{session.user?.name ?? session.user?.email}</span>
					<Link href="/logout" className="text-sm text-muted-foreground hover:text-foreground">Sign out</Link>
				</div>
			</header>
			<div className="container py-6">
				<div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
					<aside className="bg-card hidden rounded-xl border p-4 md:block h-fit">
						<nav className="space-y-0.5">
							{NAV.map(item => (
								<Link key={item.href} href={item.href} className="hover:bg-accent flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium">
									<span>{item.icon}</span><span>{item.label}</span>
								</Link>
							))}
						</nav>
					</aside>
					<main className="min-w-0">{children}</main>
				</div>
			</div>
		</div>
	)
}

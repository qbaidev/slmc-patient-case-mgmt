import { Activity } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-background relative flex min-h-screen flex-col">
			<div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10">
				<header className="flex flex-col items-center gap-3 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
						<Activity className="h-6 w-6 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-xl font-semibold tracking-tight">SLMC Case Management</h1>
						<p className="text-sm text-muted-foreground">St. Luke's Medical Center</p>
					</div>
				</header>
				<main className="flex flex-1 flex-col">{children}</main>
			</div>
		</div>
	)
}

function SlmcLogo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="SLMC Logo"
		>
			<circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.12" />
			<circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
			<rect x="21" y="11" width="6" height="26" rx="1.5" fill="currentColor" />
			<rect x="11" y="21" width="26" height="6" rx="1.5" fill="currentColor" />
		</svg>
	)
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-screen flex-col bg-background">
			{/* Brand strip */}
			<div className="bg-primary py-3 text-center text-xs font-medium text-primary-foreground/70 tracking-wider uppercase">
				St. Luke's Medical Center — Official Internal System
			</div>

			<div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10">
				<header className="flex flex-col items-center gap-4 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
						<SlmcLogo className="h-10 w-10 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">St. Luke's Medical Center</h1>
						<p className="mt-0.5 text-sm text-muted-foreground">Patient Case Management System</p>
						<p className="text-xs text-muted-foreground">Quezon City · Global City</p>
					</div>
				</header>
				<main className="flex flex-1 flex-col">{children}</main>
			</div>
		</div>
	)
}

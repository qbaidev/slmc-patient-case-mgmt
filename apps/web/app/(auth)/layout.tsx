import { Logo } from "@/core/components/logo"
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-background relative flex min-h-screen flex-col">
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
				<header className="flex flex-col gap-2 text-center">
					<Logo href="/" text="SLMC Case Management" className="self-center" />
					<p className="text-muted-foreground text-sm">St. Luke's Medical Center — Patient Case Management System</p>
				</header>
				<main className="flex flex-1 flex-col">{children}</main>
			</div>
		</div>
	)
}

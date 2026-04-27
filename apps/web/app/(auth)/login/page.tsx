"use client"

import { useState } from "react"
import { LoginForm } from "@/features/auth/login/components/login-form"
import { authClient } from "@/services/better-auth/auth-client"
import { useRouter } from "next/navigation"

const DEV_ACCOUNTS = [
	{ email: "dev@openclaw.local", password: "DevAccess123!", name: "OpenClaw Dev", role: "Dev" },
	{ email: "admin@demo.local", password: "DevAccess123!", name: "Alice Admin", role: "Admin" },
	{ email: "dev@demo.local", password: "DevAccess123!", name: "Bob Developer", role: "Developer" },
	{ email: "manager@demo.local", password: "DevAccess123!", name: "Carol Manager", role: "Manager" },
	{ email: "tester@demo.local", password: "DevAccess123!", name: "Dave Tester", role: "Tester" },
	{ email: "viewer@demo.local", password: "DevAccess123!", name: "Eve Viewer", role: "Viewer" },
]

export default function LoginPage() {
	const router = useRouter()
	const [loading, setLoading] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [showAll, setShowAll] = useState(false)

	async function quickLogin(email: string, password: string) {
		setLoading(email)
		setError(null)
		try {
			const result = await authClient.signIn.email({ email, password })
			if (result.error) throw new Error(result.error.message ?? "Failed to sign in")
			router.push("/dashboard")
			router.refresh()
		} catch (e) {
			setError(e instanceof Error ? e.message : "Login failed")
			setLoading(null)
		}
	}

	const visibleAccounts = showAll ? DEV_ACCOUNTS : DEV_ACCOUNTS.slice(0, 1)

	return (
		<section className="flex flex-1 flex-col items-center justify-center gap-6">
			{/* Dev Access Panel */}
			<div className="w-full max-w-md rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40 p-4 space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold text-violet-800 dark:text-violet-300">⚡ Quick Dev Access</span>
					</div>
					<button
						onClick={() => setShowAll(p => !p)}
						className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
					>
						{showAll ? "Show less ▲" : `Show all ${DEV_ACCOUNTS.length} accounts ▼`}
					</button>
				</div>

				<p className="text-xs text-violet-600 dark:text-violet-400">
					All accounts use password: <code className="font-mono bg-violet-100 dark:bg-violet-900 px-1 rounded">DevAccess123!</code>
				</p>

				{error && <p className="text-xs text-red-500">{error}</p>}

				<div className="space-y-2">
					{visibleAccounts.map(acc => (
						<div key={acc.email} className="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 px-3 py-2">
							<div className="min-w-0">
								<div className="flex items-center gap-1.5">
									<span className="text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-800 px-1.5 py-0.5 rounded">
										{acc.role}
									</span>
									<span className="text-xs font-medium truncate">{acc.name}</span>
								</div>
								<div className="text-xs text-muted-foreground font-mono truncate mt-0.5">{acc.email}</div>
							</div>
							<button
								onClick={() => quickLogin(acc.email, acc.password)}
								disabled={loading !== null}
								className="shrink-0 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
							>
								{loading === acc.email ? "…" : "Login"}
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Standard login form */}
			<LoginForm className="w-full" />
		</section>
	)
}

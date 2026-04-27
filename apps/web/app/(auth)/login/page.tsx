"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogIn } from "lucide-react"
import { LoginForm } from "@/features/auth/login/components/login-form"
import { authClient } from "@/services/better-auth/auth-client"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { Separator } from "@/core/components/ui/separator"

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

	async function quickLogin(email: string, password: string) {
		setLoading(email)
		setError(null)
		try {
			const result = await authClient.signIn.email({ email, password })
			if (result.error) throw new Error(result.error.message ?? "Failed to sign in")
			router.push("/dashboard")
			router.refresh()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed")
		} finally {
			setLoading(null)
		}
	}

	return (
		<div className="space-y-6">
			<LoginForm />

			{/* Dev access panel */}
			<div className="rounded-xl border bg-muted/40 p-4 space-y-3">
				<div className="flex items-center justify-between">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dev Quick Access</p>
					<Badge variant="secondary" className="text-xs">Demo</Badge>
				</div>
				<Separator />
				<div className="grid grid-cols-2 gap-2">
					{DEV_ACCOUNTS.map(acc => (
						<Button
							key={acc.email}
							variant="outline"
							size="sm"
							className="justify-start gap-2 h-9 text-xs"
							disabled={loading === acc.email}
							onClick={() => quickLogin(acc.email, acc.password)}
						>
							{loading === acc.email
								? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
								: <LogIn className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							}
							<span className="truncate">{acc.name}</span>
							<Badge variant="secondary" className="ml-auto text-xs shrink-0">{acc.role}</Badge>
						</Button>
					))}
				</div>
				{error && <p className="text-xs text-destructive">{error}</p>}
				<p className="text-xs text-muted-foreground text-center">All accounts use <code className="bg-muted px-1 rounded">DevAccess123!</code></p>
			</div>
		</div>
	)
}

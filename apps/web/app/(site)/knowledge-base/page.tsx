"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Eye, BookOpen, Loader2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Textarea } from "@/core/components/ui/textarea"
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/core/components/ui/dialog"
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/core/components/ui/select"
import { Skeleton } from "@/core/components/ui/skeleton"
import { Separator } from "@/core/components/ui/separator"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Article {
	id: string; title: string; category: string; content: string
	tags: string[]; viewCount: number; isPublished: boolean; createdAt: string
}

const CATEGORIES = ["clinical","billing","pharmacy","administrative","it","compliance","hr","general"]
const CATEGORY_LABELS: Record<string, string> = {
	clinical: "Clinical", billing: "Billing", pharmacy: "Pharmacy",
	administrative: "Admin", it: "IT", compliance: "Compliance", hr: "HR", general: "General",
}

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="leading-snug">{article.title}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="capitalize">{CATEGORY_LABELS[article.category] ?? article.category}</Badge>
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<Eye className="h-3.5 w-3.5" />
							{article.viewCount} views
						</div>
					</div>
					<Separator />
					<p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{article.content}</p>
					{(article.tags ?? []).length > 0 && (
						<div className="flex flex-wrap gap-1.5 pt-2">
							{article.tags.map(t => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

function NewArticleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
	const [form, setForm] = useState({ title: "", category: "general", content: "", tags: "", isPublished: true })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.title.trim()) { setError("Title is required"); return }
		if (!form.content.trim()) { setError("Content is required"); return }
		setSaving(true); setError("")
		try {
			const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean)
			const res = await fetch(`${API}/${V}/knowledge-articles`, {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...form, tags }),
			})
			if (!res.ok) throw new Error(await res.text())
			onCreated()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create article")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader><DialogTitle>New Article</DialogTitle></DialogHeader>
				<form onSubmit={submit} className="space-y-4">
					<div className="space-y-1.5">
						<Label>Title *</Label>
						<Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title" />
					</div>
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
						<Label>Content *</Label>
						<Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} placeholder="Article content…" />
					</div>
					<div className="space-y-1.5">
						<Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
						<Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="billing, insurance, procedure" />
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
							Publish
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default function KnowledgeBasePage() {
	const [articles, setArticles] = useState<Article[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [filterCategory, setFilterCategory] = useState("all")
	const [viewing, setViewing] = useState<Article | null>(null)
	const [showNew, setShowNew] = useState(false)

	const load = useCallback(() => {
		setLoading(true)
		fetch(`${API}/${V}/knowledge-articles`).then(r => r.json())
			.then(d => setArticles(Array.isArray(d) ? d : []))
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => { load() }, [load])

	async function handleView(article: Article) {
		setViewing(article)
		try {
			await fetch(`${API}/${V}/knowledge-articles/${article.id}/view`, { method: "POST" })
		} catch { /* non-fatal */ }
	}

	const filtered = articles.filter(a => {
		const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
		const matchCat = filterCategory === "all" || a.category === filterCategory
		return matchSearch && matchCat
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
					<p className="text-sm text-muted-foreground">{articles.length} articles</p>
				</div>
				<Button size="sm" onClick={() => setShowNew(true)}>
					<Plus className="mr-1.5 h-4 w-4" /> New Article
				</Button>
			</div>

			{/* Search + filter */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input className="pl-8 h-9" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
				</div>
				<Select value={filterCategory} onValueChange={setFilterCategory}>
					<SelectTrigger className="h-9 w-40"><SelectValue placeholder="Category" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All categories</SelectItem>
						{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
					</SelectContent>
				</Select>
				{(search || filterCategory !== "all") && (
					<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setSearch(""); setFilterCategory("all") }}>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Articles grid */}
			{loading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
				</div>
			) : filtered.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center">
						<div className="flex flex-col items-center gap-2 text-muted-foreground">
							<BookOpen className="h-10 w-10" />
							<p className="font-medium">No articles found</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map(a => (
						<Card key={a.id} className="flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(a)}>
							<CardHeader className="pb-2 flex-1">
								<div className="flex items-start justify-between gap-2">
									<CardTitle className="text-sm font-semibold leading-snug line-clamp-2">{a.title}</CardTitle>
									<Badge variant="secondary" className="shrink-0 text-xs">{CATEGORY_LABELS[a.category] ?? a.category}</Badge>
								</div>
								<CardDescription className="line-clamp-2 text-xs">{a.content}</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex items-center justify-between">
									<div className="flex flex-wrap gap-1">
										{(a.tags ?? []).slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Eye className="h-3 w-3" />
										{a.viewCount}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{viewing && <ArticleModal article={viewing} onClose={() => setViewing(null)} />}
			{showNew && <NewArticleModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
		</div>
	)
}

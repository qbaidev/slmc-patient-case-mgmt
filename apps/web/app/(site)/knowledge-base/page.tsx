"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Article { id: string; title: string; category: string; tags: string; visibility: string; status: string; viewCount: number; helpfulCount: number; createdAt: string }

const VIS_BADGE: Record<string, string> = { internal: "bg-blue-100 text-blue-700", patient_facing: "bg-green-100 text-green-700", both: "bg-purple-100 text-purple-700" }
const STATUS_BADGE: Record<string, string> = { published: "bg-green-100 text-green-700", draft: "bg-yellow-100 text-yellow-700", archived: "bg-gray-100 text-gray-600" }

export default function KnowledgeBasePage() {
	const [articles, setArticles] = useState<Article[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [catFilter, setCatFilter] = useState("")

	const load = (s?: string, c?: string) => {
		const params = new URLSearchParams()
		if (s) params.set("search", s)
		if (c) params.set("category", c)
		fetch(`${API}/${V}/knowledge-articles?${params}`).then(r => r.json()).then(d => { setArticles(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
	}

	useEffect(() => { load("", catFilter) }, [catFilter])
	useEffect(() => { const t = setTimeout(() => load(search, catFilter), 400); return () => clearTimeout(t) }, [search])

	const categories = [...new Set(articles.map(a => a.category).filter(Boolean))]

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div><h1 className="text-2xl font-bold">Knowledge Base</h1><p className="text-muted-foreground mt-1">{articles.length} articles</p></div>
				<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">✍️ New Article</button>
			</div>
			<div className="flex gap-3">
				<input type="text" placeholder="Search articles..." className="flex-1 border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
				<select className="border rounded-lg px-3 py-2 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
					<option value="">All Categories</option>
					{categories.map(c => <option key={c} value={c}>{c}</option>)}
				</select>
			</div>
			{loading ? <div className="grid gap-4 md:grid-cols-2">{[...Array(4)].map((_,i) => <div key={i} className="bg-muted h-32 animate-pulse rounded-xl" />)}</div> : (
				<div className="grid gap-4 md:grid-cols-2">
					{articles.length === 0 ? <div className="col-span-2 text-center py-12 text-muted-foreground">No articles found</div> : articles.map(a => (
						<div key={a.id} className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
							<div className="flex items-start justify-between mb-2">
								<h3 className="font-semibold">📄 {a.title}</h3>
								<span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[a.status] ?? ""}`}>{a.status}</span>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								<span className="bg-muted px-2 py-0.5 rounded text-xs">{a.category}</span>
								<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${VIS_BADGE[a.visibility] ?? ""}`}>{a.visibility.replace("_"," ")}</span>
								{a.tags?.split(",").slice(0,3).map(t => <span key={t} className="bg-muted px-1.5 py-0.5 rounded text-xs">{t.trim()}</span>)}
							</div>
							<div className="mt-3 flex gap-4 text-xs text-muted-foreground">
								<span>👁 {a.viewCount} views</span>
								<span>👍 {a.helpfulCount} helpful</span>
								<span>{new Date(a.createdAt).toLocaleDateString()}</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

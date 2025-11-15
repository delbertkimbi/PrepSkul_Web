"use client"

import { useEffect, useMemo, useState } from "react"
import { ACADEMY_LEVELS, type AcademyLevelId, type AcademyModule, getLevelById } from "@/lib/academy-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface EditableModule extends AcademyModule {}

export default function AcademyAdminPage() {
	const [levelId, setLevelId] = useState<AcademyLevelId>('nursery')
	const [modules, setModules] = useState<EditableModule[]>([])

	useEffect(() => {
		const lvl = getLevelById(levelId)
		setModules(lvl ? JSON.parse(JSON.stringify(lvl.modules)) : [])
	}, [levelId])

	const selectedLevel = useMemo(() => getLevelById(levelId), [levelId])

	const saveToLocal = () => {
		// For now, write admin edits to localStorage under a separate key.
		if (!selectedLevel) return
		const key = `prepskul.academy.admin.level.${levelId}`
		window.localStorage.setItem(key, JSON.stringify(modules))
		alert('Saved locally. Hook this up to Supabase later for persistence.')
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold">Academy Admin</h1>
				<p className="text-sm text-muted-foreground">Update teaching content and quizzes. This is a local-only editor scaffold.</p>
			</div>

			<Card>
				<CardContent className="p-6 space-y-4">
					<div className="flex items-center gap-3">
						<label className="text-sm font-medium">Level</label>
						<select className="h-9 rounded border px-2" value={levelId} onChange={e => setLevelId(e.target.value as AcademyLevelId)}>
							{ACADEMY_LEVELS.map(l => (
								<option key={l.id} value={l.id}>{l.name}</option>
							))}
						</select>
						<Button size="sm" onClick={saveToLocal}>Save</Button>
					</div>

					<div className="space-y-6">
						{modules.map((m, idx) => (
							<Card key={m.id} className="border">
								<CardContent className="p-5 space-y-3">
									<h2 className="font-semibold">Module {idx + 1}: {m.title}</h2>
									<label className="text-sm font-medium">Content (HTML allowed)</label>
									<Textarea rows={6} value={m.content.html} onChange={e => {
										const next = [...modules]
										next[idx] = { ...m, content: { ...m.content, html: e.target.value } }
										setModules(next)
									}} />
									<div className="space-y-2">
										<p className="text-sm font-medium">Quiz Questions (edit text; keep correctAnswerIndex as-is)</p>
										{m.quiz.map((q, qi) => (
											<div key={qi} className="rounded border p-3">
												<input className="w-full h-9 rounded border px-2" value={q.question} onChange={e => {
													const next = [...modules]
													next[idx].quiz[qi].question = e.target.value
													setModules(next)
												}} />
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
													{q.options.map((opt, oi) => (
														<input key={oi} className="w-full h-9 rounded border px-2" value={opt} onChange={e => {
															const next = [...modules]
															next[idx].quiz[qi].options[oi] = e.target.value
															setModules(next)
														}} />
													))}
												</div>
											<p className="text-xs text-muted-foreground mt-1">Correct answer index: <span className="font-mono">{q.correctAnswerIndex}</span> (change only if needed)</p>
										</div>
									))}
								</div>
						</CardContent>
						</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}



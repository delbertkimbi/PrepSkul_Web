"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getModule, getLevelById, type AcademyLevelId } from "@/lib/academy-data"
import { canAccessModule, recordModuleScore, PASS_THRESHOLD, updateSectionProgress } from "@/lib/academy-storage"
import ModuleSidebar from "@/components/academy/ModuleSidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function ModulePage() {
	const params = useParams<{ level: AcademyLevelId; moduleId: string }>()
	const router = useRouter()
	const res = getModule(params.level, params.moduleId)
	const level = getLevelById(params.level)

	const [selected, setSelected] = useState<Record<number, number | null>>({})
	const [tutorName, setTutorName] = useState("")
	const [submitted, setSubmitted] = useState(false)

	const order = useMemo(() => level?.modules.map(m => m.id) ?? [], [level])

	const accessible = useMemo(() => canAccessModule(params.level, order, params.moduleId), [params.level, order, params.moduleId])

	if (!res || !level) return <div className="text-sm text-red-600">Module not found.</div>

	const { module } = res

	const allAnswered = Object.keys(selected).length === module.quiz.length && Object.values(selected).every(v => v !== null && v !== undefined)

	const scorePercent = useMemo(() => {
		let correct = 0
		for (let i = 0; i < module.quiz.length; i++) {
			if (selected[i] === module.quiz[i].correctAnswerIndex) correct++
		}
		return Math.round((correct / module.quiz.length) * 100)
	}, [selected, module.quiz])

	const handleSubmit = useCallback(() => {
		setSubmitted(true)
		if (!allAnswered) return
		const percent = scorePercent
		recordModuleScore(params.level, params.moduleId, percent)
			if (percent >= PASS_THRESHOLD) {
			// Go back to level overview; next module will be unlocked
			router.push(`/academy/${params.level}`)
		}
	}, [allAnswered, scorePercent, params.level, params.moduleId, router])

	if (!accessible) {
		return (
			<div className="max-w-xl p-6 mt-6 mx-auto bg-white/80 rounded-2xl shadow border text-center">
				<h1 className="text-xl font-semibold mb-2 text-primary">Module Locked</h1>
				<p className="text-muted-foreground text-sm">Score {PASS_THRESHOLD}% in the previous module to unlock this one.</p>
				<div className="mt-4">
					<Button onClick={() => router.push(`/academy/${params.level}`)} size="sm" className="rounded-full">Back to {level.name}</Button>
				</div>
			</div>
		);
	}
	// Helper function to convert YouTube URL to embed URL
	const convertYouTubeToEmbed = (url: string): string => {
		// Handle youtu.be format
		if (url.includes('youtu.be/')) {
			const videoId = url.match(/youtu\.be\/([^?&]+)/)?.[1];
			if (videoId) return `https://www.youtube.com/embed/${videoId}`;
		}
		// Handle youtube.com/watch format
		if (url.includes('youtube.com/watch')) {
			const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
			if (videoId) return `https://www.youtube.com/embed/${videoId}`;
		}
		// Already in embed format
		if (url.includes('youtube.com/embed')) return url;
		return url;
	};

	return (
		<div className="flex flex-col lg:flex-row gap-6 p-6">
			<ModuleSidebar levelId={params.level} moduleId={params.moduleId} sections={module.sections || []} />
			
			<div className="flex-1">
				<div className="mb-6">
					<Button
						onClick={() => router.push(`/academy/${params.level}`)}
						variant="outline"
						size="sm"
						className="mb-4"
					>
						<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to Modules
					</Button>
					<h1 className="text-2xl font-bold text-primary">{module.title}</h1>
					<p className="text-muted-foreground mt-2">Complete this quiz to progress to the next module.</p>
				</div>

				<Card className="bg-white/95 shadow-md rounded-2xl border-2 border-primary/10">
					<CardContent className="p-6 space-y-6">
					<h2 className="font-semibold text-lg mb-2">Quiz</h2>
					<div className="space-y-5">
						{module.quiz.map((q, i) => (
							<div key={i} className="rounded-xl border bg-muted/40 p-4">
								<p className="font-medium mb-2 text-primary/90">Q{i + 1}. {q.question}</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{q.options.map((opt, j) => {
										const isSelected = selected[i] === j;
										return (
											<button
												onClick={() => setSelected(prev => ({ ...prev, [i]: j }))}
												key={j}
												className={`text-left rounded-lg border px-4 py-3 font-normal text-sm hover:border-primary shadow transition-all focus:z-10 focus:ring-2 focus:outline-none ${isSelected ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-gray-300 bg-white/80'}`}
											>
												{opt}
											</button>
										);
									})}
								</div>
								{submitted && (selected[i] !== q.correctAnswerIndex) && (
									<p className="text-xs text-destructive mt-2 font-semibold">Incorrect. Try again.</p>
								)}
							</div>
						))}
					</div>
					<div className="pt-6 border-t mt-6 space-y-4">
						<label className="text-sm font-medium">Your full name (for certificate records later)</label>
						<Textarea value={tutorName} onChange={e => setTutorName(e.target.value)} placeholder="Enter your name" rows={2} />
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<Button onClick={handleSubmit} disabled={!allAnswered} className="rounded-full px-6 py-2 text-base">Submit Answers</Button>
							{submitted && (
								<span className="text-sm text-muted-foreground">Score: {scorePercent}%</span>
							)}
						</div>
						{submitted && scorePercent < PASS_THRESHOLD && (
							<p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">You need {PASS_THRESHOLD}% to unlock the next module.</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
		</div>
	);
}

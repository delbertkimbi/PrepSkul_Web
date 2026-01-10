"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getLevelById, getFinalQuiz, type AcademyLevelId } from "@/lib/academy-data"
import { canAccessFinalQuiz, recordFinalQuizScore, PASS_THRESHOLD, getFinalQuizStatus } from "@/lib/academy-storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function FinalQuizPage() {
	const params = useParams<{ level: AcademyLevelId }>()
	const router = useRouter()
	const level = getLevelById(params.level)
	const finalQuiz = getFinalQuiz(params.level)

	const [selected, setSelected] = useState<Record<number, number | null>>({})
	const [tutorName, setTutorName] = useState("")
	const [submitted, setSubmitted] = useState(false)

	const order = useMemo(() => level?.modules.map(m => m.id) ?? [], [level])
	const [accessible, setAccessible] = useState(false)
	const [finalQuizStatus, setFinalQuizStatus] = useState<{ scorePercent: number; isPassed: boolean } | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadData = async () => {
			const canAccess = await canAccessFinalQuiz(params.level, order)
			setAccessible(canAccess)
			const status = await getFinalQuizStatus(params.level)
			setFinalQuizStatus(status)
			setLoading(false)
		}
		loadData()
	}, [params.level, order])

	if (!level || !finalQuiz) {
		return <div className="text-sm text-red-600">Final quiz not available for this level.</div>
	}

	const allAnswered = Object.keys(selected).length === finalQuiz.length && Object.values(selected).every(v => v !== null && v !== undefined)

	const scorePercent = useMemo(() => {
		let correct = 0
		for (let i = 0; i < finalQuiz.length; i++) {
			if (selected[i] === finalQuiz[i].correctAnswerIndex) correct++
		}
		return Math.round((correct / finalQuiz.length) * 100)
	}, [selected, finalQuiz])

	const handleSubmit = useCallback(async () => {
		setSubmitted(true)
		if (!allAnswered) return
		const percent = scorePercent
		await recordFinalQuizScore(params.level, percent)
		const status = await getFinalQuizStatus(params.level)
		setFinalQuizStatus(status)
		if (percent >= PASS_THRESHOLD) {
			// Navigate to certificate page
			router.push(`/academy/${params.level}/certificate`)
		}
	}, [allAnswered, scorePercent, params.level, router])

	if (loading) {
		return <div className="text-sm text-gray-600">Loading...</div>
	}

	if (!accessible) {
		return (
			<div className="max-w-xl p-6 mt-6 mx-auto bg-white/80 rounded-2xl shadow border text-center">
				<h1 className="text-xl font-semibold mb-2 text-primary">Final Quiz Locked</h1>
				<p className="text-muted-foreground text-sm">Complete all modules with at least {PASS_THRESHOLD}% to unlock the final quiz.</p>
				<div className="mt-4">
					<Button onClick={() => router.push(`/academy/${params.level}`)} size="sm" className="rounded-full">Back to {level.name}</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
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
				<h1 className="text-3xl font-bold text-primary mb-2">Final Quiz: {level.name} Level</h1>
				<p className="text-muted-foreground mt-2">
					{finalQuizStatus ? (
						<span>You scored {finalQuizStatus.scorePercent}% on this quiz. {finalQuizStatus.isPassed ? "Congratulations!" : `You need ${PASS_THRESHOLD}% to pass.`}</span>
					) : (
						"Complete this comprehensive quiz to demonstrate your mastery of all modules."
					)}
				</p>
			</div>

			<Card className="bg-white/95 shadow-md rounded-2xl border-2 border-primary/10">
				<CardContent className="p-6 space-y-6">
					<h2 className="font-semibold text-lg mb-2">Final Assessment ({finalQuiz.length} Questions)</h2>
					<div className="space-y-5">
						{finalQuiz.map((q, i) => (
							<div key={i} className="rounded-xl border bg-muted/40 p-4">
								<p className="font-medium mb-2 text-primary/90">Q{i + 1}. {q.question}</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{q.options.map((opt, j) => {
										const isSelected = selected[i] === j;
										return (
											<button
												onClick={() => setSelected(prev => ({ ...prev, [i]: j }))}
												key={j}
												disabled={submitted}
												className={`text-left rounded-lg border px-4 py-3 font-normal text-sm hover:border-primary shadow transition-all focus:z-10 focus:ring-2 focus:outline-none ${isSelected ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-gray-300 bg-white/80'} ${submitted ? 'opacity-75 cursor-not-allowed' : ''}`}
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
						<label className="text-sm font-medium">Your full name (for certificate records)</label>
						<Textarea 
							value={tutorName} 
							onChange={e => setTutorName(e.target.value)} 
							placeholder="Enter your name" 
							rows={2}
							disabled={submitted}
						/>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<Button 
								onClick={handleSubmit} 
								disabled={!allAnswered || submitted || !tutorName.trim()} 
								className="rounded-full px-6 py-2 text-base"
							>
								{finalQuizStatus ? "Retake Quiz" : "Submit Final Quiz"}
							</Button>
							{submitted && (
								<span className="text-sm text-muted-foreground">Score: {scorePercent}%</span>
							)}
						</div>
						{submitted && scorePercent < PASS_THRESHOLD && (
							<p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">
								You need {PASS_THRESHOLD}% to pass and claim your certificate.
							</p>
						)}
						{submitted && scorePercent >= PASS_THRESHOLD && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<p className="text-sm font-semibold text-green-700 mb-2">🎉 Congratulations! You passed the final quiz!</p>
								<Button 
									onClick={() => router.push(`/academy/${params.level}/certificate`)}
									className="bg-green-600 hover:bg-green-700 text-white"
								>
									Claim Your Certificate
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


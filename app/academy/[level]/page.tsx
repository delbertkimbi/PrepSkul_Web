"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { getLevelById, type AcademyLevelId } from "@/lib/academy-data"
import { canAccessModule, loadProgress, isLevelCompleted, getFinalQuizStatus, getCertificate } from "@/lib/academy-storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LevelOverviewPage() {
	const params = useParams<{ level: AcademyLevelId }>()
	const level = getLevelById(params.level)
	const [progress, setProgress] = useState<Awaited<ReturnType<typeof loadProgress>>>({ levels: {} })
	const [allModulesCompleted, setAllModulesCompleted] = useState(false)
	const [finalQuizStatus, setFinalQuizStatus] = useState<{ scorePercent: number; isPassed: boolean } | null>(null)
	const [certificate, setCertificate] = useState<any>(null)
	const [moduleAccess, setModuleAccess] = useState<Record<string, boolean>>({})
	const [loading, setLoading] = useState(true)

	const order = useMemo(() => level?.modules.map(m => m.id) ?? [], [level])

	useEffect(() => {
		const loadData = async () => {
			const progressData = await loadProgress()
			setProgress(progressData)
			
			const completed = await isLevelCompleted(params.level, order)
			setAllModulesCompleted(completed)
			
			const quizStatus = await getFinalQuizStatus(params.level)
			setFinalQuizStatus(quizStatus)
			
			const cert = await getCertificate(params.level)
			setCertificate(cert)

			// Check access for each module
			const accessMap: Record<string, boolean> = {}
			for (const module of level?.modules || []) {
				accessMap[module.id] = await canAccessModule(params.level, order, module.id)
			}
			setModuleAccess(accessMap)
			setLoading(false)

			// Listen for progress updates
			const handleProgressUpdate = async () => {
				const updated = await loadProgress()
				setProgress(updated)
				const completed = await isLevelCompleted(params.level, order)
				setAllModulesCompleted(completed)
				const quizStatus = await getFinalQuizStatus(params.level)
				setFinalQuizStatus(quizStatus)
				const cert = await getCertificate(params.level)
				setCertificate(cert)
			}
			window.addEventListener('prepskul:progress-updated', handleProgressUpdate)
			return () => window.removeEventListener('prepskul:progress-updated', handleProgressUpdate)
		}
		loadData()
	}, [params.level, order, level])

	if (!level) {
		return <div className="text-sm text-red-600">Level not found.</div>
	}

	return (
		<div className="relative space-y-8">
			<Button 
				variant="ghost" 
				asChild 
				className="group fixed top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
				size="icon"
			>
				<a href="/academy" aria-label="Return to Academy">
					<svg 
						xmlns="http://www.w3.org/2000/svg" 
						width="20" 
						height="20" 
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor" 
						strokeWidth="2" 
						strokeLinecap="round" 
						strokeLinejoin="round" 
						className="transition-transform group-hover:-translate-x-1"
					>
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
				</a>
			</Button>
			<div className="max-w-3xl">
				<h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 text-primary drop-shadow">{level.name} Curriculum</h1>
				<p className="text-muted-foreground text-base mb-2">{level.description}</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{level.modules.map((m, idx) => {
					const status = progress.levels[level.id]?.modules?.[m.id];
					const accessible = moduleAccess[m.id] ?? (idx === 0); // First module always accessible
					// Choose the module's first section id if present, otherwise fallback to legacy '1-1'
					const firstSectionId = (m as any).sections?.[0]?.id ?? '1-1';
					return (
						<Card key={m.id} className={`border-2 rounded-2xl shadow-md transition-all ${status?.isPassed ? 'border-emerald-400 bg-emerald-50/50' : accessible ? 'border-primary/10 bg-white/90' : 'border-gray-200 bg-muted/70 opacity-60'}`}> 
							<CardContent className="p-6 space-y-4">
								<div className="flex items-center gap-2 justify-between">
									<h2 className="font-bold text-lg text-primary/80">Module {idx + 1}: {m.title}</h2>
									{status?.isPassed ? (
										<span className="text-xs rounded-full bg-emerald-200 text-emerald-700 px-3 py-1 font-semibold">Completed</span>
									) : accessible ? (
										<span className="text-xs rounded-full bg-primary/10 text-primary/80 px-3 py-1 font-semibold">Available</span>
									) : (
										<span className="text-xs rounded-full bg-muted text-muted-foreground px-3 py-1">Locked</span>
									)}
								</div>
								<p className="text-sm text-muted-foreground line-clamp-3 mb-1">{m.description}</p>
		                            <Button asChild disabled={!accessible} size="sm" className="w-full !rounded-full">
		                              <a href={`/academy/${level.id}/${m.id}/sections/${firstSectionId}`}>{accessible ? 'Start' : 'Locked'}</a>
		                            </Button>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Final Quiz Section */}
			{allModulesCompleted && (
				<Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl shadow-lg mt-8">
					<CardContent className="p-8 text-center space-y-4">
						<h2 className="text-2xl font-bold text-amber-900 mb-2">
							🎓 Final Assessment
						</h2>
						<p className="text-muted-foreground">
							{finalQuizStatus ? (
								<span>
									You scored {finalQuizStatus.scorePercent}% on the final quiz.{" "}
									{finalQuizStatus.isPassed ? (
										certificate ? (
											<span>Your certificate is ready!</span>
										) : (
											<span>Claim your certificate now!</span>
										)
									) : (
										<span>You can retake the quiz to improve your score.</span>
									)}
								</span>
							) : (
								"Complete all modules to unlock the comprehensive final quiz covering all course content."
							)}
						</p>
						<div className="flex gap-3 justify-center mt-4">
							{finalQuizStatus?.isPassed && certificate ? (
								<Button
									asChild
									className="rounded-full bg-amber-600 hover:bg-amber-700"
								>
									<a href={`/academy/${params.level}/certificate`}>View Certificate</a>
								</Button>
							) : (
								<Button
									asChild
									className="rounded-full bg-amber-600 hover:bg-amber-700"
								>
									<a href={`/academy/${params.level}/final-quiz`}>
										{finalQuizStatus ? "Retake Final Quiz" : "Take Final Quiz"}
									</a>
								</Button>
							)}
							{finalQuizStatus?.isPassed && !certificate && (
								<Button
									asChild
									variant="outline"
									className="rounded-full"
								>
									<a href={`/academy/${params.level}/certificate`}>Claim Certificate</a>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}



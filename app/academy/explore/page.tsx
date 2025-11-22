"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ACADEMY_LEVELS } from "@/lib/academy-data"
import { loadProgress, PASS_THRESHOLD } from "@/lib/academy-storage"
import { academySupabase } from "@/lib/academy-supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BookOpen, Award, Users } from "lucide-react"

export default function ExplorePage() {
	const router = useRouter()
	const [progress, setProgress] = useState<Awaited<ReturnType<typeof loadProgress>>>({ levels: {} })
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const checkAuthAndLoadProgress = async () => {
			// Check authentication
			const { data: { user } } = await academySupabase.auth.getUser()
			if (!user) {
				router.push('/academy/login')
				return
			}

			// Load progress
			const progressData = await loadProgress()
			setProgress(progressData)
			setLoading(false)

			// Listen for progress updates
			const handleProgressUpdate = async () => {
				const updated = await loadProgress()
				setProgress(updated)
			}
			window.addEventListener('prepskul:progress-updated', handleProgressUpdate)
			return () => window.removeEventListener('prepskul:progress-updated', handleProgressUpdate)
		}

		checkAuthAndLoadProgress()
	}, [router])

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d3a6b] mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your progress...</p>
				</div>
			</div>
		)
	}

	// Module descriptions with user-friendly context
	const moduleDescriptions: Record<string, string> = {
		nursery: "Perfect for educators working with little ones aged 3-5. Learn how to create magical learning experiences through play, songs, and stories that spark curiosity and build strong foundations.",
		primary: "Master the art of teaching children aged 6-11. From phonics to problem-solving, discover proven methods that make learning engaging and help every child succeed in their educational journey.",
		secondary: "Take your teaching to the next level. Learn advanced strategies for subject-depth instruction, exam preparation, and helping teenagers reach their full academic potential.",
		university: "Advanced pedagogical strategies for higher education. Learn to engage university students, design effective curricula, and facilitate critical thinking and research skills.",
		skills: "Vocational instruction, project-based learning, and safety compliance. Master the art of teaching practical skills from coding to handwork."
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
			{/* Header */}
			<div className="bg-gradient-to-br from-[#2d3a6b] via-[#252f57] to-[#1a2340] py-12">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="max-w-4xl mx-auto text-center"
					>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
							Explore <span className="text-blue-300">Training Modules</span>
						</h1>
						<p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
							Choose your path and start your journey to teaching excellence. Each level builds on the previous one, creating a comprehensive learning experience.
						</p>
					</motion.div>
				</div>
			</div>

			{/* Training Modules Section */}
			<motion.section
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, margin: "-100px" }}
				className="max-w-7xl mx-auto px-4 py-16 sm:py-20"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
					{ACADEMY_LEVELS.map((level, index) => {
						const levelProgress = progress.levels[level.id];
						const total = level.modules.length;
						const passed = level.modules.filter(m => levelProgress?.modules?.[m.id]?.isPassed).length;
						const percent = Math.round((passed / total) * 100);
						const completed = percent >= PASS_THRESHOLD;
						
						return (
							<motion.div
								key={level.id}
								initial={{ opacity: 0, y: 50, scale: 0.9 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ 
									delay: index * 0.15,
									type: "spring",
									stiffness: 100
								}}
								whileHover={{ 
									scale: 1.05,
									rotateY: 5,
									transition: { duration: 0.3 }
								}}
							>
								<Card className={`border-2 h-full flex flex-col ${completed ? 'border-[#2d3a6b] shadow-xl bg-gradient-to-br from-white to-blue-50/30' : 'border-gray-200 shadow-lg bg-white'} hover:shadow-2xl transition-all duration-300 hover:border-[#2d3a6b]/60`}>
									<CardContent className="p-6 sm:p-8 space-y-6 flex flex-col flex-1">
										<div className="flex items-start justify-between mb-2">
											<div className="flex-1">
												<h3 className="font-bold text-xl sm:text-2xl text-[#2d3a6b] mb-2">{level.name}</h3>
												{completed && (
													<motion.span 
														initial={{ scale: 0 }}
														whileInView={{ scale: 1 }}
														viewport={{ once: true }}
														className="inline-block bg-[#2d3a6b] text-white rounded-full px-3 py-1 text-xs font-bold shadow-md"
													>
														✓ Completed
													</motion.span>
												)}
											</div>
										</div>
										
										{/* User-friendly module description */}
										<p className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1">
											{moduleDescriptions[level.id] || level.description}
										</p>

										{/* Progress Bar */}
										<div className="space-y-2">
											<div className="flex items-center justify-between text-xs font-medium">
												<span className="text-[#2d3a6b]">Progress</span>
												<span className="text-gray-600">{percent}% Complete</span>
											</div>
											<div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden shadow-inner">
												<motion.div 
													initial={{ width: 0 }}
													whileInView={{ width: `${percent}%` }}
													viewport={{ once: true }}
													transition={{ duration: 1, delay: index * 0.1 }}
													className="h-full rounded-full bg-gradient-to-r from-[#2d3a6b] to-[#3d4a7b] shadow-sm"
												/>
											</div>
										</div>

										{/* Module Stats */}
										<div className="flex items-center justify-between pt-2 border-t border-gray-200">
											<span className="text-xs text-gray-600">
												{total} {total === 1 ? 'Module' : 'Modules'}
											</span>
											<Button 
												asChild 
												size="sm" 
												className="px-6 !rounded-full bg-[#2d3a6b] hover:bg-[#3d4a7b] text-white shadow-md hover:shadow-lg transition-all"
											>
												<a href={`/academy/${level.id}`}>
													{completed ? 'Review' : 'Start Learning'}
												</a>
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)
					})}
				</div>
			</motion.section>
		</div>
	)
}


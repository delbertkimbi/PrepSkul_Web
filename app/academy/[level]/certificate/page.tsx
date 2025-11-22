"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getLevelById, type AcademyLevelId } from "@/lib/academy-data"
import { getCertificate, getFinalQuizStatus, issueCertificate, isLevelCompleted, PASS_THRESHOLD } from "@/lib/academy-storage"
import { Certificate } from "@/components/ui/certificate"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CertificatePage() {
	const params = useParams<{ level: AcademyLevelId }>()
	const router = useRouter()
	const level = getLevelById(params.level)
	const [certificateData, setCertificateData] = useState<{
		issuedAt: string;
		verificationCode: string;
		tutorName: string;
	} | null>(null)
	const [tutorName, setTutorName] = useState("")
	const [isGenerating, setIsGenerating] = useState(false)

	const [finalQuizStatus, setFinalQuizStatus] = useState<{ scorePercent: number; isPassed: boolean } | null>(null)
	const [existingCert, setExistingCert] = useState<any>(null)
	const [allModulesCompleted, setAllModulesCompleted] = useState(false)
	const [loading, setLoading] = useState(true)
	const order = level?.modules.map(m => m.id) ?? []

	useEffect(() => {
		const loadData = async () => {
			const quizStatus = await getFinalQuizStatus(params.level)
			setFinalQuizStatus(quizStatus)
			
			const cert = await getCertificate(params.level)
			setExistingCert(cert)
			if (cert) {
				setCertificateData(cert)
				setTutorName(cert.tutorName)
			}
			
			const completed = await isLevelCompleted(params.level, order)
			setAllModulesCompleted(completed)
			setLoading(false)
		}
		loadData()
	}, [params.level, order])

	if (!level) {
		return <div className="text-sm text-red-600">Level not found.</div>
	}

	if (loading) {
		return <div className="text-sm text-gray-600">Loading...</div>
	}

	if (!allModulesCompleted || !finalQuizStatus?.isPassed) {
		return (
			<div className="max-w-xl p-6 mt-6 mx-auto bg-white/80 rounded-2xl shadow border text-center">
				<h1 className="text-xl font-semibold mb-2 text-primary">Certificate Not Available</h1>
				<p className="text-muted-foreground text-sm mb-4">
					{!allModulesCompleted 
						? "Complete all modules with at least 70% to unlock the final quiz."
						: "Pass the final quiz with at least 70% to claim your certificate."
					}
				</p>
				<div className="mt-4 space-x-2">
					<Button onClick={() => router.push(`/academy/${params.level}`)} size="sm" className="rounded-full">
						Back to {level.name}
					</Button>
					{allModulesCompleted && (
						<Button onClick={() => router.push(`/academy/${params.level}/final-quiz`)} size="sm" className="rounded-full">
							Take Final Quiz
						</Button>
					)}
				</div>
			</div>
		)
	}

	const handleClaimCertificate = async () => {
		if (!tutorName.trim()) {
			alert("Please enter your name to claim the certificate.")
			return
		}
		setIsGenerating(true)
		const code = await issueCertificate(params.level, tutorName.trim())
		if (code) {
			const cert = await getCertificate(params.level)
			if (cert) {
				setCertificateData(cert)
				setExistingCert(cert)
			}
		}
		setIsGenerating(false)
	}

	const handleDownloadPDF = async () => {
		if (!certificateData) return
		
		setIsGenerating(true)
		try {
			// Dynamically import libraries
			const html2canvas = (await import('html2canvas')).default
			const jsPDF = (await import('jspdf')).default

			const certificateElement = document.getElementById('certificate')
			if (!certificateElement) {
				alert("Certificate element not found")
				setIsGenerating(false)
				return
			}

			// Create canvas from certificate
			const canvas = await html2canvas(certificateElement, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#fef9e7',
				logging: false,
			})

			// Convert to PDF
			const imgData = canvas.toDataURL('image/png')
			const pdf = new jsPDF({
				orientation: 'landscape',
				unit: 'px',
				format: [1000, 700]
			})

			pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700)
			pdf.save(`PrepSkul-${params.level}-Certificate-${certificateData.verificationCode}.pdf`)
		} catch (error) {
			console.error("Error generating PDF:", error)
			alert("Failed to generate PDF. Please try again. You can use the Print button instead.")
		} finally {
			setIsGenerating(false)
		}
	}

	if (!certificateData) {
		return (
			<div className="max-w-2xl p-6 mt-6 mx-auto">
				<Card className="bg-white/95 shadow-md rounded-2xl border-2 border-primary/10">
					<CardContent className="p-8 space-y-6">
						<h1 className="text-2xl font-bold text-primary mb-2">Claim Your Certificate</h1>
						<p className="text-muted-foreground">
							Congratulations! You've successfully completed all modules and passed the final quiz. 
							Enter your name below to generate your certificate.
						</p>
						<div className="space-y-4">
							<label className="text-sm font-medium">Your Full Name</label>
							<input
								type="text"
								value={tutorName}
								onChange={(e) => setTutorName(e.target.value)}
								placeholder="Enter your full name as it should appear on the certificate"
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							/>
							<Button 
								onClick={handleClaimCertificate}
								disabled={!tutorName.trim()}
								className="w-full rounded-full"
							>
								Generate Certificate
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	const formatDate = new Date(certificateData.issuedAt).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})

	return (
		<div className="flex flex-col items-center gap-6 p-6 min-h-screen bg-gradient-to-br from-amber-50/50 to-blue-50/50">
			<div className="mb-4 print:hidden">
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
			</div>

			<Certificate
				userName={certificateData.tutorName}
				levelName={level.name}
				completionDate={formatDate}
				certificateId={certificateData.verificationCode}
				levelId={params.level}
			/>

			<div className="flex gap-4 print:hidden">
				<Button
					onClick={handleDownloadPDF}
					disabled={isGenerating}
					className="rounded-full px-8 py-2 text-base bg-amber-600 hover:bg-amber-700"
				>
					{isGenerating ? "Generating..." : "📥 Download PDF"}
				</Button>
				<Button
					onClick={() => window.print()}
					variant="outline"
					className="rounded-full px-8 py-2 text-base"
				>
					🖨️ Print
				</Button>
			</div>

			<div className="max-w-2xl mt-4 text-center print:hidden">
				<p className="text-sm text-muted-foreground">
					Your certificate has been saved. You can download it as a PDF or print it directly.
				</p>
			</div>
		</div>
	)
}

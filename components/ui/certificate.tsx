import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CertificateProps {
  userName: string;
  levelName: string;
  completionDate: string;
  certificateId: string;
  levelId?: string;
}

const getCertificateText = (levelId?: string) => {
  switch (levelId) {
    case 'nursery':
      return {
        title: "Nursery Education Tutor Training",
        description: "has successfully completed the comprehensive Nursery Education Tutor Training Program and has demonstrated proficiency in early childhood education principles, play-based learning methodologies, child development, curriculum planning, assessment techniques, and professional ethics. This certificate attests to their readiness to teach and guide young children (ages 3-5) in nursery settings."
      };
    case 'primary':
      return {
        title: "Primary Education Tutor Training",
        description: "has successfully completed the comprehensive Primary Education Tutor Training Program and has demonstrated proficiency in child-centered instruction, core subject teaching, and assessment basics. This certificate attests to their readiness to teach and guide primary school students (ages 6-11)."
      };
    case 'secondary':
      return {
        title: "Secondary Education Tutor Training",
        description: "has successfully completed the comprehensive Secondary Education Tutor Training Program and has demonstrated proficiency in subject-depth teaching, differentiation, and exam preparation. This certificate attests to their readiness to teach and guide secondary school students."
      };
    case 'university':
      return {
        title: "University-Level Tutor Training",
        description: "has successfully completed the comprehensive University-Level Tutor Training Program and has demonstrated proficiency in seminar facilitation, research literacy, and academic integrity. This certificate attests to their readiness to teach and guide university students."
      };
    case 'skills':
      return {
        title: "Skills Training Tutor Certification",
        description: "has successfully completed the comprehensive Skills Training Tutor Certification Program and has demonstrated proficiency in vocational instruction, project-based learning, and safety compliance. This certificate attests to their readiness to teach and guide students in skills development."
      };
    default:
      return {
        title: `${levelName} Level Tutor Training`,
        description: "has successfully completed all modules in the training program and has demonstrated exceptional understanding and commitment to education. This certificate attests to their readiness to teach and guide students."
      };
  }
};

export const Certificate = ({
  userName,
  levelName,
  completionDate,
  certificateId,
  levelId,
}: CertificateProps) => {
  const certText = getCertificateText(levelId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-[1000px] h-[700px] bg-gradient-to-br from-amber-50 via-white to-blue-50 border-[12px] border-amber-600/30 p-12 shadow-2xl"
      id="certificate"
    >
      {/* Ornamental Border */}
      <div className="absolute inset-0 border-4 border-amber-500/20" />
      
      {/* Top Decorative Line */}
      <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      {/* Certificate Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between text-amber-900">
        {/* Header with Logo */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-24 h-24">
            <Image
              src="/logo.jpg"
              alt="PrepSkul Logo"
              fill
              className="object-contain rounded-full border-4 border-amber-500/30"
              unoptimized
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-serif font-bold text-amber-800 tracking-wide mb-2">
              PrepSkul
            </h1>
            <p className="text-sm text-amber-700/80 font-medium">Tutor Training Academy</p>
          </div>
        </div>

        {/* Main Certificate Text */}
        <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-serif font-bold text-amber-900 mb-8 tracking-wide">
            Certificate of Completion
          </h2>
          
          <p className="text-xl text-amber-800/90 mb-4">This is to certify that</p>
          
          <h3 className="text-5xl font-serif font-bold text-amber-900 border-b-4 border-amber-600/40 pb-4 px-12 mb-6">
            {userName}
          </h3>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg leading-relaxed text-amber-800/90">
              {certText.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end w-full mt-8 px-8">
          <div className="text-center">
            <div className="w-48 h-px bg-amber-600/40 mb-2" />
            <p className="text-sm font-semibold text-amber-800">Date of Completion</p>
            <p className="text-sm text-amber-700">{completionDate}</p>
          </div>
          
          <div className="text-center">
            <div className="w-48 h-px bg-amber-600/40 mb-2" />
            <p className="text-sm font-semibold text-amber-800">Certificate ID</p>
            <p className="text-sm text-amber-700 font-mono">{certificateId}</p>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-amber-500/30" />
        <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-amber-500/30" />
        <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-amber-500/30" />
        <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-amber-500/30" />
      </div>
    </motion.div>
  );
};
import { Certificate } from '@/components/ui/certificate';
import { Button } from '@/components/ui/button';
import { formatDate, getCertificate } from '@/lib/certificate-storage';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    level: string;
  };
}

async function CertificatePage({ params }: PageProps) {
  const { level } = params;
  
  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return notFound();
  }

  // Get certificate data
  const certificate = await getCertificate(session.user.id, level);
  
  if (!certificate) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Congratulations!</h1>
          <p className="mt-2 text-lg text-gray-600">
            You have successfully completed all modules in the {certificate.levelName} level.
          </p>
        </div>

        <div className="flex justify-center items-center mb-8">
          <Certificate
            userName={certificate.userName}
            levelName={certificate.levelName}
            completionDate={formatDate(new Date(certificate.completedAt))}
            certificateId={certificate.id}
          />
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => window.print()}
            className="bg-blue-900 hover:bg-blue-800 text-white print:hidden"
          >
            Print Certificate
          </Button>
        </div>

        <div className="mt-8 space-y-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificate.modules.map((module) => (
              <div 
                key={module.id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <h3 className="font-medium text-gray-900">{module.name}</h3>
                <p className="text-sm text-gray-500">
                  Completed on {formatDate(new Date(module.completedAt))}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  Score: {module.score}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificatePage;
import { supabase } from '@/lib/supabase';

export interface CertificateData {
  id: string;
  userId: string;
  userName: string;
  levelId: string;
  levelName: string;
  completedAt: Date;
  modules: {
    id: string;
    name: string;
    score: number;
    completedAt: Date;
  }[];
}

export const generateCertificateId = (levelId: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${levelId.toUpperCase()}-${timestamp}${random}`;
};

export const saveCertificateData = async (data: Omit<CertificateData, 'id'>) => {
  const id = generateCertificateId(data.levelId);
  
  const { data: result, error } = await supabase
    .from('certificates')
    .insert([{ ...data, id }])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to save certificate data');
  }

  return result;
};

export const getCertificate = async (userId: string, levelId: string) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .match({ userId, levelId })
    .single();

  if (error) {
    return null;
  }

  return data as CertificateData;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
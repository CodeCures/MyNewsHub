import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PreferencesClient from './PreferencesClient';

export default async function Preferences() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // No server-side data fetching - all done client-side for better performance
  return <PreferencesClient />;
}

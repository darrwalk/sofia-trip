import { getAllRestaurantsWithVotes } from '@/lib/db';
import { AppShell } from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default function Home() {
  const restaurants = getAllRestaurantsWithVotes();

  return <AppShell restaurants={restaurants} />;
}

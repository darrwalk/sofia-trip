'use server';

import { revalidatePath } from 'next/cache';
import { upsertVote } from './db';

export async function castVote(restaurantId: number, voterName: string, voteType: 'up' | 'down') {
  if (!voterName.trim()) throw new Error('Voter name required');
  upsertVote(restaurantId, voterName.trim(), voteType);
  revalidatePath('/');
}

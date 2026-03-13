'use client';

import { useState, useEffect } from 'react';
import { castVote } from '../lib/actions';
import { VoterBubbles } from './VoterBubbles';

type Vote = { voter_name: string; vote_type: 'up' | 'down' };
type VoteButtonsProps = {
  restaurantId: number;
  initialVotes: Vote[];
  upCount: number;
  downCount: number;
};

export function VoteButtons({ restaurantId, initialVotes, upCount, downCount }: VoteButtonsProps) {
  const [voterName, setVoterName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [pendingVote, setPendingVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localVotes, setLocalVotes] = useState(initialVotes);
  const [localUpCount, setLocalUpCount] = useState(upCount);
  const [localDownCount, setLocalDownCount] = useState(downCount);

  useEffect(() => {
    const saved = localStorage.getItem('sofia-trip-voter-name');
    if (saved) setVoterName(saved);
  }, []);

  const myVote = localVotes.find(v => v.voter_name === voterName);

  async function handleVote(type: 'up' | 'down') {
    if (!voterName.trim()) {
      setPendingVote(type);
      setShowNameInput(true);
      return;
    }
    await submitVote(type, voterName);
  }

  async function submitVote(type: 'up' | 'down', name: string) {
    setIsLoading(true);
    try {
      await castVote(restaurantId, name, type);
      setLocalVotes(prev => {
        const existing = prev.find(v => v.voter_name === name);
        if (existing) {
          if (existing.vote_type === type) {
            if (type === 'up') setLocalUpCount(c => c - 1);
            else setLocalDownCount(c => c - 1);
            return prev.filter(v => v.voter_name !== name);
          } else {
            if (type === 'up') { setLocalUpCount(c => c + 1); setLocalDownCount(c => c - 1); }
            else { setLocalDownCount(c => c + 1); setLocalUpCount(c => c - 1); }
            return prev.map(v => v.voter_name === name ? { ...v, vote_type: type } : v);
          }
        } else {
          if (type === 'up') setLocalUpCount(c => c + 1);
          else setLocalDownCount(c => c + 1);
          return [...prev, { voter_name: name, vote_type: type }];
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!voterName.trim() || !pendingVote) return;
    localStorage.setItem('sofia-trip-voter-name', voterName.trim());
    setShowNameInput(false);
    await submitVote(pendingVote, voterName.trim());
    setPendingVote(null);
  }

  return (
    <div className="space-y-2">
      {showNameInput && (
        <form onSubmit={handleNameSubmit} className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
          <input
            autoFocus
            type="text"
            placeholder="Your name..."
            value={voterName}
            onChange={e => setVoterName(e.target.value)}
            className="flex-1 bg-white text-gray-900 text-sm rounded px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 min-h-[44px]"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded min-h-[44px]"
          >
            Vote
          </button>
          <button
            type="button"
            onClick={() => { setShowNameInput(false); setPendingVote(null); }}
            className="text-gray-400 hover:text-gray-600 text-sm px-3 min-h-[44px]"
          >
            ✕
          </button>
        </form>
      )}
      <div className="flex gap-3 items-start">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVote('up')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] min-w-[44px] ${
              myVote?.vote_type === 'up'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            } disabled:opacity-50`}
          >
            👍 {localUpCount}
          </button>
          <VoterBubbles votes={localVotes} type="up" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVote('down')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] min-w-[44px] ${
              myVote?.vote_type === 'down'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            } disabled:opacity-50`}
          >
            👎 {localDownCount}
          </button>
          <VoterBubbles votes={localVotes} type="down" />
        </div>
        {voterName && (
          <button
            onClick={() => { setVoterName(''); localStorage.removeItem('sofia-trip-voter-name'); }}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2 ml-auto min-h-[44px] flex items-center"
            title="Change voter name"
          >
            as {voterName} ✎
          </button>
        )}
      </div>
    </div>
  );
}

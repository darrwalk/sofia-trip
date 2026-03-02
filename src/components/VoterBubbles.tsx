'use client';

type Vote = {
  voter_name: string;
  vote_type: 'up' | 'down';
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name: string): string {
  const colors = [
    'bg-rose-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600',
    'bg-orange-600', 'bg-teal-600', 'bg-pink-600', 'bg-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export function VoterBubbles({ votes, type }: { votes: Vote[], type: 'up' | 'down' }) {
  const filtered = votes.filter(v => v.vote_type === type);
  if (!filtered.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {filtered.map(v => (
        <div
          key={v.voter_name}
          title={v.voter_name}
          className={`w-6 h-6 rounded-full ${getColor(v.voter_name)} flex items-center justify-center text-[9px] font-bold text-white`}
        >
          {getInitials(v.voter_name)}
        </div>
      ))}
    </div>
  );
}

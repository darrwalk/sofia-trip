'use client';

const SCORE_CATEGORIES = [
  { key: 'score_authenticity', label: '🏺 Authenticity', tooltip: 'How deeply rooted in real Bulgarian culinary tradition' },
  { key: 'score_experience', label: '🎭 Experience', tooltip: 'The show, theater, the story you\'ll tell people about' },
  { key: 'score_food_quality', label: '🍽️ Food', tooltip: 'Actual cooking excellence' },
  { key: 'score_exclusivity', label: '🤫 Exclusivity', tooltip: 'Hard to get into, intimate, not tourist-trap' },
  { key: 'score_value', label: '💰 Value', tooltip: 'Bang for the buck' },
] as const;

type ScoreBarProps = {
  [K in typeof SCORE_CATEGORIES[number]['key']]: number;
};

export function ScoreBar(props: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      {SCORE_CATEGORIES.map(({ key, label, tooltip }) => {
        const score = props[key];
        return (
          <div key={key} className="flex items-center gap-2" title={tooltip}>
            <span className="text-xs text-slate-400 w-28 shrink-0">{label}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`w-5 h-2.5 rounded-sm transition-all ${
                    i <= score
                      ? score >= 5
                        ? 'bg-amber-400'
                        : score >= 4
                        ? 'bg-amber-500'
                        : 'bg-amber-600/70'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{score}/5</span>
          </div>
        );
      })}
    </div>
  );
}

export type EventCategory = 'concert' | 'festival' | 'rooftop' | 'nightlife' | 'market' | 'experience' | 'landmark' | 'museum' | 'day_trip' | 'wild';

export const categoryLabels: Record<EventCategory, { emoji: string; label: string }> = {
  concert: { emoji: '🎵', label: 'Concerts' },
  festival: { emoji: '🎪', label: 'Festivals' },
  rooftop: { emoji: '🌇', label: 'Rooftop Bars' },
  nightlife: { emoji: '🌙', label: 'Nightlife' },
  market: { emoji: '🛒', label: 'Markets' },
  experience: { emoji: '🎯', label: 'Experiences' },
  landmark: { emoji: '🏛️', label: 'Landmarks' },
  museum: { emoji: '🖼️', label: 'Museums' },
  day_trip: { emoji: '🏔️', label: 'Day Trips' },
  wild: { emoji: '🔥', label: 'Wild Cards' },
};

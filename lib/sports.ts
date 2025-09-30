interface Sport {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const indianSports: Sport[] = [
  { id: 'athletics', name: 'Athletics', icon: '🏃‍♂️', color: 'from-red-500 to-orange-500', description: 'Track and Field Events' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', color: 'from-blue-500 to-indigo-500', description: 'The Gentleman\'s Game' },
  { id: 'hockey', name: 'Hockey', icon: '🏑', color: 'from-green-500 to-emerald-500', description: 'India\'s National Sport' },
  { id: 'football', name: 'Football', icon: '⚽', color: 'from-purple-500 to-pink-500', description: 'The Beautiful Game' },
  { id: 'kabaddi', name: 'Kabaddi', icon: '🤼', color: 'from-orange-500 to-red-500', description: 'Traditional Contact Sport' },
  { id: 'kho-kho', name: 'Kho-Kho', icon: '🏃‍♀️', color: 'from-yellow-500 to-orange-500', description: 'Ancient Chasing Game' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', color: 'from-teal-500 to-cyan-500', description: 'Racquet Sport' },
  { id: 'wrestling', name: 'Wrestling', icon: '🤼‍♂️', color: 'from-gray-600 to-gray-800', description: 'Combat Sport' },
  { id: 'boxing', name: 'Boxing', icon: '🥊', color: 'from-red-600 to-pink-600', description: 'Sweet Science' },
  { id: 'weightlifting', name: 'Weightlifting', icon: '🏋️‍♂️', color: 'from-indigo-600 to-purple-600', description: 'Strength Sport' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', color: 'from-green-400 to-blue-400', description: 'Racquet Sport' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', color: 'from-orange-400 to-yellow-400', description: 'Team Sport' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', color: 'from-orange-600 to-red-600', description: 'Hoops Game' },
  { id: 'handball', name: 'Handball', icon: '🤾‍♂️', color: 'from-blue-600 to-purple-600', description: 'Team Ball Sport' },
  { id: 'cycling', name: 'Cycling', icon: '🚴‍♂️', color: 'from-green-600 to-teal-600', description: 'Pedal Power' },
  { id: 'archery', name: 'Archery', icon: '🏹', color: 'from-yellow-600 to-red-600', description: 'Precision Sport' },
  { id: 'shooting', name: 'Shooting', icon: '🎯', color: 'from-gray-500 to-blue-500', description: 'Target Sport' },
  { id: 'rowing', name: 'Rowing', icon: '🚣‍♂️', color: 'from-cyan-500 to-blue-500', description: 'Water Sport' },
  { id: 'swimming', name: 'Swimming', icon: '🏊‍♂️', color: 'from-blue-400 to-cyan-400', description: 'Aquatic Sport' },
  { id: 'polo', name: 'Polo', icon: '🏇', color: 'from-purple-400 to-indigo-400', description: 'Equestrian Sport' }
];

export const sportNames: { [key: string]: string } = {
  athletics: 'Athletics',
  cricket: 'Cricket',
  hockey: 'Hockey',
  football: 'Football',
  kabaddi: 'Kabaddi',
  'kho-kho': 'Kho-Kho',
  badminton: 'Badminton',
  wrestling: 'Wrestling',
  boxing: 'Boxing',
  weightlifting: 'Weightlifting',
  tennis: 'Tennis',
  volleyball: 'Volleyball',
  basketball: 'Basketball',
  handball: 'Handball',
  cycling: 'Cycling',
  archery: 'Archery',
  shooting: 'Shooting',
  rowing: 'Rowing',
  swimming: 'Swimming',
  polo: 'Polo'
};
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Medal, Award, Crown, Target, TrendingUp } from 'lucide-react';
import { indianSports } from '@/lib/sports';

interface LeaderboardEntry {
  id: string;
  user_name: string;
  composite_score: number;
  physical_score: number;
  mental_score: number;
  certificate_score: number;
  category: string;
  rank: number;
  completed_at: string;
  is_current_user: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSport = searchParams.get('sport') || 'cricket';

  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || '';
    setCurrentUserEmail(email);
    loadLeaderboard(selectedSport);
  }, [selectedSport]);

  const loadLeaderboard = async (sportId: string) => {
    setLoading(true);

    // Generate mock leaderboard data based on selected sport
    const sportData = indianSports.find(s => s.id === sportId);
    const sportName = sportData?.name || 'Unknown Sport';

    // Check if current user has completed this sport
    const userResults = localStorage.getItem(`physicalResults_${sportId}`);
    const mentalResults = localStorage.getItem(`mentalResults_${sportId}`);
    const certResults = localStorage.getItem(`certificateResults_${sportId}`);

    let currentUserScore: {
      composite_score: number;
      physical_score: number;
      mental_score: number;
      certificate_score: number;
      category: string;
    } | null = null;

    if (userResults && mentalResults && certResults) {
      const physical = JSON.parse(userResults);
      const mental = JSON.parse(mentalResults);
      const cert = JSON.parse(certResults);

      const composite = Math.round(
        (0.45 * physical.physical_score) +
        (0.35 * mental.mental_score) +
        (0.20 * cert.certificate_score)
      );

      let category = 'Development';
      if (composite >= 90) category = 'Elite';
      else if (composite >= 75) category = 'Advanced';
      else if (composite >= 50) category = 'Emerging';

      currentUserScore = {
        composite_score: composite,
        physical_score: physical.physical_score,
        mental_score: mental.mental_score,
        certificate_score: cert.certificate_score,
        category: category
      };
    }

    // Generate mock leaderboard with realistic data
    const mockData: LeaderboardEntry[] = [];
    const names = [
      'Rahul Sharma', 'Priya Patel', 'Arjun Singh', 'Kavya Reddy', 'Rohan Kumar',
      'Ananya Iyer', 'Vikram Menon', 'Sneha Gupta', 'Aditya Joshi', 'Ishita Verma',
      'Karthik Naik', 'Meera Shah', 'Siddharth Rao', 'Pooja Desai', 'Varun Pillai'
    ];

    // Generate top performers
    for (let i = 0; i < 15; i++) {
      const baseScore = 95 - (i * 2) - Math.floor(Math.random() * 3);
      mockData.push({
        id: `user_${i}`,
        user_name: names[i],
        composite_score: Math.max(60, baseScore),
        physical_score: Math.max(60, baseScore - Math.floor(Math.random() * 10)),
        mental_score: Math.max(60, baseScore - Math.floor(Math.random() * 10)),
        certificate_score: Math.max(50, baseScore - Math.floor(Math.random() * 15)),
        category: baseScore >= 90 ? 'Elite' : baseScore >= 75 ? 'Advanced' : baseScore >= 60 ? 'Emerging' : 'Development',
        rank: i + 1,
        completed_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        is_current_user: false
      });
    }

    // Insert current user if they have completed the assessment
    if (currentUserScore) {
      const userEntry: LeaderboardEntry = {
        id: 'current_user',
        user_name: 'You',
        composite_score: currentUserScore.composite_score,
        physical_score: currentUserScore.physical_score,
        mental_score: currentUserScore.mental_score,
        certificate_score: currentUserScore.certificate_score,
        category: currentUserScore.category,
        rank: 0,
        completed_at: new Date().toISOString(),
        is_current_user: true
      };

      // Find correct position for user
      let insertPosition = mockData.findIndex(entry => entry.composite_score < currentUserScore!.composite_score);
      if (insertPosition === -1) insertPosition = mockData.length;

      mockData.splice(insertPosition, 0, userEntry);
    }

    // Update ranks
    mockData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboardData(mockData);
    setLoading(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Elite': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Advanced': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'Emerging': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const sportName = indianSports.find(s => s.id === selectedSport)?.name || 'Unknown Sport';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sport Selector */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sport Rankings</CardTitle>
                <CardDescription>View top performers across different sports</CardDescription>
              </div>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {indianSports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      <div className="flex items-center space-x-2">
                        <span>{sport.icon}</span>
                        <span>{sport.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Leaderboard Header */}
        <div className="mb-6 p-6 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{sportName} Leaderboard</h2>
            <p className="text-white/90">
              Rankings based on comprehensive talent assessment
            </p>
            <div className="mt-4 flex justify-center space-x-8 text-sm">
              <div>
                <div className="font-bold text-lg">{leaderboardData.length}</div>
                <div className="text-white/80">Total Athletes</div>
              </div>
              <div>
                <div className="font-bold text-lg">
                  {leaderboardData.filter(e => e.category === 'Elite').length}
                </div>
                <div className="text-white/80">Elite Athletes</div>
              </div>
              <div>
                <div className="font-bold text-lg">
                  {leaderboardData.find(e => e.is_current_user)?.rank || '-'}
                </div>
                <div className="text-white/80">Your Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading leaderboard...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Athlete
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Composite
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Physical
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mental
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Certificate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboardData.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`${
                          entry.is_current_user
                            ? 'bg-gradient-to-r from-orange-50 to-green-50 border-2 border-orange-200'
                            : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getRankIcon(entry.rank)}
                            <span className={`text-lg font-bold ${
                              entry.rank <= 3 ? 'text-orange-600' : 'text-gray-700'
                            }`}>
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className={`font-semibold ${
                                entry.is_current_user ? 'text-orange-600' : 'text-gray-900'
                              }`}>
                                {entry.user_name}
                              </div>
                              {entry.is_current_user && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge className={`${getCategoryColor(entry.category)} text-xs px-3 py-1`}>
                            {entry.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {entry.composite_score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-700">
                            {entry.physical_score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-700">
                            {entry.mental_score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-700">
                            {entry.certificate_score}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Physical Strength:</span>
                  <span className="font-semibold">45% weight</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mental Strength:</span>
                  <span className="font-semibold">35% weight</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificates:</span>
                  <span className="font-semibold">20% weight</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Elite
                  </Badge>
                  <span className="text-gray-600">90-100 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    Advanced
                  </Badge>
                  <span className="text-gray-600">75-89 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                    Emerging
                  </Badge>
                  <span className="text-gray-600">50-74 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    Development
                  </Badge>
                  <span className="text-gray-600">0-49 points</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

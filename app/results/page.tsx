'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Share, Download, Target, TrendingUp, Award, Brain, Zap, Crown } from 'lucide-react';
import { sportNames } from '@/lib/sports';

interface Results {
  physical_score: number;
  mental_score: number;
  certificate_score: number;
  composite: number;
  category: string;
  rank: number;
}

interface LeaderboardEntry {
  user: string;
  composite: number;
  rank: number;
  category: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sport = searchParams.get('sport') || '';
  
  const [results, setResults] = useState<Results | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load test results
    const physicalResults = JSON.parse(localStorage.getItem(`physicalResults_${sport}`) || '{"physical_score": 0}');
    const mentalResults = JSON.parse(localStorage.getItem(`mentalResults_${sport}`) || '{"mental_score": 0}');
    const certificateResults = JSON.parse(localStorage.getItem(`certificateResults_${sport}`) || '{"certificate_score": 0}');
    
    // Calculate composite score
    const composite = Math.round(
      (0.45 * physicalResults.physical_score) + 
      (0.35 * mentalResults.mental_score) + 
      (0.20 * certificateResults.certificate_score)
    );
    
    // Determine category
    let category = 'Development';
    if (composite >= 90) category = 'Elite';
    else if (composite >= 75) category = 'Advanced';
    else if (composite >= 50) category = 'Emerging';
    
    const finalResults: Results = {
      physical_score: physicalResults.physical_score || 0,
      mental_score: mentalResults.mental_score || 0,
      certificate_score: certificateResults.certificate_score || 0,
      composite: composite,
      category: category,
      rank: Math.floor(Math.random() * 50) + 1 // Mock rank
    };
    
    setResults(finalResults);
    
    // Generate mock leaderboard
    const mockLeaderboard: LeaderboardEntry[] = [
      { user: 'Rahul Sharma', composite: 94, rank: 1, category: 'Elite' },
      { user: 'Priya Patel', composite: 91, rank: 2, category: 'Elite' },
      { user: 'Arjun Singh', composite: 88, rank: 3, category: 'Advanced' },
      { user: 'Kavya Reddy', composite: 85, rank: 4, category: 'Advanced' },
      { user: 'You', composite: finalResults.composite, rank: finalResults.rank, category: finalResults.category }
    ].sort((a, b) => b.composite - a.composite).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    setLeaderboard(mockLeaderboard);
  }, [router, sport]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Elite': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Advanced': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'Emerging': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Elite': return Crown;
      case 'Advanced': return Trophy;
      case 'Emerging': return Target;
      default: return TrendingUp;
    }
  };

  if (!results) {
    return <div>Loading...</div>;
  }

  const sportName = sportNames[sport] || 'Unknown Sport';
  const CategoryIcon = getCategoryIcon(results.category);

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
              <h1 className="text-2xl font-bold text-gray-900">{sportName} Results</h1>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push(`/leaderboard?sport=${sport}`)}
                className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 p-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl text-white">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CategoryIcon className="h-16 w-16" />
            </div>
            <h2 className="text-4xl font-bold mb-2">{results.composite}</h2>
            <p className="text-xl mb-4">Overall Talent Score</p>
            <Badge className={`text-lg px-6 py-2 ${getCategoryColor(results.category)}`}>
              {results.category} Athlete
            </Badge>
            <p className="mt-4 text-white/90">
              You rank #{results.rank} in {sportName} across all participants
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Physical Score */}
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Zap className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{results.physical_score}</CardTitle>
                  <CardDescription>Physical Strength</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Assessment Weight: 45%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${results.physical_score}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Speed • Stamina • Agility • Posture • Strength
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mental Score */}
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{results.mental_score}</CardTitle>
                  <CardDescription>Mental Strength</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Assessment Weight: 35%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${results.mental_score}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Reaction Time • Psychology Knowledge
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Score */}
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{results.certificate_score}</CardTitle>
                  <CardDescription>Achievement Score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Assessment Weight: 20%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${results.certificate_score}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Certificate Level • Verification Status
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Description */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {results.category} Athlete Category
                  </h3>
                  <div className="max-w-2xl mx-auto">
                    {results.category === 'Elite' && (
                      <p className="text-gray-600">
                        Exceptional talent with outstanding performance across all assessment areas. 
                        You demonstrate elite-level capabilities and are ready for high-level competition.
                      </p>
                    )}
                    {results.category === 'Advanced' && (
                      <p className="text-gray-600">
                        Strong athletic abilities with solid performance in most areas. 
                        You have advanced skills and significant competitive potential.
                      </p>
                    )}
                    {results.category === 'Emerging' && (
                      <p className="text-gray-600">
                        Good foundation with emerging talent showing clear potential. 
                        With focused training, you can develop into a competitive athlete.
                      </p>
                    )}
                    {results.category === 'Development' && (
                      <p className="text-gray-600">
                        Building fundamental skills with areas for improvement identified. 
                        Consistent training will help develop your athletic capabilities.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Score Breakdown Tab */}
          <TabsContent value="breakdown">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Score Analysis</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of your assessment performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Composite Score Calculation */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Composite Score Calculation</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span>Physical Score × 45%</span>
                      <span className="font-semibold">{results.physical_score} × 0.45 = {(results.physical_score * 0.45).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span>Mental Score × 35%</span>
                      <span className="font-semibold">{results.mental_score} × 0.35 = {(results.mental_score * 0.35).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span>Certificate Score × 20%</span>
                      <span className="font-semibold">{results.certificate_score} × 0.20 = {(results.certificate_score * 0.20).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg border-2 border-orange-200">
                      <span className="font-semibold text-lg">Total Composite Score</span>
                      <span className="font-bold text-2xl text-orange-600">{results.composite}</span>
                    </div>
                  </div>
                </div>

                {/* Category Thresholds */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Talent Categories</h4>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg flex justify-between items-center ${results.category === 'Elite' ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Elite</span>
                      </div>
                      <span className="text-sm text-gray-600">90-100 points</span>
                    </div>
                    <div className={`p-3 rounded-lg flex justify-between items-center ${results.category === 'Advanced' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Advanced</span>
                      </div>
                      <span className="text-sm text-gray-600">75-89 points</span>
                    </div>
                    <div className={`p-3 rounded-lg flex justify-between items-center ${results.category === 'Emerging' ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Emerging</span>
                      </div>
                      <span className="text-sm text-gray-600">50-74 points</span>
                    </div>
                    <div className={`p-3 rounded-lg flex justify-between items-center ${results.category === 'Development' ? 'bg-gray-100 border-2 border-gray-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Development</span>
                      </div>
                      <span className="text-sm text-gray-600">0-49 points</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Sport Leaderboard - {sportName}</CardTitle>
                <CardDescription>
                  Your ranking among all participants in this sport
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.user === 'You' 
                          ? 'bg-gradient-to-r from-orange-50 to-green-50 border-2 border-orange-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          entry.rank === 2 ? 'bg-gray-300 text-gray-800' :
                          entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{entry.user}</div>
                          <div className="text-sm text-gray-600">
                            <Badge className={`text-xs ${getCategoryColor(entry.category)}`}>
                              {entry.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{entry.composite}</div>
                        <div className="text-sm text-gray-600">Composite Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>
                    Personalized analysis and recommendations based on your assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Strengths */}
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-3">Your Strengths</h4>
                    <div className="space-y-2">
                      {results.physical_score >= Math.max(results.mental_score, results.certificate_score) && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-green-800">
                            <strong>Physical Performance:</strong> Your physical assessment shows excellent results, indicating strong athletic capabilities.
                          </p>
                        </div>
                      )}
                      {results.mental_score >= Math.max(results.physical_score, results.certificate_score) && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-purple-800">
                            <strong>Mental Toughness:</strong> Your mental strength assessment demonstrates excellent psychological preparation and focus.
                          </p>
                        </div>
                      )}
                      {results.certificate_score >= Math.max(results.physical_score, results.mental_score) && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-800">
                            <strong>Competitive Experience:</strong> Your achievements and certifications show strong competitive background.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <h4 className="text-lg font-semibold text-orange-700 mb-3">Growth Opportunities</h4>
                    <div className="space-y-2">
                      {results.physical_score <= Math.min(results.mental_score, results.certificate_score) && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-800">
                            <strong>Physical Training:</strong> Focus on improving strength, speed, and agility through targeted training programs.
                          </p>
                        </div>
                      )}
                      {results.mental_score <= Math.min(results.physical_score, results.certificate_score) && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-yellow-800">
                            <strong>Mental Preparation:</strong> Consider working on sports psychology techniques and reaction time training.
                          </p>
                        </div>
                      )}
                      {results.certificate_score <= Math.min(results.physical_score, results.mental_score) && (
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <p className="text-indigo-800">
                            <strong>Competitive Experience:</strong> Participate in more competitions to gain experience and earn certifications.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Training Recommendations */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Recommended Training Focus</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-semibold mb-2">Physical Development</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Sport-specific skill drills</li>
                          <li>• Strength and conditioning</li>
                          <li>• Endurance training</li>
                          <li>• Flexibility and mobility work</li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-semibold mb-2">Mental Training</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Visualization techniques</li>
                          <li>• Concentration exercises</li>
                          <li>• Pressure handling drills</li>
                          <li>• Goal setting strategies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600"
            size="lg"
          >
            Try Another Sport
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/sport/${sport}`)}
            size="lg"
          >
            Retake Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
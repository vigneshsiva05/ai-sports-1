'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Video, Play, CircleCheck as CheckCircle, Zap, Target, Activity, Eye, Gauge, TrendingUp } from 'lucide-react';
import { sportNames } from '@/lib/sports';

interface SportExercise {
  sport: string;
  exercises: string[];
  pushUps: number;
  description: string;
}

interface PhysicalResults {
  exercise_detected: string;
  pushup_count: number;
  pushup_validation: boolean;
  speed_score: number;
  strength_score: number;
  agility_score: number;
  balance_score: number;
  posture_score: number;
  coordination_score: number;
  physical_score: number;
  performance_level: string;
  improvement_drills: string[];
}

const sportExercises: { [key: string]: SportExercise } = {
  athletics: {
    sport: 'Athletics',
    exercises: ['Sprint 20m', 'Standing long jump', 'High knees (20s)'],
    pushUps: 20,
    description: 'Track and field performance analysis'
  },
  cricket: {
    sport: 'Cricket',
    exercises: ['Batting drive', 'Bowling action', 'Fielding throw'],
    pushUps: 15,
    description: 'Cricket technique and fitness assessment'
  },
  hockey: {
    sport: 'Hockey',
    exercises: ['Stick dribble', 'Push pass', 'Sprint with stick'],
    pushUps: 18,
    description: 'Hockey skills and endurance evaluation'
  },
  football: {
    sport: 'Football',
    exercises: ['Cone dribble', 'Juggling', 'Passing kick'],
    pushUps: 20,
    description: 'Football technique and agility assessment'
  },
  kabaddi: {
    sport: 'Kabaddi',
    exercises: ['Raid step', 'Side squat walk', 'Quick direction change'],
    pushUps: 25,
    description: 'Traditional combat sport analysis'
  },
  'kho-kho': {
    sport: 'Kho-Kho',
    exercises: ['Sprint + squat', 'Rapid turns', 'Touch & run'],
    pushUps: 18,
    description: 'Ancient chasing game performance'
  },
  badminton: {
    sport: 'Badminton',
    exercises: ['Shadow footwork', 'Smash jump', 'Serve motion'],
    pushUps: 15,
    description: 'Racquet sport technique analysis'
  },
  wrestling: {
    sport: 'Wrestling',
    exercises: ['Push-pull stance', 'Squat + sprawl', 'Arm lock'],
    pushUps: 30,
    description: 'Combat sport strength assessment'
  },
  boxing: {
    sport: 'Boxing',
    exercises: ['Jab-cross', 'Hook punch', 'Duck + punch'],
    pushUps: 25,
    description: 'Boxing technique and power analysis'
  },
  weightlifting: {
    sport: 'Weightlifting',
    exercises: ['Squat', 'Deadlift', 'Overhead press'],
    pushUps: 30,
    description: 'Strength sport performance evaluation'
  },
  tennis: {
    sport: 'Tennis',
    exercises: ['Serve', 'Forehand swing', 'Backhand swing'],
    pushUps: 15,
    description: 'Tennis technique and coordination'
  },
  volleyball: {
    sport: 'Volleyball',
    exercises: ['Vertical jump', 'Underhand pass', 'Spike jump'],
    pushUps: 18,
    description: 'Volleyball skills and jumping ability'
  },
  basketball: {
    sport: 'Basketball',
    exercises: ['Dribble', 'Layup', 'Jump shot'],
    pushUps: 20,
    description: 'Basketball technique and athleticism'
  },
  handball: {
    sport: 'Handball',
    exercises: ['Jump throw', 'Dribble + pass', 'Sprint'],
    pushUps: 18,
    description: 'Handball skills and explosive power'
  },
  cycling: {
    sport: 'Cycling',
    exercises: ['Stationary pedal', 'Sprint start', 'Balance stand'],
    pushUps: 10,
    description: 'Cycling technique and endurance'
  },
  archery: {
    sport: 'Archery',
    exercises: ['Draw-hold-release', 'Anchor point hold', 'Release motion'],
    pushUps: 12,
    description: 'Precision sport stability analysis'
  },
  shooting: {
    sport: 'Shooting',
    exercises: ['Aim-hold-trigger', 'Arm hold', 'Trigger squeeze'],
    pushUps: 10,
    description: 'Target sport precision assessment'
  },
  rowing: {
    sport: 'Rowing',
    exercises: ['Seated row', 'Leg drive', 'Arm pull'],
    pushUps: 20,
    description: 'Rowing technique and power analysis'
  },
  swimming: {
    sport: 'Swimming',
    exercises: ['Flutter kick', 'Arm stroke shadow', 'Streamline jump'],
    pushUps: 15,
    description: 'Swimming technique and coordination'
  },
  polo: {
    sport: 'Polo',
    exercises: ['Mallet swing', 'Horse-riding squat', 'Side hit'],
    pushUps: 12,
    description: 'Equestrian sport technique analysis'
  }
};

export default function PhysicalTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sport = searchParams.get('sport') || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<PhysicalResults | null>(null);

  const sportData = sportExercises[sport];
  const sportName = sportNames[sport] || 'Unknown Sport';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    }
  };

  const simulateAnalysis = async () => {
    if (!selectedFile || !sportData) return;
    
    setAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI analysis progress
    const progressSteps = [
      { progress: 15, message: 'Loading video and initializing AI models...' },
      { progress: 30, message: 'Detecting sport and exercise type...' },
      { progress: 45, message: 'Analyzing body movements and counting reps...' },
      { progress: 60, message: 'Evaluating speed, strength, and agility...' },
      { progress: 75, message: 'Assessing posture, balance, and coordination...' },
      { progress: 90, message: 'Comparing with sport-specific benchmarks...' },
      { progress: 100, message: 'Generating performance report...' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(step.progress);
    }

    // Generate realistic analysis results
    const detectedExercise = sportData.exercises[Math.floor(Math.random() * sportData.exercises.length)];
    const expectedPushUps = sportData.pushUps;
    const actualPushUps = Math.floor(expectedPushUps * (0.7 + Math.random() * 0.5)); // 70-120% of expected
    const pushupValidation = actualPushUps >= Math.floor(expectedPushUps * 0.8); // Within 80% is valid

    // Generate performance scores based on sport requirements
    const baseScore = 60 + Math.random() * 30; // 60-90 base
    const sportMultiplier = getSportMultiplier(sport);
    
    const speedScore = Math.min(100, Math.floor(baseScore + (Math.random() * 20 - 10) * sportMultiplier.speed));
    const strengthScore = Math.min(100, Math.floor(baseScore + (Math.random() * 20 - 10) * sportMultiplier.strength));
    const agilityScore = Math.min(100, Math.floor(baseScore + (Math.random() * 20 - 10) * sportMultiplier.agility));
    const balanceScore = Math.min(100, Math.floor(baseScore + (Math.random() * 20 - 10) * sportMultiplier.balance));
    const postureScore = Math.min(100, Math.floor(baseScore + (Math.random() * 20 - 10) * sportMultiplier.posture));
    const coordinationScore = Math.min(100, Math.floor(baseScore + (Math.random() * 20 - 10) * sportMultiplier.coordination));

    const physicalScore = Math.floor((speedScore + strengthScore + agilityScore + balanceScore + postureScore + coordinationScore) / 6);
    
    const performanceLevel = getPerformanceLevel(physicalScore);
    const improvementDrills = getImprovementDrills(sport, physicalScore);

    const analysisResults: PhysicalResults = {
      exercise_detected: detectedExercise,
      pushup_count: actualPushUps,
      pushup_validation: pushupValidation,
      speed_score: speedScore,
      strength_score: strengthScore,
      agility_score: agilityScore,
      balance_score: balanceScore,
      posture_score: postureScore,
      coordination_score: coordinationScore,
      physical_score: physicalScore,
      performance_level: performanceLevel,
      improvement_drills: improvementDrills
    };

    setResults(analysisResults);
    setAnalyzing(false);

    // Save results and update test status
    localStorage.setItem(`physicalResults_${sport}`, JSON.stringify(analysisResults));
    const currentStatus = JSON.parse(localStorage.getItem(`testStatus_${sport}`) || '{"physical": false, "mental": false, "certificate": false}');
    currentStatus.physical = true;
    localStorage.setItem(`testStatus_${sport}`, JSON.stringify(currentStatus));
  };

  const getSportMultiplier = (sport: string) => {
    const multipliers: { [key: string]: any } = {
      athletics: { speed: 1.3, strength: 1.1, agility: 1.2, balance: 1.0, posture: 1.1, coordination: 1.0 },
      cricket: { speed: 1.0, strength: 1.0, agility: 1.1, balance: 1.0, posture: 1.0, coordination: 1.2 },
      hockey: { speed: 1.2, strength: 1.1, agility: 1.3, balance: 1.1, posture: 1.0, coordination: 1.2 },
      football: { speed: 1.2, strength: 1.0, agility: 1.3, balance: 1.1, posture: 1.0, coordination: 1.2 },
      kabaddi: { speed: 1.1, strength: 1.3, agility: 1.2, balance: 1.1, posture: 1.2, coordination: 1.1 },
      'kho-kho': { speed: 1.3, strength: 1.0, agility: 1.3, balance: 1.1, posture: 1.0, coordination: 1.1 },
      badminton: { speed: 1.1, strength: 0.9, agility: 1.2, balance: 1.0, posture: 1.0, coordination: 1.3 },
      wrestling: { speed: 1.0, strength: 1.4, agility: 1.1, balance: 1.2, posture: 1.3, coordination: 1.1 },
      boxing: { speed: 1.2, strength: 1.3, agility: 1.2, balance: 1.1, posture: 1.2, coordination: 1.2 },
      weightlifting: { speed: 0.9, strength: 1.5, agility: 0.8, balance: 1.1, posture: 1.4, coordination: 1.0 },
      tennis: { speed: 1.1, strength: 1.0, agility: 1.2, balance: 1.0, posture: 1.0, coordination: 1.3 },
      volleyball: { speed: 1.1, strength: 1.1, agility: 1.2, balance: 1.0, posture: 1.1, coordination: 1.2 },
      basketball: { speed: 1.2, strength: 1.1, agility: 1.2, balance: 1.0, posture: 1.0, coordination: 1.2 },
      handball: { speed: 1.1, strength: 1.2, agility: 1.2, balance: 1.0, posture: 1.1, coordination: 1.1 },
      cycling: { speed: 1.1, strength: 1.2, agility: 0.9, balance: 1.2, posture: 1.1, coordination: 1.0 },
      archery: { speed: 0.8, strength: 1.0, agility: 0.8, balance: 1.3, posture: 1.3, coordination: 1.2 },
      shooting: { speed: 0.8, strength: 0.9, agility: 0.8, balance: 1.3, posture: 1.3, coordination: 1.2 },
      rowing: { speed: 1.0, strength: 1.3, agility: 0.9, balance: 1.1, posture: 1.2, coordination: 1.1 },
      swimming: { speed: 1.1, strength: 1.2, agility: 1.0, balance: 1.0, posture: 1.2, coordination: 1.3 },
      polo: { speed: 1.0, strength: 1.1, agility: 1.1, balance: 1.2, posture: 1.1, coordination: 1.2 }
    };
    return multipliers[sport] || { speed: 1.0, strength: 1.0, agility: 1.0, balance: 1.0, posture: 1.0, coordination: 1.0 };
  };

  const getPerformanceLevel = (score: number): string => {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 60) return 'Developing';
    return 'Beginner';
  };

  const getImprovementDrills = (sport: string, score: number): string[] => {
    const drillSets: { [key: string]: string[] } = {
      athletics: [
        'Sprint intervals (30s on, 30s off)',
        'Plyometric box jumps',
        'High knees running drills',
        'Acceleration ladder training',
        'Core stability exercises'
      ],
      cricket: [
        'Batting stance practice',
        'Bowling action repetition',
        'Fielding reaction drills',
        'Hand-eye coordination exercises',
        'Rotational power training'
      ],
      hockey: [
        'Stick handling drills',
        'Quick feet ladder work',
        'Push pass accuracy training',
        'Sprint with direction changes',
        'Core strengthening'
      ],
      football: [
        'Cone weaving drills',
        'Ball juggling practice',
        'Passing accuracy training',
        'Agility ladder exercises',
        'Balance board training'
      ],
      kabaddi: [
        'Raid movement patterns',
        'Squat jump training',
        'Direction change drills',
        'Grip strength exercises',
        'Flexibility training'
      ],
      'kho-kho': [
        'Sprint-squat combinations',
        'Rapid turn practice',
        'Touch and go drills',
        'Reaction time training',
        'Endurance running'
      ],
      badminton: [
        'Shadow footwork practice',
        'Jump smash training',
        'Serve technique drills',
        'Court movement patterns',
        'Wrist strengthening'
      ],
      wrestling: [
        'Stance and movement drills',
        'Squat-sprawl combinations',
        'Grip strength training',
        'Core stability work',
        'Flexibility exercises'
      ],
      boxing: [
        'Combination punch practice',
        'Footwork drills',
        'Duck and weave training',
        'Heavy bag workouts',
        'Speed bag training'
      ],
      weightlifting: [
        'Form technique practice',
        'Progressive overload training',
        'Mobility work',
        'Core strengthening',
        'Breathing technique drills'
      ]
    };

    const baseDrills = drillSets[sport] || [
      'Sport-specific movement patterns',
      'Strength and conditioning',
      'Flexibility and mobility work',
      'Coordination exercises',
      'Endurance training'
    ];

    // Return 3-4 drills based on performance level
    const numDrills = score < 70 ? 4 : 3;
    return baseDrills.slice(0, numDrills);
  };

  const handleContinue = () => {
    router.push(`/sport/${sport}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 55) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!sportData) {
    return <div>Sport not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/sport/${sport}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">AI Sports Performance Analyzer</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!results ? (
          <div className="space-y-8">
            {/* Sport Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <span>{sportData.sport} Performance Analysis</span>
                </CardTitle>
                <CardDescription>
                  {sportData.description} • Required Push-ups: {sportData.pushUps}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Sport-Specific Exercises</h4>
                    <div className="space-y-2">
                      {sportData.exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Target className="h-5 w-5 text-orange-600" />
                          <span className="font-medium text-orange-900">{exercise}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">AI Analysis Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">Speed Analysis</div>
                          <div className="text-sm text-gray-600">Movement velocity and reaction time</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Strength Assessment</div>
                          <div className="text-sm text-gray-600">Power output and muscular endurance</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Agility & Coordination</div>
                          <div className="text-sm text-gray-600">Balance, posture, and movement quality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Performance Video</CardTitle>
                <CardDescription>
                  Record yourself performing one of the {sportData.sport.toLowerCase()} exercises listed above
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analyzing ? (
                  <div className="space-y-6">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Your Performance Video
                      </h3>
                      <p className="text-gray-600">
                        Click to browse or drag and drop your video file here
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports MP4, MOV, AVI up to 100MB
                      </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFile && (
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Video className="h-6 w-6 text-orange-600" />
                          <div>
                            <div className="font-medium text-orange-900">{selectedFile.name}</div>
                            <div className="text-sm text-orange-700">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Video Requirements</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Duration: 30-90 seconds for optimal analysis</p>
                        <p>• Show full body in frame throughout the exercise</p>
                        <p>• Good lighting and stable camera position</p>
                        <p>• Perform {sportData.pushUps} push-ups after the main exercise</p>
                        <p>• Clear view of movement patterns and form</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={simulateAnalysis}
                      disabled={!selectedFile}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      size="lg"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Start AI Performance Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2.51 * analysisProgress} 251`}
                          className="text-orange-500 transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{analysisProgress}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
                    <p className="text-gray-600 mb-6">
                      Our advanced AI is analyzing your {sportData.sport.toLowerCase()} performance...
                    </p>
                    
                    <div className="text-sm text-gray-500 space-y-2">
                      <p>🎯 Detecting exercise type and counting repetitions</p>
                      <p>📊 Analyzing speed, strength, and agility metrics</p>
                      <p>⚖️ Evaluating balance, posture, and coordination</p>
                      <p>🏆 Comparing with sport-specific benchmarks</p>
                      <p>📋 Generating improvement recommendations</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span>AI Performance Analysis Complete</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of your {sportData.sport.toLowerCase()} performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Overall Score */}
                <div className="text-center mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2.51 * results.physical_score} 251`}
                        className={getScoreBgColor(results.physical_score).replace('bg-', 'text-')}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{results.physical_score}</div>
                        <div className="text-sm text-gray-600">Overall</div>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-lg px-4 py-2 ${getScoreBgColor(results.physical_score)} text-white`}>
                    {results.performance_level} Athlete
                  </Badge>
                </div>

                {/* Exercise Detection */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Exercise Analysis</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-blue-700">Detected Exercise</div>
                      <div className="font-semibold text-blue-900">{results.exercise_detected}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700">Push-up Count</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-900">{results.pushup_count}/{sportData.pushUps}</span>
                        {results.pushup_validation ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Badge variant="outline" className="text-xs">Below Target</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2.2 * results.speed_score} 220`} className="text-red-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-900">{results.speed_score}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Speed</h4>
                    <p className="text-sm text-gray-600">Movement velocity</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2.2 * results.strength_score} 220`} className="text-blue-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-900">{results.strength_score}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Strength</h4>
                    <p className="text-sm text-gray-600">Power output</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2.2 * results.agility_score} 220`} className="text-green-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-900">{results.agility_score}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Agility</h4>
                    <p className="text-sm text-gray-600">Quick movements</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2.2 * results.balance_score} 220`} className="text-purple-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-900">{results.balance_score}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Balance</h4>
                    <p className="text-sm text-gray-600">Stability control</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2.2 * results.posture_score} 220`} className="text-yellow-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-900">{results.posture_score}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Posture</h4>
                    <p className="text-sm text-gray-600">Body alignment</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2.2 * results.coordination_score} 220`} className="text-indigo-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-900">{results.coordination_score}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Coordination</h4>
                    <p className="text-sm text-gray-600">Movement sync</p>
                  </div>
                </div>

                {/* Improvement Recommendations */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">Recommended Training Drills</h4>
                  <div className="space-y-2">
                    {results.improvement_drills.map((drill, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">{drill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    size="lg"
                  >
                    Continue to Next Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
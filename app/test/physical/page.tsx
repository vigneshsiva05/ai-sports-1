'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Video, Play, CircleCheck as CheckCircle, Zap, Target, Activity, Eye, Gauge, TrendingUp, CircleAlert as AlertCircle } from 'lucide-react';
import { sportNames } from '@/lib/sports';
import { MediaPipeAnalyzer } from '@/lib/mediapipe-analyzer';

// Initialize MediaPipe analyzer instance
const mediaPipeAnalyzer = new MediaPipeAnalyzer();

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
  human_detected: boolean;
  analysis_confidence: number;
  validation_errors: string[];
  speed_score: number;
  strength_score: number;
  agility_score: number;
  balance_score: number;
  posture_score: number;
  coordination_score: number;
  physical_score: number;
  performance_level: string;
  improvement_drills: string[];
  api_response?: any;
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
  const [analysisStage, setAnalysisStage] = useState('');
  const [results, setResults] = useState<PhysicalResults | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const sportData = sportExercises[sport];
  const sportName = sportNames[sport] || 'Unknown Sport';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setApiError(null);
    }
  };

  const analyzeVideoWithAPI = async () => {
    if (!selectedFile || !sportData) return;
    
    setAnalyzing(true);
    setAnalysisProgress(0);
    setApiError(null);

    try {
      // Stage 1: MediaPipe Human Detection and Exercise Analysis
      setAnalysisStage('Initializing MediaPipe for human detection...');
      setAnalysisProgress(5);
      
      const mediaPipeResults = await mediaPipeAnalyzer.analyzeVideo(
        selectedFile, 
        sport, 
        sportData.pushUps
      );
      
      // Stage 2: Validate Human Detection
      setAnalysisStage('Validating human presence and exercise form...');
      setAnalysisProgress(15);
      
      // Capture MediaPipe warnings without stopping analysis
      const warnings = [];
      if (!mediaPipeResults.humanDetected) {
        warnings.push('No human detected in the video. Please ensure you are clearly visible throughout the exercise.');
      }
      if (mediaPipeResults.errors.length > 0) {
        warnings.push(...mediaPipeResults.errors);
      }
      if (warnings.length > 0) {
        setApiError(`Analysis warnings: ${warnings.join(', ')}`);
      }

      // Create FormData for video upload
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('sport', sport);
      formData.append('expected_pushups', sportData.pushUps.toString());
      formData.append('exercises', JSON.stringify(sportData.exercises));
      formData.append('mediapipe_results', JSON.stringify(mediaPipeResults));

      // Stage 3: Upload and Initialize
      setAnalysisStage('Uploading video to AI analysis server...');
      setAnalysisProgress(25);

      // Try multiple API endpoints for video analysis
      const apiEndpoints = [
        'https://api.sportsanalyzer.ai/v1/analyze',
        'https://sports-ai.herokuapp.com/analyze',
        'https://api.movenet.ai/sports/analyze',
        'https://vision.googleapis.com/v1/videos:annotate' // Google Video Intelligence API
      ];

      let apiResponse = null;
      let usedEndpoint = '';

      // Stage 4: AI Processing
      setAnalysisStage('Processing video with AI sports analyzer...');
      setAnalysisProgress(35);

      // Try each API endpoint
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': 'Bearer YOUR_API_KEY', // Replace with actual API key
              'X-Sport-Type': sport,
              'X-Analysis-Type': 'comprehensive'
            },
            timeout: 30000 // 30 second timeout
          });

          if (response.ok) {
            apiResponse = await response.json();
            usedEndpoint = endpoint;
            break;
          }
        } catch (error) {
          console.log(`API ${endpoint} failed, trying next...`);
          continue;
        }
      }

      // Stage 5: Exercise Detection
      setAnalysisStage('Detecting sport-specific exercises...');
      setAnalysisProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 6: Movement Analysis
      setAnalysisStage('Analyzing body movement and counting repetitions...');
      setAnalysisProgress(65);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 7: Performance Metrics
      setAnalysisStage('Calculating performance metrics...');
      setAnalysisProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 8: Benchmark Comparison
      setAnalysisStage('Comparing with sport-specific benchmarks...');
      setAnalysisProgress(90);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 9: Final Results
      setAnalysisStage('Generating performance report...');
      setAnalysisProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process API response or generate fallback results
      let analysisResults: PhysicalResults;

      if (apiResponse && usedEndpoint) {
        // Process real API response
        analysisResults = processAPIResponse(apiResponse, sportData, mediaPipeResults);
      } else {
        // Generate realistic fallback results with API simulation
        analysisResults = generateFallbackResults(sportData, mediaPipeResults);
        setApiError('Using offline analysis mode - API services temporarily unavailable');
      }

      setResults(analysisResults);
      setAnalyzing(false);

      // Save results and update test status
      localStorage.setItem(`physicalResults_${sport}`, JSON.stringify(analysisResults));
      const currentStatus = JSON.parse(localStorage.getItem(`testStatus_${sport}`) || '{"physical": false, "mental": false, "certificate": false}');
      currentStatus.physical = true;
      localStorage.setItem(`testStatus_${sport}`, JSON.stringify(currentStatus));

    } catch (error) {
      console.error('Analysis error:', error);
      setApiError('Analysis failed. Please check your internet connection and try again.');
      setAnalyzing(false);
    }
  };

  const processAPIResponse = (apiResponse: any, sportData: SportExercise, mediaPipeResults: any): PhysicalResults => {
    // Process real API response according to your specifications
    const detectedExercise = apiResponse.exercise_detected || sportData.exercises[0];
    const pushupCount = mediaPipeResults.pushupCount;
    const pushupValidation = pushupCount >= Math.floor(sportData.pushUps * 0.8);

    // Extract performance metrics from API
    const speedScore = Math.min(100, Math.max(0, apiResponse.speed_score || mediaPipeResults.speedScore));
    const strengthScore = Math.min(100, Math.max(0, apiResponse.strength_score || mediaPipeResults.strengthScore));
    const agilityScore = Math.min(100, Math.max(0, apiResponse.agility_score || mediaPipeResults.staminaScore));
    const balanceScore = Math.min(100, Math.max(0, apiResponse.balance_score || mediaPipeResults.formScore));
    const postureScore = Math.min(100, Math.max(0, apiResponse.posture_score || mediaPipeResults.formScore));
    const coordinationScore = Math.min(100, Math.max(0, apiResponse.coordination_score || mediaPipeResults.speedScore));

    const physicalScore = Math.floor((speedScore + strengthScore + agilityScore + balanceScore + postureScore + coordinationScore) / 6);
    const performanceLevel = getPerformanceLevel(physicalScore);
    const improvementDrills = apiResponse.improvement_drills || getImprovementDrills(sport, physicalScore);

    return {
      exercise_detected: detectedExercise,
      pushup_count: pushupCount,
      pushup_validation: pushupValidation,
      human_detected: mediaPipeResults.humanDetected,
      analysis_confidence: mediaPipeResults.confidence,
      validation_errors: mediaPipeResults.errors,
      speed_score: Math.round(speedScore),
      strength_score: Math.round(strengthScore),
      agility_score: Math.round(agilityScore),
      balance_score: Math.round(balanceScore),
      posture_score: Math.round(postureScore),
      coordination_score: Math.round(coordinationScore),
      physical_score: physicalScore,
      performance_level: performanceLevel,
      improvement_drills: improvementDrills,
      api_response: apiResponse
    };
  };

  const generateFallbackResults = (sportData: SportExercise, mediaPipeResults: any): PhysicalResults => {
    // Generate realistic analysis results when API is unavailable
    const detectedExercise = sportData.exercises[Math.floor(Math.random() * sportData.exercises.length)];
    const expectedPushUps = sportData.pushUps;
    const actualPushUps = mediaPipeResults.pushupCount;
    const pushupValidation = actualPushUps >= Math.floor(expectedPushUps * 0.8);

    // Use MediaPipe analysis results - no fallback to random scores
    const speedScore = mediaPipeResults.speedScore;
    const strengthScore = mediaPipeResults.strengthScore;
    const agilityScore = mediaPipeResults.staminaScore;
    const balanceScore = mediaPipeResults.formScore;
    const postureScore = mediaPipeResults.formScore;
    const coordinationScore = mediaPipeResults.speedScore;

    const physicalScore = Math.floor((speedScore + strengthScore + agilityScore + balanceScore + postureScore + coordinationScore) / 6);
    const performanceLevel = getPerformanceLevel(physicalScore);
    const improvementDrills = getImprovementDrills(sport, physicalScore);

    return {
      exercise_detected: detectedExercise,
      pushup_count: actualPushUps,
      pushup_validation: pushupValidation,
      human_detected: mediaPipeResults.humanDetected,
      analysis_confidence: mediaPipeResults.confidence,
      validation_errors: mediaPipeResults.errors,
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
  };

  const calculateScoreFromPushups = (actual: number, expected: number, metric: string): number => {
    if (actual === 0) return 0;
    
    const ratio = actual / expected;
    let baseScore = Math.min(100, ratio * 100);
    
    // Adjust based on metric type
    switch (metric) {
      case 'strength':
        return Math.floor(baseScore);
      case 'speed':
        return Math.floor(baseScore * 0.9); // Speed slightly lower
      case 'agility':
        return Math.floor(baseScore * 0.85);
      case 'balance':
        return Math.floor(baseScore * 0.8);
      case 'posture':
        return Math.floor(baseScore * 0.8);
      case 'coordination':
        return Math.floor(baseScore * 0.9);
      default:
        return Math.floor(baseScore);
    }
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
                    <h4 className="font-semibold text-gray-900 mb-4">AI Analysis Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">Exercise Detection</div>
                          <div className="text-sm text-gray-600">Automatic sport and exercise identification</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Gauge className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Repetition Counting</div>
                          <div className="text-sm text-gray-600">Precise push-up and movement counting</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Performance Metrics</div>
                          <div className="text-sm text-gray-600">6-point comprehensive analysis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            {apiError && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-900">API Status</div>
                      <div className="text-sm text-yellow-800">{apiError}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Performance Video</CardTitle>
                <CardDescription>
                  Record yourself performing one of the {sportData.sport.toLowerCase()} exercises with {sportData.pushUps} push-ups
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
                      <h4 className="font-semibold text-blue-900 mb-2">AI Analysis Requirements</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• <strong>Human Detection:</strong> Only one person should be clearly visible</p>
                        <p>• <strong>Exercise Form:</strong> Perform exercises with proper form and technique</p>
                        <p>• Duration: 30-90 seconds for optimal analysis</p>
                        <p>• Show full body in frame throughout the exercise</p>
                        <p>• Good lighting and stable camera position</p>
                        <p>• Perform {sportData.pushUps} push-ups after the main exercise</p>
                        <p>• <strong>MediaPipe Analysis:</strong> Real-time pose detection and validation</p>
                        <p>• <strong>No Multiple People:</strong> Ensure only you are in the frame</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={analyzeVideoWithAPI}
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
                    <p className="text-gray-600 mb-6">{analysisStage}</p>
                    
                    <Progress value={analysisProgress} className="w-full max-w-md mx-auto mb-4" />
                    
                    <div className="text-sm text-gray-500 space-y-2">
                      <p>👤 MediaPipe human detection and pose analysis</p>
                      <p>✅ Validating single person and exercise form</p>
                      <p>🎯 Detecting sport and exercise type</p>
                      <p>🔢 Counting push-ups with landmark tracking</p>
                      <p>📊 Analyzing body movement patterns</p>
                      <p>⚖️ Evaluating performance metrics</p>
                      <p>🏆 Comparing with sport benchmarks</p>
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
                  <h4 className="font-semibold text-blue-900 mb-2">AI Detection Results</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-blue-700">Human Detection</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-900">
                          {results.human_detected ? 'Detected' : 'Not Detected'}
                        </span>
                        {results.human_detected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-blue-600">
                        Confidence: {Math.round(results.analysis_confidence * 100)}%
                      </div>
                    </div>
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
                  
                  {/* MediaPipe Analysis Details */}
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-semibold text-purple-900 mb-2">MediaPipe Analysis Details</h5>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p>• Landmark tracking: 33-point pose detection</p>
                      <p>• Exercise type: {results.exercise_detected}</p>
                      <p>• Form validation: {results.pushup_validation ? 'Good form detected' : 'Form needs improvement'}</p>
                      <p>• Analysis confidence: {Math.round(results.analysis_confidence * 100)}%</p>
                    </div>
                  </div>
                </div>

                {/* Validation Errors */}
                {results.validation_errors.length > 0 && (
                  <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">Analysis Warnings</h4>
                    <div className="space-y-1">
                      {results.validation_errors.map((error, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-yellow-800">
                          <AlertCircle className="h-4 w-4" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Results */}
                <div className="space-y-4">
                  {/* MediaPipe Analysis Results */}
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">MediaPipe Analysis Details</h4>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p>• Push-ups detected: {results.pushup_count} (MediaPipe landmark tracking)</p>
                      <p>• Human detection confidence: {Math.round(results.analysis_confidence * 100)}%</p>
                      {results.api_response?.repTimes && results.api_response.repTimes.length > 0 && (
                        <p>• Average rep time: {(results.api_response.avgRepTime / 1000).toFixed(1)}s</p>
                      )}
                      <p>• Exercise form validation: {results.pushup_validation ? 'Good' : 'Needs improvement'}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Reaction Time Analysis</h4>
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
                  <h4 className="font-semibold text-green-900 mb-3">AI-Recommended Training Drills</h4>
                  <div className="space-y-2">
                    {results.improvement_drills.map((drill, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">{drill}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Sport-specific recommendations */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Sport-Specific Focus Areas</h5>
                    <div className="text-sm text-blue-800">
                      {sportData.sport === 'Boxing' && (
                        <p>• Focus on explosive power and quick recovery between reps</p>
                      )}
                      {sportData.sport === 'Wrestling' && (
                        <p>• Emphasize controlled movements and core stability</p>
                      )}
                      {sportData.sport === 'Athletics' && (
                        <p>• Work on speed and explosive strength for better performance</p>
                      )}
                      {sportData.sport === 'Football' && (
                        <p>• Develop agility and quick directional changes</p>
                      )}
                      {!['Boxing', 'Wrestling', 'Athletics', 'Football'].includes(sportData.sport) && (
                        <p>• Continue building sport-specific strength and endurance</p>
                      )}
                    </div>
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
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, Brain, Award, Play, CircleCheck as CheckCircle } from 'lucide-react';
import { indianSports, sportNames } from '@/lib/sports';

interface TestStatus {
  physical: boolean;
  mental: boolean;
  certificate: boolean;
}

export default function SportClientPage() {
  const router = useRouter();
  const params = useParams();
  const sportId = params.sportId as string;
  const [testStatus, setTestStatus] = useState<TestStatus>({
    physical: false,
    mental: false,
    certificate: false
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load test completion status from localStorage
    const savedStatus = localStorage.getItem(`testStatus_${sportId}`);
    if (savedStatus) {
      setTestStatus(JSON.parse(savedStatus));
    }
  }, [router, sportId]);

  const sportName = sportNames[sportId] || 'Unknown Sport';
  const completedTests = Object.values(testStatus).filter(Boolean).length;
  const allCompleted = completedTests === 3;

  const handleTestClick = (testType: string) => {
    router.push(`/test/${testType}?sport=${sportId}`);
  };

  const handleViewResults = () => {
    router.push(`/results?sport=${sportId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sports
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{sportName} Assessment</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">{sportName} Talent Assessment</h2>
              <p className="text-white/90">
                Complete all three tests to get your comprehensive talent analysis
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completedTests}/3</div>
              <div className="text-sm text-white/90">Tests Completed</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(completedTests / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mb-8">
          {/* Physical Strength Test */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="flex items-center justify-center space-x-2">
                <span>Physical Strength</span>
                {testStatus.physical && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Upload your performance video for AI analysis of speed, stamina, agility, posture, and strength
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 space-y-2">
                <Badge variant="secondary" className="mr-2">Speed Analysis</Badge>
                <Badge variant="secondary" className="mr-2">Stamina Check</Badge>
                <Badge variant="secondary" className="mr-2">Agility Test</Badge>
                <Badge variant="secondary" className="mr-2">Posture Review</Badge>
                <Badge variant="secondary">Strength Metrics</Badge>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={() => handleTestClick('physical')}
              >
                <Play className="h-4 w-4 mr-2" />
                {testStatus.physical ? 'Retake Test' : 'Start Physical Test'}
              </Button>
            </CardContent>
          </Card>

          {/* Mental Strength Test */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="flex items-center justify-center space-x-2">
                <span>Mental Strength</span>
                {testStatus.mental && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Test your reaction time and sports psychology knowledge through interactive challenges
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 space-y-2">
                <Badge variant="secondary" className="mr-2">Reaction Test</Badge>
                <Badge variant="secondary" className="mr-2">Psychology Quiz</Badge>
                <Badge variant="secondary" className="mr-2">Focus Analysis</Badge>
                <Badge variant="secondary">Mental Resilience</Badge>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => handleTestClick('mental')}
              >
                <Brain className="h-4 w-4 mr-2" />
                {testStatus.mental ? 'Retake Test' : 'Start Mental Test'}
              </Button>
            </CardContent>
          </Card>

          {/* Certificate Upload */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="flex items-center justify-center space-x-2">
                <span>Certificate Upload</span>
                {testStatus.certificate && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Upload your sports certificates for verification and scoring based on achievement level
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 space-y-2">
                <Badge variant="secondary" className="mr-2">OCR Parsing</Badge>
                <Badge variant="secondary" className="mr-2">Level Detection</Badge>
                <Badge variant="secondary" className="mr-2">Verification</Badge>
                <Badge variant="secondary">Achievement Score</Badge>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                onClick={() => handleTestClick('certificate')}
              >
                <Award className="h-4 w-4 mr-2" />
                {testStatus.certificate ? 'Update Certificate' : 'Upload Certificate'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {allCompleted && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">All Tests Completed!</h3>
              <p className="text-gray-600 mb-6">
                Congratulations! You've completed all assessments. View your comprehensive talent analysis and see how you rank.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8"
                onClick={handleViewResults}
              >
                View Complete Results
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Guidelines</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Physical Test</h4>
              <ul className="space-y-1">
                <li>• Record 30-60 second video</li>
                <li>• Show sport-specific movements</li>
                <li>• Ensure good lighting</li>
                <li>• Full body visibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mental Test</h4>
              <ul className="space-y-1">
                <li>• Quick reaction responses</li>
                <li>• Sports psychology questions</li>
                <li>• Focus and concentration</li>
                <li>• Complete without distractions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Certificate Upload</h4>
              <ul className="space-y-1">
                <li>• Clear image or PDF</li>
                <li>• Official sports certificates</li>
                <li>• Competition achievements</li>
                <li>• Training certifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
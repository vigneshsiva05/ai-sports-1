'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, Timer, CheckCircle, X } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface MentalResults {
  reaction_score: number;
  quiz_score: number;
  mental_score: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the most important mental skill for competitive sports?",
    options: ["Concentration", "Aggression", "Speed", "Flexibility"],
    correct: 0
  },
  {
    id: 2,
    question: "Which technique helps athletes manage pre-competition anxiety?",
    options: ["Ignoring the feeling", "Deep breathing exercises", "Eating more", "Sleeping less"],
    correct: 1
  },
  {
    id: 3,
    question: "What does 'flow state' mean in sports psychology?",
    options: ["Being tired", "Peak performance zone", "Drinking water", "Team coordination"],
    correct: 1
  },
  {
    id: 4,
    question: "How should athletes handle mistakes during competition?",
    options: ["Dwell on them", "Get angry", "Learn and move on", "Blame teammates"],
    correct: 2
  },
  {
    id: 5,
    question: "What is visualization in sports training?",
    options: ["Watching videos", "Mental rehearsal of performance", "Physical exercise", "Team meetings"],
    correct: 1
  },
  {
    id: 6,
    question: "Which factor most affects sports performance under pressure?",
    options: ["Equipment quality", "Mental preparation", "Weather conditions", "Audience size"],
    correct: 1
  },
  {
    id: 7,
    question: "What is the best way to maintain motivation during training?",
    options: ["Set realistic goals", "Train alone", "Avoid challenges", "Focus only on winning"],
    correct: 0
  },
  {
    id: 8,
    question: "How should athletes respond to constructive criticism?",
    options: ["Ignore it", "Get defensive", "Use it to improve", "Quit training"],
    correct: 2
  }
];

export default function MentalTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sport = searchParams.get('sport') || '';
  
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'reaction' | 'quiz' | 'results'>('intro');
  const [reactionRound, setReactionRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [showReactionButton, setShowReactionButton] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<MentalResults | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startReactionTest = () => {
    setCurrentPhase('reaction');
    setReactionRound(1);
    startReactionRound();
  };

  const startReactionRound = () => {
    setShowReactionButton(false);
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    timeoutRef.current = setTimeout(() => {
      setShowReactionButton(true);
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionStartTime) {
      const reactionTime = Date.now() - reactionStartTime;
      const newReactionTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newReactionTimes);
      setShowReactionButton(false);
      setReactionStartTime(null);

      if (reactionRound < 3) {
        setReactionRound(reactionRound + 1);
        setTimeout(startReactionRound, 1000);
      } else {
        setCurrentPhase('quiz');
      }
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(newAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (answers: number[]) => {
    // Calculate reaction score (lower time = higher score)
    const avgReactionTime = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
    const reactionScore = Math.max(0, Math.min(100, 100 - (avgReactionTime - 200) / 10));

    // Calculate quiz score
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer === quizQuestions[index].correct ? count + 1 : count;
    }, 0);
    const quizScore = (correctAnswers / quizQuestions.length) * 100;

    // Calculate final mental score
    const mentalScore = Math.round(0.4 * reactionScore + 0.6 * quizScore);

    const finalResults: MentalResults = {
      reaction_score: Math.round(reactionScore),
      quiz_score: Math.round(quizScore),
      mental_score: mentalScore
    };

    setResults(finalResults);
    setCurrentPhase('results');

    // Save results and update test status
    localStorage.setItem(`mentalResults_${sport}`, JSON.stringify(finalResults));
    const currentStatus = JSON.parse(localStorage.getItem(`testStatus_${sport}`) || '{"physical": false, "mental": false, "certificate": false}');
    currentStatus.mental = true;
    localStorage.setItem(`testStatus_${sport}`, JSON.stringify(currentStatus));
  };

  const handleContinue = () => {
    router.push(`/sport/${sport}`);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
            <h1 className="text-2xl font-bold text-gray-900">Mental Strength Assessment</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPhase === 'intro' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-purple-500" />
                  <span>Mental Strength Assessment</span>
                </CardTitle>
                <CardDescription>
                  Test your reaction time and sports psychology knowledge through two interactive challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Components</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <Timer className="h-5 w-5 text-purple-600" />
                          <h5 className="font-semibold text-purple-800">Reaction Time Test</h5>
                        </div>
                        <p className="text-sm text-purple-700">
                          Test your reflexes with 3 rounds of reaction challenges. Quick responses demonstrate mental alertness.
                        </p>
                        <div className="mt-2 text-xs text-purple-600">
                          Weight: 40% of mental score
                        </div>
                      </div>
                      
                      <div className="p-4 bg-pink-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <Brain className="h-5 w-5 text-pink-600" />
                          <h5 className="font-semibold text-pink-800">Psychology Quiz</h5>
                        </div>
                        <p className="text-sm text-pink-700">
                          Answer questions about sports psychology, mental preparation, and performance optimization.
                        </p>
                        <div className="mt-2 text-xs text-pink-600">
                          Weight: 60% of mental score
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <strong>Reaction Test:</strong> Click the button as quickly as possible when it appears
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <strong>Quiz:</strong> Choose the best answer for each sports psychology question
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <strong>Environment:</strong> Find a quiet space without distractions
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <strong>Focus:</strong> Stay alert and concentrate throughout both tests
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button
                    onClick={startReactionTest}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Start Mental Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPhase === 'reaction' && (
          <Card>
            <CardHeader>
              <CardTitle>Reaction Time Test - Round {reactionRound}/3</CardTitle>
              <CardDescription>
                Wait for the button to appear, then click it as quickly as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                {!showReactionButton ? (
                  <div>
                    <div className="animate-pulse text-gray-400 mb-4">
                      <Timer className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Get Ready...</h3>
                    <p className="text-gray-600">The button will appear at any moment</p>
                  </div>
                ) : (
                  <div>
                    <Button
                      onClick={handleReactionClick}
                      className="h-32 w-32 rounded-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-xl font-bold animate-pulse"
                    >
                      CLICK!
                    </Button>
                  </div>
                )}
              </div>
              
              {reactionTimes.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-3">Reaction Times</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((round) => (
                      <div
                        key={round}
                        className={`p-3 rounded-lg text-center ${
                          reactionTimes[round - 1] 
                            ? 'bg-green-50 border border-green-200' 
                            : round <= reactionRound 
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm text-gray-600">Round {round}</div>
                        <div className="font-bold">
                          {reactionTimes[round - 1] 
                            ? `${reactionTimes[round - 1]}ms`
                            : round <= reactionRound
                            ? 'In Progress'
                            : 'Pending'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentPhase === 'quiz' && (
          <Card>
            <CardHeader>
              <CardTitle>Sports Psychology Quiz</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} className="h-2" />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {quizQuestions[currentQuestionIndex].question}
                </h3>
                
                <div className="grid gap-3">
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleQuizAnswer(index)}
                      className="h-auto p-4 text-left justify-start hover:bg-purple-50 hover:border-purple-300"
                    >
                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentPhase === 'results' && results && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span>Mental Assessment Complete</span>
                </CardTitle>
                <CardDescription>
                  Your mental strength has been evaluated through reaction time and psychology knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Overall Mental Score */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2.2 * results.mental_score} 220`}
                          className="text-purple-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{results.mental_score}</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900">Mental Score</h3>
                    <p className="text-sm text-gray-600">Overall Assessment</p>
                  </div>
                  
                  {/* Reaction Score */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2.2 * results.reaction_score} 220`}
                          className="text-green-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{results.reaction_score}</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900">Reaction Time</h3>
                    <p className="text-sm text-gray-600">Reflexes & Alertness</p>
                  </div>
                  
                  {/* Quiz Score */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2.2 * results.quiz_score} 220`}
                          className="text-blue-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{results.quiz_score}</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900">Psychology Knowledge</h3>
                    <p className="text-sm text-gray-600">Mental Preparation</p>
                  </div>
                </div>
                
                {/* Detailed Results */}
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Reaction Time Analysis</h4>
                    <div className="text-sm text-green-800">
                      <p>Average reaction time: {Math.round(reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length)}ms</p>
                      <p>Individual times: {reactionTimes.map(time => `${time}ms`).join(', ')}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Quiz Performance</h4>
                    <div className="text-sm text-blue-800">
                      <p>Correct answers: {Math.round(results.quiz_score / 100 * quizQuestions.length)}/{quizQuestions.length}</p>
                      <p>Knowledge area: Sports Psychology & Mental Training</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Mental Strength Insights</h4>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p>• Your mental readiness shows {results.mental_score >= 80 ? 'excellent' : results.mental_score >= 65 ? 'strong' : 'developing'} potential</p>
                      <p>• {results.reaction_score > results.quiz_score ? 'Your reflexes are particularly sharp' : 'Your psychology knowledge is well-developed'}</p>
                      <p>• Mental score combines 40% reaction time + 60% psychology knowledge</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
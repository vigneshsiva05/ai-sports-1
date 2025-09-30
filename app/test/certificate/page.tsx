'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, FileText, CheckCircle, Award, Loader2 } from 'lucide-react';

interface CertificateResults {
  level: string;
  verified: boolean;
  certificate_score: number;
}

export default function CertificateTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sport = searchParams.get('sport') || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<CertificateResults | null>(null);

  const certificateLevels = [
    { level: 'National', score: 100, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    { level: 'State', score: 70, color: 'bg-gradient-to-r from-blue-400 to-purple-500' },
    { level: 'Division', score: 50, color: 'bg-gradient-to-r from-green-400 to-blue-500' },
    { level: 'District', score: 30, color: 'bg-gradient-to-r from-gray-400 to-gray-600' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateAnalysis = async () => {
    if (selectedFiles.length === 0) return;
    
    setAnalyzing(true);
    
    // Simulate OCR and verification process
    setTimeout(() => {
      const levels = ['National', 'State', 'Division', 'District'];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const levelScore = certificateLevels.find(l => l.level === randomLevel)?.score || 30;
      
      // Add bonus for multiple certificates
      const bonus = selectedFiles.length > 1 ? Math.floor(levelScore * 0.1) : 0;
      const finalScore = Math.min(100, levelScore + bonus);
      
      const mockResults: CertificateResults = {
        level: randomLevel,
        verified: Math.random() > 0.2, // 80% verification success rate
        certificate_score: finalScore
      };
      
      setResults(mockResults);
      setAnalyzing(false);
      
      // Save results and update test status
      localStorage.setItem(`certificateResults_${sport}`, JSON.stringify(mockResults));
      const currentStatus = JSON.parse(localStorage.getItem(`testStatus_${sport}`) || '{"physical": false, "mental": false, "certificate": false}');
      currentStatus.certificate = true;
      localStorage.setItem(`testStatus_${sport}`, JSON.stringify(currentStatus));
      
    }, 2500);
  };

  const handleContinue = () => {
    router.push(`/sport/${sport}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
            <h1 className="text-2xl font-bold text-gray-900">Certificate Upload & Verification</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!results ? (
          <div className="space-y-8">
            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-blue-500" />
                  <span>Certificate Verification System</span>
                </CardTitle>
                <CardDescription>
                  Upload your sports certificates for OCR analysis and official verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Scoring System</h4>
                    <div className="space-y-3">
                      {certificateLevels.map((level) => (
                        <div key={level.level} className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{level.level} Level</span>
                              <span className="font-bold">{level.score} points</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-800">
                        <strong>Bonus:</strong> +10% for multiple certificates
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Accepted Certificates</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Competition participation certificates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Achievement and ranking certificates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Training completion certificates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Sports federation endorsements</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Coaching qualifications</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">File Requirements</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Format: JPG, PNG, PDF</p>
                        <p>• Size: Max 10MB per file</p>
                        <p>• Quality: Clear, readable text</p>
                        <p>• Multiple certificates allowed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Certificate Upload</CardTitle>
                <CardDescription>
                  Upload your certificate images or PDF files for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analyzing ? (
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Certificate Files
                      </h3>
                      <p className="text-gray-600">
                        Click to browse or drag and drop your certificate files here
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports JPG, PNG, PDF up to 10MB each
                      </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Uploaded Files */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-blue-900">{file.name}</div>
                                <div className="text-sm text-blue-700">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Additional Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="certNumber">Certificate Number (Optional)</Label>
                        <Input
                          id="certNumber"
                          placeholder="e.g., AIFF/2023/12345"
                          value={certificateNumber}
                          onChange={(e) => setCertificateNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="issuingBody">Issuing Body (Optional)</Label>
                        <Input
                          id="issuingBody"
                          placeholder="e.g., All India Football Federation"
                          value={issuingBody}
                          onChange={(e) => setIssuingBody(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={simulateAnalysis}
                      disabled={selectedFiles.length === 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                      size="lg"
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Analyze & Verify Certificates
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Certificates</h3>
                    <p className="text-gray-600 mb-6">
                      Our system is analyzing your certificates using OCR technology and verifying authenticity...
                    </p>
                    
                    <div className="text-sm text-gray-500 space-y-2">
                      <p>🔍 Extracting text and metadata...</p>
                      <p>📋 Identifying certificate levels...</p>
                      <p>✅ Verifying with official databases...</p>
                      <p>🏆 Calculating achievement scores...</p>
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
                  <span>Certificate Analysis Complete</span>
                </CardTitle>
                <CardDescription>
                  Your certificates have been processed and verified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Overall Score */}
                  <div className="text-center">
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
                          strokeDasharray={`${2.51 * results.certificate_score} 251`}
                          className="text-blue-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">{results.certificate_score}</div>
                          <div className="text-sm text-gray-600">Score</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Certificate Score</h3>
                    <p className="text-gray-600">Achievement Recognition</p>
                  </div>
                  
                  {/* Analysis Details */}
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Certificate Level Detected</h4>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${certificateLevels.find(l => l.level === results.level)?.color} text-white`}>
                          {results.level}
                        </Badge>
                        <span className="text-blue-800">
                          {certificateLevels.find(l => l.level === results.level)?.score} base points
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${results.verified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <h4 className={`font-semibold mb-2 ${results.verified ? 'text-green-900' : 'text-yellow-900'}`}>
                        Verification Status
                      </h4>
                      <div className="flex items-center space-x-2">
                        {results.verified ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800">Verified - Certificate is authentic</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-5 w-5 text-yellow-600" />
                            <span className="text-yellow-800">Pending - Manual verification required</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Analysis Summary</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>• Files processed: {selectedFiles.length}</p>
                        <p>• Highest level detected: {results.level}</p>
                        {selectedFiles.length > 1 && (
                          <p>• Multiple certificate bonus: +{Math.floor(certificateLevels.find(l => l.level === results.level)?.score || 0 * 0.1)} points</p>
                        )}
                        <p>• Final certificate score: {results.certificate_score}/100</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Achievement Insights</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Your {results.level.toLowerCase()}-level achievements demonstrate {results.level === 'National' ? 'exceptional' : results.level === 'State' ? 'strong' : 'developing'} competitive experience</p>
                    <p>• Certificate verification adds credibility to your athletic profile</p>
                    <p>• This score contributes 20% to your overall talent assessment</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                    size="lg"
                  >
                    Complete Assessment
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
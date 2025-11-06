interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface ExerciseAnalysis {
  humanDetected: boolean;
  exerciseDetected: boolean;
  pushupCount: number;
  exerciseType: string;
  confidence: number;
  landmarks: PoseLandmark[];
  errors: string[];
  repTimes: number[];
  avgRepTime: number;
  speedScore: number;
  strengthScore: number;
  staminaScore: number;
  formScore: number;
}

export class MediaPipeAnalyzer {
  private pose: any;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video!: HTMLVideoElement;
  private pushupCount: number = 0;
  private isInDownPosition: boolean = false;
  private lastUpTime: number = 0;
  private repTimes: number[] = [];
  private exerciseFrames: PoseLandmark[][] = [];
  private analysisResults: ExerciseAnalysis;
  private frameCount: number = 0;
  private humanDetectedFrames: number = 0;
  private validPushupFrames: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.analysisResults = {
      humanDetected: false,
      exerciseDetected: false,
      pushupCount: 0,
      exerciseType: 'unknown',
      confidence: 0,
      landmarks: [],
      errors: [],
      repTimes: [],
      avgRepTime: 0,
      speedScore: 0,
      strengthScore: 0,
      staminaScore: 0,
      formScore: 0
    };
  }

  async initializeMediaPipe(): Promise<void> {
    try {
      // Initialize MediaPipe Pose
      const { Pose } = await import('@mediapipe/pose');
      
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 2, // Higher complexity for better accuracy
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.7, // Higher confidence threshold
        minTrackingConfidence: 0.7
      });

      this.pose.onResults(this.onPoseResults.bind(this));
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      this.analysisResults.errors.push('MediaPipe initialization failed');
    }
  }

  async analyzeVideo(videoFile: File, sport: string, expectedPushups: number): Promise<ExerciseAnalysis> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.initializeMediaPipe();
        
        // Create video element
        this.video = document.createElement('video');
        this.video.src = URL.createObjectURL(videoFile);
        this.video.muted = true;
        
        // Reset analysis state
        this.pushupCount = 0;
        this.isInDownPosition = false;
        this.lastUpTime = 0;
        this.repTimes = [];
        this.exerciseFrames = [];
        this.frameCount = 0;
        this.humanDetectedFrames = 0;
        this.validPushupFrames = 0;
        
        this.analysisResults = {
          humanDetected: false,
          exerciseDetected: false,
          pushupCount: 0,
          exerciseType: 'unknown',
          confidence: 0,
          landmarks: [],
          errors: [],
          repTimes: [],
          avgRepTime: 0,
          speedScore: 0,
          strengthScore: 0,
          staminaScore: 0,
          formScore: 0
        };

        this.video.onloadedmetadata = () => {
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
          this.processVideoFrames(sport, expectedPushups, resolve);
        };

        this.video.onerror = () => {
          reject(new Error('Failed to load video'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private async processVideoFrames(sport: string, expectedPushups: number, resolve: Function): Promise<void> {
    const frameRate = 30; // Process 30 frames per second for highly accurate analysis
    const interval = 1000 / frameRate;

    const processFrame = async () => {
      if (this.video.currentTime >= this.video.duration) {
        // Analysis complete
        this.finalizeAnalysis(sport, expectedPushups);
        resolve(this.analysisResults);
        return;
      }

      try {
        // Draw current frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Send frame to MediaPipe with proper error handling
        await this.pose.send({ image: this.canvas });

        this.frameCount++;
        this.video.currentTime += interval / 1000;

        // Process next frame immediately
        setTimeout(processFrame, 16); // ~60fps processing for smooth analysis
      } catch (error) {
        console.error('Frame processing error:', error);
        this.video.currentTime += interval / 1000;
        setTimeout(processFrame, 16);
      }
    };

    this.video.currentTime = 0;
    processFrame();
  }

  private onPoseResults(results: any): void {
    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      const landmarks = results.poseLandmarks;
      
      // Check if landmarks are valid and visible
      const visibleLandmarks = landmarks.filter((landmark: PoseLandmark) => 
        landmark.visibility > 0.5
      );
      
      if (visibleLandmarks.length >= 20) { // Need at least 20 visible landmarks for human detection
        this.humanDetectedFrames++;
        this.analysisResults.humanDetected = true;
        this.analysisResults.landmarks = landmarks;
        this.exerciseFrames.push(landmarks);

        // Analyze for push-ups with improved accuracy
        this.analyzePushupImproved(landmarks);
        
        // Analyze exercise type
        this.analyzeExerciseType(landmarks);
      }
    }
  }

  private analyzePushupImproved(landmarks: PoseLandmark[]): void {
    try {
      // Key landmarks for push-up analysis
      const leftShoulder = landmarks[11];   // LEFT_SHOULDER
      const rightShoulder = landmarks[12];  // RIGHT_SHOULDER
      const leftElbow = landmarks[13];      // LEFT_ELBOW
      const rightElbow = landmarks[14];     // RIGHT_ELBOW
      const leftWrist = landmarks[15];      // LEFT_WRIST
      const rightWrist = landmarks[16];     // RIGHT_WRIST
      const leftHip = landmarks[23];        // LEFT_HIP
      const rightHip = landmarks[24];       // RIGHT_HIP
      const leftKnee = landmarks[25];       // LEFT_KNEE
      const rightKnee = landmarks[26];      // RIGHT_KNEE
      const nose = landmarks[0];            // NOSE

      // Check visibility of key landmarks
      const keyLandmarks = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
      const visibleKeyLandmarks = keyLandmarks.filter(landmark => landmark.visibility > 0.7);

      if (visibleKeyLandmarks.length < 5) return; // Need at least 5 key landmarks visible

      // Check if person is in plank/push-up position
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipY = (leftHip.y + rightHip.y) / 2;
      const kneeY = (leftKnee.y + rightKnee.y) / 2;
      const noseY = nose.y;

      // More accurate horizontal position check - body should be aligned
      const bodyAlignment = Math.abs(shoulderY - hipY);
      const hipsToKnees = Math.abs(hipY - kneeY);
      const headAlignment = Math.abs(shoulderY - noseY);

      // Stricter alignment for proper push-up form
      const isHorizontal = bodyAlignment < 0.12 && hipsToKnees < 0.15 && headAlignment < 0.15;

      if (!isHorizontal) return; // Not in proper push-up position

      this.validPushupFrames++;

      // Calculate elbow angles with improved accuracy
      const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // Calculate wrist-to-elbow distance to track arm extension
      const leftArmExtension = this.calculateDistance(leftElbow, leftWrist);
      const rightArmExtension = this.calculateDistance(rightElbow, rightWrist);
      const avgArmExtension = (leftArmExtension + rightArmExtension) / 2;

      // Calculate shoulder-to-elbow distance
      const leftShoulderElbow = this.calculateDistance(leftShoulder, leftElbow);
      const rightShoulderElbow = this.calculateDistance(rightShoulder, rightElbow);
      const avgShoulderElbow = (leftShoulderElbow + rightShoulderElbow) / 2;

      // More accurate push-up detection with multiple parameters
      // Down position: elbows bent significantly with arms pulled in
      const isDown = avgElbowAngle < 100 && avgElbowAngle > 40;

      // Up position: arms fully extended with high angle
      const isUp = avgElbowAngle > 160 && avgArmExtension > 0.15;

      // State machine for push-up counting with debouncing
      const currentTime = this.video.currentTime * 1000; // Convert to milliseconds
      const timeSinceLastTransition = currentTime - this.lastUpTime;

      // Strict transition logic to prevent false counts
      if (isDown && !this.isInDownPosition && timeSinceLastTransition > 400) {
        this.isInDownPosition = true;
      } else if (isUp && this.isInDownPosition && timeSinceLastTransition > 500) {
        // Complete push-up detected
        this.pushupCount++;
        this.isInDownPosition = false;

        // Calculate rep time
        if (this.lastUpTime > 0) {
          const repTime = currentTime - this.lastUpTime;
          if (repTime > 600 && repTime < 15000) { // Valid rep time between 0.6-15 seconds
            this.repTimes.push(repTime);
          }
        }
        this.lastUpTime = currentTime;
      }

    } catch (error) {
      console.error('Push-up analysis error:', error);
    }
  }

  private analyzeExerciseType(landmarks: PoseLandmark[]): void {
    try {
      // Analyze movement patterns to detect exercise type
      const head = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];

      // Calculate body posture and movement
      const bodyHeight = Math.abs(head.y - ((leftKnee.y + rightKnee.y) / 2));
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      const hipWidth = Math.abs(leftHip.x - rightHip.x);

      // Improved exercise classification
      if (bodyHeight < 0.4 && shoulderWidth > 0.1) {
        this.analysisResults.exerciseType = 'push-up';
      } else if (bodyHeight > 0.7) {
        this.analysisResults.exerciseType = 'standing';
      } else if (bodyHeight > 0.4 && bodyHeight < 0.7) {
        this.analysisResults.exerciseType = 'squat';
      }

      this.analysisResults.exerciseDetected = true;
    } catch (error) {
      console.error('Exercise type analysis error:', error);
    }
  }

  private calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  private calculateDistance(a: PoseLandmark, b: PoseLandmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private finalizeAnalysis(sport: string, expectedPushups: number): void {
    // Calculate human detection confidence
    const humanDetectionRate = this.humanDetectedFrames / this.frameCount;
    this.analysisResults.humanDetected = humanDetectionRate > 0.6; // Strict threshold

    // Validate push-up count
    this.analysisResults.pushupCount = this.pushupCount;

    // Calculate average rep time
    if (this.repTimes.length > 0) {
      this.analysisResults.avgRepTime = this.repTimes.reduce((sum, time) => sum + time, 0) / this.repTimes.length;
      this.analysisResults.repTimes = this.repTimes;
    }

    // Calculate performance scores based on actual data
    this.calculatePerformanceScores(expectedPushups);

    // Set confidence based on detection quality with stricter criteria
    const validFrameRatio = this.validPushupFrames / this.humanDetectedFrames;
    this.analysisResults.confidence = Math.min(0.95, Math.max(0.3, humanDetectionRate * validFrameRatio * 0.9));

    // Add validation errors
    if (!this.analysisResults.humanDetected) {
      this.analysisResults.errors.push('Human detection confidence too low - ensure you are clearly visible');
    }

    if (this.pushupCount === 0 && expectedPushups > 0) {
      this.analysisResults.errors.push('No push-ups detected - ensure proper form and camera angle');
    }

    if (this.pushupCount < expectedPushups * 0.6) {
      this.analysisResults.errors.push(`Low push-up count: ${this.pushupCount}/${expectedPushups} expected. Ensure full range of motion.`);
    }

    if (this.validPushupFrames < 100) {
      this.analysisResults.errors.push('Insufficient exercise frames for accurate analysis - ensure camera captures full movement');
    }

    if (this.humanDetectedFrames < this.frameCount * 0.7) {
      this.analysisResults.errors.push('Human not consistently visible throughout video - improve lighting and camera angle');
    }

    // Add sport-specific validation
    this.addSportSpecificValidation(sport, expectedPushups);
  }

  private addSportSpecificValidation(sport: string, expectedPushups: number): void {
    const sportMultipliers = this.getSportMultipliers(sport);
    
    // Adjust expectations based on sport difficulty
    const adjustedExpected = Math.floor(expectedPushups * sportMultipliers.difficulty);
    
    if (this.pushupCount < adjustedExpected * 0.7) {
      this.analysisResults.errors.push(`Below ${sport} performance standards: ${this.pushupCount}/${adjustedExpected} expected`);
    }
    
    // Add sport-specific form checks
    if (sport === 'wrestling' || sport === 'boxing') {
      if (this.analysisResults.formScore < 70) {
        this.analysisResults.errors.push('Combat sports require higher form standards - focus on controlled movements');
      }
    }
    
    if (sport === 'athletics' || sport === 'football') {
      if (this.analysisResults.speedScore < 60) {
        this.analysisResults.errors.push('Speed-based sports require faster rep execution');
      }
    }
  }

  private getSportMultipliers(sport: string): { difficulty: number; speed: number; strength: number } {
    const multipliers: { [key: string]: { difficulty: number; speed: number; strength: number } } = {
      wrestling: { difficulty: 1.3, speed: 1.0, strength: 1.4 },
      boxing: { difficulty: 1.2, speed: 1.3, strength: 1.3 },
      weightlifting: { difficulty: 1.4, speed: 0.8, strength: 1.5 },
      athletics: { difficulty: 1.1, speed: 1.4, strength: 1.1 },
      football: { difficulty: 1.1, speed: 1.3, strength: 1.0 },
      kabaddi: { difficulty: 1.2, speed: 1.1, strength: 1.3 },
      hockey: { difficulty: 1.1, speed: 1.2, strength: 1.1 },
      cricket: { difficulty: 0.9, speed: 1.0, strength: 1.0 },
      badminton: { difficulty: 0.9, speed: 1.1, strength: 0.9 },
      tennis: { difficulty: 0.9, speed: 1.1, strength: 1.0 },
      volleyball: { difficulty: 1.0, speed: 1.1, strength: 1.1 },
      basketball: { difficulty: 1.1, speed: 1.2, strength: 1.1 },
      handball: { difficulty: 1.0, speed: 1.1, strength: 1.2 },
      swimming: { difficulty: 1.0, speed: 1.1, strength: 1.2 },
      rowing: { difficulty: 1.1, speed: 1.0, strength: 1.3 },
      cycling: { difficulty: 0.8, speed: 1.1, strength: 1.2 },
      archery: { difficulty: 0.7, speed: 0.8, strength: 1.0 },
      shooting: { difficulty: 0.7, speed: 0.8, strength: 0.9 },
      polo: { difficulty: 0.8, speed: 1.0, strength: 1.1 },
      'kho-kho': { difficulty: 1.2, speed: 1.3, strength: 1.0 }
    };
    
    return multipliers[sport] || { difficulty: 1.0, speed: 1.0, strength: 1.0 };
  }

  private calculatePerformanceScores(expectedPushups: number): void {
    // Speed Score - based on rep time consistency
    if (this.repTimes.length > 1) {
      const avgRepTime = this.analysisResults.avgRepTime;
      const idealRepTime = this.getIdealRepTime();
      const timeDiff = Math.abs(avgRepTime - idealRepTime);
      this.analysisResults.speedScore = Math.max(0, Math.min(100, 100 - (timeDiff / 30)));
    } else {
      this.analysisResults.speedScore = this.pushupCount > 0 ? 40 : 0;
    }

    // Strength Score - based on push-up count vs expected
    const completionRatio = this.pushupCount / expectedPushups;
    this.analysisResults.strengthScore = Math.min(100, Math.max(0, completionRatio * 100));

    // Stamina Score - based on rep time consistency (less variation = better stamina)
    if (this.repTimes.length > 2) {
      const repTimeVariation = this.calculateVariation(this.repTimes);
      this.analysisResults.staminaScore = Math.max(0, Math.min(100, 100 - (repTimeVariation / 15)));
    } else {
      this.analysisResults.staminaScore = this.pushupCount > 0 ? 50 : 0;
    }

    // Form Score - based on valid push-up frames vs total frames
    const formRatio = this.validPushupFrames / Math.max(1, this.humanDetectedFrames);
    this.analysisResults.formScore = Math.min(100, Math.max(0, formRatio * 120)); // Bonus for good form
  }

  private getIdealRepTime(): number {
    // Different sports have different ideal rep times
    const sportTimings: { [key: string]: number } = {
      'boxing': 1500,      // Faster for explosive sports
      'wrestling': 1800,   // Controlled but strong
      'athletics': 1600,   // Speed focused
      'football': 1700,    // Balanced
      'weightlifting': 2500, // Slower, more controlled
      'archery': 3000,     // Very controlled
      'shooting': 3000     // Very controlled
    };
    
    return 2000; // Default 2 seconds per rep
  }

  private calculateVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  getAnalysisResults(): ExerciseAnalysis {
    return this.analysisResults;
  }
}
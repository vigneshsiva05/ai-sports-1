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
}

export class MediaPipeAnalyzer {
  private pose: any;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private pushupCount: number = 0;
  private isInDownPosition: boolean = false;
  private exerciseFrames: PoseLandmark[][] = [];
  private analysisResults: ExerciseAnalysis;

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
      errors: []
    };
  }

  async initializeMediaPipe(): Promise<void> {
    try {
      // Initialize MediaPipe Pose
      const { Pose } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');
      
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
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
        this.exerciseFrames = [];
        this.analysisResults = {
          humanDetected: false,
          exerciseDetected: false,
          pushupCount: 0,
          exerciseType: 'unknown',
          confidence: 0,
          landmarks: [],
          errors: []
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
    const frameRate = 10; // Process 10 frames per second
    const interval = 1000 / frameRate;
    let frameCount = 0;
    let humanDetectedFrames = 0;

    const processFrame = async () => {
      if (this.video.currentTime >= this.video.duration) {
        // Analysis complete
        this.finalizeAnalysis(sport, expectedPushups, humanDetectedFrames, frameCount);
        resolve(this.analysisResults);
        return;
      }

      // Draw current frame to canvas
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Send frame to MediaPipe
      await this.pose.send({ image: this.canvas });
      
      frameCount++;
      this.video.currentTime += interval / 1000;
      
      setTimeout(processFrame, 50); // Small delay between frames
    };

    this.video.currentTime = 0;
    processFrame();
  }

  private onPoseResults(results: any): void {
    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      const landmarks = results.poseLandmarks;
      this.analysisResults.humanDetected = true;
      this.analysisResults.landmarks = landmarks;
      this.exerciseFrames.push(landmarks);

      // Analyze for push-ups
      this.analyzePushup(landmarks);
      
      // Analyze exercise type
      this.analyzeExerciseType(landmarks);
    }
  }

  private analyzePushup(landmarks: PoseLandmark[]): void {
    try {
      // Key landmarks for push-up analysis
      const leftShoulder = landmarks[11];  // LEFT_SHOULDER
      const rightShoulder = landmarks[12]; // RIGHT_SHOULDER
      const leftElbow = landmarks[13];     // LEFT_ELBOW
      const rightElbow = landmarks[14];    // RIGHT_ELBOW
      const leftWrist = landmarks[15];     // LEFT_WRIST
      const rightWrist = landmarks[16];    // RIGHT_WRIST
      const nose = landmarks[0];           // NOSE

      // Check if person is in plank position (horizontal body)
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const noseY = nose.y;
      const isHorizontal = Math.abs(shoulderY - noseY) < 0.1;

      if (!isHorizontal) return; // Not in push-up position

      // Calculate elbow angles
      const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // Push-up detection logic
      const isDown = avgElbowAngle < 100; // Arms bent (down position)
      const isUp = avgElbowAngle > 160;   // Arms straight (up position)

      if (isDown && !this.isInDownPosition) {
        this.isInDownPosition = true;
      } else if (isUp && this.isInDownPosition) {
        this.pushupCount++;
        this.isInDownPosition = false;
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

      // Simple exercise classification based on body position
      if (bodyHeight < 0.3) {
        this.analysisResults.exerciseType = 'push-up';
      } else if (bodyHeight > 0.7) {
        this.analysisResults.exerciseType = 'standing';
      } else {
        this.analysisResults.exerciseType = 'squat';
      }

      this.analysisResults.exerciseDetected = true;
      this.analysisResults.confidence = Math.min(0.95, this.exerciseFrames.length / 30);

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

  private finalizeAnalysis(sport: string, expectedPushups: number, humanDetectedFrames: number, totalFrames: number): void {
    // Calculate human detection confidence
    const humanDetectionRate = humanDetectedFrames / totalFrames;
    this.analysisResults.humanDetected = humanDetectionRate > 0.5;

    // Validate push-up count
    this.analysisResults.pushupCount = this.pushupCount;

    // Set confidence based on detection quality
    this.analysisResults.confidence = Math.min(0.95, humanDetectionRate * this.exerciseFrames.length / 50);

    // Add validation errors
    if (!this.analysisResults.humanDetected) {
      this.analysisResults.errors.push('No human detected in video');
    }
    
    if (this.pushupCount === 0 && expectedPushups > 0) {
      this.analysisResults.errors.push('No push-ups detected');
    }

    if (this.pushupCount < expectedPushups * 0.5) {
      this.analysisResults.errors.push(`Low push-up count: ${this.pushupCount}/${expectedPushups} expected`);
    }

    if (this.exerciseFrames.length < 30) {
      this.analysisResults.errors.push('Video too short for accurate analysis');
    }
  }

  getAnalysisResults(): ExerciseAnalysis {
    return this.analysisResults;
  }
}
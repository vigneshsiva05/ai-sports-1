# Push-Up Detection Algorithm Improvements

## Overview
Enhanced the push-up detection accuracy from MediaPipe Pose analysis to capture more precise rep counts by analyzing video frame-by-frame.

## Key Improvements Made

### 1. **Increased Frame Processing Rate**
- **Before**: 15 frames per second
- **After**: 30 frames per second
- **Benefit**: Captures twice as many data points, reducing missed push-ups during rapid movements

### 2. **Enhanced Body Position Validation**
Added more strict alignment checks:
- **Shoulder-to-hip alignment**: `< 0.12` (stricter than before)
- **Hip-to-knee alignment**: Added check for `< 0.15`
- **Head alignment**: Maintained at `< 0.15`
- **Effect**: Only counts push-ups in proper horizontal plank position

### 3. **Multi-Parameter Arm Analysis**
Now analyzes three key metrics for each frame:

#### a) Elbow Angle
- **Down position**: 40° - 100° (arms bent)
- **Up position**: > 160° (arms fully extended)
- More precise than previous ±50° ranges

#### b) Arm Extension Distance
- Calculates wrist-to-elbow distance
- Ensures arms fully extend for "up" position
- Added threshold: `avgArmExtension > 0.15`

#### c) Shoulder-Elbow Distance
- Tracks shoulder-to-elbow proximity
- Helps identify collapsed or improper form
- Used for form validation

### 4. **Advanced State Machine Logic**
Implemented debouncing to prevent false counts:

```
Down Position → (wait 400ms) → Up Position → (wait 500ms) → Count Rep
```

- **400ms minimum** before transitioning down → up
- **500ms minimum** between counted reps
- Prevents counting rapid micro-movements as separate reps

### 5. **Improved Rep Time Validation**
- **Valid range**: 600ms - 15 seconds per rep (previously 500ms - 10s)
- More tolerant of slower, controlled movements
- Still filters out unrealistic speeds

### 6. **Better Visibility Confidence Threshold**
- Key landmarks require `visibility > 0.7` (improved from 0.6)
- Minimum 5 visible key landmarks required (from 4)
- Stricter human detection: `humanDetectionRate > 0.6` (from 0.5)

### 7. **Frame-Level Analysis**
Each frame now calculates:
- Individual left and right elbow angles (then averaged)
- Distance measurements in 3D space (x, y, z)
- Body alignment across 4 different points
- Validates all parameters before counting

### 8. **Enhanced Error Messages**
More actionable feedback:
- `"Insufficient exercise frames for accurate analysis - ensure camera captures full movement"`
- `"Low push-up count: detected/expected. Ensure full range of motion."`
- `"Human not consistently visible throughout video - improve lighting and camera angle"`

## Expected Results

### Previous Behavior
- 25 push-ups performed → 11 detected (44% accuracy)
- High false positives from partial movements
- Missed reps during fatigue

### Expected New Behavior
- 25 push-ups performed → 23-25 detected (92-100% accuracy)
- Rejects partial or incomplete movements
- Captures reps with variable speed

## Technical Details

### Processing Pipeline
1. Video loaded at original frame rate
2. Every frame extracted at 30 FPS
3. MediaPipe processes each frame for pose landmarks
4. Algorithm validates:
   - Human is visible and properly positioned
   - Body alignment is horizontal
   - All key joints are visible
5. For each valid frame:
   - Calculate angles for both arms
   - Calculate distances in 3D space
   - Apply state machine logic
   - Count complete reps only

### Confidence Scoring
```
Confidence = min(0.95, max(0.3,
  (humanDetectionRate × validFrameRatio × 0.9)
))
```

- Stricter confidence calculation
- Accounts for both human visibility and form quality
- Maximum 95% confidence (accounts for video quality variations)

## Best Practices for Video Submission

1. **Lighting**: Ensure good, even lighting on your body
2. **Camera Angle**: Film from the side or slightly angled to capture full arm extension
3. **Distance**: Stand 1-2 meters from camera for full body visibility
4. **Background**: Use a plain background to aid detection
5. **Form**: Perform complete push-ups with full range of motion
   - Down: Arms bent to ~90 degrees (chest near ground)
   - Up: Arms fully extended (body in plank)
6. **Speed**: Maintain consistent, moderate pace (1.5-2 seconds per rep)
7. **Video Quality**: Use 720p or higher resolution for best results

## Technical Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Frame Rate | 15 FPS | 30 FPS | 2x more data points |
| Visibility Threshold | 0.6 | 0.7 | Stricter detection |
| Elbow Angle Down | <110° | <100° | More precise |
| Elbow Angle Up | >150° | >160° | Full extension required |
| Min Rep Time | 500ms | 600ms | Better for control |
| Max Rep Time | 10s | 15s | Allows slower reps |
| State Debounce | None | 400-500ms | Prevents false counts |
| Detection Parameters | 1 (angle) | 3 (angle, extension, distance) | Comprehensive analysis |

## Troubleshooting

If you still don't get accurate counts:

1. **Too many reps counted**
   - You may have jerky movements or partial reps
   - Try slower, more controlled movements
   - Ensure full arm extension at top

2. **Too few reps counted**
   - Check camera angle - ensure full body is visible
   - Improve lighting
   - Ensure chest gets close to ground during down position
   - Ensure arms fully straighten during up position

3. **No reps detected**
   - Verify camera can see your body clearly
   - Check for adequate lighting
   - Make sure you're in proper horizontal plank position
   - Ensure full range of motion (not partial dips)

## Future Enhancements

Potential improvements for even higher accuracy:
- Add rep speed consistency tracking
- Form quality scoring (body sag, elbow flare, etc.)
- Comparison with professional form models
- AI-based movement pattern recognition
- Real-time feedback during exercise

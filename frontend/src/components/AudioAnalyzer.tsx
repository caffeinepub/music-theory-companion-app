import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Activity, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import type { MusicKey } from '@/pages/MusicTheoryApp';
import { detectKeyFromPitches } from '@/lib/musicTheory';

interface AudioAnalyzerProps {
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  onKeyDetected: (key: MusicKey | null) => void;
  onStableKeyDetected: (key: MusicKey | null) => void;
  onPitchDetected: (pitch: number | null) => void;
  onNoteDetected: (note: string | null) => void;
  hasPermission: boolean;
}

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
}

interface PitchDataPoint {
  frequency: number;
  timestamp: number;
}

interface KeyConfidence {
  key: MusicKey;
  count: number;
  firstDetected: number;
  confidenceScore: number;
}

type AnalysisState = 'listening' | 'analyzing' | 'locked';

export default function AudioAnalyzer({
  isListening,
  onListeningChange,
  onKeyDetected,
  onStableKeyDetected,
  onPitchDetected,
  onNoteDetected,
  hasPermission,
}: AudioAnalyzerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pitchHistoryRef = useRef<PitchDataPoint[]>([]);
  const keyConfidenceRef = useRef<KeyConfidence | null>(null);
  const lastStableKeyRef = useRef<string | null>(null);
  const keyDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isKeyLockedRef = useRef<boolean>(false);
  const analysisStartTimeRef = useRef<number>(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
  const [currentDeviceLabel, setCurrentDeviceLabel] = useState<string>('Default Microphone');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('listening');
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [currentDetectedKey, setCurrentDetectedKey] = useState<MusicKey | null>(null);

  // Configuration for 40-second rolling window
  const ROLLING_WINDOW_MS = 40000; // 40 seconds
  const KEY_DETECTION_INTERVAL_MS = 3000; // Update every 3 seconds
  const CONFIDENCE_THRESHOLD = 0.8; // 80% confidence required
  const MIN_UNIQUE_NOTES = 5; // Minimum unique notes needed
  const STABILITY_DURATION_MS = 1500; // 1.5 seconds of sustained detection

  // Enumerate available audio input devices
  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
        }));
      
      setAvailableDevices(audioInputs);
      
      // Set the first device as default if none selected
      if (audioInputs.length > 0 && selectedDeviceId === 'default') {
        setSelectedDeviceId(audioInputs[0].deviceId);
        setCurrentDeviceLabel(audioInputs[0].label);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
      toast.error('Failed to list audio devices');
    }
  };

  // Update device list when permission is granted
  useEffect(() => {
    if (hasPermission) {
      enumerateDevices();
    }
  }, [hasPermission]);

  const startListening = async (deviceId?: string) => {
    if (!hasPermission) {
      toast.error('Microphone permission required');
      return;
    }

    try {
      setIsInitializing(true);
      
      const constraints: MediaStreamConstraints = {
        audio: deviceId && deviceId !== 'default' 
          ? { deviceId: { exact: deviceId } }
          : true,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Update current device label
      const track = stream.getAudioTracks()[0];
      if (track) {
        setCurrentDeviceLabel(track.label || 'Unknown Microphone');
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Reset all tracking state
      pitchHistoryRef.current = [];
      keyConfidenceRef.current = null;
      lastStableKeyRef.current = null;
      isKeyLockedRef.current = false;
      analysisStartTimeRef.current = Date.now();
      setAnalysisState('listening');
      setConfidenceScore(0);
      setCurrentDetectedKey(null);

      onListeningChange(true);
      analyzePitch();
      startKeyDetectionInterval();
      toast.success('Microphone activated');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check permissions and device availability.');
    } finally {
      setIsInitializing(false);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (keyDetectionIntervalRef.current) {
      clearInterval(keyDetectionIntervalRef.current);
      keyDetectionIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    pitchHistoryRef.current = [];
    keyConfidenceRef.current = null;
    lastStableKeyRef.current = null;
    isKeyLockedRef.current = false;
    analysisStartTimeRef.current = 0;
    setAnalysisState('listening');
    setConfidenceScore(0);
    setCurrentDetectedKey(null);
    onListeningChange(false);
    onPitchDetected(null);
    onNoteDetected(null);
    toast.info('Microphone deactivated');
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    
    // If currently listening, restart with the new device
    if (isListening) {
      stopListening();
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        startListening(deviceId);
      }, 100);
    }
  };

  const keysMatch = (key1: MusicKey, key2: MusicKey): boolean => {
    return key1.note === key2.note && key1.mode === key2.mode;
  };

  const cleanupOldPitchData = () => {
    const now = Date.now();
    const cutoffTime = now - ROLLING_WINDOW_MS;
    pitchHistoryRef.current = pitchHistoryRef.current.filter(
      (dataPoint) => dataPoint.timestamp > cutoffTime
    );
  };

  const getUniqueNoteCount = (pitches: number[]): number => {
    const noteIndices = new Set<number>();
    pitches.forEach((frequency) => {
      const noteIndex = frequencyToNoteIndex(frequency);
      if (noteIndex >= 0 && noteIndex < 12) {
        noteIndices.add(noteIndex);
      }
    });
    return noteIndices.size;
  };

  const calculateConfidenceScore = (frequencies: number[], detectedKey: MusicKey): number => {
    if (frequencies.length === 0) return 0;

    // Factor 1: Unique note diversity (0-1)
    const uniqueNotes = getUniqueNoteCount(frequencies);
    const diversityScore = Math.min(uniqueNotes / 12, 1.0);

    // Factor 2: Frequency distribution stability (0-1)
    const noteDistribution = new Array(12).fill(0);
    frequencies.forEach((frequency) => {
      const noteIndex = frequencyToNoteIndex(frequency);
      if (noteIndex >= 0 && noteIndex < 12) {
        noteDistribution[noteIndex]++;
      }
    });

    // Calculate how well the distribution matches the expected key
    const tonicIndex = getNoteIndex(detectedKey.note);
    const keyNotes = getKeyNoteIndices(detectedKey);
    
    let inKeyCount = 0;
    let totalCount = 0;
    noteDistribution.forEach((count, index) => {
      totalCount += count;
      if (keyNotes.includes(index)) {
        inKeyCount += count;
      }
    });

    const keyMatchScore = totalCount > 0 ? inKeyCount / totalCount : 0;

    // Factor 3: Note repetition consistency (0-1)
    const tonicCount = noteDistribution[tonicIndex];
    const repetitionScore = Math.min(tonicCount / (frequencies.length * 0.2), 1.0);

    // Factor 4: Time-based confidence boost
    const elapsedTime = Date.now() - analysisStartTimeRef.current;
    const timeScore = Math.min(elapsedTime / ROLLING_WINDOW_MS, 1.0);

    // Weighted average of all factors
    const confidence = (
      diversityScore * 0.25 +
      keyMatchScore * 0.40 +
      repetitionScore * 0.20 +
      timeScore * 0.15
    );

    return Math.min(confidence, 1.0);
  };

  const getNoteIndex = (note: string): number => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames.indexOf(note);
  };

  const getKeyNoteIndices = (key: MusicKey): number[] => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const tonicIndex = noteNames.indexOf(key.note);
    if (tonicIndex === -1) return [];

    // Mode intervals
    const modeIntervals: Record<string, number[]> = {
      Ionian: [0, 2, 4, 5, 7, 9, 11],
      Dorian: [0, 2, 3, 5, 7, 9, 10],
      Phrygian: [0, 1, 3, 5, 7, 8, 10],
      Lydian: [0, 2, 4, 6, 7, 9, 11],
      Mixolydian: [0, 2, 4, 5, 7, 9, 10],
      Aeolian: [0, 2, 3, 5, 7, 8, 10],
      Locrian: [0, 1, 3, 5, 6, 8, 10],
    };

    const intervals = modeIntervals[key.mode] || modeIntervals.Ionian;
    return intervals.map((interval) => (tonicIndex + interval) % 12);
  };

  const startKeyDetectionInterval = () => {
    // Clear any existing interval
    if (keyDetectionIntervalRef.current) {
      clearInterval(keyDetectionIntervalRef.current);
    }

    // Run key detection every few seconds
    keyDetectionIntervalRef.current = setInterval(() => {
      performKeyDetection();
    }, KEY_DETECTION_INTERVAL_MS);
  };

  const performKeyDetection = () => {
    // If key is already locked, skip detection
    if (isKeyLockedRef.current) {
      return;
    }

    // Clean up old data outside the 40-second window
    cleanupOldPitchData();

    const pitchData = pitchHistoryRef.current;
    
    if (pitchData.length === 0) {
      setAnalysisState('listening');
      return;
    }

    // Extract frequencies from pitch data
    const frequencies = pitchData.map((dp) => dp.frequency);
    const uniqueNotes = getUniqueNoteCount(frequencies);

    // Check if we have enough unique note data
    if (uniqueNotes < MIN_UNIQUE_NOTES) {
      setAnalysisState('listening');
      // Window will automatically extend as we keep collecting
      return;
    }

    // Transition to analyzing state
    setAnalysisState('analyzing');

    // Detect key from aggregated pitch data
    const detectedKey = detectKeyFromPitches(frequencies);
    
    if (detectedKey) {
      // Calculate confidence score
      const confidence = calculateConfidenceScore(frequencies, detectedKey);
      setConfidenceScore(confidence);
      setCurrentDetectedKey(detectedKey);
      
      onKeyDetected(detectedKey);

      // Check if confidence meets threshold
      if (confidence >= CONFIDENCE_THRESHOLD) {
        checkKeyStability(detectedKey, confidence);
      }
    }
  };

  const checkKeyStability = (detectedKey: MusicKey, confidence: number) => {
    const now = Date.now();

    if (!keyConfidenceRef.current) {
      // First detection of this key
      keyConfidenceRef.current = {
        key: detectedKey,
        count: 1,
        firstDetected: now,
        confidenceScore: confidence,
      };
      return;
    }

    if (keysMatch(keyConfidenceRef.current.key, detectedKey)) {
      // Same key detected again
      keyConfidenceRef.current.count++;
      keyConfidenceRef.current.confidenceScore = confidence;
      const duration = now - keyConfidenceRef.current.firstDetected;

      // Check if key has been stable long enough
      if (duration >= STABILITY_DURATION_MS) {
        const keyString = `${detectedKey.note}-${detectedKey.mode}`;
        
        // Only trigger update if this is a new stable key
        if (lastStableKeyRef.current !== keyString) {
          lastStableKeyRef.current = keyString;
          isKeyLockedRef.current = true; // Lock the key
          setAnalysisState('locked');
          onStableKeyDetected(detectedKey);
          toast.success(`Key locked: ${detectedKey.displayName}`, {
            description: `Confidence: ${Math.round(confidence * 100)}%`,
          });
        }
      }
    } else {
      // Different key detected, reset confidence
      keyConfidenceRef.current = {
        key: detectedKey,
        count: 1,
        firstDetected: now,
        confidenceScore: confidence,
      };
    }
  };

  const analyzePitch = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);

    const detectPitch = () => {
      analyser.getFloatTimeDomainData(buffer);

      // Autocorrelation algorithm for pitch detection
      const pitch = autoCorrelate(buffer, audioContextRef.current!.sampleRate);

      if (pitch > 0) {
        onPitchDetected(pitch);
        const note = frequencyToNote(pitch);
        onNoteDetected(note);

        // Store pitch data with timestamp for rolling window
        const now = Date.now();
        pitchHistoryRef.current.push({
          frequency: pitch,
          timestamp: now,
        });
      } else {
        onPitchDetected(null);
        onNoteDetected(null);
      }

      animationFrameRef.current = requestAnimationFrame(detectPitch);
    };

    detectPitch();
  };

  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    // Find the RMS (root mean square) to determine if there's enough signal
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    // Not enough signal
    if (rms < 0.01) return -1;

    // Autocorrelation
    const correlations = new Array(buffer.length).fill(0);
    for (let lag = 0; lag < buffer.length; lag++) {
      for (let i = 0; i < buffer.length - lag; i++) {
        correlations[lag] += buffer[i] * buffer[i + lag];
      }
    }

    // Find the first peak after the initial correlation
    let maxCorrelation = 0;
    let bestOffset = -1;
    let foundPeak = false;

    for (let i = 1; i < correlations.length; i++) {
      if (correlations[i] > correlations[i - 1] && correlations[i] > correlations[i + 1]) {
        if (!foundPeak) {
          foundPeak = true;
          continue;
        }
        if (correlations[i] > maxCorrelation) {
          maxCorrelation = correlations[i];
          bestOffset = i;
        }
      }
    }

    if (bestOffset === -1 || maxCorrelation < 0.01) return -1;

    return sampleRate / bestOffset;
  };

  const frequencyToNote = (frequency: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440;
    const c0 = a4 * Math.pow(2, -4.75);
    const halfSteps = Math.round(12 * Math.log2(frequency / c0));
    const octave = Math.floor(halfSteps / 12);
    const note = noteNames[halfSteps % 12];
    return `${note}${octave}`;
  };

  const frequencyToNoteIndex = (frequency: number): number => {
    const a4 = 440;
    const c0 = a4 * Math.pow(2, -4.75);
    const halfSteps = Math.round(12 * Math.log2(frequency / c0));
    return halfSteps % 12;
  };

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, []);

  const getStateIcon = () => {
    switch (analysisState) {
      case 'listening':
        return <Activity className="w-5 h-5 text-muted-foreground" />;
      case 'analyzing':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-success" />;
    }
  };

  const getStateText = () => {
    switch (analysisState) {
      case 'listening':
        return 'Listening…';
      case 'analyzing':
        return currentDetectedKey 
          ? `Analyzing: ${currentDetectedKey.displayName}` 
          : 'Analyzing…';
      case 'locked':
        return currentDetectedKey 
          ? `Key Locked: ${currentDetectedKey.displayName}` 
          : 'Key Locked';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getStateIcon()}
            Audio Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            {isListening ? getStateText() : 'Start listening to detect key'}
          </p>
        </div>
        <Button
          onClick={isListening ? stopListening : () => startListening(selectedDeviceId)}
          disabled={isInitializing || !hasPermission}
          size="lg"
          variant={isListening ? 'destructive' : 'default'}
          className="gap-2"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              {isInitializing ? 'Starting...' : 'Start Listening'}
            </>
          )}
        </Button>
      </div>

      {/* Confidence Indicator */}
      {isListening && analysisState !== 'listening' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className={`font-medium ${
              confidenceScore >= CONFIDENCE_THRESHOLD 
                ? 'text-success' 
                : 'text-primary'
            }`}>
              {Math.round(confidenceScore * 100)}%
            </span>
          </div>
          <Progress 
            value={confidenceScore * 100} 
            className="h-2"
          />
          {confidenceScore < CONFIDENCE_THRESHOLD && (
            <p className="text-xs text-muted-foreground">
              Collecting more data to reach {Math.round(CONFIDENCE_THRESHOLD * 100)}% threshold...
            </p>
          )}
        </div>
      )}

      {/* Microphone Device Selection */}
      {hasPermission && availableDevices.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Current Microphone:
          </label>
          <Select
            value={selectedDeviceId}
            onValueChange={handleDeviceChange}
            disabled={isListening}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select microphone">
                {currentDeviceLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isListening && (
            <p className="text-xs text-muted-foreground">
              Stop listening to change microphone
            </p>
          )}
        </div>
      )}

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Recording audio from {currentDeviceLabel}
        </div>
      )}
    </div>
  );
}

# Music Theory Companion App

## Overview
A music theory companion application that analyzes live audio to detect musical keys and provides educational content about music theory concepts.

## Core Features

### Audio Analysis
- Real-time microphone input to analyze live audio
- 40-second rolling time window for audio key detection that aggregates all frequency and pitch data to determine the most probable key
- Dynamic window extension when confidence remains below threshold after 40 seconds until sufficient unique note data is collected
- Automatic detection of the current musical key from audio input with enhanced confidence-based stabilization
- Confidence threshold system for key identification using frequency distribution stability and note repetition consistency
- Confidence scoring algorithm that estimates the likelihood of a detected key being correct
- Scales, chords, and related data only displayed once confidence exceeds the threshold (e.g., 80% stability over the rolling analysis window)
- Visual confidence indicator showing system states: "Listening…" → "Analyzing…" → "Key Locked: [C Major]"
- Real-time pitch tracking display
- Analysis feedback when notes or chords deviate from the expected tonal center
- Smoothing logic that locks stable detected keys and prevents fluctuation once confidence is achieved
- Optimized computation that updates every few seconds for real-time responsiveness without processing overload
- Debounce mechanism with 1-2 second sustained key confidence before switching displayed information to prevent rapid flickering
- Automatic updates to KeySelector active key/mode state when audio analyzer stabilizes on a detected key with sufficient confidence
- Automatic triggering of TheoryPanel display updates to show matching scales, chord progressions, improvisation tips, and composition suggestions based on detected key only when confidence threshold is met
- Automatic animation and highlighting of the active area in the CircleOfFifths component when key is detected with sufficient confidence
- Auto-update behavior that works consistently for mic-detected keys, microphone switching, and listening state toggling

### Microphone Permission Management
- Automatic microphone permission request when the app loads or when audio analysis first starts
- Permission state verification (granted, denied, or prompt)
- Clear user prompts explaining why microphone access is needed when permission is denied or unavailable
- Instructions on how to enable microphone access in browser settings
- Graceful handling of all permission states with appropriate user feedback
- Local storage of user's microphone preference to avoid repeated permission requests
- AudioAnalyzer only starts once microphone access is confirmed

### Microphone Device Selection
- Display of currently selected microphone device with clear labeling
- Dropdown menu listing all available audio input devices obtained via navigator.mediaDevices.enumerateDevices()
- Dynamic switching between microphones with automatic audio stream restart using the selected device ID
- Updated permission error handling for device accessibility and audio input restart failures
- Device enumeration filtering for audio input devices only

### Visual Interface
- Interactive circle of fifths display
- Dynamic highlighting of the detected or manually selected key
- Visual representation of relative modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)
- Display of neighboring keys on the circle of fifths
- Confidence indicator showing current analysis state and detected key confidence level

### Manual Controls
- Manual key selection override (e.g., A major, C minor)
- Manual mode selection (e.g., D Dorian)
- Toggle between automatic detection and manual mode

### Music Theory Information
- Display compatible chords for the current key or mode (only when confidence threshold is met for auto-detected keys)
- Show playable scales for the selected key/mode (only when confidence threshold is met for auto-detected keys)
- Provide improvisation tips relevant to the current key (only when confidence threshold is met for auto-detected keys)
- Show composition suggestions based on the selected key/mode (only when confidence threshold is met for auto-detected keys)
- Display contextual explanations for common chord progressions within the selected key or mode

### Educational Content
- Brief explanations of music theory concepts
- Chord progression examples and their common uses
- Mode characteristics and applications

## Technical Requirements

### Frontend
- Microphone permission management and state handling
- Local storage for microphone preference persistence
- Microphone device enumeration and selection controls
- Dynamic audio stream management with device switching capability
- Microphone access and real-time audio processing
- Enhanced audio frequency analysis with 40-second rolling window for improved key detection accuracy
- Confidence threshold system with scoring algorithm for key detection reliability
- Dynamic window extension logic for insufficient confidence scenarios
- Key detection smoothing and locking mechanism to maintain stable results
- Optimized computation scheduling for real-time performance without processing overload
- Key detection debounce mechanism to prevent rapid UI updates
- Confidence-based display logic that only shows theory content when threshold is exceeded
- Visual confidence state indicator for user feedback on analysis progress
- Automatic state synchronization between audio analyzer, KeySelector, TheoryPanel, and CircleOfFifths components
- Interactive circle of fifths visualization with automatic highlighting
- Real-time pitch tracking visualization
- Responsive interface for manual key/mode selection
- Permission denial handling with user guidance

### Backend
- Store educational content including chord progressions, scale information, and music theory explanations
- Provide endpoints to retrieve theory content based on selected keys and modes
- Store improvisation tips and composition suggestions organized by key and mode

## User Interface
- Clean, intuitive design focused on the circle of fifths as the central element
- Real-time visual feedback for audio analysis
- Easy-to-use manual controls for key and mode selection
- Microphone selection dropdown with current device display
- Clear display of relevant music theory information
- Educational tooltips and explanations
- Clear permission prompts and guidance for microphone access
- Confidence indicator showing analysis states and key detection progress
- Smooth transitions and animations when key detection updates the interface
- App content language: English

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CircleOfFifths from '@/components/CircleOfFifths';
import AudioAnalyzer from '@/components/AudioAnalyzer';
import KeySelector from '@/components/KeySelector';
import TheoryPanel from '@/components/TheoryPanel';
import PitchDisplay from '@/components/PitchDisplay';
import MicrophonePermissionPrompt from '@/components/MicrophonePermissionPrompt';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMicrophonePermission } from '@/hooks/useMicrophonePermission';
import { toast } from 'sonner';

export type Mode = 'Ionian' | 'Dorian' | 'Phrygian' | 'Lydian' | 'Mixolydian' | 'Aeolian' | 'Locrian';

export interface MusicKey {
  note: string;
  mode: Mode;
  displayName: string;
}

export default function MusicTheoryApp() {
  const [isListening, setIsListening] = useState(false);
  const [detectedKey, setDetectedKey] = useState<MusicKey | null>(null);
  const [manualKey, setManualKey] = useState<MusicKey | null>(null);
  const [currentPitch, setCurrentPitch] = useState<number | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [autoDetectedKey, setAutoDetectedKey] = useState<MusicKey | null>(null);

  const { permissionState, requestPermission, hasPermission, isChecking } = useMicrophonePermission();

  const activeKey = manualKey || autoDetectedKey;

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    const granted = await requestPermission();
    setIsRequestingPermission(false);
    
    if (granted) {
      toast.success('Microphone access granted');
    } else {
      toast.error('Microphone access denied. Please check your browser settings.');
    }
  };

  const handleStableKeyDetected = (key: MusicKey | null) => {
    if (key && !manualKey) {
      // Only auto-update if no manual key is set
      setAutoDetectedKey(key);
      toast.success(`Key detected: ${key.displayName}`, {
        duration: 2000,
      });
    }
  };

  const handleManualKeyChange = (key: MusicKey | null) => {
    setManualKey(key);
    if (key) {
      // Clear auto-detected key when manual key is set
      setAutoDetectedKey(null);
    }
  };

  // Reset auto-detected key when listening stops
  useEffect(() => {
    if (!isListening) {
      setAutoDetectedKey(null);
    }
  }, [isListening]);

  const shouldShowPermissionPrompt = !isChecking && !hasPermission && (permissionState === 'prompt' || permissionState === 'denied');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Microphone Permission Prompt */}
          {shouldShowPermissionPrompt && (
            <MicrophonePermissionPrompt
              permissionState={permissionState as 'prompt' | 'denied'}
              onRequestPermission={handleRequestPermission}
              isRequesting={isRequestingPermission}
            />
          )}

          {/* Audio Controls Section */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <AudioAnalyzer
                    isListening={isListening}
                    onListeningChange={setIsListening}
                    onKeyDetected={setDetectedKey}
                    onStableKeyDetected={handleStableKeyDetected}
                    onPitchDetected={setCurrentPitch}
                    onNoteDetected={setDetectedNote}
                    hasPermission={hasPermission}
                  />
                </div>
                <div className="flex-1">
                  <KeySelector
                    selectedKey={manualKey}
                    onKeyChange={handleManualKeyChange}
                    detectedKey={detectedKey}
                    autoDetectedKey={autoDetectedKey}
                  />
                </div>
              </div>

              {/* Pitch Display */}
              {isListening && (
                <PitchDisplay
                  pitch={currentPitch}
                  note={detectedNote}
                  activeKey={activeKey}
                />
              )}
            </div>
          </Card>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Circle of Fifths */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Circle of Fifths
              </h2>
              <CircleOfFifths activeKey={activeKey} />
            </Card>

            {/* Theory Information */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <Tabs defaultValue="chords" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chords">Chords</TabsTrigger>
                  <TabsTrigger value="scales">Scales</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="chords" className="mt-6">
                  <TheoryPanel activeKey={activeKey} type="chords" />
                </TabsContent>
                <TabsContent value="scales" className="mt-6">
                  <TheoryPanel activeKey={activeKey} type="scales" />
                </TabsContent>
                <TabsContent value="tips" className="mt-6">
                  <TheoryPanel activeKey={activeKey} type="tips" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

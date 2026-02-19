import { AlertCircle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MicrophonePermissionPromptProps {
  permissionState: 'prompt' | 'denied';
  onRequestPermission: () => void;
  isRequesting?: boolean;
}

export default function MicrophonePermissionPrompt({
  permissionState,
  onRequestPermission,
  isRequesting = false,
}: MicrophonePermissionPromptProps) {
  if (permissionState === 'denied') {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Microphone Access Denied
          </CardTitle>
          <CardDescription>
            The app needs microphone access to analyze audio and detect musical keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to enable microphone access:</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <div className="space-y-1">
                <p className="font-semibold">Chrome/Edge:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click the lock icon in the address bar</li>
                  <li>Find "Microphone" and select "Allow"</li>
                  <li>Reload the page</li>
                </ol>
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Firefox:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click the microphone icon in the address bar</li>
                  <li>Select "Allow" and check "Remember this decision"</li>
                  <li>Reload the page</li>
                </ol>
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Safari:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to Safari → Settings → Websites → Microphone</li>
                  <li>Find this website and select "Allow"</li>
                  <li>Reload the page</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          Microphone Access Required
        </CardTitle>
        <CardDescription>
          This app analyzes live audio to detect musical keys and provide real-time feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>To use the audio analysis features, we need access to your microphone.</p>
          <p className="font-semibold">What we'll do with microphone access:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Analyze audio frequencies in real-time</li>
            <li>Detect the musical key you're playing</li>
            <li>Track pitch and provide visual feedback</li>
            <li>Help you learn music theory concepts</li>
          </ul>
          <p className="text-xs mt-4">
            Your audio is processed locally in your browser and is never recorded or transmitted.
          </p>
        </div>
        <Button 
          onClick={onRequestPermission} 
          disabled={isRequesting}
          className="w-full gap-2"
          size="lg"
        >
          <Mic className="w-5 h-5" />
          {isRequesting ? 'Requesting Access...' : 'Grant Microphone Access'}
        </Button>
      </CardContent>
    </Card>
  );
}

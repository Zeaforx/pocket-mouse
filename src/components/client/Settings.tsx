"use client";

import { useSettings } from '@/app/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const { sensitivity, setSensitivity, haptics, setHaptics } = useSettings();

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Touchpad Settings</CardTitle>
          <CardDescription>
            Adjust the behavior of the touchpad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4">
            <Label htmlFor="sensitivity">Touchpad Sensitivity</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="sensitivity"
                min={1}
                max={10}
                step={1}
                value={[sensitivity]}
                onValueChange={(value) => setSensitivity(value[0])}
              />
              <span className="font-semibold w-8 text-center">{sensitivity}</span>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="haptics" className="flex flex-col space-y-1">
              <span>Haptic Feedback</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Enable vibration on touch events.
              </span>
            </Label>
            <Switch
              id="haptics"
              checked={haptics}
              onCheckedChange={setHaptics}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import Keyboard from '@/components/client/Keyboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function KeyboardPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background p-4">
       <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Keyboard</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Keyboard />
        </CardContent>
      </Card>
    </div>
  );
}

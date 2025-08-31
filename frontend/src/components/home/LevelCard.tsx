import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface LevelCardProps {
  name: string;
  points: number;
  color: string;
}

const LevelCard: React.FC<LevelCardProps> = ({ name, points, color }) => {
  return (
    <Card className="text-center relative overflow-hidden">
      <CardHeader>
        <div className="mx-auto">
          <Trophy className={`h-12 w-12 ${color}`} />
        </div>
        <CardTitle className={`text-2xl ${color}`}>
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">
          От {points} баллов
        </p>
        <p className="text-sm text-muted-foreground">
          Получите сертификат {name} разработчика
        </p>
      </CardContent>
    </Card>
  );
};

export default LevelCard;
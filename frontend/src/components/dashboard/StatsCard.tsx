import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, iconColor }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 ${iconColor} rounded-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
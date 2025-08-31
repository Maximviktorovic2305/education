import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
  iconColor: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  buttonVariant = 'outline',
  iconColor,
  onClick 
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconColor} rounded-lg`}>
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant={buttonVariant} className="w-full" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActionCard;
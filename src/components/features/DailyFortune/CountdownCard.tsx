import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountdownCardProps {
    daysTo1st: number;
    daysTo15th: number;
    daysTo25th: number;
    daysTo30th: number;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ 
    daysTo1st, 
    daysTo15th, 
    daysTo25th, 
    daysTo30th 
}) => {
    return (
        <Card className="shadow-lg dark:bg-slate-800">
            <CardHeader>
                <CardTitle className="text-lg">摸鱼倒计时</CardTitle>
            </CardHeader>
            <CardContent className="text-sm grid grid-cols-2 gap-2">
                <p>距 1日发工资: <span className="font-semibold">{daysTo1st}</span> 天</p>
                <p>距 15日发工资: <span className="font-semibold">{daysTo15th}</span> 天</p>
                <p>距 25日发工资: <span className="font-semibold">{daysTo25th}</span> 天</p>
                <p>距 30日发工资: <span className="font-semibold">{daysTo30th}</span> 天</p>
            </CardContent>
        </Card>
    );
}; 
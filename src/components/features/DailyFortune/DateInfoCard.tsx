import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LunarFortuneData {
    text: string;
    error?: string;
}

interface DateInfoCardProps {
    gregorianDate: string;
    lunarDateFull: string;
    lunarFortuneData: LunarFortuneData | null;
    isLoading: boolean; // To show loading for lunar fortune part
}

export const DateInfoCard: React.FC<DateInfoCardProps> = ({ 
    gregorianDate, 
    lunarDateFull, 
    lunarFortuneData,
    isLoading
}) => {
    return (
        <Card className="shadow-lg dark:bg-slate-800">
            <CardHeader>
                <CardTitle className="text-lg">今日日期</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
                <p>公历: {gregorianDate}</p>
                <p>农历: {lunarDateFull}</p>
                {isLoading && !lunarFortuneData ? (
                    <p className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        今日吉凶加载中...
                    </p>
                ) : lunarFortuneData && lunarFortuneData.text ? (
                    <p style={{ whiteSpace: "pre-line" }} className={lunarFortuneData.error ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}>
                        今日吉凶: {lunarFortuneData.text}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { CONSTELLATIONS_LIST } from "@/lib/fortuneUtils";
import { type CachedHoroscopeData } from "@/hooks/useFortuneData"; // Assuming this type is exported

interface HoroscopeSectionProps {
    selectedAstroEng: string;
    onAstroChange: (eng: string) => void;
    horoscopeDetail: CachedHoroscopeData | null;
    isLoading: boolean; // For initial loading of horoscope section or all horoscopes
    isRetrying: boolean;
    onRetry: () => void;
}

export const HoroscopeSection: React.FC<HoroscopeSectionProps> = ({
    selectedAstroEng,
    onAstroChange,
    horoscopeDetail,
    isLoading,
    isRetrying,
    onRetry,
}) => {
    const showRetryButton = 
        horoscopeDetail && 
        !isRetrying && 
        (horoscopeDetail.content.includes("失败") || 
         horoscopeDetail.content.includes("出错") || 
         horoscopeDetail.content.includes("暂未更新"));

    // Determine if we are retrying THIS specific horoscope
    const isRetryingThisAstro = isRetrying && horoscopeDetail?.name === CONSTELLATIONS_LIST.find(c => c.eng === selectedAstroEng)?.name;

    return (
        <Card className="shadow-lg dark:bg-slate-800">
            <CardHeader>
                <CardTitle className="text-lg">星座运势</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <Select value={selectedAstroEng} onValueChange={onAstroChange} disabled={isRetrying || isLoading}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="选择星座" />
                    </SelectTrigger>
                    <SelectContent>
                        {CONSTELLATIONS_LIST.map((constellation) => (
                            <SelectItem key={constellation.eng} value={constellation.eng}>
                                {constellation.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isLoading ? (
                    <p className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        运势加载中...
                    </p>
                ) : isRetryingThisAstro ? (
                    <p className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在为 {horoscopeDetail?.name || selectedAstroEng} 重新加载...
                    </p>
                ) : horoscopeDetail ? (
                    <>
                        <p>今日星座: {horoscopeDetail.name} (数据日期: {horoscopeDetail.apiForecastDate})</p>
                        <div className="flex items-center space-x-2">
                            <p className="flex-grow">
                                今日运势:{" "}
                                <span className={horoscopeDetail.content.includes("失败") || horoscopeDetail.content.includes("出错") ? 'text-red-500' : 'text-sky-600 dark:text-sky-400' }>
                                    {horoscopeDetail.content}
                                </span>
                            </p>
                            {showRetryButton && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={onRetry}
                                    disabled={isRetrying} 
                                >
                                    <RefreshCw className="mr-1 h-3 w-3" /> 
                                    重试
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div>
                        <p>请选择一个星座查看运势。</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="mt-2"
                        >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            加载星座运势
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { DictumItem } from "@/services/tianapi";

interface QuoteCardProps {
    quote: DictumItem | null;
    isLoading: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, isLoading }) => {
    return (
        <Card className="shadow-lg dark:bg-slate-800">
            <CardHeader>
                <CardTitle className="text-lg">名人名言</CardTitle>
            </CardHeader>
            <CardContent className="text-sm italic min-h-[60px]">
                {isLoading ? (
                    <p className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        名言加载中...
                    </p>
                ) : quote ? (
                    <>
                        <p>"{quote.content}"</p>
                        <p className="text-right">- {quote.mrname}</p>
                    </>
                ) : (
                    <p>今日名言加载失败或暂无数据。</p>
                )}
            </CardContent>
        </Card>
    );
}; 
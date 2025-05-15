import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBingDailyImage, getBingImageUrl, type BingDailyImageData } from "@/services/bingImage";
import { Loader2, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BingImageCard = () => {
  const [imageData, setImageData] = useState<BingDailyImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const fetchImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!fallbackMode) {
        // 尝试使用代理服务获取
        const data = await fetchBingDailyImage();
        setImageData(data);
      } else {
        // 备选方案：直接使用第三方API
        const response = await fetch("https://bingw.jasonzeng.dev/?format=json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 转换数据格式以匹配我们的接口
        setImageData({
          images: [{
            startdate: data.startdate,
            fullstartdate: data.startdate,
            enddate: data.startdate,
            url: data.url,
            urlbase: data.urlbase,
            copyright: data.copyright,
            copyrightlink: "#",
            title: data.title || "必应每日一图",
            quiz: "",
            wp: true,
            hsh: "",
            drk: 0,
            top: 0,
            bot: 0
          }],
          tooltips: {
            loading: "",
            previous: "",
            next: "",
            walle: "",
            walls: ""
          }
        });
      }
    } catch (err) {
      console.error(err);
      if (!fallbackMode) {
        // 如果主API失败，切换到备选方案
        setFallbackMode(true);
        fetchImage(); // 重试
      } else {
        setError("获取必应每日一图失败");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  const handleRetry = () => {
    fetchImage();
  };

  const currentImage = imageData?.images?.[0];
  const imageUrl = fallbackMode 
    ? (currentImage?.url || "") 
    : (currentImage ? getBingImageUrl(currentImage.urlbase) : "");
  const imageTitle = currentImage?.title || "";
  const imageCopyright = currentImage?.copyright || "";
  const copyrightLink = currentImage?.copyrightlink || "";

  return (
    <Card className="shadow-lg overflow-hidden dark:bg-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">必应每日一图</CardTitle>
        {!isLoading && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRetry}
            title="刷新"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 min-h-[200px]">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>加载中...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="relative aspect-video">
              <img 
                src={imageUrl} 
                alt={imageTitle} 
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => {
                  if (!fallbackMode) {
                    setFallbackMode(true);
                    fetchImage();
                  } else {
                    setError("图片加载失败");
                  }
                }}
              />
              {fallbackMode && <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">备选源</div>}
            </div>
            <div className="p-4">
              <h3 className="font-medium">{imageTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">{imageCopyright}</p>
              {copyrightLink && copyrightLink !== "#" && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => window.open(copyrightLink, "_blank")}
                  >
                    了解更多 <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
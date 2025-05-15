import { useEffect, useState } from "react";
import { fetchBingDailyImage, getBingImageUrl, type BingDailyImageData } from "@/services/bingImage";
import { Loader2, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BingImageBackgroundProps {
  children: React.ReactNode;
}

export const BingImageBackground: React.FC<BingImageBackgroundProps> = ({ children }) => {
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

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
        <div className="opacity-0">{children}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        {children}
        <div className="absolute top-2 right-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="bg-white/80 dark:bg-slate-800/80"
          >
            <RefreshCcw className="mr-2 h-3 w-3" />
            重试加载背景
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-4 rounded-lg overflow-hidden shadow-md" style={{ minHeight: "180px" }}>
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url(${imageUrl})`,
        }}
        aria-hidden="true"
      />
      
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" aria-hidden="true" />
      
      {/* 实际内容 */}
      <div className="relative">{children}</div>
      
      {/* 刷新按钮 - 放在右上角 */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleRetry}
        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white"
        title="刷新背景"
      >
        <RefreshCcw className="h-3 w-3" />
      </Button>
      
      {/* 图片信息 - 半透明放在底部 */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-2 text-sm flex items-center justify-between">
        <div className="truncate mr-2">
          <span className="font-medium text-xs">{imageTitle}</span>
          <span className="text-xs ml-2 opacity-80">{imageCopyright}</span>
        </div>
        {copyrightLink && copyrightLink !== "#" && (
          <Button 
            variant="ghost"
            size="sm" 
            className="text-xs shrink-0 text-white hover:text-white hover:bg-white/20 py-1 h-auto"
            onClick={() => window.open(copyrightLink, "_blank")}
          >
            了解更多 <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
"use client";

import { useEffect, useState, useRef } from "react";
import calendar from "js-calendar-converter";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

import { getDaysUntil } from "@/lib/dateUtils";
import { useFortuneData } from "@/hooks/useFortuneData";

import { DateInfoCard } from "@/components/features/DailyFortune/DateInfoCard";
import { HoroscopeSection } from "@/components/features/DailyFortune/HoroscopeSection";
import { QuoteCard } from "@/components/features/DailyFortune/QuoteCard";
import { CountdownCard } from "@/components/features/DailyFortune/CountdownCard";
import { BingImageCard, BingImageBackground } from "@/components/features/BingWallpaper";

export default function HomePage() {
  const [gregorianDate, setGregorianDate] = useState("");
  const [lunarDateFull, setLunarDateFull] = useState("");
  const [daysTo1st, setDaysTo1st] = useState(0);
  const [daysTo15th, setDaysTo15th] = useState(0);
  const [daysTo25th, setDaysTo25th] = useState(0);
  const [daysTo30th, setDaysTo30th] = useState(0);

  const exportRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLDivElement>(null);

  const {
    lunarFortuneData,
    selectedHoroscopeDetail,
    isLoadingInitial,
    isRetryingSingle,
    error: fortuneError,
    selectedAstroEng,
    setSelectedAstroEng,
    retrySingleSelectedHoroscope,
    getInitialConstellationByDate,
    quoteData,
    isLoadingQuote,
    allHoroscopesData,
  } = useFortuneData();

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    setGregorianDate(`${year}年${month}月${day}日`);
    const lunarData = calendar.solar2lunar(year, month, day);
    const lunarDateStr = `${lunarData.gzYear}年 ${lunarData.IMonthCn}${lunarData.IDayCn} (${lunarData.Animal}年)`;
    setLunarDateFull(lunarDateStr);

    setDaysTo1st(getDaysUntil(1, year, month, day));
    setDaysTo15th(getDaysUntil(15, year, month, day));
    setDaysTo25th(getDaysUntil(25, year, month, day));
    setDaysTo30th(getDaysUntil(30, year, month, day));
  }, [getInitialConstellationByDate, setSelectedAstroEng]);

  const handleAstroChange = (eng: string) => {
    console.log("选择星座:", eng);
    console.log("当前星座数据:", selectedHoroscopeDetail);
    console.log("所有星座数据:", allHoroscopesData);
    setSelectedAstroEng(eng);
  };

  const handleExportImage = () => {
    if (exportRef.current === null) return;
    if (exportButtonRef.current) exportButtonRef.current.style.display = "none";
    toPng(exportRef.current, {
      cacheBust: true,
      backgroundColor: document.body.classList.contains("dark") ? "#1e293b" : "#f8fafc",
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "摸鱼日报.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error("Image export error:", err))
      .finally(() => {
        if (exportButtonRef.current) exportButtonRef.current.style.display = "block";
      });
  };

  if (isLoadingInitial) {
    return (
      <div className="mobile-screen-ratio flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
        <p className="ml-4 text-slate-500">日报加载中...</p>
      </div>
    );
  }

  return (
    <div
      className="mobile-screen-ratio bg-slate-50 dark:bg-slate-900 p-4 space-y-4 text-slate-800 dark:text-slate-200 min-h-screen"
      ref={exportRef}
    >
      <BingImageBackground>
        <header className="text-center py-16">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            摸鱼日报
          </h1>
          {fortuneError && <p className="text-red-300 text-sm mt-2 drop-shadow-md">错误: {fortuneError}</p>}
        </header>
      </BingImageBackground>

      <DateInfoCard 
        gregorianDate={gregorianDate}
        lunarDateFull={lunarDateFull}
        lunarFortuneData={lunarFortuneData}
        isLoading={lunarFortuneData === null}
      />

      <HoroscopeSection 
        selectedAstroEng={selectedAstroEng}
        onAstroChange={handleAstroChange}
        horoscopeDetail={selectedHoroscopeDetail}
        isLoading={isLoadingInitial}
        isRetrying={isRetryingSingle}
        onRetry={retrySingleSelectedHoroscope}
      />

      <QuoteCard quote={quoteData} isLoading={isLoadingQuote} />

      <CountdownCard 
        daysTo1st={daysTo1st}
        daysTo15th={daysTo15th}
        daysTo25th={daysTo25th}
        daysTo30th={daysTo30th}
      />

      <div ref={exportButtonRef} className="pt-4">
        <Button
          onClick={handleExportImage}
          className="w-full dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          <Download className="mr-2 h-4 w-4" /> 
          导出为图片
        </Button>
      </div>
    </div>
  );
}


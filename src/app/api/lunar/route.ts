import { NextResponse } from "next/server";
import { fetchTianApiLunar } from "@/services/tianapi"; // 假设服务函数路径正确
import { CACHE_EXPIRY_DURATION } from "@/constants";

interface LunarCache {
  data: any;
  timestamp: number;
  dateString: string;
}

// 简单的内存缓存
let lunarCache: LunarCache | null = null;

function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
}

export async function GET() {
  const todayDateString = getTodayDateString();
  console.log("API Route: /api/lunar called for date:", todayDateString);

  // 检查缓存
  if (
    lunarCache &&
    lunarCache.dateString === todayDateString &&
    Date.now() - lunarCache.timestamp < CACHE_EXPIRY_DURATION
  ) {
    console.log("API Route: /api/lunar - Returning cached data");
    return NextResponse.json(lunarCache.data);
  }

  console.log("API Route: /api/lunar - Fetching new data");
  try {
    const lunarApiData = await fetchTianApiLunar(todayDateString); // 传入日期参数

    if (lunarApiData.code === 200 && lunarApiData.result) {
      const responseData = {
        text: `宜：${lunarApiData.result.fitness} \\n忌：${lunarApiData.result.taboo}`,
        raw: lunarApiData.result, // 可以选择也缓存原始数据
      };
      // 更新缓存
      lunarCache = {
        data: responseData,
        timestamp: Date.now(),
        dateString: todayDateString,
      };
      console.log("API Route: /api/lunar - Data fetched and cached", responseData);
      return NextResponse.json(responseData);
    } else {
      console.error("API Route: /api/lunar - Error fetching lunar data from TianAPI:", lunarApiData);
      return NextResponse.json(
        { error: `农历运势获取失败: ${lunarApiData.msg || "未知错误"}` },
        { status: lunarApiData.code === 200 ? 500 : lunarApiData.code || 500 }
      );
    }
  } catch (error) {
    console.error("API Route: /api/lunar - Exception fetching lunar data:", error);
    return NextResponse.json(
      { error: "服务器获取农历运势时发生内部错误" },
      { status: 500 }
    );
  }
} 
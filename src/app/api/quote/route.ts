import { NextResponse } from "next/server";
import { fetchRandomQuote, type DictumItem } from "@/services/tianapi.ts";
import { CACHE_EXPIRY_DURATION } from "@/constants";

interface QuoteAPICache {
  data: DictumItem;
  timestamp: number;
  dateString: string;
}

// 简单的内存缓存
let quoteApiCache: QuoteAPICache | null = null;

function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
}

export async function GET() {
  const todayDateString = getTodayDateString();
  console.log("API Route: /api/quote called for date:", todayDateString);

  // 检查缓存
  // 名言每日更新一次即可，所以主要检查 dateString
  if (
    quoteApiCache &&
    quoteApiCache.dateString === todayDateString &&
    Date.now() - quoteApiCache.timestamp < CACHE_EXPIRY_DURATION // 保留时间戳检查以防万一
  ) {
    console.log("API Route: /api/quote - Returning cached data");
    return NextResponse.json(quoteApiCache.data);
  }

  console.log("API Route: /api/quote - Fetching new data");
  try {
    // 注意：fetchRandomQuote 可能需要 API key，这里我们假设它在服务器环境变量中配置
    // 或者服务函数内部能处理（例如，如果 tianapi.ts 中的服务函数配置了全局KEY）
    const apiKey = process.env.TIANAPI_KEY; // 从环境变量获取 API Key
    if (!apiKey) {
        console.error("API Route: /api/quote - TIANAPI_KEY is not set in environment variables.");
        return NextResponse.json(
            { error: "服务器API Key未配置" },
            { status: 500 }
        );
    }

    const quoteApiData = await fetchRandomQuote(apiKey);

    if (quoteApiData.code === 200 && quoteApiData.result?.list?.length > 0) {
      const fetchedQuote = quoteApiData.result.list[0];
      // 更新缓存
      quoteApiCache = {
        data: fetchedQuote,
        timestamp: Date.now(),
        dateString: todayDateString,
      };
      console.log("API Route: /api/quote - Data fetched and cached", fetchedQuote);
      return NextResponse.json(fetchedQuote);
    } else {
      console.error("API Route: /api/quote - Error fetching quote from TianAPI:", quoteApiData);
      const errorMsg = quoteApiData.msg || "未能获取到名言数据";
      // 根据天行API的错误码来决定返回的status
      const status = quoteApiData.code === 200 ? 500 : quoteApiData.code || 500; 
      return NextResponse.json(
        { error: `名言获取失败: ${errorMsg}` },
        { status }
      );
    }
  } catch (error) {
    console.error("API Route: /api/quote - Exception fetching quote data:", error);
    return NextResponse.json(
      { error: "服务器获取名言时发生内部错误" },
      { status: 500 }
    );
  }
} 
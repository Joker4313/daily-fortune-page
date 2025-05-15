import { NextResponse } from "next/server";
import { fetchTianApiHoroscope, type HoroscopeItem } from "@/services/tianapi";
import { CONSTELLATIONS_LIST, type ConstellationInfo } from "@/lib/fortuneUtils";
import { CACHE_EXPIRY_DURATION } from "@/constants";

// --- Types for Cache ---
interface CachedHoroscopeData {
  name: string;
  content: string;
  apiForecastDate: string;
}

interface AllHoroscopesAPICache {
  fetchAttemptDate: string;
  horoscopes: {
    [constellationEng: string]: CachedHoroscopeData | undefined;
  };
}

// 简单的内存缓存
let horoscopesApiCache: AllHoroscopesAPICache | null = null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
}

// 后端获取单个星座数据的逻辑，类似前端的 fetchAndCacheSingleHoroscope
async function fetchHoroscopeForAstro(
  astroDef: ConstellationInfo,
  dateString: string,
  maxRetries = 1, // 后端重试次数可以少一些，或者由前端触发整体重试
  retryBaseDelayMs = 500
): Promise<CachedHoroscopeData | undefined> {
  let retries = 0;
  let success = false;
  let finalDataForAstro: CachedHoroscopeData | undefined;

  while (retries <= maxRetries && !success) {
    try {
      if (retries > 0) await delay(retryBaseDelayMs * retries);
      const horoscopeApiData = await fetchTianApiHoroscope(
        astroDef.eng,
        dateString
      );

      if (horoscopeApiData.code === 200) {
        if (horoscopeApiData.result && horoscopeApiData.result.list) {
          const overview = horoscopeApiData.result.list.find(
            (item: HoroscopeItem) => item.type === "今日概述"
          );
          const apiForecastDate = overview?.date || dateString;
          if (overview) {
            finalDataForAstro = {
              name: astroDef.name,
              content: overview.content,
              apiForecastDate,
            };
          } else {
            finalDataForAstro = {
              name: astroDef.name,
              content: "当日数据暂未更新",
              apiForecastDate: dateString,
            };
          }
          success = true;
        } else {
          finalDataForAstro = {
            name: astroDef.name,
            content: "运势数据格式错误",
            apiForecastDate: dateString,
          };
          break; 
        }
      } else if (horoscopeApiData.code === 130) { // 频率限制
        if (retries < maxRetries) {
          console.warn(
            `API Route: /api/horoscopes - Rate limit (130) for ${astroDef.eng}, attempt ${retries + 1}. Retrying...`
          );
          retries++;
        } else {
          finalDataForAstro = {
            name: astroDef.name,
            content: `运势获取失败 (频率超限): ${horoscopeApiData.msg || "已达最大重试次数"}`,
            apiForecastDate: dateString,
          };
          break;
        }
      } else {
        finalDataForAstro = {
          name: astroDef.name,
          content: `运势获取失败 (代码: ${horoscopeApiData.code}): ${horoscopeApiData.msg || "未知API错误"}`,
          apiForecastDate: dateString,
        };
        break;
      }
    } catch (error) {
      if (retries < maxRetries) {
        console.warn(
          `API Route: /api/horoscopes - Network error for ${astroDef.eng}, attempt ${retries + 1}. Retrying...`,
          error
        );
        retries++;
      } else {
        finalDataForAstro = {
          name: astroDef.name,
          content: "运势加载出错 (网络问题)",
          apiForecastDate: dateString,
        };
        break;
      }
    }
  }
  return finalDataForAstro;
}

export async function GET() {
  const todayDateString = getTodayDateString();
  console.log(
    "API Route: /api/horoscopes called for date:",
    todayDateString
  );

  // 检查缓存
  if (
    horoscopesApiCache &&
    horoscopesApiCache.fetchAttemptDate === todayDateString &&
    Date.now() - new Date(horoscopesApiCache.fetchAttemptDate).getTime() < CACHE_EXPIRY_DURATION // 更准确的基于日期的缓存检查
  ) {
    console.log("API Route: /api/horoscopes - Returning cached data");
    return NextResponse.json(horoscopesApiCache.horoscopes);
  }

  console.log("API Route: /api/horoscopes - Fetching new data for all horoscopes");
  const newHoroscopesToCache: AllHoroscopesAPICache["horoscopes"] = {};
  let anErrorOccurred = false;

  for (const astroDef of CONSTELLATIONS_LIST) {
    // 天行API对星座接口有频率限制，每秒不超过1次
    // 此处增加延时，可以根据实际情况调整
    await delay(1100); // 略大于1秒，以确保不超过限制
    console.log(
      `API Route: /api/horoscopes - Fetching for ${astroDef.name} (${astroDef.eng})`
    );
    const data = await fetchHoroscopeForAstro(astroDef, todayDateString);
    if (data) {
      newHoroscopesToCache[astroDef.eng] = data;
    } else {
      // 如果单个星座获取失败，可以记录下来，或者返回一个错误状态
      // 为简单起见，这里我们仍然缓存获取到的部分，但前端可能需要处理不完整数据
      newHoroscopesToCache[astroDef.eng] = {
        name: astroDef.name,
        content: "获取失败，请稍后重试",
        apiForecastDate: todayDateString,
      };
      anErrorOccurred = true; // 标记发生了错误
    }
  }

  // 更新缓存
  horoscopesApiCache = {
    fetchAttemptDate: todayDateString,
    horoscopes: newHoroscopesToCache,
  };
  console.log(
    "API Route: /api/horoscopes - Data fetched and cached",
    newHoroscopesToCache
  );

  if (anErrorOccurred) {
    console.warn("API Route: /api/horoscopes - Some horoscope data might be missing or failed to fetch.");
    // 即使部分失败，也返回已获取的数据和缓存
    // 前端可以根据内容判断是否显示错误信息
  }

  return NextResponse.json(newHoroscopesToCache);
} 
export interface BingDailyImageData {
  images: {
    startdate: string;
    fullstartdate: string;
    enddate: string;
    url: string;
    urlbase: string;
    copyright: string;
    copyrightlink: string;
    title: string;
    quiz: string;
    wp: boolean;
    hsh: string;
    drk: number;
    top: number;
    bot: number;
  }[];
  tooltips: {
    loading: string;
    previous: string;
    next: string;
    walle: string;
    walls: string;
  };
}

/**
 * 获取必应每日一图数据
 * @param idx 图片索引，0表示今天，1表示昨天，以此类推
 * @param n 返回的图片数量，最大为8
 * @param mkt 地区设置，默认为zh-CN
 * @returns 必应每日一图数据
 */
export const fetchBingDailyImage = async (
  idx: number = 0,
  n: number = 1,
  mkt: string = "zh-CN"
): Promise<BingDailyImageData> => {
  // 使用代理服务器解决CORS问题
  const proxyUrl = "https://proxy.corsfix.com/?";
  const bingUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=${n}&mkt=${mkt}`;
  const url = proxyUrl + encodeURIComponent(bingUrl);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as BingDailyImageData;
  } catch (error) {
    console.error("获取必应每日一图失败:", error);
    throw error;
  }
};

/**
 * 获取完整的必应图片URL
 * @param urlbase 必应图片的基础URL
 * @param resolution 图片分辨率，默认为1920x1080
 * @returns 完整的图片URL
 */
export const getBingImageUrl = (urlbase: string, resolution: string = "1920x1080"): string => {
  return `https://www.bing.com${urlbase}_${resolution}.jpg`;
}; 
export interface IReportsStats {
  growthRate: number;
  avgBookingValue: number;
  conversionRate: number;
  retentionRate: number;
}

export interface IUserGrowthPoint {
  month: string;
  totalUsers: number;
  activeUsers: number;
}

export interface IBookingPatternPoint {
  hour: string;
  bookings: number;
}

export interface IRevenueByCategoryPoint {
  month: string;
  boats: number;
  aircraft: number;
  land: number;
}

export interface ICategorySplitItem {
  category: string;
  percentage: number;
}

export interface IGeographicPerformanceItem {
  region: string;
  bookings: number;
  revenue: number;
}

export interface ITopPerformingItem {
  name: string;
  rank: number;
  revenue: number;
}

export interface ITopPerforming {
  boats: ITopPerformingItem[];
  aircraft: ITopPerformingItem[];
}

export interface IReportsAnalyticsData {
  stats: IReportsStats;
  userGrowth: IUserGrowthPoint[];
  bookingPatterns: IBookingPatternPoint[];
  revenueByCategory: IRevenueByCategoryPoint[];
  categorySplit: ICategorySplitItem[];
  geographicPerformance: IGeographicPerformanceItem[];
  topPerforming: ITopPerforming;
}

export interface IGetReportsAnalyticsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IReportsAnalyticsData;
}

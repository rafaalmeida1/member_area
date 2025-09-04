export interface ClicksByDate {
  date: string;
  clicks: number;
  uniqueClicks: number;
}

export interface ViewsByDate {
  date: string;
  views: number;
  uniqueViews: number;
}

export interface LinkAnalytics {
  linkId: number;
  linkTitle: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: ClicksByDate[];
  clicksByCountry: Record<string, number>;
  clicksByDevice: Record<string, number>;
  clicksByBrowser: Record<string, number>;
  lastClickAt?: string;
}

export interface UserActivity {
  userId: number;
  userName: string;
  userEmail: string;
  totalClicks: number;
  totalViews: number;
  lastActivityAt: string;
}

export interface PageAnalytics {
  professionalId: number;
  totalViews: number;
  uniqueViews: number;
  totalClicks: number;
  averageSessionDuration: number;
  viewsByDate: ViewsByDate[];
  viewsByCountry: Record<string, number>;
  viewsByDevice: Record<string, number>;
  viewsByBrowser: Record<string, number>;
  topLinks: LinkAnalytics[];
  authenticatedUsers: UserActivity[];
  lastViewAt?: string;
}

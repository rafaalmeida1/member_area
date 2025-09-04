export type LinkType = 
  | 'SOCIAL_MEDIA'
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'PHONE'
  | 'YOUTUBE'
  | 'LINKEDIN'
  | 'FACEBOOK'
  | 'TIKTOK'
  | 'INSTAGRAM'
  | 'TWITTER'
  | 'TELEGRAM'
  | 'CUSTOM';

export interface PublicLink {
  id: number;
  title: string;
  description?: string;
  url: string;
  linkType: LinkType;
  icon?: string;
  whatsappMessage?: string;
  displayOrder: number;
}

export interface PublicLinksData {
  professionalId: number;
  name: string;
  title?: string;
  bio?: string;
  image?: string;
  backgroundImage?: string;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeBackgroundColor?: string;
  themeSurfaceColor?: string;
  themeTextPrimaryColor?: string;
  themeTextSecondaryColor?: string;
  themeBorderColor?: string;
  themeHoverColor?: string;
  themeDisabledColor?: string;
  links: PublicLink[];
}

export interface LinkRequest {
  title: string;
  description?: string;
  url: string;
  linkType: LinkType;
  icon?: string;
  whatsappMessage?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface LinkResponse extends LinkRequest {
  id: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderLinksRequest {
  linkIds: number[];
}

export interface LinkPageProfileRequest {
  displayName?: string;
  displayBio?: string;
  displayTitle?: string;
  displayImageUrl?: string;
  backgroundImageUrl?: string;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  
  // Cores da página
  pagePrimaryColor?: string;
  pageSecondaryColor?: string;
  pageBackgroundColor?: string;
  pageSurfaceColor?: string;
  pageTextPrimaryColor?: string;
  pageTextSecondaryColor?: string;
  pageBorderColor?: string;
  pageHoverColor?: string;
  
  useSiteColors?: boolean;
  
  // Configurações de exibição
  showProfileImage?: boolean;
  showTitle?: boolean;
  showBio?: boolean;
  showBranding?: boolean;
  customBrandingText?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Acesso
  isPublic?: boolean;
  passwordProtected?: boolean;
  accessPassword?: string;
}

export interface LinkPageProfileResponse {
  id: number;
  displayName?: string;
  displayBio?: string;
  displayTitle?: string;
  displayImageUrl?: string;
  backgroundImageUrl?: string;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  
  // Cores da página
  pagePrimaryColor?: string;
  pageSecondaryColor?: string;
  pageBackgroundColor?: string;
  pageSurfaceColor?: string;
  pageTextPrimaryColor?: string;
  pageTextSecondaryColor?: string;
  pageBorderColor?: string;
  pageHoverColor?: string;
  
  useSiteColors?: boolean;
  
  // Configurações de exibição
  showProfileImage?: boolean;
  showTitle?: boolean;
  showBio?: boolean;
  showBranding?: boolean;
  customBrandingText?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Acesso
  isPublic?: boolean;
  passwordProtected?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

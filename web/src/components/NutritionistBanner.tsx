import bannerImage from '@/assets/nutritionist-banner.jpg';
import './NutritionistBanner.css';

interface ProfessionalData {
  name: string;
  title: string;
  bio?: string;
  image?: string;
  backgroundImage?: string;
  specialties: string[];
}

interface NutritionistBannerProps {
  professional?: ProfessionalData;
  isLoading?: boolean;
}

export function NutritionistBanner({ professional, isLoading = false }: NutritionistBannerProps) {
  const getBackgroundStyle = () => {
    const imageUrl = professional?.backgroundImage || bannerImage;
    
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  };

  return (
    <div className="nutritionist-banner">
      {/* Background Image */}
      <div 
        className="banner-background"
        style={getBackgroundStyle()}
      >
        <div className="banner-overlay" />
      </div>
      
      {/* Content */}
      <div className="banner-content">
        <div className="banner-text">
          {isLoading ? (
            <div className="banner-loading">
              <div className="loading-skeleton title-skeleton"></div>
              <div className="loading-skeleton subtitle-skeleton"></div>
              <div className="loading-skeleton text-skeleton"></div>
              <div className="loading-skeleton badges-skeleton"></div>
            </div>
          ) : (
            <>
              <h1 className="banner-title">
                {professional?.name || 'Nutricionista'}
              </h1>
              <p className="banner-subtitle">
                {professional?.title || 'Especialista em Nutrição'}
              </p>
              {professional?.bio && (
                <p className="banner-bio">
                  {professional.bio}
                </p>
              )}
              
              {/* Specialties */}
              {professional?.specialties && professional.specialties.length > 0 && (
                <div className="banner-specialties">
                  {professional.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="specialty-badge"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
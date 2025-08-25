import backgroundImage from '@/assets/ImagemBackgroundLogin.png';
import './NutritionistBanner.css';

export default function NutriotinistImage() {
  return (
    <div className="login-background max-h-screen">
        <div className="background-image w-full h-full flex items-end justify-center">
        <img src={backgroundImage} alt="Background" className=" object-contain" width={550} />
        </div>
    </div>
  );
}
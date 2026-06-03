import { useState, useEffect } from 'react';

interface HeroSlideshowProps {
  images: string[];
  interval?: number;       
  overlayOpacity?: string; 
}

export default function HeroSlideshow({
  images,
  interval = 5000,
  overlayOpacity = 'bg-gray-950/75',
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <>
      {images.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${img}')`,
            opacity: i === currentIndex ? 1 : 0,
          }}
        />
      ))}
      <div className={`absolute inset-0 -z-10 ${overlayOpacity}`} />
    </>
  );
}
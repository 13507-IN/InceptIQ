import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselImage {
  id: number;
  url: string;
  alt: string;
  title: string;
  description: string;
}

interface ImageCarouselProps {
  isInvestor?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ isInvestor = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const images: CarouselImage[] = isInvestor
    ? [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
          alt: 'Investors discussing',
          title: 'Connect with Founders',
          description: 'Discover promising startups and investment opportunities'
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca88495?w=800&h=600&fit=crop',
          alt: 'Business meeting',
          title: 'Grow Your Portfolio',
          description: 'Build a diversified investment portfolio with curated deals'
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884988?w=800&h=600&fit=crop',
          alt: 'Data analytics',
          title: 'Smart Analytics',
          description: 'Make data-driven investment decisions with our insights'
        },
        {
          id: 4,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
          alt: 'Success celebration',
          title: 'Successful Exits',
          description: 'Join a community of successful angel investors and VCs'
        }
      ]
    : [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
          alt: 'Startup innovation',
          title: 'Validate Your Ideas',
          description: 'Get actionable insights to perfect your business concept'
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca88495?w=800&h=600&fit=crop',
          alt: 'Team collaboration',
          title: 'Build with Community',
          description: 'Connect with mentors and investor community'
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884988?w=800&h=600&fit=crop',
          alt: 'Growth chart',
          title: 'Scale Your Business',
          description: 'Track progress and access resources to grow faster'
        },
        {
          id: 4,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
          alt: 'Success story',
          title: 'Launch Successfully',
          description: 'Join hundreds of successful entrepreneurs'
        }
      ];

  // Auto-scroll on hover
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [autoPlay, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  return (
    <div 
      className="relative w-full h-full rounded-2xl overflow-hidden group"
      onMouseEnter={() => setAutoPlay(true)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Images Container */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0 }}
            transition={{ duration: 1 }}
            style={{ pointerEvents: index === currentIndex ? 'auto' : 'none' }}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent opacity-60"></div>
          </motion.div>
        ))}
      </div>

      {/* Content Overlay */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6 z-10"
      >
        <h3 className="text-3xl font-bold mb-2">{images[currentIndex].title}</h3>
        <p className="text-lg text-sand-200">{images[currentIndex].description}</p>
      </motion.div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8 h-2'
                : 'bg-white/40 w-2 h-2 hover:bg-white/70'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;

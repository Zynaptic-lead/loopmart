import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { motion } from 'framer-motion'
import 'swiper/css'

const banners = [
  '/banners/banner1.jpg',
  '/banners/banner2.avif',
  '/banners/banner3.avif',
  '/banners/banner4.avif',
  '/banners/banner5.avif',
]

export default function BannerCarousel() {
  return (
    <section className="relative w-full overflow-hidden pt-16 md:pt-0">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className="relative w-full h-[18vh] sm:h-[30vh] md:h-[45vh] lg:h-[55vh]"
      >
        {banners.map((src, i) => (
          <SwiperSlide key={i}>
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
              className="relative w-full h-full flex items-center justify-center bg-gray-100"
            >
              <img
                src={src}
                alt={`Loopmart Banner ${i + 1}`}
                className="w-full h-full object-contain md:object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Not+Found';
                }}
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
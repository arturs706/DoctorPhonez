import React, { useState, useEffect, useRef} from 'react';
import styles from './testimonials.module.css'
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper";
import Image from 'next/image';


export default function Testimonials() {
  const swiperRef = useRef(null);

  return ( 
    <div className={styles.swipertestdiv}>
      <div className="previousButton" onClick={() => swiperRef.current.swiper.slidePrev()}>
      </div>
      <Swiper 
      navigation={true} 
      modules={[Navigation]} 
      ref={swiperRef}
      slidesPerView={1}
      loop = {true}
      breakpoints={{
        1920: {
          width: 1920,
          slidesPerView: 1,
          },
        1450: {
          width: 1450,
          slidesPerView: 1,
          },
        1200: {
          width: 1200,
          slidesPerView: 1,
          },
        1024: {
          width: 1024,
          slidesPerView: 1,
          },
        900: {
          width: 900,
          slidesPerView: 1,
          },
        768: {
          width: 768,
          slidesPerView: 1,
          },
        500: {
          width: 500,
          slidesPerView: 1,
          },
        400: {
          width: 400,
          slidesPerView: 1,
          },
        320: {
          width: 320,
          slidesPerView: 1,
          },


    }}
      >
              <SwiperSlide>
                
              </SwiperSlide>


      </Swiper>
        <div className="nextButton" onClick={() => swiperRef.current.swiper.slideNext()}>
          <Image
            className={styles.arrowright}
            src="https://res.cloudinary.com/dttaprmbu/image/upload/v1677960910/arrowright_tpil92.svg"
            alt="arrow-next"
            width={50}
            height={37}
          />
        </div>
  </div>
  ) 
}


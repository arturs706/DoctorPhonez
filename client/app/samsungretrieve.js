import React, { useState, useEffect, useRef} from 'react';
import styles from './appleretrieve.module.css'
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper";
import Image from 'next/image';
import Link from 'next/link';

export default function Samsungretrieve() {
  const [data, setData] = useState(null);
  const swiperRef = useRef(null);


  useEffect(() => {
    async function fetchData() {
      try {
        
        const response = await fetch('http://localhost:10010/api/v1/products/mobilephones/samsung', { mode: 'cors' });
        const data = await response.json();
        console.log(data.product);

        setData(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return ( 
 
    <div className={styles.swiperdiv}>
      <div className="previousButton" onClick={() => swiperRef.current.swiper.slidePrev()}>
        <Image
          className={styles.arrowleft}
          src="https://res.cloudinary.com/dttaprmbu/image/upload/v1677960910/arrowleft_bxtl9u.svg"
          alt="prev-arrow"
          width={50}
          height={37}
        />
      </div>
      <Swiper 
      navigation={true} 
      modules={[Navigation]} 
      className={`${styles.myswiperr} custom-slide`}
      ref={swiperRef}
      slidesPerView={3}
      spaceBetween={10}
      loop = {true}
      breakpoints={{
        1920: {
          width: 1920,
          slidesPerView: 4,
          },
        1450: {
          width: 1450,
          slidesPerView: 3,
          },
        1200: {
          width: 1200,
          slidesPerView: 3,
          },
        1024: {
          width: 1024,
          slidesPerView: 2,
          },
        900: {
          width: 900,
          slidesPerView: 2,
          },
        768: {
          width: 768,
          slidesPerView: 2,
          spaceBetween: 20,
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
            {data.product.map((item, index) => (
              <SwiperSlide key={index}>
              <Link href="/products/[category]/[brand]/[id]" as={`/products/${item.category}/${item.brand}/${item.productid}`}>
                <Image
                  src={item.imageone}
                  alt="Picture of the author"
                  width={245}
                  height={280}
                  quality={100}
                />
                </Link>
              </SwiperSlide>
            ))}


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


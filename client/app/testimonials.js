import React, { useState, useEffect, useRef} from 'react';
import styles from './testimonials.module.css'
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation } from "swiper";
import Image from 'next/image';


const testimonials = [
    {
    id: 1,
    name: 'Emily Johnson',
    quote: 'I had an amazing experience with this company. The customer service was outstanding and the product exceeded my expectations. Highly recommend!',
    rate: 5,
    date: '2022-01-15'
    },
    {
    id: 2,
    name: 'Michael Lee',
    quote: 'I was impressed by the quick response time and excellent service provided by this company. They went above and beyond to ensure my satisfaction. Would definitely use again!',
    rate: 4,
    date: '2022-02-05'
    },
    {
    id: 3,
    name: 'Sarah Davis',
    quote: 'I had a great experience with this company. The staff was friendly, helpful and knowledgeable. The product was of high quality and arrived quickly. Highly recommend!',
    rate: 5,
    date: '2022-03-01'
    },
    {
    id: 4,
    name: 'David Johnson',
    quote: 'I had an average experience with this company. The product was good, but the customer service could have been better. Overall, satisfied with my purchase.',
    rate: 3,
    date: '2022-03-05'
    },
    {
    id: 5,
    name: 'Jessica Lee',
    quote: 'I had an excellent experience with this company. The staff was professional and the product was of high quality. Would definitely recommend to others!',
    rate: 5,
    date: '2022-04-10'
    },
    {
    id: 6,
    name: 'Ryan Davis',
    quote: 'I had a decent experience with this company. The product was good, but the shipping took longer than expected. Would consider using again.',
    rate: 3,
    date: '2022-05-01'
    },
    {
    id: 7,
    name: 'Amanda Smith',
    quote: 'I had a great experience with this company. The product was exactly what I needed and arrived quickly. The staff was also very helpful and friendly. Highly recommend!',
    rate: 5,
    date: '2022-05-15'
    },
    {
    id: 8,
    name: 'Jacob Lee',
    quote: 'I had a positive experience with this company. The product was good and the customer service was decent. Would consider using again.',
    rate: 4,
    date: '2022-06-01'
    },
    {
    id: 9,
    name: 'Olivia Davis',
    quote: 'I had an excellent experience with this company. The staff was friendly and helpful, and the product was of high quality. Would definitely recommend!',
    rate: 5,
    date: '2022-07-05'
    },
    {
    id: 10,
    name: 'Benjamin Johnson',
    quote: 'I had an average experience with this company. The product was okay, but the customer service could have been better. Overall, satisfied with my purchase.',
    rate: 3,
    date: '2022-08-01'
    },
    {
    id: 11,
    name: 'Sophia Lee',
    quote: 'I had a great experience with this company. The staff was knowledgeable and the product was exactly what I needed. Would definitely use again!',
    rate: 5,
    date: '2022-09-10'
    },
    {
    id: 12,
    name: 'William Davis',
    quote: 'I had an excellent experience with this company. The product was of high quality and the staff was professional and helpful. Shipping was also fast. Highly recommend!',
    rate: 5,
    date: '2022-10-05'
    },
    {
    id: 13,
    name: 'Ella Johnson',
    quote: 'I had a positive experience with this company. The product was good and the customer service was decent. Would consider using again.',
    rate: 4,
    date: '2022-11-01'
    }
]


export default function Testimonials() {
  const swiperRef = useRef(null);

  return ( 
    <div className={styles.swipertestdiv}>
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
      className={`custom-slide-two`}
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
        {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
            <div className={styles.testimonial}>
            <div className={styles.stars}>
                {(() => {
                switch (testimonial.rate) {
                    case 1:
                    return <div className={styles.starwrap}>
                      <h2>Terrible</h2>
                        <Image
                            src="/star_ready_one.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />

                    </div>;
                    case 1.5:
                    return <div className={styles.starwrap}>

                        <h2>Very Poor</h2>
                        <Image
                            src="/star_ready_oneh.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    case 2:
                    return <div className={styles.starwrap}>

                        <h2>Poor</h2>
                        <Image
                            src="/star_ready_two.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    case 2.5:
                    return <div className={styles.starwrap}>

                      <h2>Below Average</h2>
                        <Image
                            src="/star_ready_twoh.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    case 3:
                    return <div className={styles.starwrap}>

                      <h2>Average</h2>
                        <Image
                            src="/star_ready_three.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    case 3.5:
                    return <div className={styles.starwrap}>

                      <h2>Above Average</h2>
                        <Image
                            src="/star_ready_threeh.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    case 4:
                    return <div className={styles.starwrap}>

                      <h2>Good</h2>
                        <Image
                            src="/star_ready_four.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    case 4.5:
                    return <div className={styles.starwrap}>

                      <h2>Very Good</h2>
                        <Image
                            src="/star_ready_fourh.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                        <span>Based on {testimonials.length} reviews</span>
                    </div>;
                    case 5:
                    return <div className={styles.starwrap}>

                      <h2>Excellent</h2>
                        <Image
                            src="/star_ready_five.svg"
                            alt="star"
                            width={226}
                            height={34}
                        />
                    </div>;
                    default:
                    return null;
                }
                })()}
            </div>
            <div className={styles.wrapnamedate}>
              <span>{testimonial.name}</span>
              <span>{testimonial.date}</span>
            </div>
            <span className={styles.textstyles}>{testimonial.quote}</span>
            
            </div>
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


import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './recentitems.module.css'
import gsap from 'https://cdn.skypack.dev/gsap';
import { ScrollTrigger } from 'https://cdn.skypack.dev/gsap/ScrollTrigger';
import Link from 'next/link';

export default function RecentItems() {
  const [data, setData] = useState(null);
  const [widthSize, setWidthSize] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);

  useEffect(() => {
    if (widthSize < 880 && (widthSize !== 0)) {
      setW(355);
      setH(438);
    } else {
      setW(355); 
      setH(438); 
    }
  }, [widthSize]);
    


  //create a function that assigns the screen width to the state so it can be returned
  const handleResize = () => {
    setWidthSize(window.innerWidth);
  }
  //create an event listener that listens for the resize event and calls the handleResize function
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://0.0.0.0:10010/api/v1/products/apple/featured');
        const data = await response.json();
        console.error(data);

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
    <div className={styles.sectionthreediv}>
          {data.products.map((item, index) => (
            <div key={index} className={styles.glassmorphdiv}>
                <div className={styles.imgdiv}>
                    <Image
                        src={item.imagetwo}
                        alt="Picture of the author"
                        width={w}
                        height={h}
                        quality={100}
                        priority={true}
                    />
                    <span>{item.prodname}</span>
                    <span className={styles.pricespan}>{"£"+ item.price}</span>
                    <div className={styles.button}>
                      <Link href="/products/[id]" as={`/products/${item.productid}`}>Check Now</Link>
                    </div>
                </div>
            </div>
    ))}

  </div>
  ) 
}
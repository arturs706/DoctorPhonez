import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './appleretrieve.module.css'


export default function Appleretrieve() {
  const [data, setData] = useState(null);


  useEffect(() => {
    async function fetchData() {
      try {
        
        const response = await fetch('http://0.0.0.0:10010/api/v1/products/apple');
        const data = await response.json();
        console.error(data.Ok[0].result);

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
    // <div className={styles.maindiv}>
    //     {data.Ok[0].result.map((item, index) => (
    //         <div key={index} className={styles.divwrap}>
    //             <div className={styles.imgdiv}>
    //                 <Image
    //                     className={styles.img}
    //                     src={item.imageone}
    //                     alt="Picture of the author"
    //                     width={290}
    //                     height={290}
    //                     quality={100}
    //                     priority={true}
    //                 />
    //             </div>
    //         </div>
    // ))}
    // </div>
    <div className={styles.sectionthreediv}>
          {data.Ok[0].result.map((item, index) => (
            <div key={index} className={styles.glassmorphdiv}>
                <div className={styles.imgdiv}>
                    <Image
                        src={item.imageone}
                        alt="Picture of the author"
                        width={273}
                        height={300}
                        quality={100}
                        layout="intrinsic"
                        priority={true}
                    />
                    <span>{item.prodname}</span>
                    <span>{"£"+ item.price + ".00"}</span>
                    <div className={styles.button}>Check Now</div>
                </div>
            </div>
    ))}

  </div>
  ) 
}
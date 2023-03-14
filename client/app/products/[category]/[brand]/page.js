'use client'
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';


export default function Home() {
  const pathname = usePathname();
  const [dataretrvieved, setDataretrvieved] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const brand = pathname.split("/")[3]
  const categorysplit = pathname.split("/")[2]

  useEffect(() => {
    setLoading(true)
    //fetch data from api using a dynamic path
      fetch(`http://localhost:10010/api/v1/products/${categorysplit}/${brand}`)
      .then(res => res.json())
      .then(data => {
        setDataretrvieved(data)
        setLoading(false)
      })
    
  }, [categorysplit, brand]) 

  if (isLoading) return <div className={styles.pagemaindyn}>Loading...</div>
  if (!dataretrvieved) return <div className={styles.pagemaindyn}>No data</div>
  
  if (dataretrvieved.status === "success") {

    return (
      <div className={styles.pagemaindyn}>
       <h1>Category And Brand</h1>
      </div>
    )
  }
}
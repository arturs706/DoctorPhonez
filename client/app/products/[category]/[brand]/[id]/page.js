'use client'
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux'
import { addToCart } from '../../../../../redux/reducers/cartSlice'

//import redux slice and actions


export default function Home() {
  // const addtoCart = useSelector((state) => state.counter)
  const dispatch = useDispatch()

  const category = usePathname();
  const [dataretrvieved, setDataretrvieved] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const categorysplit = category.split("/")[2]
  const brand = category.split("/")[3]
  const id = category.split("/")[4]
  useEffect(() => {
    setLoading(true)
    //fetch data from api using a dynamic path
      fetch(`http://localhost:10010/api/v1/products/${categorysplit}/${brand}/${id}`)
      .then(res => res.json())
      .then(data => {
        setDataretrvieved(data)
        setLoading(false)
      })
    
  }, [brand, categorysplit, id]) 

  if (isLoading) return <div className={styles.pagemaindyn}>Loading...</div>
  if (!dataretrvieved) return <div className={styles.pagemaindyn}>No data</div>
  
  if (dataretrvieved.status === "success") {

    return (
      <div className={styles.pagemaindyn}>
        <div className={styles.pagemaindyn}>
          <div className={styles.ovalblurdyn}></div>
          <div className={styles.pagedyn}>
          <div className={styles.phoneprice}>          
            <Image 
            src={dataretrvieved.product[0].imagetwo}
            alt="Main image"
            width={354}
            height={438}
          />
          <h2>£{dataretrvieved.product[0].price}</h2>
          </div>
          <div className={styles.descript}>
            <h4>{dataretrvieved.product[0].prodname}</h4>
            <span>{dataretrvieved.product[0].proddescr}</span>
            <div className={styles.descripttwo}>            
              <h2>{dataretrvieved.product[0].memory}</h2>
              <h2>{dataretrvieved.product[0].color}</h2>
            </div>
            <div className={styles.actionbutton} onClick={() => dispatch(addToCart(dataretrvieved.product[0]), console.log(dataretrvieved.product[0].prodname))}>
              Add to cart
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
}
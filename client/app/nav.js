"use client"; // this is a client component 👈🏽
import styles from './nav.module.css'
import Hamburger from './hamburger'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navpage from './navpage';
import Image from 'next/image'
import { useSelector } from 'react-redux'


export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const cart = useSelector(state => state.counter);
    const [totalItems, setTotalItems] = useState(0)
    //total items in cart
    useEffect(() => {
      const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
      setTotalItems(totalItems);
    }, [cart]);




    const handleToggle = () => {
        setIsOpen(!isOpen);
      }
      
    return (
        <div className={styles.nav}>
          <div className={styles.wrapperone}>
            <div className={styles.burger}>
                <Hamburger isOpen={isOpen} handleToggle={handleToggle} />
                {isOpen && <Navpage />}
              <div className={styles.logo}><Link href="/"><h1>Doctor Phonez</h1></Link></div>
            </div>
            <div className={styles.linetwo}>
              <Link href="/"><h3>Home</h3></Link>
              <h3>Tablets</h3>
              <h3>Accessories</h3>
            </div>
          </div>
        <div className={styles.wrappertwo}>
          <div className={styles.logo}>
            <h3 className = {styles.trustpilottext}>See our 13 reviews on</h3>
              <Image className={styles.img} src="/trustpilot.svg" alt="Trustpilot" width={20} height={20} />
            <h3>Trustpilot</h3>
          </div>
          <div className={styles.linetwoicons}>
            <Image className={styles.img} src="/search.svg" alt="Search" width={25} height={25} />
            <Image className={styles.img} src="/user.svg" alt="User" width={25} height={25} />
            <div className={styles.cartstatus}>
              <Link href="/cart">
                <Image className={styles.img} src="/cart.svg" alt="Cart" width={25} height={25}/>
              </Link>
              <div className={styles.cartcount}>{totalItems}</div>
            </div>
          </div>
        </div>

    </div>
    )
  }
  
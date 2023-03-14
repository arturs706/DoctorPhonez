"use client"; // this is a client component 👈🏽

import styles from './cartpage.module.css'
import { useState, useEffect } from 'react'
import { removeFromCart, incrementQuantity, decrementQuantity } from '../../redux/reducers/cartSlice'
import { useSelector, useDispatch } from 'react-redux'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
    const cart = useSelector(state => state.counter);
    const [totalItems, setTotalItems] = useState(0)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const dispatch = useDispatch()


    useEffect(() => {
        const dataRetrieve = cart.map((item) => {
            return {
                prodname: item.prodname,
                quantity: item.quantity,
                price: item.price,
                productimage: item.imagetwo,
            }
        })
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalItems(totalItems);
        setData(dataRetrieve)
        setTotal(total)

    }, [cart])




    const handleProductAdd = (prodname) => {
        dispatch(incrementQuantity(prodname))
    }
    const handleProductDecrement = (prodname) => {
        dispatch(decrementQuantity(prodname))
    }
    const handleProductRemove = (prodname) => {
        dispatch(removeFromCart(prodname))
    }

    //create a function to format the price to 2 decimal places
    const formatPrice = (price) => {
        return price.toFixed(2)
    }


    return (
        <div className={styles.cartmain}>
            <div className={styles.cartpage}>
                {data.map((item, index) => (
                    <div key={index}>
                        <div className={styles.cartitem}><h4>{item.prodname}</h4></div>
                        <Image 
                            src = {item.productimage}
                            alt = {item.prodname}
                            width = {100}
                            height = {100}
                        />

                        <div className={styles.cartitem}><h4>{item.quantity}</h4></div>
                        <div className={styles.cartitem}><h4>{totalItems}</h4></div>
                        <div className={styles.actionbutton} onClick={() => handleProductAdd(item.prodname)}>+</div>
                        <div className={styles.actionbutton} onClick={() => handleProductDecrement(item.prodname)}>-</div>
                        <div className={styles.actionbutton} onClick={() => handleProductRemove(item.prodname)}>Remove</div>
                        <div className={styles.cartitem}><h1>£{item.price}</h1></div>
                        <div className={styles.cartitem}><h1>£{formatPrice(item.price * item.quantity)}</h1></div>

                    </div>
                ))}
            </div>
            <div className={styles.cartitem}><h1>£{formatPrice(total)}</h1></div>
            <Link href="/checkout"><button className={styles.button}>Pay</button></Link>
        </div>
    )
}

import React from 'react'
import styles from './footer.module.css'
import Image from 'next/image'



export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.wrapone}>
      <div className={styles.leftdiv}>
        <div className={styles.wrappall}>
          <h3>Doctor Phonez</h3>
          <span>Doctor Phonez is an online mobile 
            phone store that offers a wide range of mobile phones, 
            tablets and accessories for purchase.
          </span>
            <div className={styles.searchsocial}>
              <div className={styles.socials}>
              <Image
                src="/ig.svg"
                alt="Instagram"
                width={20}
                height={20}
              />
              <Image 
                src="/fb.svg"
                alt="Facebook"
                width={20}
                height={20}
              />
              <Image
                src="/twitter.svg"
                alt="Twitter"
                width={20}
                height={20}
              />
              </div>
      
              <div className={styles.newsletter}>
                <Image
                  src="/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                />
                <span>Newsletter Sign Up</span>
              </div>
            </div>
        </div>
      </div>
      <div className={styles.seconddiv}>
        <h3>Phones</h3>
        <div className={styles.columnlist}>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Apple</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Samsung</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Retro</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Accessories</span>
        </div>
        </div>
     
  
      </div>
      <div className={styles.thirddiv}>
        <h3>Tablets</h3>
        <div className={styles.columnlist}>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Apple</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Samsung</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Microsoft</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Accessories</span>
        </div>
        </div>
 
      </div>
      <div className={styles.fourthdiv}>
        <h3>About Us</h3>
        <div className={styles.columnlist}>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>About Us</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Contact Us</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Terms & C`&apos;`s</span>
        </div>
        <div className={styles.category}>
          <Image 
            src="/larger.svg"
            alt="Larger"
            width={10}
            height={10}
          />
          <span>Privacy</span>
        </div>
        </div>
     
      </div>
      </div>
      <div className={styles.hiddendiv}>
      <h3>Doctor Phonez</h3>

      <div className={styles.socialssmallscreen}>
              <Image
                src="/ig.svg"
                alt="Instagram"
                width={20}
                height={20}
              />
              <Image 
                src="/fb.svg"
                alt="Facebook"
                width={20}
                height={20}
              />
              <Image
                src="/twitter.svg"
                alt="Twitter"
                width={20}
                height={20}
              />
          </div>
          <div className={styles.newslettersmallscreen}>
                <Image
                  src="/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                />
                <span>Newsletter Sign Up</span>
          </div>
      </div>
      <div className={styles.wraptwo}>Doctor Phonez © 2023</div>
    </div>
  )
}

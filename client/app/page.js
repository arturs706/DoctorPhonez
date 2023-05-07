"use client"

import styles from './page.module.css';
import Sectionone from './sectionone';
import Sectiontwo from './sectiontwo';
import Sectionthree from './sectionthree';
import Sectionfour from './sectionfour';
import Sectionfive from './sectionfive';
import Sectionsix from './sectionssix';
import Sectionseven from './sectionseven';
import Sectioneight from './sectioneight';
import Sectionnine from './sectionnine';
import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import refreshToken from '../checkCr';



export default function Home() {
  const sectionTwoRef = useRef(null);
  const sectionThreeRef = useRef(null);
  const sectionFiveRef = useRef(null);
  const sectionSevenRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkRefreshToken() {
      await refreshToken(dispatch);
    }
    checkRefreshToken();
  }, [dispatch]);


  return (
    <div className={styles.main}>
      <div className={styles.sectionone}>
        <Sectionone sectiontworef={sectionTwoRef}/>
      </div>
      <div ref={sectionTwoRef}>
        <Sectiontwo sectionthreeref={sectionThreeRef}/>
      </div>
      <div ref={sectionThreeRef}>
        <Sectionthree />
      </div>
      <div>
        <Sectionfour sectionFiveref = {sectionFiveRef}/>
      </div>
      <div ref={sectionFiveRef}>
        <Sectionfive />
      </div>
      <div>
        <Sectionsix sectionSevenref = {sectionSevenRef}/>
      </div>
      <div ref={sectionSevenRef}>
        <Sectionseven />
      </div>
      <div>
        <Sectioneight />
      </div>
      <div>
        <Sectionnine />
        </div>
    </div>
  );
}

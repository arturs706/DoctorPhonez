import styles from './navicon.module.css'


export default function Hamburger(props){
    const { isOpen, handleToggle } = props;

    // const handleIconClick = () => {
    // setOpen(!open);
    // };
    const iconClasses = `${styles['nav-icon-1']} ${isOpen ? styles.open : ''}`;
    return (
        <div className={styles.wrapper}>
            <div className={iconClasses} onClick={handleToggle}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
  )
}

import './globals.css'
import { Roboto } from '@next/font/google'
import Nav from './nav'

const roboto = Roboto({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    
    <html lang="en">
      <head />
        <body>
          <Nav />
          <div className={roboto.className}>
            {children}
          </div>
        </body>
    </html>
  )
}
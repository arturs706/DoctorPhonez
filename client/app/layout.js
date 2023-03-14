
import './globals.css'
import { Roboto } from '@next/font/google'
import Nav from './nav'
import Footer from './footer'
import { Providers } from './provider'

const roboto = Roboto({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    
    <html lang="en">
      <head />
        <body>
        <Providers>
          <Nav />
          <div className={roboto.className}>
              {children}
          </div>
          <Footer />
          </Providers>
        </body>
    </html>
  )
}
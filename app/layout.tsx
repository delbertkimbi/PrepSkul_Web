import type React from "react"
import type { Metadata } from "next"
import { Poppins, Lato } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PrepSkul: Find Trusted Home and Online Tutors in Cameroon",
  description:
    "Get connected with verified home and online tutors who don't just teach, but mentor and inspire — offering personalized support for academics, skill development, and exam preparation in Cameroon and beyond.",
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" }],
    shortcut: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${lato.variable}`}>

        {/* Mixpanel Script */}
        <Script id="mixpanel-script" strategy="afterInteractive">
          {`
            (function(f,b){
              if(!b.__SV){
                var e,g,i,h;
                window.mixpanel=b;
                b._i=[];
                b.init=function(e,f,c){
                  function g(a,d){
                    var b=d.split(".");
                    2==b.length&&(a=a[b[0]],d=b[1]);
                    a[d]=function(){
                      a.push([d].concat(Array.prototype.slice.call(arguments,0)))
                    }
                  }
                  var a=b;
                  "undefined"!==typeof c?a=b[c]=[]:c="mixpanel";
                  a.people=a.people||[];
                  a.toString=function(a){
                    var d="mixpanel";
                    "mixpanel"!==c&&(d+="."+c);
                    a||(d+=" (stub)");
                    return d
                  };
                  a.people.toString=function(){
                    return a.toString(1)+".people (stub)"
                  };
                  i="disable time_event track track_pageview track_links track_forms track register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
                  for(h=0;h<i.length;h++)g(a,i[h]);
                  b._i.push([e,f,c])
                };
                b.__SV=1.2;
                e=f.createElement("script");
                e.type="text/javascript";
                e.async=true;
                e.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
                g=f.getElementsByTagName("script")[0];
                g.parentNode.insertBefore(e,g)
              }
            })(document,window.mixpanel||[]);

            mixpanel.init("3aedc52e18443b07c09205411a534aa7",{
              autocapture:true,
              record_sessions_percent:100,
              api_host:"https://api-eu.mixpanel.com"
            });
          `}
        </Script>

        {children}
      </body>
    </html>
  )
}

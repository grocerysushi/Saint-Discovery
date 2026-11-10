import Image from "next/image";
import { Button } from "@/components/ui/button";
import "./home-app-promotion.css";

export const APP_STORE_URL = "https://apps.apple.com/us/app/saint-discovery/id6828221648";

export default function HomeAppPromotion() {
  return <section id="iphone-app" className="home-app-promotion" aria-labelledby="home-app-title">
    <div className="home-app-inner site-width">
      <div className="home-app-copy">
        <div className="home-app-identity">
          <Image src="/app-promotion/app-icon.webp" alt="Saint Discovery app icon" width={64} height={64} unoptimized />
          <div><span>Saint Discovery</span><p>Now available for iPhone</p></div>
        </div>
        <h2 id="home-app-title">Take Saint Discovery<br />with you.</h2>
        <p className="home-app-intro">A saint to meet. A story to explore. A moment to reflect. Make room for all three on your iPhone.</p>
        <ul className="home-app-features">
          <li>Discover your saint with the quiz</li>
          <li>Explore biographies and patron-saint guides</li>
          <li>Return for a daily moment of reflection</li>
        </ul>
        <Button asChild variant="gold" size="cta" className="home-app-download">
          <a href={APP_STORE_URL} aria-label="View Saint Discovery on the App Store">
            View on the App Store{" "}
            <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 18 18 6M6 6h12v12" /></svg>
          </a>
        </Button>
        <p className="home-app-requirements">Free for iPhone · iOS 17+ · Ages 18+</p>
        <p className="home-app-no-account">No account needed. You can also keep using the web quiz.</p>
      </div>
      <figure className="home-app-visual">
        <div className="home-app-phone"><Image src="/app-promotion/app-home.webp" alt="Saint Discovery iPhone app showing the quiz introduction, Saint of the Day and Discover, Today, Explore and Settings tabs" width={598} height={1300} sizes="(max-width: 760px) 240px, 274px" unoptimized /></div>
        <figcaption>The Saint Discovery iPhone app</figcaption>
      </figure>
    </div>
  </section>;
}

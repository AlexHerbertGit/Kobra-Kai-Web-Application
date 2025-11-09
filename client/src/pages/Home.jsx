import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="landing-header">
        <img
          src="/hero.jpg"
          alt="Community sharing home-cooked meals"
          className="landing-img"
        />

        <div className="hero-overlay">
          <div className="card hero-card">
            <img
              src="/kobra-kai-logo.png"
              alt="Community sharing home-cooked meals"
              className="hero-logo"
            />
            <h1>Welcome to Kobra Kai</h1>
            <h2>
              <i>
                "Helping the local community fight against hardship, one meal at a
                time."
              </i>
            </h2>
          </div>
        </div>
      </section>

      <section className="home-bio">
        <div className="bio-card">
          <p>Kobra Kai's mission is to support families and individuals in the Nelson region by providing nutritious, home cooked meals, delivered directly to your door.</p>

          <p>Our generous supporters and donors, comprised of various local restaurants and produce wholesalers, donate their meals and list them here to be ordered by anyone in need.</p>

          <p>Ordering meals is made easy using the Kobra Kai Tokens that are allocated to your account on registration.</p>

          <p>Registering is easy, just click the button below to create your Kobra Kai account and order your first delivery.</p>
          <Link to="/register" className="btn">Register Here!</Link>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="feature-section">
        <div className="feature-section__overlay" />

        <div className="feature-section__inner container">
          <h2 className="feature-section__title">What We Do!</h2>
          <p className="feature-section__tagline">
            “We strive to support our local community during the tough times, feeding those who are in need.”
          </p>

          <div className="feature-section__grid">
            {/* Card 1 */}
            <article className="feature-card">
              <img src="/meeting.jpg" alt="Community support" className="feature-card__img" />
              <div className="feature-card__body">
                <h3 className="feature-card__title">Community Support</h3>
                <p className="feature-card__text">
                  Everyone experiences tough times and challenges in life; Kobra Kai’s mission is to support the
                  community by providing nutritious meals to those who need it the most!
                </p>
                <Link to="/about" className="btn btn--primary">About Us</Link>
              </div>
            </article>

            {/* Card 2 */}
            <article className="feature-card">
              <img src="/helping.jpg" alt="Meal delivery" className="feature-card__img" />
              <div className="feature-card__body">
                <h3 className="feature-card__title">Meal Delivery</h3>
                <p className="feature-card__text">
                  Order meals from generous charity members directly to your door. Our meal providers are local
                  restaurants and produce wholesalers who provide healthy, balanced meals ready to eat!
                </p>
                <Link to="/meals" className="btn btn--primary">Order Meals</Link>
              </div>
            </article>

            {/* Card 3 */}
            <article className="feature-card">
              <img src="/bags.jpg" alt="Join our mission" className="feature-card__img" />
              <div className="feature-card__body">
                <h3 className="feature-card__title">Join Our Mission</h3>
                <p className="feature-card__text">
                  Do you own a local hospitality business and want to support the Nelson community? Join our mission and
                  sign up to become a Kobra Kai Charity Member.
                </p>
                <Link to="/register" className="btn btn--primary">Register Here</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      
    </div>
  );
}
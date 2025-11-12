import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <div className="container">
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
      </div>
    

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
                <Link to="/about" className="btn">About Us</Link>
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
                <Link to="/meals" className="btn">Order Meals</Link>
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
                <Link to="/register" className="btn">Register Here</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="feature-section-2">
        <div className="feature-section__overlay-2" />

        <div className="feature-section__inner container">
          <h2 className="feature-section__title-2">Testimonials</h2>
          <p className="feature-section__tagline-2">
            Don't just take our word for it, here is what the community has to say!
          </p>

          <div className="feature-section__grid">
            {/* Card 1 */}
            <article className="feature-card">
              <img src="/ocean-food.jpg" alt="Community support" className="feature-card__img" />
              <div className="feature-card__body">
                <h3 className="feature-card__title">Aroha</h3>
                <p className="feature-card__text">
                  <i>
                  "I was really struggling after loosing my job, I have two children I need to provide for and Kobra Kai really helped take the pressure off while I was looking for work.
                  I loved how easy it was to order meals from the website, and the food was amazing!"
                  </i>
                </p>
              </div>
            </article>

            {/* Card 2 */}
            <article className="feature-card">
              <img src="/helping.jpg" alt="Meal delivery" className="feature-card__img" />
              <div className="feature-card__body">
                <h3 className="feature-card__title">Jackson</h3>
                <p className="feature-card__text">
                  <i> "I was made redundant from my job and I have and wife and two kids to feed, Kobra Kai really helped us out when we needed it the most! 
                    Being able to order meals online straight from the website really made a difference."
                  </i>
                </p>
                
              </div>
            </article>

            {/* Card 3 */}
            <article className="feature-card">
              <img src="/bags.jpg" alt="Join our mission" className="feature-card__img" />
              <div className="feature-card__body">
                <h3 className="feature-card__title">Lindsey</h3>
                <p className="feature-card__text">
                  <i>
                  "I'm social services representative from Work and Income and I've been signing recipients up to Kobra Kai services for the past 12 months. 
                  All of my clients speak very highly of the food and how easy the service is to use. 10/10!"
                  </i>
                </p>
                
              </div>
            </article>
          </div>
        </div>
      </section>

      { /* How It Works */ }
      <section className="feature-section-3">
        <div className="feature-section__overlay-3" />

        <div className="feature-section__inner container">
            <h2 className="feature-section__title">How it Works</h2>
              <p className="feature-section__tagline">
                Ordering free, home-cooked meals, delivered straight to your door has never been easier. <br></br>
                Just register for an account using your community services number, and use your allocated tokens to order meals directly from the restaurant.
                <br></br> Simple, Easy, and very tasty!
              </p>
          <div className="feature-section__grid">

            {/* Card 1 */}
            <article className="feature-card">
              <div className="feature-card__body">
                <h3 className="feature-card__title">Create Your Account</h3>
                <p className="feature-card__text">
                  Create your free account today, every account is credited with 10 Kobra Kai Tokens ready to be used to order homecooked meals directly to your door. Click the button below to register today!
                </p>
                <Link to="/register" className="btn">Register</Link>
              </div>
            </article>

            {/* Card 2 */}
            <article className="feature-card">
              <div className="feature-card__body">
                <h3 className="feature-card__title">Browse and Order Meals</h3>
                <p className="feature-card__text">
                  Order meals from generous charity members directly to your door. Our meal providers are local
                  restaurants and produce wholesalers who provide healthy, balanced meals ready to eat!
                </p>
                <Link to="/meals" className="btn">Browse Meals</Link>
              </div>
            </article>

            {/* Card 3 */}
            <article className="feature-card">
              <div className="feature-card__body">
                <h3 className="feature-card__title">Manage your Orders</h3>
                <p className="feature-card__text">
                  You can view and manage your orders using the Account Dashboard, here you will find all of your pending, current, and past orders as well as your personal details and delivery address. 
                </p>
                <Link to="/Dashboard" className="btn">Account Dashboard</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

    </div>
  );
}
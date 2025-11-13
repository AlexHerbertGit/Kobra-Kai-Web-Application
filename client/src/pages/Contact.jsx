export default function Contact() {
  return (
    <main className="contact-page">
      <header className="contact-page__intro">
        <p className="contact-page__eyebrow">We would love to hear from you</p>
        <h1>Contact Kobra Kai Community Kitchen</h1>
        <p>
          Whether you have a question about our meals, want to volunteer, or hope to
          partner with us, the team at Kobra Kai Community Kitchen is only a call or
          email away.
        </p>
      </header>

      <div className="contact-page__grid">
        <section
          className="contact-page__details"
          aria-labelledby="contact-details-heading"
        >
          <h2 id="contact-details-heading">How to reach us</h2>
          <p>
            We welcome visitors, neighbours, and collaborators. Here is the fastest
            way to connect with a member of the dojo kitchen crew:
          </p>
          <dl className="contact-page__list">
            <div>
              <dt>Visit</dt>
              <dd>
                <address>
                  123 Sensei Way
                  <br />
                  Resilience City
                </address>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:hello@kobrakai.community">
                  hello@kobrakai.community
                </a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href="tel:+15551234567">(555) 123-4567</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="contact-page__cta" aria-labelledby="contact-cta-heading">
          <h2 id="contact-cta-heading">Plan your next step</h2>
          <p>
            Tell us about your upcoming visit, community event, or collaboration idea
            and we will respond within two business days. Sharing a few details helps
            us match you with the right sensei.
          </p>
          <ul className="contact-page__highlights">
            <li>Volunteer shifts and kitchen orientation requests</li>
            <li>Meal support for neighbours or partner organisations</li>
            <li>Media, donation, and sponsorship enquiries</li>
          </ul>
          <a
            className="btn contact-page__btn"
            href="mailto:hello@kobrakai.community?subject=Hello%20Kobra%20Kai%20Kitchen"
          >
            Email the team
          </a>
        </section>
      </div>
    </main>
  );
}
export default function About() {
  return (
     <section className="about-page">
      <div className="about-page__hero">
        <p className="about-page__eyebrow">Sharing strength, one meal at a time</p>
        <h1 className="about-page__title">A community where everyone is invited to the table</h1>
        <p className="about-page__intro">
          Kobra Kai weaves together restaurants, volunteers, and neighbors through a token-based
          meal sharing network. Each connection we forge ensures nourishing food finds the people who
          need it most.
        </p>
      </div>

      <div className="about-page__content">
        <section className="about-page__mission">
          <h2>Our Mission</h2>
          <p>
            We believe reliable access to wholesome meals is a right, not a privilege. Our platform
            helps community partners sponsor meals, track impact, and uplift recipients with the
            dignity of choice. By translating generosity into shareable tokens, we empower people to
            give—and receive—support with confidence.
          </p>
          <p>
            With a transparent dashboard and streamlined logistics, Kobra Kai keeps donors informed
            while restaurants stay focused on what they do best: cooking great food. Together, we are
            building a resilient safety net that scales with need.
          </p>
          <p>
            <strong>Our goals include:</strong><br></br>
            Providing a reliable and respectful meal delivery service for struggling individuals and families.<br></br>
            Empowering charity members to give back through food donations and volunteering.<br></br>
            Building a connected and compassionate community through mutual support.<br></br>
            Expanding our platform to support additional essentials like grocery packs and hygiene kits.<br></br><br></br>
            We believe that food is more than just nourishment — it's care, dignity, and community.
          </p>
        </section>

        <section className="about-page__values">
          <h2>Our Values</h2>
          <ul className="about-page__values-list">
            <li className="about-page__values-item">
              <h3>Community First</h3>
              <p>
                We partner with local kitchens, social workers, and volunteers to make sure help is
                always close to home.
              </p>
            </li>
            <li className="about-page__values-item">
              <h3>Transparency</h3>
              <p>
                Real-time reporting, impact stories, and a shareable ledger keep every supporter
                connected to the outcomes they power.
              </p>
            </li>
            <li className="about-page__values-item">
              <h3>Dignity &amp; Choice</h3>
              <p>
                Recipients use tokens to select meals that suit their tastes and schedules, because
                care should feel personal.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
}
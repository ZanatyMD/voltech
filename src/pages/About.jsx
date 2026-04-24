import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-header">
          <h1>About <span className="volt-green">Voltech</span></h1>
          <p className="about-subtitle">Built For Students, By Tech Enthusiasts.</p>
        </div>
        
        <div className="about-content">
          <div className="about-card glass">
            <h2>Who We Are</h2>
            <p>
              Voltech was founded with a single mission: to provide engineering students, hobbyists, and makers with high-quality, affordable electronic components. 
              We know how frustrating it can be to hunt down the right Arduino board, sensor, or custom PCB for your graduation project, only to face high prices and long shipping times.
            </p>
            <p>
              That's why Voltech is here. We are a local store dedicated to fueling your innovation. From microcontrollers and actuators to basic jumper wires and breadboards, we stock everything you need to bring your circuit designs to life.
            </p>
          </div>

          <div className="about-card glass">
            <h2>Our Promise</h2>
            <ul className="promise-list">
              <li><strong>Student-First Pricing:</strong> We keep our margins low so you can afford to build bigger and better projects.</li>
              <li><strong>Quality Components:</strong> Every module and board is tested to ensure it works reliably when you need it most.</li>
              <li><strong>Direct Support:</strong> We don't just sell parts; we understand them. Our WhatsApp support is always open to help you pick the right components.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

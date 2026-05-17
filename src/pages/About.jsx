import { motion } from 'framer-motion';
import './About.css';

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.2 + i * 0.12,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

function About() {
  return (
    <div className="about-page">
      <div className="container">
        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1>About <span className="volt-green">Voltech</span></h1>
          <p className="about-subtitle">Built For Students, By Tech Enthusiasts.</p>
        </motion.div>
        
        <div className="about-content">
          <motion.div
            className="about-card glass"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2>Who We Are</h2>
            <p>
              Voltech was founded with a single mission: to provide engineering students, hobbyists, and makers with high-quality, affordable electronic components. 
              We know how frustrating it can be to hunt down the right Arduino board, sensor, or custom PCB for your graduation project, only to face high prices and long shipping times.
            </p>
            <p>
              That's why Voltech is here. We are a local store dedicated to fueling your innovation. From microcontrollers and actuators to basic jumper wires and breadboards, we stock everything you need to bring your circuit designs to life.
            </p>
          </motion.div>

          <motion.div
            className="about-card glass"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2>Our Promise</h2>
            <ul className="promise-list">
              {[
                { title: 'Student-First Pricing:', desc: 'We keep our margins low so you can afford to build bigger and better projects.' },
                { title: 'Quality Components:', desc: 'Every module and board is tested to ensure it works reliably when you need it most.' },
                { title: 'Direct Support:', desc: "We don't just sell parts; we understand them. Our WhatsApp support is always open to help you pick the right components." },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  variants={listItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <strong>{item.title}</strong> {item.desc}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default About;

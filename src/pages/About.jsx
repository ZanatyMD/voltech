import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  return (
    <div className="about-page">
      <div className="container">
        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1>{t.about_title_prefix}<span className="volt-green">{t.about_title_voltech}</span></h1>
          <p className="about-subtitle">{t.about_subtitle}</p>
        </motion.div>
        
        <div className="about-content">
          <motion.div
            className="about-card glass"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2>{t.about_who_title}</h2>
            <p>
              {t.about_who_p1}
            </p>
            <p>
              {t.about_who_p2}
            </p>
          </motion.div>

          <motion.div
            className="about-card glass"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2>{t.about_promise_title}</h2>
            <ul className="promise-list">
              {[
                { title: t.about_promise_1_title, desc: t.about_promise_1_desc },
                { title: t.about_promise_2_title, desc: t.about_promise_2_desc },
                { title: t.about_promise_3_title, desc: t.about_promise_3_desc },
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

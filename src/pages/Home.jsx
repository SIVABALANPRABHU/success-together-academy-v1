import { useState, useEffect } from 'react'
import '../styles/Home.css'

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Interactive Syllabus Tracker State
  const [syllabus, setSyllabus] = useState({
    prelims: [
      { id: 'p1', subject: 'Indian Polity & Governance', completed: true },
      { id: 'p2', subject: 'History of India & National Movement', completed: false },
      { id: 'p3', subject: 'Physical & Economic Geography', completed: false },
      { id: 'p4', subject: 'Economic & Social Development', completed: false },
      { id: 'p5', subject: 'General Science & Sci-Tech', completed: false },
      { id: 'p6', subject: 'CSAT (Mental Ability & English)', completed: false }
    ],
    mains: [
      { id: 'm1', subject: 'GS I: Culture, History & Geography', completed: false },
      { id: 'm2', subject: 'GS II: Constitution, Polity & Governance', completed: false },
      { id: 'm3', subject: 'GS III: Economy, Tech & Security', completed: false },
      { id: 'm4', subject: 'GS IV: Ethics, Integrity & Aptitude', completed: false },
      { id: 'm5', subject: 'Essay Writing Practice', completed: false }
    ]
  })

  // Interactive Score Analyzer State
  const [correctAnswers, setCorrectAnswers] = useState(65)
  const [incorrectAnswers, setIncorrectAnswers] = useState(25)

  // Computed Values for Score Analyzer
  const marksForCorrect = correctAnswers * 2
  const marksForIncorrect = incorrectAnswers * 0.66
  const totalScore = parseFloat((marksForCorrect - marksForIncorrect).toFixed(2))
  const cutoffTarget = 95
  const isCutoffCleared = totalScore >= cutoffTarget

  // Calculate Syllabus progress
  const getProgress = (type) => {
    const items = syllabus[type]
    const completedCount = items.filter(item => item.completed).length
    return Math.round((completedCount / items.length) * 100)
  }

  const toggleSyllabusItem = (type, id) => {
    setSyllabus(prev => ({
      ...prev,
      [type]: prev[type].map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    }))
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll('.animate-on-scroll')
    animatedElements.forEach((el) => observer.observe(el))

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="gold-seal">★</span>
            <span className="logo-text">SUCCESS TOGETHER <span className="gold-text">ACADEMY</span></span>
          </div>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link" onClick={closeMenu}>Home</a>
            <a href="#syllabus-tool" className="nav-link" onClick={closeMenu}>Syllabus Tracker</a>
            <a href="#score-tool" className="nav-link" onClick={closeMenu}>Prelims Calculator</a>
            <a href="#features" className="nav-link" onClick={closeMenu}>Features</a>
            <a href="#testimonials" className="nav-link" onClick={closeMenu}>Officer Success Stories</a>
            <button className="nav-button login" onClick={closeMenu}>Login</button>
            <button className="nav-button primary signup" onClick={closeMenu}>Enroll Now</button>
          </div>
          <div className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-grid">
          <div className="hero-content animate-on-scroll">
            <div className="badge">
              <span className="saffron-dot"></span> UPSC Civil Services Academy
            </div>
            <h1 className="hero-title">
              Forge Your Path to <span className="gold-text">LBSNAA</span> & <span className="gold-text">SVPNPA</span>
            </h1>
            <p className="hero-subtitle">
              India's premium academy for dedicated IAS & IPS aspirants. Transform your dream of service into reality through personalized mentorship, advanced analytics, and strategic execution.
            </p>
            <div className="hero-buttons">
              <a href="#enroll" className="btn btn-primary gold-glow-animation">Begin Free Trial</a>
              <a href="#syllabus-tool" className="btn btn-secondary">Explore Syllabus Tracker</a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <h3>120+</h3>
                <p>Selections in CSE 2024</p>
              </div>
              <div className="stat-item">
                <h3>1-on-1</h3>
                <p>IAS/IPS Mentorship</p>
              </div>
              <div className="stat-item">
                <h3>94.8%</h3>
                <p>Mock Test Accuracy</p>
              </div>
            </div>
          </div>
          <div className="hero-image-pane animate-on-scroll">
            <div className="academy-crest-box">
              <div className="gold-orbit-1"></div>
              <div className="gold-orbit-2"></div>
              <div className="crest-content">
                <div className="crest-logo">🔱</div>
                <h2>SATYA MEVA JAYATE</h2>
                <p>National Duty • Excellence • Integrity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive UPSC Syllabus Tracker Section */}
      <section className="interactive-section" id="syllabus-tool">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2 className="section-title">Interactive UPSC Syllabus Tracker</h2>
            <p className="section-subtitle">
              Visualize your preparation journey. Toggle subjects below to simulate tracking your syllabus coverage live.
            </p>
          </div>

          <div className="tracker-grid">
            {/* Prelims Card */}
            <div className="tracker-card animate-on-scroll">
              <div className="tracker-card-header">
                <h3>UPSC Prelims (GS Paper I)</h3>
                <span className="progress-badge gold">{getProgress('prelims')}% Done</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${getProgress('prelims')}%` }}></div>
              </div>
              <ul className="syllabus-checklist">
                {syllabus.prelims.map((item) => (
                  <li key={item.id} className={item.completed ? 'checked' : ''} onClick={() => toggleSyllabusItem('prelims', item.id)}>
                    <span className="checkbox">{item.completed ? '✓' : ''}</span>
                    <span className="subject-name">{item.subject}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mains Card */}
            <div className="tracker-card animate-on-scroll">
              <div className="tracker-card-header">
                <h3>UPSC Mains (GS Papers)</h3>
                <span className="progress-badge saffron">{getProgress('mains')}% Done</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar saffron" style={{ width: `${getProgress('mains')}%` }}></div>
              </div>
              <ul className="syllabus-checklist">
                {syllabus.mains.map((item) => (
                  <li key={item.id} className={item.completed ? 'checked' : ''} onClick={() => toggleSyllabusItem('mains', item.id)}>
                    <span className="checkbox">{item.completed ? '✓' : ''}</span>
                    <span className="subject-name">{item.subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Test Score Analyzer Section */}
      <section className="interactive-section alt-bg" id="score-tool">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2 className="section-title">UPSC Prelims Mock Score Analyzer</h2>
            <p className="section-subtitle">
              Estimate your GS Paper-I marks based on UPSC mark patterns (+2.00 for Correct, -0.66 for Incorrect).
            </p>
          </div>

          <div className="calculator-box animate-on-scroll">
            <div className="calculator-controls">
              <div className="slider-group">
                <div className="slider-label">
                  <span>Correct Answers (Out of 100)</span>
                  <span className="slider-value gold">{correctAnswers}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={correctAnswers}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    setCorrectAnswers(val)
                    if (val + incorrectAnswers > 100) {
                      setIncorrectAnswers(100 - val)
                    }
                  }}
                  className="accent-range"
                />
              </div>

              <div className="slider-group">
                <div className="slider-label">
                  <span>Incorrect Answers</span>
                  <span className="slider-value saffron">{incorrectAnswers}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={100 - correctAnswers}
                  value={incorrectAnswers}
                  onChange={(e) => setIncorrectAnswers(parseInt(e.target.value))}
                  className="accent-range secondary"
                />
              </div>
            </div>

            <div className="calculator-results">
              <div className="results-grid">
                <div className="result-metric">
                  <span className="metric-title">Correct Score</span>
                  <span className="metric-value text-green">+{marksForCorrect}</span>
                </div>
                <div className="result-metric">
                  <span className="metric-title">Negative Penalty</span>
                  <span className="metric-value text-red">-{marksForIncorrect}</span>
                </div>
                <div className="result-metric highlight">
                  <span className="metric-title">Estimated Net Score</span>
                  <span className="metric-value">{totalScore}</span>
                </div>
              </div>

              <div className="result-status-container">
                {isCutoffCleared ? (
                  <div className="status-badge success">
                    <span>✔</span> Target Cutoff Cleared (~95 marks)
                  </div>
                ) : (
                  <div className="status-badge warning">
                    <span>⚠</span> Below Typical Cutoff (~95 marks)
                  </div>
                )}
                <p className="cutoff-hint">
                  Historically, IAS general category prelims cutoffs float between 88 - 98 marks. Try boosting correct answers to secure a safe margin!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2 className="section-title">Our Premium UPSC Ecosystem</h2>
            <p className="section-subtitle">
              We provide tools, evaluations, and strategies that mimic the actual UPSC exam standards.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🛡</div>
              <h3>1-on-1 Bureaucrat Mentorship</h3>
              <p>Get guided by sitting IAS, IPS, and IFS officers who have successfully crossed the threshold.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <h3>Real-time Answer Evaluation</h3>
              <div className="feature-icon">✍</div>
              <p>Upload your Mains GS answers and essays for assessment by our senior subject matter experts.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">📰</div>
              <h3>Daily UPSC-Centric Current Affairs</h3>
              <p>Save hours of reading with distilled Newspaper Analysis and PIB briefs curated daily.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🎯</div>
              <h3>Intelligent Performance Heatmap</h3>
              <p>Identify weak sections in Polity, History, or CSAT with our comprehensive micro-level analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2 className="section-title">Hall of Fame</h2>
            <p className="section-subtitle">Read how Success Together Academy paved the way for successful ranks.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card animate-on-scroll">
              <p className="quote">"The mock test analyzer and detailed feedback on General Studies answer sheets completely restructured my strategy. I went from failing Prelims to securing a double-digit Rank."</p>
              <div className="officer-meta">
                <div className="avatar">🇮🇳</div>
                <div>
                  <h4>Karthik Sharma, IAS</h4>
                  <p>AIR 42, Civil Services Examination 2023</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card animate-on-scroll">
              <p className="quote">"Syllabus tracking combined with consistent current affairs briefs kept me focused. The IPS mentorship program taught me what to leave out, which is as critical as what to study."</p>
              <div className="officer-meta">
                <div className="avatar">🇮🇳</div>
                <div>
                  <h4>Priyanka Reddy, IPS</h4>
                  <p>AIR 89, Civil Services Examination 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section" id="enroll">
        <div className="container animate-on-scroll">
          <h2>Ready to Begin Your IAS/IPS Journey?</h2>
          <p>Join India's most rigorous academy. Start for free and get access to 3 free Answer Sheet evaluations and 2 Prelims Full Mock Tests.</p>
          <button className="btn btn-primary large gold-glow-animation">Secure Your Free Trial Session</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Success Together Academy</h3>
              <p>Inspiring, Educating, and Mentoring the next generation of administrators of our nation.</p>
              <div className="national-emblem-text">🇮🇳 Dedicated to the Service of the Nation</div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#syllabus-tool">Syllabus Tracker</a></li>
                <li><a href="#score-tool">Score Calculator</a></li>
                <li><a href="#features">Ecosystem Features</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>UPSC Prep Resources</h4>
              <ul>
                <li><a href="#daily-ca">Daily Current Affairs</a></li>
                <li><a href="#prelims-mocks">Prelims Test Series</a></li>
                <li><a href="#mains-qa">Mains Q&A Platform</a></li>
                <li><a href="#mentorship">Mentorship Portal</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Success Together Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

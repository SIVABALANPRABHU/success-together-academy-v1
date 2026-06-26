import { useState, useEffect } from 'react'
import '../styles/Home.css'

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Hero interactive Goal toggle: 'ias' or 'ips'
  const [goalMode, setGoalMode] = useState('ias')

  // Interactive Syllabus Tracker State (with detailed micro-topics for 'How it works')
  const [activeSyllabusTab, setActiveSyllabusTab] = useState('prelims')
  const [expandedSubject, setExpandedSubject] = useState('p1') // ID of expanded subject

  const [syllabus, setSyllabus] = useState({
    prelims: [
      { 
        id: 'p1', 
        subject: 'Indian Polity & Governance', 
        completed: true,
        resources: {
          ncert: 'Class XI Constitution at Work',
          reference: 'M. Laxmikanth Chapters 1-10',
          video: 'Polity Masterclass: Historical Background & Preamble',
          mockTest: 'Prelims Mini Mock #3 (Polity)'
        }
      },
      { 
        id: 'p2', 
        subject: 'History of India & National Movement', 
        completed: false,
        resources: {
          ncert: 'Class XII Themes in Indian History',
          reference: 'Spectrum Modern India (Rajiv Ahir)',
          video: 'National Movement: 1857 Revolt to Independence',
          mockTest: 'Prelims Mini Mock #5 (History)'
        }
      },
      { 
        id: 'p3', 
        subject: 'Physical & Economic Geography', 
        completed: false,
        resources: {
          ncert: 'Class XI Fundamentals of Physical Geography',
          reference: 'GC Leong physical geography',
          video: 'Monsoon Patterns & Indian River Systems',
          mockTest: 'Geography Sectional Test #1'
        }
      },
      { 
        id: 'p4', 
        subject: 'Economic & Social Development', 
        completed: false,
        resources: {
          ncert: 'Class XI Indian Economic Development',
          reference: 'Ramesh Singh / Nitin Singhania Notes',
          video: 'Budget & Economic Survey Analysis',
          mockTest: 'Economy Sectional Test #2'
        }
      },
      { 
        id: 'p5', 
        subject: 'General Science & Sci-Tech', 
        completed: false,
        resources: {
          ncert: 'Class IX & X General Science Digest',
          reference: 'Current Affairs Science & Tech Monthly',
          video: 'Space Missions, AI, & Defense tech updates',
          mockTest: 'Sci-Tech Sectional Test'
        }
      },
      { 
        id: 'p6', 
        subject: 'CSAT (Mental Ability & English)', 
        completed: false,
        resources: {
          ncert: 'Quantitative Aptitude Practice guides',
          reference: 'Previous Year CSAT Question Banks (2015-2024)',
          video: 'CSAT Speed Math & Comprehension Strategies',
          mockTest: 'CSAT Mock Exam #1'
        }
      }
    ],
    mains: [
      { 
        id: 'm1', 
        subject: 'GS I: Culture, History & Geography', 
        completed: false,
        resources: {
          ncert: 'Fine Arts Class XI',
          reference: 'Nitin Singhania Indian Art & Culture',
          video: 'Mains Answer Writing: Temple Architecture',
          mockTest: 'GS I full length mock'
        }
      },
      { 
        id: 'm2', 
        subject: 'GS II: Constitution, Polity & Governance', 
        completed: false,
        resources: {
          ncert: 'Class XI Political Theory',
          reference: 'M. Laxmikanth & Current Bills',
          video: 'Judicial Activism vs Judicial Restraint panel',
          mockTest: 'GS II Answer Writing Drills'
        }
      },
      { 
        id: 'm3', 
        subject: 'GS III: Economy, Tech & Security', 
        completed: false,
        resources: {
          ncert: 'Macroeconomics Class XII',
          reference: 'Internal Security by Ashok Kumar (IPS)',
          video: 'Disaster Management & Economic Reforms',
          mockTest: 'GS III Sectional mock'
        }
      },
      { 
        id: 'm4', 
        subject: 'GS IV: Ethics, Integrity & Aptitude', 
        completed: false,
        resources: {
          ncert: 'Lexicon for Ethics book',
          reference: 'Case Studies Compilation & Solved papers',
          video: 'GS IV Case Study Decolling & Frameworks',
          mockTest: 'Ethics Mock Test #1'
        }
      },
      { 
        id: 'm5', 
        subject: 'Essay Writing Practice', 
        completed: false,
        resources: {
          ncert: 'Philosophical Quotations Index',
          reference: 'Ecosystem topper essays',
          video: 'Structuring Philosophical Essays',
          mockTest: 'Monthly Essay Evaluation'
        }
      }
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

  const toggleSyllabusItem = (type, id, e) => {
    e.stopPropagation() // Prevent toggling expansion
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
    <div className={`home-container theme-${goalMode}`}>
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="gold-seal">★</span>
            <span className="logo-text">SUCCESS TOGETHER <span className="gold-text">ACADEMY</span></span>
          </div>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link" onClick={closeMenu}>Home</a>
            <a href="#syllabus-tool" className="nav-link" onClick={closeMenu}>Syllabus</a>
            <a href="#score-tool" className="nav-link" onClick={closeMenu}>Calculator</a>
            <a href="#features" className="nav-link" onClick={closeMenu}>Features</a>
            <a href="#testimonials" className="nav-link" onClick={closeMenu}>Stories</a>
            <button className="nav-button login" onClick={closeMenu}>Login</button>
            <button className="nav-button primary signup" onClick={closeMenu}>Enroll</button>
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

            {/* Interactive Goal Mode Toggle Buttons */}
            <div className="goal-switch-container">
              <button 
                className={`goal-switch-btn ${goalMode === 'ias' ? 'active' : ''}`}
                onClick={() => setGoalMode('ias')}
              >
                🎓 IAS Mode (LBSNAA)
              </button>
              <button 
                className={`goal-switch-btn ${goalMode === 'ips' ? 'active' : ''}`}
                onClick={() => setGoalMode('ips')}
              >
                👮 IPS Mode (SVPNPA)
              </button>
            </div>

            {goalMode === 'ias' ? (
              <>
                <h1 className="hero-title">
                  Forge Your Path to <span className="gold-text">LBSNAA</span>
                </h1>
                <p className="hero-subtitle">
                  Join India's premiere academy dedicated to shaping the next generation of civil administrators. Transform your dreams of running districts and crafting national policies into reality with expert-guided UPSC frameworks.
                </p>
              </>
            ) : (
              <>
                <h1 className="hero-title">
                  Forge Your Path to <span className="silver-text">SVPNPA</span>
                </h1>
                <p className="hero-subtitle">
                  Prepare for the rigorous physical, mental, and tactical demands of the Indian Police Service. Learn from top IPS trainers and master the GS syllabus while building elite command and discipline.
                </p>
              </>
            )}

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
                <p>Personalized Mentorship</p>
              </div>
              <div className="stat-item">
                <h3>94.8%</h3>
                <p>Mock Accuracy Rate</p>
              </div>
            </div>
          </div>
          
          <div className="hero-image-pane animate-on-scroll">
            <div className="academy-crest-box">
              <div className="gold-orbit-1"></div>
              <div className="gold-orbit-2"></div>
              <div className="crest-content">
                {goalMode === 'ias' ? (
                  <>
                    <div className="crest-logo">🔱</div>
                    <h2>SATYA MEVA JAYATE</h2>
                    <p className="academy-name">LBSNAA • Mussoorie</p>
                    <p className="academy-motto">"Sheelam Param Bhushanam"</p>
                  </>
                ) : (
                  <>
                    <div className="crest-logo">🦁</div>
                    <h2>DEVOTION TO DUTY</h2>
                    <p className="academy-name">SVPNPA • Hyderabad</p>
                    <p className="academy-motto">"Satyameva Jayate"</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive UPSC Syllabus Tracker Section */}
      <section className="interactive-section" id="syllabus-tool">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2 className="section-title">UPSC Smart Syllabus Tracker</h2>
            <p className="section-subtitle">
              Don't just check off subjects. Expand each module to see how our tracker maps daily lessons, reference materials, and evaluation results straight to the UPSC curriculum.
            </p>
          </div>

          {/* Interactive Syllabus Explanation Card */}
          <div className="tracker-explanation-card animate-on-scroll">
            <div className="explanation-header">
              <span className="ex-icon">💡</span>
              <h4>How This Tracker Works</h4>
            </div>
            <p>
              The UPSC Civil Services syllabus is notoriously vast. Our <strong>Smart Tracker</strong> breaks down massive subjects into daily micro-topics. When you toggle a subject, our system links your reading materials, revision timelines, and test performance to calculate your true coverage level. <strong>Click any subject card below to expand its connected resource map!</strong>
            </p>
          </div>

          <div className="syllabus-tabs-container animate-on-scroll">
            <button 
              className={`syllabus-tab-btn ${activeSyllabusTab === 'prelims' ? 'active' : ''}`}
              onClick={() => setActiveSyllabusTab('prelims')}
            >
              UPSC Prelims (GS Paper-I)
            </button>
            <button 
              className={`syllabus-tab-btn ${activeSyllabusTab === 'mains' ? 'active' : ''}`}
              onClick={() => setActiveSyllabusTab('mains')}
            >
              UPSC Mains (GS Papers I-IV)
            </button>
          </div>

          <div className="single-tracker-container animate-on-scroll">
            <div className="tracker-card-header">
              <h3>{activeSyllabusTab === 'prelims' ? 'GS Paper I Syllabus Modules' : 'Mains GS & Essay Modules'}</h3>
              <span className={`progress-badge ${activeSyllabusTab === 'prelims' ? 'gold' : 'saffron'}`}>
                {getProgress(activeSyllabusTab)}% Syllabus Cleared
              </span>
            </div>
            <div className="progress-bar-container">
              <div className={`progress-bar ${activeSyllabusTab === 'mains' ? 'saffron' : ''}`} style={{ width: `${getProgress(activeSyllabusTab)}%` }}></div>
            </div>

            <div className="syllabus-interactive-list">
              {syllabus[activeSyllabusTab].map((item) => (
                <div 
                  key={item.id} 
                  className={`syllabus-list-item ${expandedSubject === item.id ? 'expanded' : ''} ${item.completed ? 'completed' : ''}`}
                  onClick={() => setExpandedSubject(expandedSubject === item.id ? null : item.id)}
                >
                  <div className="item-row">
                    <div className="item-left">
                      <div 
                        className={`checkbox-circle ${item.completed ? 'checked' : ''}`}
                        onClick={(e) => toggleSyllabusItem(activeSyllabusTab, item.id, e)}
                      >
                        {item.completed ? '✓' : ''}
                      </div>
                      <span className="subject-title-text">{item.subject}</span>
                    </div>
                    <span className="expand-indicator">{expandedSubject === item.id ? '▲' : '▼'}</span>
                  </div>

                  {expandedSubject === item.id && (
                    <div className="resource-map-panel animate-slide-down">
                      <h5>Mapped Ecosystem Resources:</h5>
                      <div className="resources-grid">
                        <div className="resource-col">
                          <strong>📚 NCERT Standard</strong>
                          <p>{item.resources.ncert}</p>
                        </div>
                        <div className="resource-col">
                          <strong>📖 Reference Books</strong>
                          <p>{item.resources.reference}</p>
                        </div>
                        <div className="resource-col">
                          <strong>🎥 Live Class Link</strong>
                          <p>{item.resources.video}</p>
                        </div>
                        <div className="resource-col">
                          <strong>🎯 Integrated Mock</strong>
                          <p>{item.resources.mockTest}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
              <div className="feature-icon">✍</div>
              <h3>Real-time Answer Evaluation</h3>
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
                <li><a href="#syllabus-tool">Syllabus</a></li>
                <li><a href="#score-tool">Calculator</a></li>
                <li><a href="#features">Ecosystem</a></li>
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

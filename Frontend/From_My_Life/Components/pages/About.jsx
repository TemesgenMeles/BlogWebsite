import { Link } from 'react-router-dom';
import {
  User,
  BookOpen,
  Cpu,
  Heart,
  ArrowRight,
  MessageCircle,
  AtSign,
  Target,
  Zap,
  Coffee,
  Twitter,
  Linkedin,
  Github,
  ChevronRight,
  MonitorPlay,
  Search
} from 'lucide-react';

const About = () => {
  return (
    <div className="about_page_wrapper">
      {/* About Hero Header */}
      <header className="about_header">
        <div className="about_header_logo_container">
          <img src="/logo.png" alt="Logo" className="about_header_logo" />
        </div>
        <div className="about_hero_content">
          <span className="subtitle">Every story carries a lesson</span>
          <h1>About Me</h1>
          <p className="hero_tagline">"Every story carries a lesson, and this is where I share mine."</p>
        </div>
      </header>

      <div className="about_container_main">
        {/* Introduction Section */}
        <section className="about_intro_section">
          <div className="intro_grid">
            <div className="intro_image_placeholder">
              <div className="profile_blob">
                <img src="/profile.png" alt="Temesgen Meles" className="profile_image" />
              </div>
            </div>
            <div className="intro_text_content">
              <h2>Hi, I’m Temesgen Meles</h2>
              <p className="profession">IT Shop Technician | Technical Educator | Fullstack Developer | IoT Innovator</p>
              <p>
                currently teach <strong>Web Design and Development</strong> at <strong>Memhr Akaleweld Secondary School</strong>, where I help students build practical skills for the digital world, an aspiring IoT innovator, and a passionate fullstack developer.
                I created <em>From My Life</em> to share reflections, lessons, and experiences that blend both my professional journey and personal growth.
              </p>
            </div>
          </div>
        </section>

        {/* My Story Section */}
        <section className="about_story_section">
          <h2 className="section_title">My Story</h2>
          <div className="story_card">
            <p>
              I’ve spent years troubleshooting technical challenges, guiding students, and helping organizations build their digital presence.
              Along the way, I realized that the most valuable insights often come from everyday experiences — whether it’s solving a coding bug,
              teaching a class, or reflecting on life’s ethical dilemmas.
            </p>
            <p>
              This blog is my way of turning those moments into stories worth sharing. My journey hasn't just been about learning to code or fixing hardware;
              it's been about understanding the human element behind every screen and every lesson.
            </p>
          </div>
        </section>

        {/* What You'll Find Section */}
        <section className="about_discover_section">
          <h2 className="section_title">What You’ll Find Here</h2>
          <div className="discover_grid">
            <div className="discover_card">
              <Heart className="discover_icon" />
              <h3>Personal Reflections</h3>
              <p>Stories about life, learning, and the human experiences that shape our perspective on the world.</p>
            </div>
            <div className="discover_card">
              <BookOpen className="discover_icon" />
              <h3>Practical Guides</h3>
              <p>Step-by-step examples and tutorials designed for students and professionals in the IT and development space.</p>
            </div>
            <div className="discover_card">
              <Cpu className="discover_icon" />
              <h3>Technology & Innovation</h3>
              <p>Thoughts on the latest trends, IoT innovations, and how community empowerment can be driven by tech.</p>
            </div>
            <div className="discover_card">
              <Zap className="discover_icon" />
              <h3>Philosophical Musings</h3>
              <p>Occasional deep dives into justice, morality, compassion, and the ethical side of our digital lives.</p>
            </div>
          </div>
        </section>

        {/* Beyond Blogging Section */}
        <section className="about_beyond_section">
          <div className="beyond_content">
            <h2 className="section_title">Beyond Blogging</h2>
            <p>
              I’m passionate about clarity, accessibility, and empowering others through knowledge. Whether it’s refining educational materials,
              designing digital branding, or exploring playful riddles, I thrive on making complex ideas simple and engaging.
            </p>
            <div className="values_list">
              <span className="value_item"><Target size={18} /> Impact-Driven Design</span>
              <span className="value_item"><Coffee size={18} /> Lifelong Learning</span>
              <span className="value_item"><Heart size={18} /> Community First</span>
            </div>
          </div>
        </section>

        {/* Future Goals Section */}
        <section className="about_goals_section">
          <h2 className="section_title">Future Goals & Aspirations</h2>
          <div className="goals_grid">
            <div className="goal_card">
              <Zap className="goal_icon" />
              <h3>IoT Innovation</h3>
              <p>I aim to build smart, accessible solutions that solve real-world problems in our local communities.</p>
            </div>
            <div className="goal_card">
              <Target className="goal_icon" />
              <h3>Mentorship</h3>
              <p>Continuing to guide the next generation of tech talent at W/ro Siheen Polytechnic College and beyond.</p>
            </div>
          </div>
        </section>

        {/* Join Me / CTA Section */}
        <section className="about_cta_section">
          <div className="cta_glass_card">
            <h2>Join Me on This Journey</h2>
            <p>This blog is not just about me — it’s about connecting with you. Let's learn and grow together.</p>
            <div className="about_cta_buttons">
              <Link to="/posts" className="btn_primary flex_center gap_sm">
                Explore Latest Posts <ArrowRight size={20} />
              </Link>
              <Link to="/contact" className="btn_secondary flex_center gap_sm">
                Reach Out <MessageCircle size={20} />
              </Link>
            </div>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="footer_section">
        <div className="footer_content">
          <div className="footer_info">
            <h3>From My Life</h3>
            <p>Stories, lessons, and reflections worth sharing.</p>
            <div className="footer_socials">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex_center gap_xs inline_flex"><Twitter size={20} /> Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex_center gap_xs inline_flex"><Linkedin size={20} /> LinkedIn</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex_center gap_xs inline_flex"><Github size={20} /> GitHub</a>
            </div>
          </div>
          <div className="footer_links_group">
            <h4>Navigation</h4>
            <div className="footer_links">
              <Link to="/" className="flex_center gap_xs"><ChevronRight size={16} /> Home</Link>
              <Link to="/blog" className="flex_center gap_xs"><ChevronRight size={16} /> Blog</Link>
              <Link to="/about" className="flex_center gap_xs"><ChevronRight size={16} /> About</Link>
              <Link to="/contact" className="flex_center gap_xs"><ChevronRight size={16} /> Contact</Link>
            </div>
          </div>
          <div className="footer_links_group">
            <h4>Topics</h4>
            <div className="footer_links">
              <Link to="/posts?category=showcase" className="flex_center gap_xs"><MonitorPlay size={16} /> Showcase</Link>
              <Link to="/posts?category=education" className="flex_center gap_xs"><BookOpen size={16} /> Education</Link>
              <Link to="/posts?category=business" className="flex_center gap_xs"><BookOpen size={16} /> Business</Link>
              <Link to="/posts?category=insight" className="flex_center gap_xs"><Search size={16} /> Insight</Link>
              <Link to="/posts?category=lifestyle" className="flex_center gap_xs"><Coffee size={16} /> Lifestyle</Link>
            </div>
          </div>
        </div>
        <div className="footer_bottom">
          <p>&copy; {new Date().getFullYear()} Temesgen &ndash; All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default About;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  ChevronRight,
  Send,
  MessageCircle,
  BookOpen,
  MonitorPlay,
  Search,
  Coffee
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
        const response = await fetch('http://127.0.0.1:8000/posts/contact-message/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        
        if (response.ok) {
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitStatus(''), 5000);
        } else {
            setSubmitStatus('error');
        }
    } catch (error) {
        console.error('Error submitting message:', error);
        setSubmitStatus('error');
    }
  };

  return (
    <div className="contact_page_wrapper">
      {/* Hero Section */}
      <header className="about_header contact_hero">
        <div className="about_header_logo_container">
          <img src="/logo.png" alt="Logo" className="about_header_logo" />
        </div>
        <div className="about_hero_content">
          <span className="subtitle">Let's Connect</span>
          <h1>Contact Me</h1>
          <p className="hero_tagline">"I’d love to hear from you! Whether you have feedback, questions, or just want to say hello, feel free to reach out."</p>
        </div>
      </header>

      <div className="about_container_main">
        <div className="contact_grid">
          {/* Contact Info Side */}
          <div className="contact_info_section">
            <div className="contact_card">
              <h2>Direct Connect</h2>
              <p>I’m always open to discussing new projects, creative ideas or opportunities to be part of your visions.</p>

              <div className="contact_details">
                <div className="contact_item">
                  <div className="contact_icon_box">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>temesgen12m1@gmail.com</p>
                  </div>
                </div>

                <div className="contact_item">
                  <div className="contact_icon_box">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4>Phone</h4>
                    <p>+251 902 127 832</p>
                  </div>
                </div>

                <div className="contact_item">
                  <div className="contact_icon_box">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4>Location</h4>
                    <p>Dessie, Amhara Region, Ethiopia</p>
                  </div>
                </div>
              </div>

              <div className="social_links_container">
                <h3>Follow My Journey</h3>
                <div className="social_grid">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social_btn facebook">
                    <Facebook size={20} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social_btn twitter">
                    <Twitter size={20} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social_btn linkedin">
                    <Linkedin size={20} />
                  </a>
                  <a href="https://github.com/TemesgenMeles" target="_blank" rel="noreferrer" className="social_btn github">
                    <Github size={20} />
                  </a>
                </div>
              </div>
            </div>

            <div className="response_note">
              <MessageCircle size={20} />
              <p>I’ll get back to you as soon as possible. Your thoughts and ideas mean a lot to me.</p>
            </div>
          </div>

          {/* Contact Form Side */}
          <div className="contact_form_container">
            <form onSubmit={handleSubmit} className="premium_contact_form">
              <div className="form_group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Example: Temesgen Meles" required />
              </div>
              <div className="form_group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Example: teme@gmail.com" required />
              </div>
              <div className="form_group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Feedback / Inquiry" required />
              </div>
              <div className="form_group">
                <label htmlFor="message">Your Message</label>
                <textarea id="message" rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Write your message here..." required></textarea>
              </div>
              <button type="submit" disabled={submitStatus === 'submitting'} className="btn_primary btn_full">
                <span>{submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                <Send size={18} />
              </button>
              {submitStatus === 'success' && <div style={{ color: 'var(--primary-color)', textAlign: 'center', marginTop: '15px' }}>Thank you for your message! I'll get back to you soon.</div>}
              {submitStatus === 'error' && <div style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>Failed to send message. Please try again later.</div>}
            </form>
          </div>
        </div>

        {/* Map Section */}
        <section className="map_section">
          <div className="section_header_centered">
            <h2>Find Me Here</h2>
            <p>I’m based in Dessie, Amhara Region, Ethiopia. Here’s where you can find me.</p>
          </div>
          <div className="map_container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62474.34685023907!2d39.60528657662892!3d11.13401764667821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1646e3362a40498b%3A0xc39f88d927dce7e!2sDessie!5e0!3m2!1sen!2set!4v1710595000000!5m2!1sen!2set"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '24px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            ></iframe>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer_section">
        <div className="footer_content">
          <div className="footer_info">
            <h3>From My Life</h3>
            <p>Stories, lessons, and reflections worth sharing. Thank you for visiting.</p>
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
              <Link to="/category/showcase" className="flex_center gap_xs"><MonitorPlay size={16} /> Showcase</Link>
              <Link to="/category/education" className="flex_center gap_xs"><BookOpen size={16} /> Education</Link>
              <Link to="/category/business" className="flex_center gap_xs"><BookOpen size={16} /> Business</Link>
              <Link to="/category/insight" className="flex_center gap_xs"><Search size={16} /> Insight</Link>
              <Link to="/category/lifestyle" className="flex_center gap_xs"><Coffee size={16} /> Lifestyle</Link>
            </div>
          </div>
        </div>
        <div className="footer_bottom">
          <p>&copy; {new Date().getFullYear()} Temesgen &ndash; All rights reserved. Thank you for visiting From My Life.</p>
        </div>
      </footer>
    </div>
  );
}

export default Contact;
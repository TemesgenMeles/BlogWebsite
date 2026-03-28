import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../../src/context/AuthContext';
import '../../src/Login.css';
import { Lock, User, Loader2, AlertCircle, ChevronRight, ShieldCheck, Cpu } from 'lucide-react';
import loginBg from '../../src/assets/admin_login_bg.png';

const Login = () => {
    const { loginUser, error, isLoggingIn, clearError } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Clear context error on mount or when user starts typing
    useEffect(() => {
        clearError();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(username, password);
    };

    const handleInputChange = (setter) => (e) => {
        if (error) clearError();
        setter(e.target.value);
    };

    return (
        <div className="login_page_wrapper">

            {/* Ambient Background Elements */}
            <div className="ambient_layer ambient_1"></div>
            <div className="ambient_layer ambient_2"></div>

            <div className="login_card">

                {/* Visual/Branding Sidebar */}
                <div className="login_branding">
                    <div
                        className="branding_bg"
                        style={{ backgroundImage: `url(${loginBg})` }}
                    ></div>
                    <div className="branding_overlay"></div>

                    <div className="branding_content">
                        <div className="logo_header stagger_1">
                            <div className="logo_icon_box" style={{ background: 'transparent', boxShadow: 'none' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: 'auto' }} />
                            </div>
                            <span className="logo_text">From My Life</span>
                        </div>

                        <div className="hero_section">
                            <h2 className="hero_title stagger_2">
                                System <br />
                                <span>Administration</span>
                            </h2>
                            <div className="feature_list stagger_3">
                                {[
                                    "Quantum Session Protection",
                                    "Real-time Content Governance",
                                    "Neural Network Analytics"
                                ].map((feature, i) => (
                                    <div key={i} className="feature_item">
                                        <div className="feature_dot"></div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="footer_meta stagger_5">
                        Operational Environment • SECURE v2.4
                    </div>
                </div>

                {/* Authentication Form Side */}
                <div className="login_form_side">

                    <div className="form_header stagger_1">
                        <h2>Authorize</h2>
                        <p>Secure authentication required for portal access.</p>
                    </div>

                    {/* Error Feedback */}
                    {error && (
                        <div className="error_container">
                            <AlertCircle className="error_icon" size={24} />
                            <div className="error_content">
                                <h5>Access Denied</h5>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input_group stagger_2">
                            <label className="input_label" htmlFor="username">
                                Operator Identity
                            </label>
                            <div className="input_control_wrapper">
                                <User className="input_icon" size={20} />
                                <input
                                    id="username"
                                    type="text"
                                    className="login_input"
                                    placeholder="Username or Verified Email"
                                    value={username}
                                    onChange={handleInputChange(setUsername)}
                                    disabled={isLoggingIn}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="input_group stagger_3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="input_label" htmlFor="password">
                                    Security Code
                                </label>
                                <a href="mailto:temesgen12m1@gmail.com" className="input_label" style={{ color: 'var(--accent-main)', cursor: 'pointer', textDecoration: 'none' }}>
                                    Recover
                                </a>
                            </div>
                            <div className="input_control_wrapper">
                                <Lock className="input_icon" size={20} />
                                <input
                                    id="password"
                                    type="password"
                                    className="login_input"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={handleInputChange(setPassword)}
                                    disabled={isLoggingIn}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="auth_submit_btn stagger_4"
                        >
                            <div className="shimmer_effect"></div>
                            {isLoggingIn ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Establish Secure Link</span>
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth_footer_info stagger_5">
                        <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} />
                        Military Grade AES-256 Encryption
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

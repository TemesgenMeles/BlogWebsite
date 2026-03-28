import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../../src/context/AuthContext';
import { Lock, User, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

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
        <div className="relative flex justify-center items-center min-h-screen bg-slate-950 p-4 font-sans overflow-hidden">
            
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>

            <div className="relative z-10 flex bg-white/[0.02] backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-w-5xl w-full border border-white/10">
                
                {/* Visual/Branding Sidebar */}
                <div className="hidden lg:flex flex-col justify-between w-[45%] bg-slate-900 border-r border-white/5 p-12 relative">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-green-950/20"></div>
                    
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                            <Lock className="text-white h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white uppercase">From My Life</span>
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                            Portal <br /> 
                            <span className="text-green-400">Administration</span>
                        </h2>
                        <div className="space-y-4">
                            {[
                                "Encrypted session management",
                                "Real-time content moderation",
                                "Advanced user analytics"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-400">
                                    <div className="h-1 w-1 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-8 border-t border-white/10 text-xs text-slate-500 font-medium tracking-widest uppercase">
                        Version 2.4.0 • Secure Build
                    </div>
                </div>

                {/* Authentication Form */}
                <div className="w-full lg:w-[55%] p-8 md:p-16 flex flex-col justify-center relative">
                    
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <Lock className="text-white h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold text-white uppercase tracking-tighter">FML Admin</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3">System Access</h2>
                        <p className="text-slate-400 font-medium">Please authenticate to continue to the backend.</p>
                    </div>

                    {/* Error Feedback */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-red-400 font-semibold mb-0.5">Authentication Failed</p>
                                <p className="text-red-300/80 leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="username">
                                Identity
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-green-500 transition-colors" />
                                </div>
                                <input 
                                    id="username"
                                    type="text" 
                                    className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-white placeholder-slate-600 transition-all sm:text-sm" 
                                    placeholder="Username or email"
                                    value={username}
                                    onChange={handleInputChange(setUsername)}
                                    disabled={isLoggingIn}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="password">
                                    Security Code
                                </label>
                                <a href="#" className="text-xs font-bold text-green-500/80 hover:text-green-400 transition-colors uppercase tracking-widest">
                                    Recover
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-green-500 transition-colors" />
                                </div>
                                <input 
                                    id="password"
                                    type="password" 
                                    className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-white placeholder-slate-600 transition-all sm:text-sm" 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={handleInputChange(setPassword)}
                                    disabled={isLoggingIn}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center pt-2">
                            <label className="relative flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only" 
                                />
                                <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-md peer-checked:bg-green-500 peer-checked:border-green-500 transition-all duration-200"></div>
                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-3 text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Remember identity</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoggingIn}
                            className={`w-full relative group bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_30px_rgba(34,197,94,0.5)] overflow-hidden flex justify-center items-center`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            {isLoggingIn ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Authorize Access <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                            End-to-End Encrypted Session
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

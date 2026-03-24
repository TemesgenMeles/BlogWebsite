import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, X, User, Calendar, Clock, Send } from 'lucide-react';

const ManageMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/contact-message/');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/contact-message/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new: false })
            });
            if (response.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, new: false } : m));
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent delete this inquiry?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/contact-message/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setMessages(messages.filter(m => m.id !== id));
                if (selectedMessage?.id === id) setSelectedMessage(null);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const handleView = (msg) => {
        setSelectedMessage(msg);
        if (msg.new) markAsRead(msg.id);
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Contact Messages</h1>
                    <p>Inquiries and feedback from your readers.</p>
                </div>
            </header>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Fetching messages...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>Sender</th>
                                <th>Subject</th>
                                <th>Received</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(m => (
                                <tr key={m.id} style={{ background: m.new ? 'rgba(16, 185, 129, 0.03)' : 'inherit' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '8px', background: m.new ? '#ecfdf5' : '#f1f5f9', borderRadius: '50%', color: m.new ? '#10b981' : '#64748b' }}>
                                                <User size={18} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{m.name}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: m.new ? '700' : '500' }}>{m.subject}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.875rem' }}>
                                            <span>{new Date(m.message_date).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(m.message_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status_badge ${m.new ? 'draft' : 'approved'}`} style={{ color: m.new ? '#9b1c1c' : '#03543f', background: m.new ? '#fee2e2' : '#def7ec' }}>
                                            {m.new ? 'New Inquiry' : 'Reviewed'}
                                        </span>
                                    </td>
                                    <td className="action_cells">
                                        <button onClick={() => handleView(m)} className="action_btn" title="Detailed View">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(m.id)} className="action_btn delete" title="Delete Permanent">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && messages.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>Your inbox is quiet. No messages yet.</p>
                    </div>
                )}
            </div>

            {selectedMessage && (
                <div className="message_modal_overlay animation_fade_in">
                    <div className="message_modal_content animation_slide_up">
                        <header className="modal_header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedMessage.subject}</h3>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span><User size={14} /> {selectedMessage.name}</span>
                                    <span><Mail size={14} /> {selectedMessage.email}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMessage(null)} className="action_btn">
                                <X size={20} />
                            </button>
                        </header>
                        <div className="modal_body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                                <Clock size={14} /> Sent on {new Date(selectedMessage.message_date).toLocaleString()}
                            </div>
                            <div style={{ background: 'transparent', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {selectedMessage.message}
                            </div>
                        </div>
                        <footer className="modal_footer">
                            <button onClick={() => handleDelete(selectedMessage.id)} className="admin_btn_danger">
                                <Trash2 size={18} /> Delete
                            </button>
                            <a href={`mailto:${selectedMessage.email}`} className="admin_btn_primary">
                                <Send size={18} /> Reply via Email
                            </a>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMessages;

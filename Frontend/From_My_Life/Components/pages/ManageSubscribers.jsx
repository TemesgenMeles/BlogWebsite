import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Download, Users, Calendar, CheckCircle } from 'lucide-react';

const ManageSubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSubscribers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/newsletter/');
            const data = await response.json();
            setSubscribers(data);
        } catch (error) {
            console.error("Error fetching subscribers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent remove this subscriber from the list?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/newsletter/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSubscribers(subscribers.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Error deleting subscriber:", error);
        }
    };

    const filteredSubscribers = subscribers.filter(s => 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["ID,Email,Date Subscribed"].join(",") + "\n"
            + subscribers.map(s => `${s.id},${s.email},${s.subscribed_date}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `blog_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Newsletter Subscribers</h1>
                    <p>Building your audience. Total active subscribers: <strong>{subscribers.length}</strong></p>
                </div>
                <button onClick={exportToCSV} className="admin_btn_secondary">
                    <Download size={18} /> Export CSV List
                </button>
            </header>

            <div className="admin_table_controls" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="search_bar" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Filter by email address..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                </div>
            </div>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Fetching audience data...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>Subscriber</th>
                                <th>Subscription Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscribers.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '10px', color: '#10b981' }}>
                                                <Mail size={18} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{s.email}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{s.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                            <Calendar size={14} className="text_muted" />
                                            <span>{new Date(s.subscribed_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status_badge publish" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    </td>
                                    <td className="action_cells">
                                        <button onClick={() => handleDelete(s.id)} className="action_btn delete" title="Unsubscribe Message">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filteredSubscribers.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No subscribers found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageSubscribers;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { 'x-auth-token': token }
                });
                setUser(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, []);

    if (!user) return <div>Loading...</div>;

    const getLevelColor = (level) => {
        switch (level) {
            case 'Legendary': return '#a855f7'; // Purple
            case 'Diamond': return '#0ea5e9'; // Blue
            case 'Gold': return '#eab308'; // Yellow
            case 'Silver': return '#94a3b8'; // Gray
            default: return '#94a3b8';
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#334155',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'var(--text)'
                }}>
                    {user.firstName[0]}{user.lastName[0]}
                </div>

                <h2 style={{ marginBottom: '0.5rem' }}>{user.firstName} {user.lastName}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user.email}</p>

                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Level</p>
                        <h3 style={{ color: getLevelColor(user.level), fontSize: '1.5rem' }}>{user.level}</h3>
                    </div>
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Contribution Points</p>
                        <h3 style={{ color: 'var(--success)', fontSize: '1.5rem' }}>{user.points}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

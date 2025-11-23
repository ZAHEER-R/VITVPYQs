import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [papers, setPapers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPapers();
    }, [search]);

    const fetchPapers = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/papers/search?query=${search}`);
            setPapers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = (filePath) => {
        // In a real app, this would trigger a download
        // For local, we just open the file path relative to server
        window.open(`http://localhost:5000/${filePath}`, '_blank');
    };

    return (
        <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'var(--gradient-main)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Find Your PYQs
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Search through thousands of previous year question papers shared by students.
                </p>

                <input
                    type="text"
                    placeholder="Search by Subject, Course Code, or Exam Name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', padding: '1rem' }}
                />
            </div>

            <div className="grid grid-cols-3">
                {papers.map(paper => (
                    <div key={paper._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <span style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--primary)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {paper.category}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{paper.examYear}</span>
                        </div>

                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{paper.subject}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{paper.courseCode} • {paper.examName}</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem'
                            }}>
                                {paper.uploader?.firstName?.[0]}
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {paper.uploader?.firstName} {paper.uploader?.lastName}
                            </span>
                        </div>

                        <button
                            onClick={() => handleDownload(paper.filePath)}
                            className="btn btn-outline"
                            style={{ width: '100%' }}
                        >
                            View Paper
                        </button>
                    </div>
                ))}
            </div>

            {papers.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    No papers found. Try a different search term.
                </div>
            )}
        </div>
    );
};

export default Home;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        subject: '',
        courseCode: '',
        examYear: '',
        examName: '',
        category: 'CAT1'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('file', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/papers/upload', data, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Paper uploaded successfully! You earned 50 points.');
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Error uploading paper');
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Upload PYQ Paper</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <input
                            type="text"
                            name="subject"
                            placeholder="Subject Name"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="courseCode"
                            placeholder="Course Code"
                            value={formData.courseCode}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <input
                            type="text"
                            name="examYear"
                            placeholder="Exam Year (e.g. 2023)"
                            value={formData.examYear}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="examName"
                            placeholder="Exam Name"
                            value={formData.examName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="CAT1">CAT 1</option>
                        <option value="CAT2">CAT 2</option>
                        <option value="FAT">FAT</option>
                    </select>

                    <div style={{ marginBottom: '1rem', padding: '1rem', border: '2px dashed #334155', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                            style={{ display: 'none' }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--primary)' }}>
                            {file ? file.name : 'Click to upload PDF or Image'}
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Upload Paper
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Upload;

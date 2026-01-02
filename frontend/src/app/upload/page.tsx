'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function UploadPage() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [topic, setTopic] = useState('');
    const [humanDebater, setHumanDebater] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('aristotle');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const agents = [
        { id: 'aristotle', name: 'Aristotle', icon: '🎭' },
        { id: 'socrates', name: 'Socrates', icon: '❓' },
        { id: 'darwin', name: 'Darwin', icon: '🔬' },
        { id: 'custom', name: '+ My Agent', icon: '🤖' },
    ];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !title.trim()) return;

        setUploading(true);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 200));
            setProgress(i);
        }

        // In production, POST to /api/videos/upload
        setUploading(false);
        alert('Video uploaded successfully! It will be processed and available shortly.');
    };

    return (
        <div className="arena-container" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="text-glow-gold" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        📤 Upload Debate Video
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Share your recorded debates with the world. Upload videos from your own studio or recordings with portable AI agents.
                    </p>
                </div>

                {/* Video Upload Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="card"
                    style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        border: dragActive ? '2px solid var(--cyan)' : '2px dashed var(--surface-lighter)',
                        background: dragActive ? 'rgba(0, 255, 255, 0.05)' : 'transparent',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {file ? (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <p style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {file.name}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                style={{ marginTop: '1rem', background: 'var(--crimson)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Drag and drop your video here
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                or click to browse • MP4, MOV, WebM supported
                            </p>
                        </>
                    )}
                </div>

                {/* Video Details Form */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>📝 Video Details</h3>

                    {/* Title */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., AI vs Human: The Future of Creativity"
                            className="input-arena"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell viewers what this debate is about..."
                            className="input-arena"
                            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Topic */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Debate Topic *
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., The Impact of AI on Human Creativity"
                            className="input-arena"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Debaters */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                Human Debater Name
                            </label>
                            <input
                                type="text"
                                value={humanDebater}
                                onChange={(e) => setHumanDebater(e.target.value)}
                                placeholder="Your name"
                                className="input-arena"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                AI Agent Used
                            </label>
                            <select
                                value={selectedAgent}
                                onChange={(e) => setSelectedAgent(e.target.value)}
                                className="input-arena"
                                style={{ width: '100%' }}
                            >
                                {agents.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.icon} {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="card" style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.05), rgba(0, 255, 255, 0.03))',
                }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>💡 Tips for Great Debate Videos</h4>
                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                        <li>Record in a quiet environment with good lighting</li>
                        <li>Use a quality microphone for clear audio</li>
                        <li>Show both your screen (AI response) and your face</li>
                        <li>Keep debates focused - 10-30 minutes is ideal</li>
                        <li>Add intro/outro for professional touch</li>
                    </ul>
                </div>

                {/* Upload Button */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/feed" style={{ flex: 1 }}>
                        <button className="btn-secondary" style={{ width: '100%' }}>
                            Cancel
                        </button>
                    </Link>
                    <button
                        onClick={handleUpload}
                        className="btn-primary"
                        style={{ flex: 2 }}
                        disabled={!file || !title.trim() || uploading}
                    >
                        {uploading ? (
                            <>Uploading... {progress}%</>
                        ) : (
                            <>🚀 Upload Video</>
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                {uploading && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ background: 'var(--surface)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: 'var(--gradient-gold)',
                                    transition: 'width 0.3s ease',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

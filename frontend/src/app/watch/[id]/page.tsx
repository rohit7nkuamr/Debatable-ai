'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock video data
const mockVideoData = {
    id: '1',
    title: 'AI vs Human: The Future of Creativity',
    description: `An intense philosophical debate exploring whether artificial intelligence will enhance or replace human creativity in the arts. 

This debate covers:
- The nature of creativity and consciousness
- Historical precedents of technology changing art
- The role of human emotion in creative expression
- Potential collaboration between AI and human artists

Watch as our debaters go head-to-head on one of the most pressing questions of our time.`,
    views: 12500,
    likes: 892,
    date: 'Dec 27, 2024',
    debaters: {
        human: { name: 'Alex', avatar: '👤', score: 78 },
        ai: { name: 'Aristotle', avatar: '🤖', score: 85 },
    },
    topic: 'The Impact of AI on Human Creativity',
    winner: 'ai' as const,
    duration: '24:30',
    transcript: [
        { time: '0:00', speaker: 'judge', text: 'Welcome to the Debate Arena! Today we discuss the impact of AI on human creativity.' },
        { time: '0:45', speaker: 'human', text: 'I believe AI will fundamentally enhance human creativity by removing barriers to expression and democratizing artistic tools.' },
        { time: '2:30', speaker: 'ai', text: 'While technology provides tools, I must contend that true creativity stems from the depth of human consciousness and lived experience that machines cannot replicate.' },
        { time: '5:15', speaker: 'human', text: 'But consider the printing press, photography, digital art - each was feared as the death of creativity, yet art flourished.' },
        { time: '8:00', speaker: 'ai', text: 'A fair historical parallel. However, those tools augmented human capability. AI generates content autonomously - a fundamentally different paradigm.' },
        { time: '12:30', speaker: 'judge', text: 'Excellent points from both sides. Let us delve deeper into the philosophical implications.' },
    ],
    comments: [
        { id: 1, user: 'PhilosophyFan99', text: 'Incredible debate! The AI made some really unexpected arguments.', likes: 45, time: '2 hours ago' },
        { id: 2, user: 'TechDebater', text: 'Alex held his ground well against a tough opponent. Love this platform!', likes: 32, time: '3 hours ago' },
        { id: 3, user: 'ArtistMind', text: 'As a digital artist, this debate really made me think about my own creative process.', likes: 28, time: '5 hours ago' },
    ],
    relatedVideos: [
        { id: '2', title: 'Philosophy of Mind: Can Machines Think?', views: 8340, duration: '45:12' },
        { id: '4', title: 'Climate Change: Technology vs Nature', views: 15200, duration: '32:18' },
        { id: '5', title: 'Universal Basic Income: Necessity or Dystopia?', views: 9800, duration: '28:45' },
    ],
};

export default function WatchPage() {
    const params = useParams();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [comment, setComment] = useState('');
    const [activeTab, setActiveTab] = useState<'transcript' | 'comments'>('transcript');

    const video = mockVideoData;

    const formatViews = (views: number) => {
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };

    return (
        <div className="arena-container" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div
                style={{
                    maxWidth: '1600px',
                    margin: '0 auto',
                    padding: '2rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 350px',
                    gap: '2rem',
                }}
            >
                {/* Main Content */}
                <div>
                    {/* Video Player */}
                    <div
                        style={{
                            position: 'relative',
                            paddingTop: '56.25%',
                            background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {/* 3D Arena Preview / Player */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                background: 'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.1) 0%, transparent 70%)',
                            }}
                        >
                            {!isPlaying ? (
                                <>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚔️</div>
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        style={{
                                            background: 'rgba(201, 162, 39, 0.9)',
                                            color: '#0A0A0A',
                                            border: 'none',
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            fontSize: '2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 0 40px rgba(201, 162, 39, 0.5)',
                                        }}
                                    >
                                        ▶️
                                    </button>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                                        Click to play recorded debate
                                    </p>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--gold)' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>🎬 Debate Playback</p>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        3D replay feature coming soon...
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            <div
                                style={{
                                    width: `${(currentTime / 100) * 100}%`,
                                    height: '100%',
                                    background: 'var(--gold)',
                                }}
                            />
                        </div>

                        {/* Duration */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px',
                                background: 'rgba(0, 0, 0, 0.8)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                color: 'white',
                            }}
                        >
                            {video.duration}
                        </div>
                    </div>

                    {/* Video Info */}
                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: '0.75rem',
                        }}
                    >
                        {video.title}
                    </h1>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                            <span>{formatViews(video.views)} views</span>
                            <span>•</span>
                            <span>{video.date}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                👍 {video.likes}
                            </button>
                            <button className="btn-secondary">
                                📤 Share
                            </button>
                            <button className="btn-secondary">
                                📋 Save
                            </button>
                        </div>
                    </div>

                    {/* Debaters Card */}
                    <div
                        className="card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {/* Human */}
                        <div style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    margin: '0 auto 0.5rem',
                                }}
                            >
                                {video.debaters.human.avatar}
                            </div>
                            <p style={{ fontWeight: 600, color: 'var(--gold)' }}>{video.debaters.human.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Score: {video.debaters.human.score}
                            </p>
                        </div>

                        {/* VS */}
                        <div
                            style={{
                                background: video.winner === 'ai' ? 'var(--cyan)' : 'var(--gold)',
                                color: 'var(--background)',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontWeight: 700,
                            }}
                        >
                            🏆 {video.winner === 'ai' ? 'AI WINS' : 'HUMAN WINS'}
                        </div>

                        {/* AI */}
                        <div style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--cyan), #0088aa)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    margin: '0 auto 0.5rem',
                                    boxShadow: video.winner === 'ai' ? '0 0 20px var(--cyan)' : 'none',
                                }}
                            >
                                {video.debaters.ai.avatar}
                            </div>
                            <p style={{ fontWeight: 600, color: 'var(--cyan)' }}>{video.debaters.ai.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Score: {video.debaters.ai.score}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {video.description}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('transcript')}
                            style={{
                                background: activeTab === 'transcript' ? 'var(--gold)' : 'transparent',
                                color: activeTab === 'transcript' ? 'var(--background)' : 'var(--text-primary)',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            📜 Transcript
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            style={{
                                background: activeTab === 'comments' ? 'var(--gold)' : 'transparent',
                                color: activeTab === 'comments' ? 'var(--background)' : 'var(--text-primary)',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            💬 Comments ({video.comments.length})
                        </button>
                    </div>

                    {/* Transcript */}
                    {activeTab === 'transcript' && (
                        <div className="card">
                            {video.transcript.map((entry, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '0.75rem',
                                        borderLeft: `3px solid ${entry.speaker === 'human'
                                                ? 'var(--gold)'
                                                : entry.speaker === 'ai'
                                                    ? 'var(--cyan)'
                                                    : 'var(--crimson)'
                                            }`,
                                        marginBottom: '0.75rem',
                                        background:
                                            entry.speaker === 'human'
                                                ? 'rgba(201, 162, 39, 0.05)'
                                                : entry.speaker === 'ai'
                                                    ? 'rgba(0, 255, 255, 0.05)'
                                                    : 'rgba(139, 0, 0, 0.05)',
                                        borderRadius: '0 8px 8px 0',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                color:
                                                    entry.speaker === 'human'
                                                        ? 'var(--gold)'
                                                        : entry.speaker === 'ai'
                                                            ? 'var(--cyan)'
                                                            : 'var(--crimson)',
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {entry.speaker === 'human' ? video.debaters.human.name : entry.speaker === 'ai' ? video.debaters.ai.name : 'Judge'}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{entry.time}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{entry.text}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comments */}
                    {activeTab === 'comments' && (
                        <div>
                            {/* Add Comment */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="input-arena"
                                    style={{ flex: 1 }}
                                />
                                <button className="btn-primary" disabled={!comment.trim()}>
                                    Post
                                </button>
                            </div>

                            {/* Comments List */}
                            {video.comments.map((c) => (
                                <div key={c.id} className="card" style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{c.user}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.time}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{c.text}</p>
                                    <button
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        👍 {c.likes}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar - Related Videos */}
                <div>
                    <h3 style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '1rem' }}>
                        Related Debates
                    </h3>

                    {video.relatedVideos.map((rv) => (
                        <Link key={rv.id} href={`/watch/${rv.id}`} style={{ textDecoration: 'none' }}>
                            <div
                                className="card"
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginBottom: '0.75rem',
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    style={{
                                        width: '120px',
                                        height: '68px',
                                        background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(0, 255, 255, 0.1))',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    ⚔️
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4
                                        style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            marginBottom: '0.25rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {rv.title}
                                    </h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        {formatViews(rv.views)} views • {rv.duration}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Start Debate CTA */}
                    <div
                        className="card"
                        style={{
                            marginTop: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(0, 255, 255, 0.05))',
                            border: '2px solid var(--gold)',
                        }}
                    >
                        <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Ready to debate this topic yourself?
                        </p>
                        <Link href="/arena">
                            <button className="btn-primary">⚔️ Enter Arena</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

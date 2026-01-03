'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    views: number;
    likes: number;
    date: string;
    isLive: boolean;
    debaters: {
        human: string;
        ai: string;
    };
    topic: string;
    winner?: 'human' | 'ai' | 'draw';
}


function VideoCard({ video }: { video: Video }) {
    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };

    return (
        <Link href={`/watch/${video.id}`} style={{ textDecoration: 'none' }}>
            <div
                style={{
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--surface-lighter)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                }}
                className="video-card"
            >
                {/* Thumbnail */}
                <div
                    style={{
                        position: 'relative',
                        paddingTop: '56.25%', // 16:9 aspect ratio
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
                    }}
                >
                    {/* Placeholder gradient background */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(135deg, 
                ${video.isLive ? 'rgba(139, 0, 0, 0.3)' : 'rgba(201, 162, 39, 0.1)'} 0%, 
                rgba(0, 255, 255, 0.1) 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontSize: '3rem' }}>⚔️</span>
                    </div>

                    {/* Duration/Live badge */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: video.isLive ? '#8B0000' : 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        {video.isLive && (
                            <span
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    animation: 'pulse 1s infinite',
                                }}
                            />
                        )}
                        {video.duration}
                    </div>

                    {/* Winner badge */}
                    {video.winner && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background:
                                    video.winner === 'human'
                                        ? 'rgba(201, 162, 39, 0.9)'
                                        : video.winner === 'ai'
                                            ? 'rgba(0, 255, 255, 0.9)'
                                            : 'rgba(128, 128, 128, 0.9)',
                                color: video.winner === 'ai' ? '#0A0A0A' : 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                            }}
                        >
                            {video.winner === 'draw' ? '🤝 Draw' : `🏆 ${video.winner === 'human' ? 'Human' : 'AI'} Won`}
                        </div>
                    )}
                </div>

                {/* Video Info */}
                <div style={{ padding: '1rem' }}>
                    <h3
                        style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {video.title}
                    </h3>

                    {/* Debaters */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            fontSize: '0.85rem',
                        }}
                    >
                        <span style={{ color: 'var(--gold)' }}>👤 {video.debaters.human}</span>
                        <span style={{ color: 'var(--text-muted)' }}>vs</span>
                        <span style={{ color: 'var(--cyan)' }}>🤖 {video.debaters.ai}</span>
                    </div>

                    {/* Stats */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                        }}
                    >
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{video.date}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function FeedPage() {
    const [filter, setFilter] = useState<'all' | 'live' | 'recent' | 'popular'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                // In a real app, you might pass filter params to the API
                const fetchedVideos = await api.videos.list();

                // Map backend response to frontend Video interface
                const mappedVideos: Video[] = fetchedVideos.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    description: v.description || '',
                    thumbnail: v.thumbnail_url || '',
                    duration: v.duration || '00:00',
                    views: v.views || 0,
                    likes: v.likes || 0,
                    date: new Date(v.created_at).toLocaleDateString(),
                    isLive: v.is_live,
                    debaters: {
                        human: v.human_debater || 'Human',
                        ai: v.ai_name || 'AI'
                    },
                    topic: v.topic || '',
                    winner: v.winner,
                }));

                setVideos(mappedVideos);
            } catch (error) {
                console.error("Failed to fetch videos:", error);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const filteredVideos = videos.filter((video) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!video.title.toLowerCase().includes(query) &&
                !video.topic.toLowerCase().includes(query)) {
                return false;
            }
        }

        if (filter === 'live') return video.isLive;
        if (filter === 'recent') return !video.isLive;
        if (filter === 'popular') return video.views > 100; // Adjusted threshold
        return true;
    });

    return (
        <div
            className="arena-container"
            style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem' }}
        >
            {/* Header */}
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto 2rem',
                }}
            >
                <h1
                    className="text-glow-gold"
                    style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                    }}
                >
                    📺 Debate Feed
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Watch recorded debates, join live streams, and learn from the best arguments
                </p>
            </div>

            {/* Controls */}
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}
            >
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search debates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-arena"
                    style={{ maxWidth: '400px' }}
                />

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'live', label: '🔴 Live' },
                        { id: 'recent', label: '🕐 Recent' },
                        { id: 'popular', label: '🔥 Popular' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as typeof filter)}
                            style={{
                                background: filter === f.id ? 'var(--gold)' : 'var(--surface)',
                                color: filter === f.id ? 'var(--background)' : 'var(--text-primary)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Upload Button */}
                <Link href="/upload">
                    <button className="btn-primary">
                        ➕ Upload Debate
                    </button>
                </Link>
            </div>

            {/* Video Grid */}
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                }}
            >
                {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>

            {/* Empty State */}
            {filteredVideos.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p>No debates found matching your criteria</p>
                </div>
            )}

            <style jsx global>{`
        .video-card:hover {
          transform: translateY(-4px);
          border-color: var(--gold) !important;
          box-shadow: 0 10px 30px rgba(201, 162, 39, 0.2);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}

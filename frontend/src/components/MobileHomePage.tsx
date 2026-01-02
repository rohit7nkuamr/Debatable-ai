'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// Define Interface based on API response
// Adjust as needed based on actual API definition in api.ts
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  date: string;
  isLive: boolean;
  debaters: { human: string; ai: string };
  topic: string;
  winner?: 'human' | 'ai' | 'draw';
  channel: string;
  channelAvatar: string;
}

const categories = [
  { id: 'all', label: 'All', icon: '🔥' },
  { id: 'live', label: 'Live', icon: '🔴' },
  { id: 'philosophy', label: 'Philosophy', icon: '🤔' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'ethics', label: 'Ethics', icon: '⚖️' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'politics', label: 'Politics', icon: '🏛️' },
  { id: 'economics', label: 'Economics', icon: '📊' },
];

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function VideoCard({ video, compact = false }: { video: Video; compact?: boolean }) {
  return (
    <Link href={video.isLive ? '/arena' : `/watch/${video.id}`} style={{ textDecoration: 'none' }}>
      <div className={`video-card ${compact ? 'compact' : ''}`}>
        {/* Thumbnail */}
        <div className="video-thumbnail">
          <div className="video-thumbnail-content">
            <span className="video-icon">⚔️</span>
          </div>

          {/* Duration/Live Badge */}
          <div className={`video-badge ${video.isLive ? 'live' : ''}`}>
            {video.isLive && <span className="live-dot" />}
            {video.duration}
          </div>

          {/* Winner Badge */}
          {video.winner && (
            <div className={`winner-badge ${video.winner}`}>
              {video.winner === 'draw' ? '🤝' : '🏆'} {video.winner === 'human' ? 'Human' : video.winner === 'ai' ? 'AI' : 'Draw'}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="video-info">
          {/* Channel Avatar */}
          <div className="channel-avatar">{video.channelAvatar}</div>

          <div className="video-details">
            <h3 className="video-title">{video.title}</h3>
            <p className="video-channel">{video.channel}</p>
            <p className="video-meta">
              {formatViews(video.views)} views • {video.date}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategoryPill({ category, isActive, onClick }: {
  category: typeof categories[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`category-pill ${isActive ? 'active' : ''}`}
    >
      <span className="category-icon">{category.icon}</span>
      <span className="category-label">{category.label}</span>
    </button>
  );
}

export default function MobileHomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [videos, setVideos] = useState<Video[]>([]);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch videos from API
    const fetchVideos = async () => {
      try {
        // In a real app, you might distinguish active/live vs past
        // For now, we'll just fetch list
        const fetchedVideos = await api.videos.list();
        // Map the backend data to our frontend Video interface if needed
        // Assuming backend returns roughly compatible structure or mapping it here:
        const mappedVideos: Video[] = fetchedVideos.map((v: any) => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail_url || '',
          duration: '10:00', // Mock if missing
          views: v.view_count || 0,
          likes: v.like_count || 0,
          date: new Date(v.created_at).toLocaleDateString(), // Format date
          isLive: false, // Need live status from API
          debaters: { human: 'Human', ai: 'AI' }, // Potentially missing from video list endpoint
          topic: 'Debate Topic',
          channel: 'Samvad AI',
          channelAvatar: '⚔️'
        }));
        // If the API returns empty, keep fallback or handle empty state
        if (mappedVideos.length > 0) {
          setVideos(mappedVideos);
        } else {
          // Fallback mock data for demo if API is empty
          setVideos([
            {
              id: '1', title: 'AI vs Human: The Future of Creativity', thumbnail: '', duration: '24:30',
              views: 125000, likes: 8920, date: '2 hours ago', isLive: false,
              debaters: { human: 'Alex', ai: 'Aristotle' }, topic: 'AI & Creativity',
              winner: 'ai', channel: 'Philosophy Arena', channelAvatar: '🎭',
            },
            // ... (add more mocks if needed for visual pop)
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch videos", error);
        // Fallback on error
        setVideos([
          {
            id: '1', title: 'AI vs Human: The Future of Creativity', thumbnail: '', duration: '24:30',
            views: 125000, likes: 8920, date: '2 hours ago', isLive: false,
            debaters: { human: 'Alex', ai: 'Aristotle' }, topic: 'AI & Creativity',
            winner: 'ai', channel: 'Philosophy Arena', channelAvatar: '🎭',
          }
        ]);
      }
    };

    fetchVideos();
  }, []);


  const filteredVideos = activeCategory === 'all'
    ? videos
    : activeCategory === 'live'
      ? videos.filter(v => v.isLive)
      : videos;

  return (
    <>
      <style jsx global>{`
        /* Mobile-First YouTube-Style CSS */
        
        .mobile-home {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 80px; /* Space for mobile nav */
        }

        /* Mobile Header */
        .mobile-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(10px);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--surface-lighter);
        }

        .mobile-logo {
          font-size: 1.25rem;
          font-weight: 800;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-actions {
          display: flex;
          gap: 16px;
        }

        .header-btn {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 8px;
        }

        /* Category Pills Scroll */
        .category-scroll {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding: 12px 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          background: var(--surface-dark);
          border-bottom: 1px solid var(--surface-lighter);
        }

        .category-scroll::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          border: none;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-pill.active {
          background: var(--gold);
          color: var(--background);
        }

        .category-pill:hover:not(.active) {
          background: var(--surface-lighter);
        }

        .category-icon {
          font-size: 1rem;
        }

        /* Video Grid */
        .video-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }

        @media (min-width: 640px) {
          .video-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            max-width: 1400px;
            margin: 0 auto;
          }
        }

        @media (min-width: 1400px) {
          .video-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Video Card */
        .video-card {
          background: transparent;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .video-card:hover {
          transform: translateY(-2px);
        }

        .video-thumbnail {
          position: relative;
          padding-top: 56.25%;
          background: linear-gradient(135deg, #1A1A1A, #0F0F0F);
          border-radius: 12px;
          overflow: hidden;
        }

        .video-thumbnail-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(0, 255, 255, 0.1));
        }

        .video-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .video-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .video-badge.live {
          background: #8B0000;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .winner-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .winner-badge.human {
          background: rgba(201, 162, 39, 0.9);
          color: white;
        }

        .winner-badge.ai {
          background: rgba(0, 255, 255, 0.9);
          color: #0A0A0A;
        }

        .winner-badge.draw {
          background: rgba(128, 128, 128, 0.9);
          color: white;
        }

        .video-info {
          display: flex;
          gap: 12px;
          padding: 12px 0;
        }

        .channel-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .video-details {
          flex: 1;
          min-width: 0;
        }

        .video-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }

        .video-channel {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0 0 2px;
        }

        .video-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Mobile Bottom Navigation */
        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.98);
          backdrop-filter: blur(10px);
          border-top: 1px solid var(--surface-lighter);
          display: flex;
          justify-content: space-around;
          padding: 8px 0;
          z-index: 100;
        }

        @media (min-width: 768px) {
          .mobile-nav {
            display: none;
          }
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.7rem;
          padding: 4px 12px;
          cursor: pointer;
          text-decoration: none;
        }

        .nav-item.active {
          color: var(--gold);
        }

        .nav-icon {
          font-size: 1.5rem;
        }

        .nav-item.create {
          position: relative;
        }

        .nav-item.create .nav-icon {
          background: var(--gradient-gold);
          border-radius: 8px;
          padding: 8px 16px;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Shorts-style preview (horizontal scroll) */
        .shorts-section {
          padding: 16px;
        }

        .shorts-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .shorts-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .shorts-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 8px;
        }

        .shorts-scroll::-webkit-scrollbar {
          display: none;
        }

        .short-card {
          flex-shrink: 0;
          width: 160px;
          height: 280px;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(201, 162, 39, 0.2), rgba(0, 255, 255, 0.1));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .short-card:hover {
          transform: scale(1.02);
        }
      `}</style>

      <div className="mobile-home">
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-logo">
            ⚔️ SAMVAD AI
          </div>
          <div className="header-actions">
            <button className="header-btn">🔔</button>
            <button className="header-btn">🔍</button>
            <Link href="/profile" className="header-btn">👤</Link>
          </div>
        </header>

        {/* Category Pills */}
        <div className="category-scroll" ref={categoryRef}>
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              category={cat}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>

        {/* Shorts Section (Horizontal Scroll) */}
        <div className="shorts-section">
          <div className="shorts-header">
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <span className="shorts-title">Quick Debates</span>
          </div>
          <div className="shorts-scroll">
            {videos.slice(0, 5).map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`} style={{ textDecoration: 'none' }}>
                <div className="short-card">
                  <span style={{ fontSize: '2rem' }}>⚔️</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center', padding: '0 8px' }}>
                    {video.debaters.human} vs {video.debaters.ai}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    {formatViews(video.views)} views
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-nav">
          <Link href="/" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link href="/feed" className="nav-item">
            <span className="nav-icon">📺</span>
            <span>Feed</span>
          </Link>
          <Link href="/arena" className="nav-item create">
            <span className="nav-icon">⚔️</span>
          </Link>
          <Link href="/agents" className="nav-item">
            <span className="nav-icon">🤖</span>
            <span>Agents</span>
          </Link>
          <Link href="/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>You</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

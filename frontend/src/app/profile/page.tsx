'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Agent {
    id: string;
    name: string;
    personality: string;
    description: string;
    documentCount: number;
}

export default function ProfilePage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch agents to show simple stats
        const fetchStats = async () => {
            try {
                const data = await api.agents.list();
                setAgents(data);
            } catch (err) {
                console.error("Failed to load profile stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Mock User Data
    const user = {
        name: "Debate Master",
        handle: "@debatemaster",
        joinDate: "Jan 2026",
        avatar: "👤",
        level: 5,
        xp: 2450,
        nextLevelXp: 3000
    };

    const stats = [
        { label: "Debates Watched", value: 42, icon: "📺" },
        { label: "Debates Created", value: 15, icon: "⚔️" },
        { label: "Agents Trained", value: agents.length, icon: "🤖" },
        { label: "Comments Posted", value: 128, icon: "💬" },
    ];

    return (
        <div className="arena-container" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Profile Header */}
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--surface-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        border: '2px solid var(--gold)'
                    }}>
                        {user.avatar}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ color: 'var(--gold)', margin: 0, fontSize: '2rem' }}>{user.name}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 1rem 0' }}>{user.handle} • Joined {user.joinDate}</p>

                        {/* XP Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>Level {user.level}</span>
                            <div style={{ flex: 1, height: '8px', background: 'var(--surface-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(user.xp / user.nextLevelXp) * 100}%`,
                                    height: '100%',
                                    background: 'var(--gradient-gold)',
                                }} />
                            </div>
                            <span style={{ color: 'var(--text-muted)' }}>{user.xp} / {user.nextLevelXp} XP</span>
                        </div>
                    </div>

                    <button className="btn-secondary">⚙️ Settings</button>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '-' : stat.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Content Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    {/* Recent Agents */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>🤖 My Top Agents</h3>
                            <Link href="/agents" style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>View All</Link>
                        </div>

                        {loading ? (
                            <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>Loading agents...</div>
                        ) : agents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                No agents created yet.
                                <br />
                                <Link href="/agents"><button className="btn-secondary" style={{ marginTop: '0.5rem' }}>Create Agent</button></Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {agents.slice(0, 3).map(agent => (
                                    <div key={agent.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        background: 'var(--surface-dark)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '1.5rem' }}>🤖</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{agent.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agent.personality}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Account Settings Placeholder */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🛡️ Security & Privacy</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Email Notifications</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Public Profile</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Two-Factor Auth</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Disabled</span>
                            </div>

                            <button className="btn-secondary" style={{ marginTop: '1rem', color: 'var(--crimson)', borderColor: 'var(--crimson)' }}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

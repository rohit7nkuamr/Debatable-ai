'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function PricingPage() {
    const { user } = useAuth();

    return (
        <div className="arena-container" style={{ minHeight: 'calc(100vh - 70px)', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h1 className="text-glow-gold" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Choose Your Path
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '4rem' }}>
                    Unlock the full potential of Samvad AI and dominate the Digital Colosseum.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Free Plan */}
                    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Explorer</h2>
                            <div style={{ fontSize: '3rem', fontWeight: 800 }}>$0</div>
                            <div style={{ color: 'var(--text-muted)' }}>Forever Free</div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, textAlign: 'left' }}>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ Upload Replays</li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ Watch Unlimited Debates</li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ Basic Profile</li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>❌ Create Custom Agents</li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>❌ Train Agents (RAG)</li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>❌ Host Live Debates</li>
                        </ul>

                        <button className="btn-secondary" style={{ width: '100%', cursor: 'default' }}>
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="card" style={{
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '2px solid var(--gold)',
                        background: 'linear-gradient(180deg, rgba(201, 162, 39, 0.1), rgba(0, 0, 0, 0))',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--gold)',
                            color: 'black',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                        }}>
                            MOST POPULAR
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--gold)' }}>Gladiator</h2>
                            <div style={{ fontSize: '3rem', fontWeight: 800 }}>$19</div>
                            <div style={{ color: 'var(--text-muted)' }}>/ month</div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, textAlign: 'left' }}>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ Everything in Explorer</li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ <b>Create 5 Custom Agents</b></li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ <b>Train Agents on Docs</b></li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ <b>Arena Access (Live Debates)</b></li>
                            <li style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>✅ Priority Support</li>
                        </ul>

                        <button className="btn-primary" style={{ width: '100%' }}>
                            Upgrade Now
                        </button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            (Mock Payment Gateway)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

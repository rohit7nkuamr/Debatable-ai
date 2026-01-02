'use client';

interface DebaterCardProps {
    name: string;
    type: 'human' | 'ai';
    score: number;
    isActive: boolean;
    avatar?: string;
}

export default function DebaterCard({ name, type, score, isActive, avatar }: DebaterCardProps) {
    return (
        <div className={`card-debater ${type} ${isActive ? 'active' : ''}`}>
            {/* Avatar */}
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: type === 'human'
                        ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)'
                        : 'linear-gradient(135deg, var(--cyan) 0%, #0088aa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    margin: '0 auto 1rem',
                    boxShadow: isActive
                        ? type === 'human'
                            ? '0 0 30px rgba(201, 162, 39, 0.6)'
                            : '0 0 30px rgba(0, 255, 255, 0.6)'
                        : 'none',
                    transition: 'all 0.3s ease',
                }}
            >
                {avatar || (type === 'human' ? '👤' : '🤖')}
            </div>

            {/* Name */}
            <h3
                style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: type === 'human' ? 'var(--gold)' : 'var(--cyan)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                }}
            >
                {name}
            </h3>

            {/* Type Label */}
            <p
                style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '1rem',
                }}
            >
                {type === 'human' ? 'Human Debater' : 'AI Agent'}
            </p>

            {/* Score */}
            <div className="score-badge">
                Score: {score}
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: type === 'human' ? 'var(--gold)' : 'var(--cyan)',
                        color: 'var(--background)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}
                >
                    Speaking
                </div>
            )}
        </div>
    );
}

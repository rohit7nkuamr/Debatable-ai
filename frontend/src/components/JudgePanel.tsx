'use client';

interface JudgePanelProps {
    judgeType: 'ai' | 'human';
    judgeName: string;
    onJudgeTypeChange?: (type: 'ai' | 'human') => void;
    verdict?: string;
    scores?: {
        logic: number;
        evidence: number;
        relevance: number;
        persuasion: number;
        rebuttal: number;
    };
}

export default function JudgePanel({
    judgeType,
    judgeName,
    onJudgeTypeChange,
    verdict,
    scores,
}: JudgePanelProps) {
    return (
        <div className="judge-panel">
            {/* Judge Type Toggle */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                }}
            >
                <button
                    onClick={() => onJudgeTypeChange?.('ai')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: judgeType === 'ai' ? 'var(--cyan)' : 'var(--surface)',
                        color: judgeType === 'ai' ? 'var(--background)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                >
                    🤖 AI Judge
                </button>
                <button
                    onClick={() => onJudgeTypeChange?.('human')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: judgeType === 'human' ? 'var(--gold)' : 'var(--surface)',
                        color: judgeType === 'human' ? 'var(--background)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                >
                    👨‍⚖️ Human Judge
                </button>
            </div>

            {/* Judge Avatar & Name */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                }}
            >
                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--crimson) 0%, var(--crimson-light) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        boxShadow: '0 0 20px rgba(139, 0, 0, 0.4)',
                    }}
                >
                    ⚖️
                </div>
                <div>
                    <h3
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'var(--gold)',
                            marginBottom: '0.25rem',
                        }}
                    >
                        {judgeName}
                    </h3>
                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}
                    >
                        {judgeType === 'ai' ? 'AI Arbiter' : 'Human Arbiter'}
                    </p>
                </div>
            </div>

            {/* Scoring Criteria (if available) */}
            {scores && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        fontSize: '0.7rem',
                    }}
                >
                    {[
                        { label: 'Logic', value: scores.logic, max: 30 },
                        { label: 'Evidence', value: scores.evidence, max: 25 },
                        { label: 'Relevance', value: scores.relevance, max: 20 },
                        { label: 'Persuasion', value: scores.persuasion, max: 15 },
                        { label: 'Rebuttal', value: scores.rebuttal, max: 10 },
                    ].map((criteria) => (
                        <div
                            key={criteria.label}
                            style={{
                                textAlign: 'center',
                                padding: '0.5rem',
                                background: 'var(--surface)',
                                borderRadius: '6px',
                            }}
                        >
                            <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                {criteria.label}
                            </div>
                            <div style={{ color: 'var(--gold)', fontWeight: '700' }}>
                                {criteria.value}/{criteria.max}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Verdict */}
            {verdict && (
                <div
                    style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(139, 0, 0, 0.2)',
                        border: '1px solid var(--crimson)',
                        borderRadius: '8px',
                    }}
                >
                    <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
                        "{verdict}"
                    </p>
                </div>
            )}
        </div>
    );
}

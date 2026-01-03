'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Agent {
    id: string;
    name: string;
    personality: string;
    description: string;
    model: string;
    voice_id?: string;
    documentCount: number;
    isDefault?: boolean;
}

const personalities = [
    { id: 'philosophical', label: 'Philosophical 🤔', description: 'Deep thinking, references classical philosophy' },
    { id: 'scientific', label: 'Scientific 🔬', description: 'Evidence-based, data-driven reasoning' },
    { id: 'devils_advocate', label: "Devil's Advocate 😈", description: 'Contrarian, challenges every assumption' },
    { id: 'balanced', label: 'Balanced ⚖️', description: 'Fair, nuanced arguments' },
    { id: 'aggressive', label: 'Aggressive 🔥', description: 'Direct, assertive debate style' },
    { id: 'socratic', label: 'Socratic ❓', description: 'Uses questions to make points' },
];

function AgentCard({ agent, onExport, onEdit }: {
    agent: Agent;
    onExport: (id: string) => void;
    onEdit: (agent: Agent) => void;
}) {
    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                        🤖 {agent.name}
                    </h3>
                    <span style={{
                        fontSize: '0.75rem',
                        background: 'var(--surface-lighter)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        color: 'var(--cyan)'
                    }}>
                        {agent.personality}
                    </span>
                </div>
                {agent.isDefault && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>
                        Default
                    </span>
                )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                {agent.description}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>📚 {agent.documentCount} docs</span>
                <span>•</span>
                <span>🧠 {agent.model}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={`/arena?agent=${agent.id}`}>
                    <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        ⚔️ Debate
                    </button>
                </Link>
                <button
                    onClick={() => onExport(agent.id)}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                    📤 Export
                </button>
                <button
                    onClick={() => onEdit(agent)}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                    📚 Train
                </button>
            </div>
        </div>
    );
}

interface Voice {
    id: string;
    name: string;
    lang: string;
    gender: string;
}

function CreateAgentModal({ isOpen, onClose, onCreate }: {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (agent: Partial<Agent>) => void;
}) {
    const [name, setName] = useState('');
    const [personality, setPersonality] = useState('balanced');
    const [description, setDescription] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');
    const [voices, setVoices] = useState<Voice[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            api.agents.listVoices().then(setVoices).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onCreate({
                name,
                personality,
                description,
                voice_id: selectedVoice,
            });
            onClose();
            setName('');
            setDescription('');
            setSelectedVoice('en-US-AriaNeural');
            // setDocuments([]);
        } catch (error) {
            console.error('Error creating agent:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
        }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>🤖 Create AI Agent</h2>

                {/* Name */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Agent Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Socrates, Newton..."
                        className="input-arena"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Voice Selection */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Voice & Accent</label>
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="input-arena"
                        style={{ width: '100%' }}
                    >
                        {voices.map(voice => (
                            <option key={voice.id} value={voice.id}>
                                {voice.gender === 'Female' ? '👩' : '👨'} {voice.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Personality */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Debate Personality</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {personalities.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPersonality(p.id)}
                                style={{
                                    background: personality === p.id ? 'var(--gold)' : 'var(--surface)',
                                    color: personality === p.id ? 'var(--background)' : 'var(--text-primary)',
                                    border: 'none',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.label}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{p.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your agent's expertise and focus areas..."
                        className="input-arena"
                        style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={!name.trim() || isSubmitting}>
                        {isSubmitting ? 'Creating...' : '✨ Create Agent'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExportModal({ isOpen, onClose, agent }: {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent | null;
}) {
    const [copied, setCopied] = useState(false);
    const [exportData, setExportData] = useState<{ embed_code: string, api_key: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && agent) {
            setIsLoading(true);
            api.agents.export(agent.id)
                .then(data => setExportData(data))
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        } else {
            setExportData(null);
        }
    }, [isOpen, agent]);

    if (!isOpen || !agent) return null;

    const handleCopy = () => {
        if (exportData?.embed_code) {
            navigator.clipboard.writeText(exportData.embed_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
        }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
                <h2 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>📤 Export {agent.name}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Use your AI agent anywhere - embed on websites, integrate via API, or use in external recordings.
                </p>

                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Generating export keys...
                    </div>
                ) : exportData ? (
                    <>
                        {/* Embed Code */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                💻 Website Embed Code
                            </label>
                            <div style={{
                                background: 'var(--surface-dark)',
                                borderRadius: '8px',
                                padding: '1rem',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                color: 'var(--cyan)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                maxHeight: '200px',
                                overflow: 'auto'
                            }}>
                                {exportData.embed_code}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="btn-secondary"
                                style={{ marginTop: '0.5rem', width: '100%' }}
                            >
                                {copied ? '✅ Copied!' : '📋 Copy Embed Code'}
                            </button>
                        </div>

                        {/* API Info */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                🔑 Temporary API Key
                            </label>
                            <div style={{
                                background: 'var(--surface-dark)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                color: 'var(--text-primary)',
                            }}>
                                {exportData.api_key}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ color: 'red' }}>Failed to load export data.</div>
                )}


                <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
                    Done
                </button>
            </div>
        </div>
    );
}


function TopicModal({ isOpen, onClose, onStartDebate, agent, allAgents }: {
    isOpen: boolean;
    onClose: () => void;
    onStartDebate: (topic: string, mode: 'one_vs_one' | 'ai_vs_ai', secondaryAgentId?: string) => void;
    agent: Agent | null;
    allAgents: Agent[];
}) {
    const [topic, setTopic] = useState('');
    const [mode, setMode] = useState<'one_vs_one' | 'ai_vs_ai'>('one_vs_one');
    const [opponentId, setOpponentId] = useState('');

    if (!isOpen || !agent) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
        }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>🔥 Start Debate</h2>
                <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Prepare to challenge <strong>{agent.name}</strong>
                </div>

                {/* Mode Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Debate Mode</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setMode('one_vs_one')}
                            className={mode === 'one_vs_one' ? 'btn-primary' : 'btn-secondary'}
                            style={{ flex: 1 }}
                        >
                            🧑‍⚖️ You vs AI
                        </button>
                        <button
                            onClick={() => setMode('ai_vs_ai')}
                            className={mode === 'ai_vs_ai' ? 'btn-primary' : 'btn-secondary'}
                            style={{ flex: 1 }}
                        >
                            🤖 AI vs AI
                        </button>
                    </div>
                </div>

                {/* Opponent Selection (AI vs AI) */}
                {mode === 'ai_vs_ai' && (
                    <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Opponent</label>
                        <select
                            value={opponentId}
                            onChange={(e) => setOpponentId(e.target.value)}
                            className="input-arena"
                            style={{ width: '100%' }}
                        >
                            <option value="">-- Choose Opponent --</option>
                            {allAgents.filter(a => a.id !== agent.id).map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.personality})</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Topic Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Topic</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Is AI dangerous? Does free will exist?"
                        className="input-arena"
                        style={{ width: '100%' }}
                        autoFocus
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={() => onStartDebate(topic, mode, opponentId)}
                        className="btn-primary"
                        disabled={!topic.trim() || (mode === 'ai_vs_ai' && !opponentId)}
                    >
                        ⚔️ Enter Arena
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [exportAgent, setExportAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);

    // New state for starting debate
    const [debateAgent, setDebateAgent] = useState<Agent | null>(null);
    const [uploadAgent, setUploadAgent] = useState<Agent | null>(null); // New state for document upload

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const data = await api.agents.list();
            setAgents(data);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleCreate = async (newAgent: Partial<Agent>) => {
        try {
            await api.agents.create({
                name: newAgent.name!,
                personality: newAgent.personality!,
                description: newAgent.description,
                voice_id: newAgent.voice_id,
            });
            await fetchAgents(); // Refresh list
        } catch (error) {
            console.error('Failed to create agent:', error);
        }
    };

    const handleStartDebate = (topic: string, mode: 'one_vs_one' | 'ai_vs_ai', secondaryAgentId?: string) => {
        if (!debateAgent) return;

        let url = `/arena?agentId=${debateAgent.id}&topic=${encodeURIComponent(topic)}&mode=${mode}`;
        if (mode === 'ai_vs_ai' && secondaryAgentId) {
            url += `&secondaryAgentId=${secondaryAgentId}`;
        }

        window.location.href = url;
    };

    return (
        <div className="arena-container" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="text-glow-gold" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                            🤖 My AI Agents
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Create and manage your personalized debate AI agents
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        ➕ Create Agent
                    </button>
                </div>

                {/* Info Banner */}
                <div className="card" style={{
                    marginBottom: '2rem',
                    background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(0, 255, 255, 0.05))',
                    border: '1px solid var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                }}>
                    <span style={{ fontSize: '2rem' }}>🎬</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Record Debates Anywhere!
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Export your agent, record debates in your own studio, and upload to share with the world.
                        </p>
                    </div>
                    <Link href="/upload">
                        <button className="btn-secondary">📤 Upload Video</button>
                    </Link>
                </div>

                {/* Agent Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        Loading agents...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {agents.map((agent) => (
                            <div className="card" key={agent.id} style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                                            🤖 {agent.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            background: 'var(--surface-lighter)',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            color: 'var(--cyan)'
                                        }}>
                                            {agent.personality}
                                        </span>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                    {agent.description}
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span>🧠 {agent.model}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setDebateAgent(agent)}
                                        className="btn-primary"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                        ⚔️ Debate
                                    </button>
                                    <button
                                        onClick={() => setExportAgent(agent)}
                                        className="btn-secondary"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                        📤 Export
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (user?.tier === 'free') {
                                                router.push('/pricing');
                                            } else {
                                                setUploadAgent(agent);
                                            }
                                        }}
                                        className="btn-secondary"
                                        style={{
                                            fontSize: '0.85rem',
                                            padding: '0.5rem 1rem',
                                            opacity: user?.tier === 'free' ? 0.7 : 1
                                        }}
                                    >
                                        {user?.tier === 'free' ? '🔒 Train' : '📚 Train'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateAgentModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onCreate={handleCreate}
            />

            <ExportModal
                isOpen={!!exportAgent}
                onClose={() => setExportAgent(null)}
                agent={exportAgent}
            />

            <TopicModal
                isOpen={!!debateAgent}
                onClose={() => setDebateAgent(null)}
                onStartDebate={handleStartDebate}
                agent={debateAgent}
                allAgents={agents}
            />

            <DocumentUploadModal
                isOpen={!!uploadAgent}
                onClose={() => setUploadAgent(null)}
                agent={uploadAgent}
            />
        </div>
    );
}

function DocumentUploadModal({ isOpen, onClose, agent }: {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent | null;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen || !agent) return null;

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setMessage('');
        try {
            await api.agents.uploadDocument(agent.id, file);
            setMessage('✅ Document uploaded successfully!');
            setTimeout(() => {
                setFile(null);
                setMessage('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error(error);
            setMessage('❌ Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
        }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>📚 Manage Knowledge</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Upload documents (PDF/TXT) to teach <strong>{agent.name}</strong> new facts.
                </p>

                <div style={{
                    border: '2px dashed var(--surface-lighter)',
                    padding: '2rem',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: file ? 'rgba(0, 255, 255, 0.05)' : 'transparent'
                }}
                    onClick={() => document.getElementById('doc-upload')?.click()}
                >
                    <input
                        id="doc-upload"
                        type="file"
                        accept=".txt,.pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file ? (
                        <div>
                            <div style={{ fontSize: '2rem' }}>📄</div>
                            <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>{file.name}</div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '2rem' }}>📂</div>
                            <div style={{ color: 'var(--text-muted)' }}>Click to select PDF or TXT</div>
                        </div>
                    )}
                </div>

                {message && <div style={{ marginBottom: '1rem', textAlign: 'center', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</div>}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn-secondary">Close</button>
                    <button
                        onClick={handleUpload}
                        className="btn-primary"
                        disabled={!file || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload & Train'}
                    </button>
                </div>
            </div>
        </div>
    );
}

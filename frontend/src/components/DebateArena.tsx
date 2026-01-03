'use client';

import { useState, useRef, useEffect } from 'react';
import DebaterCard from './DebaterCard';
import JudgePanel from './JudgePanel';

interface Message {
    id: string;
    sender: 'human' | 'ai' | 'judge';
    senderName: string;
    content: string;
    timestamp: Date;
    score?: number;
}

interface DebateArenaProps {
    topic?: string;
    humanName?: string;
    aiName?: string;
    aiAgent?: {
        id: string;
        name: string;
        personality: string;
    };
}

export default function DebateArena({
    topic = 'The Impact of AI on Human Creativity',
    humanName = 'You',
    aiName = 'AI Agent',
}: DebateArenaProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'judge',
            senderName: 'Judge',
            content: 'Welcome to the Debate Arena! The topic today is: "' + topic + '". Let the debate begin!',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [humanScore, setHumanScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [judgeType, setJudgeType] = useState<'ai' | 'human'>('ai');
    const [currentTurn, setCurrentTurn] = useState<'human' | 'ai'>('human');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isAiTyping) return;

        const humanMessage: Message = {
            id: Date.now().toString(),
            sender: 'human',
            senderName: humanName,
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, humanMessage]);
        setInputValue('');
        setCurrentTurn('ai');
        setIsAiTyping(true);

        // Simulate AI response (will be replaced with actual API call)
        setTimeout(() => {
            const aiResponses = [
                "That's a compelling perspective. However, I would argue that while technology provides tools, true creativity stems from human experience and emotion. The depth of human consciousness cannot be replicated by algorithms.",
                "An interesting point indeed. Let me offer a counterargument: creativity has always been enhanced by tools throughout history. From the printing press to digital art software, technology amplifies rather than diminishes human creative potential.",
                "You raise a valid concern. However, consider this: AI can remove barriers to creative expression, allowing those without traditional training to bring their visions to life. Is that not an expansion of human creativity?",
                "I must respectfully disagree. The essence of creativity lies not in the output, but in the struggle, the emotion, the human experience behind it. Can an AI truly understand the joy of creation?",
            ];

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                senderName: aiName,
                content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsAiTyping(false);
            setCurrentTurn('human');

            // Simulate scoring
            const humanPoints = Math.floor(Math.random() * 8) + 3;
            const aiPoints = Math.floor(Math.random() * 8) + 3;
            setHumanScore((prev) => prev + humanPoints);
            setAiScore((prev) => prev + aiPoints);

            // Judge comment
            if (messages.length > 2 && messages.length % 4 === 0) {
                setTimeout(() => {
                    const judgeComments = [
                        "Both debaters are presenting strong arguments. The debate is heating up!",
                        "Excellent rebuttal! The AI demonstrates sophisticated understanding of the topic.",
                        "A compelling human perspective that resonates with emotional intelligence.",
                        "Points awarded for logical consistency and evidence-based argumentation.",
                    ];

                    const judgeMessage: Message = {
                        id: (Date.now() + 2).toString(),
                        sender: 'judge',
                        senderName: 'Judge',
                        content: judgeComments[Math.floor(Math.random() * judgeComments.length)],
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, judgeMessage]);
                }, 1000);
            }
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="arena-container" style={{ padding: '2rem' }}>
            {/* Arena Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
                <h1
                    style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '0.5rem',
                    }}
                    className="text-glow-gold"
                >
                    ⚔️ DEBATE ARENA ⚔️
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Topic: <span style={{ color: 'var(--cyan)' }}>{topic}</span>
                </p>
            </div>

            {/* Judge Panel */}
            <div style={{ maxWidth: '600px', margin: '0 auto 2rem' }} className="animate-slide-up">
                <JudgePanel
                    judgeType={judgeType}
                    judgeName={judgeType === 'ai' ? 'Themis AI' : 'Guest Judge'}
                    onJudgeTypeChange={setJudgeType}
                />
            </div>

            {/* Debaters Row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: '2rem',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    maxWidth: '900px',
                    margin: '0 auto 2rem',
                }}
                className="animate-slide-up"
            >
                {/* Human Debater */}
                <DebaterCard
                    name={humanName}
                    type="human"
                    score={humanScore}
                    isActive={currentTurn === 'human' && !isAiTyping}
                />

                {/* VS Badge */}
                <div className="vs-badge">VS</div>

                {/* AI Debater */}
                <DebaterCard
                    name={aiName}
                    type="ai"
                    score={aiScore}
                    isActive={currentTurn === 'ai' || isAiTyping}
                />
            </div>

            {/* Debate Transcript */}
            <div
                style={{
                    maxWidth: '800px',
                    margin: '0 auto 2rem',
                    background: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--surface-lighter)',
                    overflow: 'hidden',
                }}
                className="animate-slide-up"
            >
                {/* Transcript Header */}
                <div
                    style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid var(--surface-lighter)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}
                >
                    <span style={{ fontSize: '1.25rem' }}>📜</span>
                    <h3 style={{ fontWeight: '600', color: 'var(--gold)' }}>DEBATE TRANSCRIPT</h3>
                </div>

                {/* Messages Container */}
                <div
                    style={{
                        padding: '1.5rem',
                        maxHeight: '400px',
                        overflowY: 'auto',
                    }}
                >
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message message-${message.sender}`}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: '700',
                                        color:
                                            message.sender === 'human'
                                                ? 'var(--gold)'
                                                : message.sender === 'ai'
                                                    ? 'var(--cyan)'
                                                    : 'var(--crimson)',
                                    }}
                                >
                                    [{message.senderName.toUpperCase()}]
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
                                {message.content}
                            </p>
                        </div>
                    ))}

                    {/* AI Typing Indicator */}
                    {isAiTyping && (
                        <div className="message message-ai" style={{ opacity: 0.7 }}>
                            <span style={{ color: 'var(--cyan)', fontWeight: '700' }}>
                                [{aiName.toUpperCase()}]
                            </span>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                <span className="typing-dots">Formulating response...</span>
                            </p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '1rem',
                }}
                className="animate-slide-up"
            >
                <input
                    type="text"
                    className="input-arena"
                    placeholder="Present your argument..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isAiTyping}
                    style={{ flex: 1 }}
                />
                <button
                    className="btn-primary"
                    onClick={handleSendMessage}
                    disabled={isAiTyping || !inputValue.trim()}
                    style={{
                        opacity: isAiTyping || !inputValue.trim() ? 0.5 : 1,
                        cursor: isAiTyping || !inputValue.trim() ? 'not-allowed' : 'pointer',
                    }}
                >
                    ⚡ SUBMIT
                </button>
            </div>

            {/* Instructions */}
            <div
                style={{
                    maxWidth: '800px',
                    margin: '2rem auto 0',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                }}
            >
                <p>Press Enter to submit your argument. The AI will respond and the judge will score each exchange.</p>
            </div>
        </div>
    );
}

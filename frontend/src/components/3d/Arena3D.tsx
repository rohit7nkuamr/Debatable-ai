'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import StudioEnvironment from './StudioEnvironment';
import HumanoidAvatar from './HumanoidAvatar';
import JudgeFigure from './JudgeFigure';
import { api } from '@/lib/api';

interface Message {
    id: string;
    sender: 'human' | 'ai' | 'judge';
    senderName: string;
    content: string;
    timestamp: Date;
}

interface Arena3DProps {
    debateId: string;
    topic?: string;
    humanName?: string;
    aiName?: string;
    secondaryAiName?: string;
    mode?: 'one_vs_one' | 'ai_vs_ai';
    isStreaming?: boolean;
    onStreamToggle?: () => void;
}

// Loading component for Suspense
function LoadingScreen() {
    return (
        <Html center>
            <div style={{
                color: '#C9A227',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
            }}>
                <div style={{ marginBottom: '1rem' }}>⚔️</div>
                <div>Loading Arena...</div>
            </div>
        </Html>
    );
}

// 3D Scene component with humanoid avatars
function Scene({ humanIsActive, aiIsActive, humanIsSpeaking, aiIsSpeaking, judgeSpeaking, mode, aiName, secondaryAiName }: {
    humanIsActive: boolean;
    aiIsActive: boolean;
    humanIsSpeaking: boolean;
    aiIsSpeaking: boolean;
    judgeSpeaking?: boolean;
    mode?: 'one_vs_one' | 'ai_vs_ai';
    aiName: string;
    secondaryAiName?: string;
}) {
    return (
        <>
            <StudioEnvironment />

            {/* Left side Debater (Human or Secondary AI) */}
            <HumanoidAvatar
                position={[-4, 0, 0]}
                type={mode === 'ai_vs_ai' ? "ai" : "human"}
                name={mode === 'ai_vs_ai' ? (secondaryAiName || "AI 2") : "Human"}
                isActive={humanIsActive}
                isSpeaking={humanIsSpeaking}
            />

            {/* Right side Debater (Primary AI) */}
            <HumanoidAvatar
                position={[4, 0, 0]}
                type="ai"
                name={aiName}
                isActive={aiIsActive}
                isSpeaking={aiIsSpeaking}
            />

            {/* Judge - Back center, elevated */}
            <JudgeFigure
                position={[0, 1.5, -6]}
                isActive={true}
                isSpeaking={judgeSpeaking}
            />
        </>
    );
}


export default function Arena3D({
    debateId,
    topic = 'The Impact of AI on Human Creativity',
    humanName = 'You',
    aiName = 'AI Agent',
    secondaryAiName,
    mode = 'one_vs_one',
    isStreaming = false,
    onStreamToggle,
}: Arena3DProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'judge',
            senderName: 'Judge Themis',
            content: `Welcome to the Debate Arena! Today's topic: "${topic}". Let the battle of minds begin!`,
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<'human' | 'ai' | null>(null);
    const [humanScore, setHumanScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [showChat, setShowChat] = useState(true);
    const [cameraPosition, setCameraPosition] = useState<'overview' | 'human' | 'ai' | 'judge'>('overview');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.onended = () => {
            setCurrentSpeaker(null);
            setIsAiTyping(false);
        };
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [mode, debateId]); // Add dependencies if needed

    // Auto-Debate Loop for AI vs AI
    useEffect(() => {
        if (mode === 'ai_vs_ai' && !currentSpeaker && !isAiTyping && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            // If judge just spoke, or an AI just finished speaking, trigger the next turn
            // We adding a small delay for realism
            const timer = setTimeout(() => {
                triggerAutoTurn();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [mode, currentSpeaker, isAiTyping, messages]);

    const triggerAutoTurn = async () => {
        setIsAiTyping(true);
        // Determine who should be speaking visually based on whose turn it is
        // We can check the backend response to know for sure, but optimistically:
        // if last was AI1, now matches AI2 (Human/Left side visually).

        try {
            const response = await api.debates.triggerTurn(debateId);
            const aiMessageData = response.message;

            if (aiMessageData) {
                const aiMessage: Message = {
                    id: aiMessageData.id,
                    sender: 'ai',
                    senderName: aiMessageData.sender_name,
                    content: aiMessageData.content,
                    timestamp: new Date(aiMessageData.timestamp)
                };

                setMessages(prev => [...prev, aiMessage]);
                setIsAiTyping(false);

                // Fetch score
                const debateInfo = await api.debates.get(debateId);
                if (debateInfo) {
                    setHumanScore(debateInfo.human_score); // In AI vs AI, human_score is effectively AI2 score
                    setAiScore(debateInfo.ai_score);
                }

                // Determine speaker ID for voice
                // If the sender name matches the primary AI Name, it's 'ai' (Right)
                // If it matches secondary AI name, it's 'human' (Left - reused slot)
                const isPrimary = aiMessageData.sender_name === aiName;
                setCurrentSpeaker(isPrimary ? 'ai' : 'human');

                await playAudio(aiMessage.content, aiMessageData.sender_name.toLowerCase());
            }
        } catch (error) {
            console.error("Auto-turn failed:", error);
            setIsAiTyping(false);
        }
    };

    const playAudio = async (text: string, agentId: string) => {
        try {
            const response = await api.tts.generate(text, agentId);
            if (response.audio_url && audioRef.current) {
                // Prepend API_BASE_URL if relative path
                const url = response.audio_url.startsWith('http')
                    ? response.audio_url
                    : `${api.baseUrl}${response.audio_url}`;

                audioRef.current.src = url;
                await audioRef.current.play();
                setCurrentSpeaker('ai');
            }
        } catch (err) {
            console.error("Failed to play TTS:", err);
            // Fallback: just show text and wait a bit
            setCurrentSpeaker('ai');
            setTimeout(() => setCurrentSpeaker(null), 3000 + text.length * 50);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isAiTyping) return;

        const humanMessage: Message = {
            id: Date.now().toString(),
            sender: 'human',
            senderName: humanName,
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, humanMessage]);
        setInputValue('');
        setCurrentSpeaker('human');

        // Stop human speaking animation after a short delay
        setTimeout(() => {
            if (currentSpeaker === 'human') setCurrentSpeaker(null);
        }, 2000);

        try {
            setIsAiTyping(true);

            // Call API
            const response = await api.debates.sendMessage(debateId, humanMessage.content);

            // Process response
            const aiMessageData = response.message;
            if (aiMessageData) {
                const aiMessage: Message = {
                    id: aiMessageData.id,
                    sender: 'ai',
                    senderName: aiMessageData.sender_name,
                    content: aiMessageData.content,
                    timestamp: new Date(aiMessageData.timestamp)
                };

                setMessages(prev => [...prev, aiMessage]);
                setIsAiTyping(false);

                // Fetch updated debate state to get scores
                const debateInfo = await api.debates.get(debateId);
                if (debateInfo) {
                    setHumanScore(debateInfo.human_score);
                    setAiScore(debateInfo.ai_score);
                }

                // Play Audio Response
                // Use aiName as agentId fallback or passed prop (need to add prop)
                // For now using aiName.toLowerCase() as approximation
                await playAudio(aiMessage.content, aiName?.toLowerCase() || 'default');
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            setIsAiTyping(false);
            setCurrentSpeaker(null);
        }
    };

    const getCameraProps = () => {
        switch (cameraPosition) {
            case 'human':
                return { position: [-2, 2, 5] as [number, number, number], target: [-4, 0, 0] as [number, number, number] };
            case 'ai':
                return { position: [2, 2, 5] as [number, number, number], target: [4, 0, 0] as [number, number, number] };
            case 'judge':
                return { position: [0, 3, 2] as [number, number, number], target: [0, 1, -6] as [number, number, number] };
            default:
                return { position: [0, 5, 12] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
        }
    };

    const cameraProps = getCameraProps();

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0A0A0A' }}>
            {/* 3D Canvas */}
            <Canvas shadows style={{ position: 'absolute', inset: 0 }}>
                <Suspense fallback={<LoadingScreen />}>
                    <PerspectiveCamera
                        makeDefault
                        position={cameraProps.position}
                        fov={50}
                    />
                    <OrbitControls
                        target={cameraProps.target}
                        enablePan={false}
                        minDistance={5}
                        maxDistance={20}
                        maxPolarAngle={Math.PI / 2}
                    />
                    <Scene
                        humanIsActive={currentSpeaker === 'human'}
                        aiIsActive={currentSpeaker === 'ai' || isAiTyping}
                        humanIsSpeaking={currentSpeaker === 'human'}
                        aiIsSpeaking={isAiTyping}
                        mode={mode} // Pass correct mode
                        aiName={aiName}
                        secondaryAiName={secondaryAiName}
                    />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Top Bar */}
                <div style={{
                    padding: '1rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    pointerEvents: 'auto',
                }}>
                    {/* Topic */}
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#C9A227',
                            textShadow: '0 0 20px rgba(201, 162, 39, 0.5)',
                        }}>
                            ⚔️ DEBATE ARENA
                        </h1>
                        <p style={{ color: '#A0998A', fontSize: '0.9rem' }}>
                            Topic: <span style={{ color: '#00FFFF' }}>{topic}</span>
                        </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Streaming Badge */}
                        {isStreaming && (
                            <div style={{
                                background: '#8B0000',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    animation: 'pulse 1s infinite',
                                }} />
                                LIVE
                            </div>
                        )}

                        {/* Stream Toggle */}
                        <button
                            onClick={onStreamToggle}
                            style={{
                                background: isStreaming ? '#8B0000' : 'transparent',
                                border: '2px solid',
                                borderColor: isStreaming ? '#8B0000' : '#C9A227',
                                color: isStreaming ? 'white' : '#C9A227',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {isStreaming ? '⏹️ End Stream' : '📺 Go Live'}
                        </button>

                        {/* Chat Toggle */}
                        <button
                            onClick={() => setShowChat(!showChat)}
                            style={{
                                background: 'transparent',
                                border: '2px solid #00FFFF',
                                color: '#00FFFF',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            💬 {showChat ? 'Hide' : 'Show'} Chat
                        </button>
                    </div>
                </div>

                {/* Score Display */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        background: 'rgba(201, 162, 39, 0.2)',
                        border: '2px solid #C9A227',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}>
                        <div style={{ color: '#C9A227', fontWeight: 700, fontSize: '1.25rem' }}>{humanScore}</div>
                        <div style={{ color: '#A0998A', fontSize: '0.7rem' }}>{humanName}</div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #C9A227, #9A7B1C)',
                        color: '#0A0A0A',
                        fontWeight: 800,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                    }}>
                        VS
                    </div>

                    <div style={{
                        background: 'rgba(0, 255, 255, 0.1)',
                        border: '2px solid #00FFFF',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}>
                        <div style={{ color: '#00FFFF', fontWeight: 700, fontSize: '1.25rem' }}>{aiScore}</div>
                        <div style={{ color: '#A0998A', fontSize: '0.7rem' }}>{aiName}</div>
                    </div>
                </div>

                {/* Camera Controls */}
                <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    pointerEvents: 'auto',
                }}>
                    <span style={{ color: '#A0998A', fontSize: '0.75rem', marginBottom: '0.25rem' }}>CAMERA</span>
                    {[
                        { id: 'overview', label: '🎬 Overview' },
                        { id: 'human', label: '👤 Human' },
                        { id: 'ai', label: '🤖 AI' },
                        { id: 'judge', label: '⚖️ Judge' },
                    ].map((cam) => (
                        <button
                            key={cam.id}
                            onClick={() => setCameraPosition(cam.id as typeof cameraPosition)}
                            style={{
                                background: cameraPosition === cam.id ? '#C9A227' : 'rgba(26, 26, 26, 0.8)',
                                color: cameraPosition === cam.id ? '#0A0A0A' : '#F5F0E1',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                        >
                            {cam.label}
                        </button>
                    ))}
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '80px',
                        bottom: '1rem',
                        width: '350px',
                        background: 'rgba(15, 15, 15, 0.95)',
                        border: '1px solid #2F2F2F',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        pointerEvents: 'auto',
                    }}>
                        {/* Chat Header */}
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid #2F2F2F',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>💬</span>
                            <span style={{ fontWeight: 600, color: '#C9A227' }}>DEBATE CHAT</span>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                        }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        marginBottom: '0.75rem',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: msg.sender === 'human'
                                            ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(201, 162, 39, 0.05))'
                                            : msg.sender === 'ai'
                                                ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.03))'
                                                : 'linear-gradient(135deg, rgba(139, 0, 0, 0.15), rgba(139, 0, 0, 0.05))',
                                        borderLeft: `3px solid ${msg.sender === 'human' ? '#C9A227' : msg.sender === 'ai' ? '#00FFFF' : '#8B0000'
                                            }`,
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.25rem',
                                        fontSize: '0.8rem',
                                    }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: msg.sender === 'human' ? '#C9A227' : msg.sender === 'ai' ? '#00FFFF' : '#8B0000',
                                        }}>
                                            {msg.senderName}
                                        </span>
                                        <span style={{ color: '#6B6560' }}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{ color: '#F5F0E1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                        {msg.content}
                                    </p>
                                </div>
                            ))}

                            {/* AI Typing Indicator */}
                            {isAiTyping && (
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    background: 'rgba(0, 255, 255, 0.05)',
                                    borderLeft: '3px solid #00FFFF',
                                }}>
                                    <span style={{ color: '#00FFFF', fontWeight: 700, fontSize: '0.8rem' }}>
                                        {aiName}
                                    </span>
                                    <p style={{ color: '#A0998A', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                                        Formulating response...
                                    </p>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '1rem',
                            borderTop: '1px solid #2F2F2F',
                            display: 'flex',
                            gap: '0.5rem',
                        }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Present your argument..."
                                disabled={isAiTyping}
                                style={{
                                    flex: 1,
                                    background: '#1A1A1A',
                                    border: '2px solid #2F2F2F',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    color: '#F5F0E1',
                                    fontSize: '0.9rem',
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isAiTyping || !inputValue.trim()}
                                style={{
                                    background: 'linear-gradient(135deg, #C9A227, #9A7B1C)',
                                    color: '#0A0A0A',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    fontWeight: 700,
                                    cursor: isAiTyping || !inputValue.trim() ? 'not-allowed' : 'pointer',
                                    opacity: isAiTyping || !inputValue.trim() ? 0.5 : 1,
                                }}
                            >
                                ⚡
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

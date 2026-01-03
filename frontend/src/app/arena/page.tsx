'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Dynamic import with SSR disabled (Three.js requires browser environment)
const Arena3D = dynamic(() => import('@/components/3d/Arena3D'), {
    ssr: false,
    loading: () => <div>Loading 3D Engine...</div>,
});

function LoadingScreen({ message = "Entering the Arena..." }: { message?: string }) {
    return (
        <div style={{
            width: '100%',
            height: '100vh',
            background: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
        }}>
            <div style={{
                fontSize: '3rem',
                animation: 'pulse 1.5s ease-in-out infinite',
            }}>
                ⚔️
            </div>
            <div style={{
                color: '#C9A227',
                fontSize: '1.25rem',
                fontWeight: 600,
            }}>
                {message}
            </div>
            <div style={{
                width: '200px',
                height: '4px',
                background: '#1A1A1A',
                borderRadius: '2px',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #C9A227, #00FFFF)',
                    animation: 'loading 1.5s ease-in-out infinite',
                }} />
            </div>
            <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </div>
    );
}

export default function ArenaPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <ArenaContent />
        </Suspense>
    );
}

function ArenaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isStreaming, setIsStreaming] = useState(false);
    const [debateData, setDebateData] = useState<{
        id: string;
        topic: string;
        humanName: string;
        aiName: string;
        secondaryAiName?: string;
        mode: 'one_vs_one' | 'ai_vs_ai';
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    const agentId = searchParams.get('agentId'); // Updated param name from prev file
    const topic = searchParams.get('topic');
    const mode = searchParams.get('mode') as 'one_vs_one' | 'ai_vs_ai' || 'one_vs_one';
    const secondaryAgentId = searchParams.get('secondaryAgentId');

    useEffect(() => {
        const initDebate = async () => {
            if (!agentId) {
                // If no agent selected, redirect to agents list to choose one
                router.push('/agents');
                return;
            }

            try {
                // Create a new debate session
                const defaultTopic = "The Impact of AI on Human Creativity";
                const response = await api.debates.create(
                    topic || defaultTopic,
                    "You",
                    agentId,
                    mode,
                    secondaryAgentId || undefined
                );

                if (response.id) {
                    setDebateData({
                        id: response.id,
                        topic: response.topic,
                        humanName: response.human_name,
                        aiName: response.ai_name,
                        secondaryAiName: response.secondary_ai_name, // Add to state
                        mode: response.mode // Add to state
                    });
                }
            } catch (err) {
                console.error("Failed to start debate:", err);
                setError("Failed to initialize debate arena.");
            }
        };

        if (!debateData) {
            initDebate();
        }
    }, [agentId, topic, mode, secondaryAgentId, debateData, router, user, authLoading]);

    // Auth & Tier Check
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.tier === 'free') {
                router.push('/pricing');
            }
        }
    }, [user, authLoading, router]);

    const handleStreamToggle = () => {
        setIsStreaming(!isStreaming);
        // TODO: Integrate with actual streaming service
        if (!isStreaming) {
            console.log('Starting stream...');
        } else {
            console.log('Ending stream...');
        }
    };

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B0000' }}>
                {error}
            </div>
        );
    }

    if (authLoading || (user?.tier === 'free')) {
        return <LoadingScreen message="Checking Credentials..." />;
    }

    if (!debateData) {
        return <LoadingScreen message="Summoning the AI Debater..." />;
    }

    return (
        <Arena3D
            debateId={debateData.id}
            topic={debateData.topic}
            humanName={debateData.humanName}
            aiName={debateData.aiName}
            secondaryAiName={debateData.secondaryAiName}
            mode={debateData.mode}
            isStreaming={isStreaming}
            onStreamToggle={handleStreamToggle}
        />
    );
}

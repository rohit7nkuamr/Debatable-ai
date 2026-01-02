// API configuration for connecting to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = {
    // Base URL
    baseUrl: API_BASE_URL,

    // Agent endpoints
    agents: {
        list: () => fetch(`${API_BASE_URL}/api/agents`).then(r => r.json()),
        get: (id: string) => fetch(`${API_BASE_URL}/api/agents/${id}`).then(r => r.json()),
        listVoices: () => fetch(`${API_BASE_URL}/api/agents/voices`).then(r => r.json()),
        create: (data: { name: string; personality: string; description?: string; voice_id?: string }) =>
            fetch(`${API_BASE_URL}/api/agents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        export: (id: string) =>
            fetch(`${API_BASE_URL}/api/agents/${id}/export`, { method: 'POST' }).then(r => r.json()),
    },

    // Debate endpoints
    debates: {
        create: async (topic: string, humanName: string, aiAgentId: string, mode: 'one_vs_one' | 'ai_vs_ai' = 'one_vs_one', secondaryAgentId?: string) => {
            const res = await fetch(`${API_BASE_URL}/api/debates/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    human_name: humanName,
                    ai_agent_id: aiAgentId,
                    mode,
                    secondary_agent_id: secondaryAgentId
                }),
            });
            return res.json();
        },
        get: async (id: string) => {
            const res = await fetch(`${API_BASE_URL}/api/debates/${id}`);
            return res.json();
        },
        sendMessage: async (debateId: string, message: string) => {
            const res = await fetch(`${API_BASE_URL}/api/debates/${debateId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ debate_id: debateId, message }),
            });
            return res.json();
        },
        triggerTurn: async (debateId: string) => {
            const res = await fetch(`${API_BASE_URL}/api/debates/${debateId}/trigger_ai_turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            return res.json();
        }, end: (id: string) =>
            fetch(`${API_BASE_URL}/api/debates/${id}/end`, { method: 'POST' }).then(r => r.json()),
    },

    // Video endpoints
    videos: {
        list: (filter?: string) =>
            fetch(`${API_BASE_URL}/api/videos${filter ? `?filter=${filter}` : ''}`).then(r => r.json()),
        get: (id: string) => fetch(`${API_BASE_URL}/api/videos/${id}`).then(r => r.json()),
        like: (id: string) =>
            fetch(`${API_BASE_URL}/api/videos/${id}/like`, { method: 'POST' }).then(r => r.json()),
        startLive: (data: { title: string; topic: string; human_debater: string; ai_agent_id: string }) => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            return fetch(`${API_BASE_URL}/api/videos/live/start`, {
                method: 'POST',
                body: formData,
            }).then(r => r.json());
        },
    },

    // Judge endpoints
    judge: {
        score: (data: { topic: string; human_argument: string; ai_argument: string }) =>
            fetch(`${API_BASE_URL}/api/judge/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        criteria: () => fetch(`${API_BASE_URL}/api/judge/criteria`).then(r => r.json()),
    },

    // TTS endpoints
    tts: {
        generate: (text: string, agentId: string) =>
            fetch(`${API_BASE_URL}/api/tts/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, agent_id: agentId }),
            }).then(r => r.json()),
    },
};

export default api;

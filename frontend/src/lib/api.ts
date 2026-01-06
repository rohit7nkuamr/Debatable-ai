// API configuration for connecting to backend
// API configuration for connecting to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Helper to ensure URL is valid before request
const getUrl = (endpoint: string) => {
    if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not set. Please configure it in your deployment settings.");
    return `${API_BASE_URL}${endpoint}`;
};

export const api = {
    // Base URL
    baseUrl: API_BASE_URL,

    // Agent endpoints
    agents: {
        list: () => fetch(getUrl('/api/agents')).then(r => r.json()),
        get: (id: string) => fetch(getUrl(`/api/agents/${id}`)).then(r => r.json()),
        listVoices: () => fetch(getUrl('/api/agents/voices')).then(r => r.json()),
        create: (data: { name: string; personality: string; description?: string; voice_id?: string }) =>
            fetch(getUrl('/api/agents'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        export: (id: string) =>
            fetch(getUrl(`/api/agents/${id}/export`), { method: 'POST' }).then(r => r.json()),
        uploadDocument: async (agentId: string, file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(getUrl(`/api/agents/${agentId}/documents`), {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
                throw new Error(err.detail || 'Upload failed');
            }
            return res.json();
        },
    },

    // Debate endpoints
    debates: {
        create: async (topic: string, humanName: string, aiAgentId: string, mode: 'one_vs_one' | 'ai_vs_ai' = 'one_vs_one', secondaryAgentId?: string) => {
            const res = await fetch(getUrl('/api/debates/'), {
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
            const res = await fetch(getUrl(`/api/debates/${id}`));
            return res.json();
        },
        sendMessage: async (debateId: string, message: string) => {
            const res = await fetch(getUrl(`/api/debates/${debateId}/message`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ debate_id: debateId, message }),
            });
            return res.json();
        },
        triggerTurn: async (debateId: string) => {
            const res = await fetch(getUrl(`/api/debates/${debateId}/trigger_ai_turn`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            return res.json();
        }, end: (id: string) =>
            fetch(getUrl(`/api/debates/${id}/end`), { method: 'POST' }).then(r => r.json()),
    },

    // Video endpoints
    videos: {
        list: (filter?: string) =>
            fetch(getUrl(`/api/videos${filter ? `?filter=${filter}` : ''}`)).then(r => r.json()),
        get: (id: string) => fetch(getUrl(`/api/videos/${id}`)).then(r => r.json()),
        like: (id: string) =>
            fetch(getUrl(`/api/videos/${id}/like`), { method: 'POST' }).then(r => r.json()),
        startLive: (data: { title: string; topic: string; human_debater: string; ai_agent_id: string }) => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            return fetch(getUrl('/api/videos/live/start'), {
                method: 'POST',
                body: formData,
            }).then(r => r.json());
        },
    },

    // Judge endpoints
    judge: {
        score: (data: { topic: string; human_argument: string; ai_argument: string }) =>
            fetch(getUrl('/api/judge/score'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        criteria: () => fetch(getUrl('/api/judge/criteria')).then(r => r.json()),
    },

    // TTS endpoints
    tts: {
        generate: (text: string, agentId: string) =>
            fetch(getUrl('/api/tts/generate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, agent_id: agentId }),
            }).then(r => r.json()),
    },
};

export default api;

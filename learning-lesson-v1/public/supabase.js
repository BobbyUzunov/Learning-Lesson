(function () {
    const CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    const PROFILE_STORAGE_KEY = 'learningEnvironmentProfileIdV1';
    let remoteConfig = null;
    let configPromise = null;

    function getConfig() {
        const config = window.SUPABASE_CONFIG || {};
        return {
            url: config.SUPABASE_URL || window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || remoteConfig?.SUPABASE_URL || '',
            anonKey: config.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || remoteConfig?.SUPABASE_ANON_KEY || ''
        };
    }

    function isConfigured() {
        const config = getConfig();
        return Boolean(config.url && config.anonKey && !config.url.includes('your-project'));
    }

    async function loadOptionalLocalConfig() {
        if (isConfigured()) return;
        const response = await fetch('/supabase-config.js', { cache: 'no-store' });
        if (!response.ok) return;
        const source = await response.text();
        if (!source.trim()) return;
        Function(source)();
    }

    async function ready() {
        if (isConfigured()) return getConfig();
        if (!configPromise) {
            configPromise = loadOptionalLocalConfig()
                .catch((error) => {
                    console.warn('Local Supabase config unavailable:', error.message);
                })
                .then(async () => {
                    if (isConfigured()) return getConfig();
                    const response = await fetch('/api/supabase-config', {
                        headers: { Accept: 'application/json' },
                        cache: 'no-store'
                    });
                    if (!response.ok) return getConfig();
                    const data = await response.json();
                    if (data?.configured) {
                        remoteConfig = data;
                    }
                    return getConfig();
                })
                .catch((error) => {
                    console.warn('Supabase config endpoint unavailable:', error.message);
                    return getConfig();
                });
        }
        return configPromise;
    }

    function loadSupabaseLibrary() {
        if (window.supabase?.createClient) return Promise.resolve(window.supabase);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Supabase client library timed out.')), 6000);
            const existingScript = document.querySelector('script[data-supabase-client]');
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    clearTimeout(timeout);
                    resolve(window.supabase);
                });
                existingScript.addEventListener('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
                return;
            }
            const script = document.createElement('script');
            script.src = CDN_URL;
            script.defer = true;
            script.dataset.supabaseClient = 'true';
            script.onload = () => {
                clearTimeout(timeout);
                resolve(window.supabase);
            };
            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Supabase client library failed to load.'));
            };
            document.head.appendChild(script);
        });
    }

    let clientPromise = null;

    async function getClient() {
        await ready();
        if (!isConfigured()) return null;
        if (!clientPromise) {
            clientPromise = loadSupabaseLibrary().then((supabaseGlobal) => {
                const config = getConfig();
                return supabaseGlobal.createClient(config.url, config.anonKey);
            }).catch((error) => {
                console.warn('Supabase is unavailable, using local fallback:', error.message);
                return null;
            });
        }
        return clientPromise;
    }

    async function apiFetch(path, options = {}) {
        await ready();
        if (!isConfigured()) return null;
        const config = getConfig();
        const response = await fetch(`${config.url}/rest/v1/${path}`, {
            ...options,
            headers: {
                apikey: config.anonKey,
                Authorization: `Bearer ${config.anonKey}`,
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Supabase request failed with ${response.status}`);
        }
        if (response.status === 204) return null;
        return response.json();
    }

    function getProfileId() {
        let profileId = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!profileId) {
            profileId = crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            localStorage.setItem(PROFILE_STORAGE_KEY, profileId);
        }
        return profileId;
    }

    function normalizeLesson(row) {
        return {
            id: row.slug,
            dbId: row.id,
            lang: row.path_slug,
            track: row.path_slug,
            order: row.sort_order || 0,
            label: row.label || row.title,
            title: row.title,
            category: row.category || 'Без категория',
            description: row.description || '',
            detailedExplanation: row.detailed_explanation || '',
            code: row.code || '',
            published: row.published !== false
        };
    }

    async function fetchPaths() {
        return apiFetch('learning_paths?select=*&order=sort_order.asc');
    }

    async function fetchLessons() {
        const data = await apiFetch('lessons?select=*&order=path_slug.asc,sort_order.asc');
        return (data || []).map(normalizeLesson);
    }

    async function createLesson(payload) {
        const data = await apiFetch('lessons?select=*', {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify(payload)
        });
        return normalizeLesson(data[0]);
    }

    async function updateLesson(id, payload) {
        const data = await apiFetch(`lessons?id=eq.${encodeURIComponent(id)}&select=*`, {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify(payload)
        });
        return normalizeLesson(data[0]);
    }

    async function deleteLesson(id) {
        await apiFetch(`lessons?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    }

    async function fetchProgress() {
        return apiFetch(`user_progress?select=*&profile_id=eq.${encodeURIComponent(getProfileId())}`);
    }

    async function saveCompletedLesson(pathSlug, lessonSlug, completed = true) {
        await apiFetch('user_progress?on_conflict=profile_id,path_slug,lesson_slug', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify({
            profile_id: getProfileId(),
            path_slug: pathSlug,
            lesson_slug: lessonSlug,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
            })
        });
        return true;
    }

    window.LearningSupabase = {
        getClient,
        apiFetch,
        getConfig,
        getProfileId,
        isConfigured,
        ready,
        fetchPaths,
        fetchLessons,
        createLesson,
        updateLesson,
        deleteLesson,
        fetchProgress,
        saveCompletedLesson
    };
})();

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
            const existingScript = document.querySelector('script[data-supabase-client]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.supabase));
                existingScript.addEventListener('error', reject);
                return;
            }
            const script = document.createElement('script');
            script.src = CDN_URL;
            script.defer = true;
            script.dataset.supabaseClient = 'true';
            script.onload = () => resolve(window.supabase);
            script.onerror = () => reject(new Error('Supabase client library failed to load.'));
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
        const client = await getClient();
        if (!client) return null;
        const { data, error } = await client
            .from('learning_paths')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
    }

    async function fetchLessons() {
        const client = await getClient();
        if (!client) return null;
        const { data, error } = await client
            .from('lessons')
            .select('*')
            .order('path_slug', { ascending: true })
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return (data || []).map(normalizeLesson);
    }

    async function createLesson(payload) {
        const client = await getClient();
        if (!client) throw new Error('Supabase не е конфигуриран.');
        const { data, error } = await client.from('lessons').insert(payload).select().single();
        if (error) throw error;
        return normalizeLesson(data);
    }

    async function updateLesson(id, payload) {
        const client = await getClient();
        if (!client) throw new Error('Supabase не е конфигуриран.');
        const { data, error } = await client.from('lessons').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return normalizeLesson(data);
    }

    async function deleteLesson(id) {
        const client = await getClient();
        if (!client) throw new Error('Supabase не е конфигуриран.');
        const { error } = await client.from('lessons').delete().eq('id', id);
        if (error) throw error;
    }

    async function fetchProgress() {
        const client = await getClient();
        if (!client) return null;
        const { data, error } = await client
            .from('user_progress')
            .select('*')
            .eq('profile_id', getProfileId());
        if (error) throw error;
        return data || [];
    }

    async function saveCompletedLesson(pathSlug, lessonSlug, completed = true) {
        const client = await getClient();
        if (!client) return null;
        const { error } = await client.from('user_progress').upsert({
            profile_id: getProfileId(),
            path_slug: pathSlug,
            lesson_slug: lessonSlug,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'profile_id,path_slug,lesson_slug'
        });
        if (error) throw error;
        return true;
    }

    window.LearningSupabase = {
        getClient,
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

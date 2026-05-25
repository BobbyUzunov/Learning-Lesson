const PROGRESS_STORAGE_KEY = 'learningEnvironmentProgressV1';
const TRACK_LABELS = {
    javascript: 'JavaScript',
    python: 'Python',
    swift: 'Swift',
    backend: 'Backend',
    web: 'HTML/CSS',
    new: 'AI & Tools'
};

const state = {
    rows: [],
    paths: [],
    source: 'local',
    loading: false,
    selectedDbId: null
};

function readProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)) || { completed: {} };
    } catch (error) {
        return { completed: {} };
    }
}

function writeProgress(progress) {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function getLessonsMap(lang) {
    if (lang === 'python') return lessonsPython;
    if (lang === 'swift') return lessonsSwift;
    if (lang === 'backend') return lessonsBackend;
    if (lang === 'web') return lessonsWeb;
    if (lang === 'new') return lessonsNew;
    return lessonsJS;
}

function getProgressKey(lang, lessonId) {
    return `${lang}:${lessonId}`;
}

function getLocalRows() {
    return Object.keys(topicsByLanguage).flatMap(lang => {
        const lessons = getLessonsMap(lang);
        return (topicsByLanguage[lang] || []).map((topic, index) => {
            const lesson = lessons[topic.id] || {};
            return {
                lang,
                track: TRACK_LABELS[lang] || lang,
                id: topic.id,
                slug: topic.id,
                dbId: null,
                order: index + 1,
                label: topic.label,
                title: lesson.title || topic.label,
                category: lesson.category || 'Без категория',
                description: lesson.description || '',
                detailedExplanation: lesson.detailedExplanation || '',
                code: lesson.code || '',
                hasDetails: Boolean(lesson.detailedExplanation),
                published: true
            };
        });
    });
}

function getLocalPaths() {
    return Object.keys(topicsByLanguage).map((slug, index) => ({
        slug,
        title: TRACK_LABELS[slug] || slug,
        sort_order: index + 1
    }));
}

async function loadRows() {
    state.loading = true;
    setStatus('Зареждане на данни...', 'warn');
    try {
        if (window.LearningSupabase?.isConfigured()) {
            const [paths, lessons] = await Promise.all([
                window.LearningSupabase.fetchPaths(),
                window.LearningSupabase.fetchLessons()
            ]);
            if (lessons && paths) {
                state.paths = paths.length ? paths : getLocalPaths();
                state.rows = lessons.map(row => ({
                    ...row,
                    lang: row.lang,
                    track: TRACK_LABELS[row.lang] || state.paths.find(path => path.slug === row.lang)?.title || row.lang,
                    hasDetails: Boolean(row.detailedExplanation)
                }));
                state.source = 'supabase';
                setStatus(`Supabase е свързан. Заредени са ${state.rows.length} урока от базата.`, 'ok');
                return;
            }
        }
        state.paths = getLocalPaths();
        state.rows = getLocalRows();
        state.source = 'local';
        setStatus('Supabase не е конфигуриран. Показвам fallback данните от JS файловете.', 'warn');
    } catch (error) {
        console.error('Admin data loading failed:', error);
        state.paths = getLocalPaths();
        state.rows = getLocalRows();
        state.source = 'local';
        setStatus(`Грешка при Supabase зареждане: ${error.message}. Включен е fallback.`, 'warn');
    } finally {
        state.loading = false;
    }
}

function getCompletedSet() {
    return readProgress().completed || {};
}

function isCompleted(row) {
    return Boolean(getCompletedSet()[getProgressKey(row.lang, row.id)]);
}

function auditRow(row) {
    const issues = [];
    if (!row.description || row.description.length < 40) issues.push('кратко описание');
    if (!row.code || row.code.length < 30) issues.push('липсва код');
    if (!row.category) issues.push('липсва категория');
    if (!row.hasDetails) issues.push('липсва детайлно обяснение');
    return issues;
}

function updateMetrics(rows) {
    const completed = rows.filter(isCompleted).length;
    const issues = rows.reduce((sum, row) => sum + auditRow(row).length, 0);
    const percent = rows.length ? Math.round((completed / rows.length) * 100) : 0;
    const tracks = new Set(rows.map(row => row.lang)).size || state.paths.length;

    document.getElementById('metric-tracks').textContent = tracks;
    document.getElementById('metric-lessons').textContent = rows.length;
    document.getElementById('metric-completed').textContent = completed;
    document.getElementById('metric-completed-note').textContent = `${percent}% local/Supabase-ready progress.`;
    document.getElementById('metric-issues').textContent = issues;
}

function renderTrackFilter() {
    const select = document.getElementById('track-filter');
    const current = select.value || 'all';
    select.innerHTML = [
        '<option value="all">Всички теми</option>',
        ...state.paths.map(path => `<option value="${path.slug}">${escapeHtml(path.title || TRACK_LABELS[path.slug] || path.slug)}</option>`)
    ].join('');
    select.value = [...select.options].some(option => option.value === current) ? current : 'all';
}

function renderLessonPathOptions() {
    const select = document.getElementById('lesson-path');
    const current = select.value || state.paths[0]?.slug || 'new';
    select.innerHTML = state.paths.map(path => `<option value="${path.slug}">${escapeHtml(path.title || path.slug)}</option>`).join('');
    select.value = [...select.options].some(option => option.value === current) ? current : state.paths[0]?.slug || 'new';
}

function renderTrackProgress(rows) {
    const container = document.getElementById('track-progress-list');
    container.innerHTML = state.paths.map(path => {
        const trackRows = rows.filter(row => row.lang === path.slug);
        const completed = trackRows.filter(isCompleted).length;
        const percent = trackRows.length ? Math.round((completed / trackRows.length) * 100) : 0;
        return `
            <div class="track-row">
                <div class="track-name">${escapeHtml(path.title || TRACK_LABELS[path.slug] || path.slug)}</div>
                <div class="progress-track" aria-label="${percent}%">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="track-count">${completed}/${trackRows.length}</div>
            </div>
        `;
    }).join('');
}

function renderLessonsTable(rows) {
    const selectedTrack = document.getElementById('track-filter').value;
    const query = document.getElementById('lesson-search').value.trim().toLowerCase();
    const tbody = document.getElementById('lessons-table-body');
    const filtered = rows.filter(row => {
        const inTrack = selectedTrack === 'all' || row.lang === selectedTrack;
        const haystack = `${row.track} ${row.id} ${row.label} ${row.title} ${row.category}`.toLowerCase();
        return inTrack && (!query || haystack.includes(query));
    });

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">Няма намерени уроци.</div></td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(row => {
        const issues = auditRow(row);
        const completed = isCompleted(row);
        const sourceLabel = row.dbId ? 'Supabase' : 'Local';
        return `
            <tr>
                <td data-label="Track">${escapeHtml(row.track)}</td>
                <td data-label="Lesson"><strong>${escapeHtml(row.title)}</strong><br><span class="metric-note">${escapeHtml(row.id)}</span></td>
                <td data-label="Category">${escapeHtml(row.category)}</td>
                <td data-label="Status"><span class="status-pill ${completed ? 'ok' : ''}">${completed ? 'Complete' : 'Open'}</span></td>
                <td data-label="Code"><span class="status-pill ${issues.length ? 'warn' : 'ok'}">${issues.length ? escapeHtml(issues.join(', ')) : 'Ready'}</span></td>
                <td data-label="Edit"><button class="btn" type="button" onclick="editLesson('${escapeHtml(row.dbId || '')}', '${escapeHtml(row.lang)}', '${escapeHtml(row.id)}')">${sourceLabel}</button></td>
            </tr>
        `;
    }).join('');
}

function renderAudit(rows) {
    const audit = rows
        .map(row => ({ row, issues: auditRow(row) }))
        .filter(item => item.issues.length)
        .slice(0, 8);

    const container = document.getElementById('audit-list');
    if (!audit.length) {
        container.innerHTML = '<div class="empty-state">Всички уроци имат основно съдържание.</div>';
        return;
    }

    container.innerHTML = audit.map(item => `
        <div class="audit-item">
            <span>${escapeHtml(item.row.track)}: ${escapeHtml(item.row.title)}</span>
            <strong>${escapeHtml(item.issues.join(', '))}</strong>
        </div>
    `).join('');
}

function exportReport(rows) {
    const completed = rows.filter(isCompleted).length;
    const report = {
        source: state.source,
        exportedAt: new Date().toISOString(),
        tracks: new Set(rows.map(row => row.lang)).size,
        lessons: rows.length,
        completed,
        completionPercent: rows.length ? Math.round((completed / rows.length) * 100) : 0,
        byTrack: state.paths.map(path => {
            const trackRows = rows.filter(row => row.lang === path.slug);
            return {
                lang: path.slug,
                name: path.title || TRACK_LABELS[path.slug] || path.slug,
                lessons: trackRows.length,
                completed: trackRows.filter(isCompleted).length
            };
        })
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'learning-admin-report.json';
    link.click();
    URL.revokeObjectURL(link.href);
}

function markSelectedTrackComplete(rows) {
    const selectedTrack = document.getElementById('track-filter').value;
    const lang = selectedTrack === 'all' ? 'new' : selectedTrack;
    const progress = readProgress();
    progress.completed = progress.completed || {};
    rows.filter(row => row.lang === lang).forEach(row => {
        progress.completed[getProgressKey(row.lang, row.id)] = new Date().toISOString();
    });
    writeProgress(progress);
    renderAdmin();
}

function resetProgress() {
    if (!confirm('Да изчистя ли целия локален прогрес за този браузър?')) return;
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    renderAdmin();
}

function fillLessonForm(row = null) {
    document.getElementById('lesson-db-id').value = row?.dbId || '';
    document.getElementById('lesson-path').value = row?.lang || state.paths[0]?.slug || 'new';
    document.getElementById('lesson-slug').value = row?.id || '';
    document.getElementById('lesson-title').value = row?.title || '';
    document.getElementById('lesson-category').value = row?.category || '';
    document.getElementById('lesson-description').value = row?.description || '';
    document.getElementById('lesson-details').value = row?.detailedExplanation || '';
    document.getElementById('lesson-code').value = row?.code || '';
    document.getElementById('lesson-order').value = row?.order || 1;
    document.getElementById('lesson-published').checked = row?.published !== false;
    state.selectedDbId = row?.dbId || null;
}

function editLesson(dbId, lang, slug) {
    const row = state.rows.find(item => (dbId && item.dbId === dbId) || (item.lang === lang && item.id === slug));
    if (!row) return;
    fillLessonForm(row);
    setStatus(row.dbId ? 'Урокът е зареден за редакция.' : 'Това е local fallback урок. Запази го, за да го създадеш в Supabase.', row.dbId ? 'ok' : 'warn');
}

function getLessonPayload() {
    const pathSlug = document.getElementById('lesson-path').value;
    const slug = document.getElementById('lesson-slug').value.trim();
    return {
        path_slug: pathSlug,
        slug,
        label: document.getElementById('lesson-title').value.trim(),
        title: document.getElementById('lesson-title').value.trim(),
        category: document.getElementById('lesson-category').value.trim(),
        description: document.getElementById('lesson-description').value.trim(),
        detailed_explanation: document.getElementById('lesson-details').value.trim(),
        code: document.getElementById('lesson-code').value,
        sort_order: Number(document.getElementById('lesson-order').value || 1),
        published: document.getElementById('lesson-published').checked
    };
}

async function saveLesson(event) {
    event.preventDefault();
    if (!window.LearningSupabase?.isConfigured()) {
        setStatus('Supabase не е конфигуриран. Попълни SUPABASE_URL и SUPABASE_ANON_KEY, за да записваш в база.', 'warn');
        return;
    }
    const dbId = document.getElementById('lesson-db-id').value;
    const payload = getLessonPayload();
    if (!payload.slug || !payload.title || !payload.path_slug) {
        setStatus('Попълни поне пътека, slug и заглавие.', 'warn');
        return;
    }
    try {
        setStatus('Записване...', 'warn');
        if (dbId) {
            await window.LearningSupabase.updateLesson(dbId, payload);
        } else {
            await window.LearningSupabase.createLesson(payload);
        }
        setStatus('Урокът е записан в Supabase.', 'ok');
        await refreshAdmin();
    } catch (error) {
        console.error('Lesson save failed:', error);
        setStatus(`Грешка при запис: ${error.message}`, 'warn');
    }
}

async function deleteSelectedLesson() {
    const dbId = document.getElementById('lesson-db-id').value;
    if (!dbId) {
        setStatus('Може да изтриеш само урок, който вече съществува в Supabase.', 'warn');
        return;
    }
    if (!confirm('Да изтрия ли този урок от Supabase?')) return;
    try {
        await window.LearningSupabase.deleteLesson(dbId);
        fillLessonForm();
        setStatus('Урокът е изтрит.', 'ok');
        await refreshAdmin();
    } catch (error) {
        console.error('Lesson delete failed:', error);
        setStatus(`Грешка при изтриване: ${error.message}`, 'warn');
    }
}

function setStatus(message, type = '') {
    const status = document.getElementById('admin-status');
    if (!status) return;
    status.textContent = message;
    status.className = `admin-status ${type}`.trim();
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
}

function renderAdmin() {
    renderTrackFilter();
    renderLessonPathOptions();
    updateMetrics(state.rows);
    renderTrackProgress(state.rows);
    renderLessonsTable(state.rows);
    renderAudit(state.rows);
}

async function refreshAdmin() {
    await loadRows();
    renderAdmin();
}

document.addEventListener('DOMContentLoaded', async () => {
    await refreshAdmin();
    fillLessonForm();

    document.getElementById('track-filter').addEventListener('change', renderAdmin);
    document.getElementById('lesson-search').addEventListener('input', renderAdmin);
    document.getElementById('reload-data-btn').addEventListener('click', refreshAdmin);
    document.getElementById('lesson-form').addEventListener('submit', saveLesson);
    document.getElementById('new-lesson-btn').addEventListener('click', () => fillLessonForm());
    document.getElementById('delete-lesson-btn').addEventListener('click', deleteSelectedLesson);
    document.getElementById('export-report-btn').addEventListener('click', () => exportReport(state.rows));
    document.getElementById('mark-track-btn').addEventListener('click', () => markSelectedTrackComplete(state.rows));
    document.getElementById('reset-progress-btn').addEventListener('click', resetProgress);
});

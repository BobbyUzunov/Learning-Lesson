const PROGRESS_STORAGE_KEY = 'learningEnvironmentProgressV1';
const TRACK_LABELS = {
    javascript: 'JavaScript',
    python: 'Python',
    swift: 'Swift',
    backend: 'Backend',
    web: 'HTML/CSS',
    new: 'AI & Tools'
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

function getAllRows() {
    return Object.keys(topicsByLanguage).flatMap(lang => {
        const lessons = getLessonsMap(lang);
        return (topicsByLanguage[lang] || []).map((topic, index) => {
            const lesson = lessons[topic.id] || {};
            return {
                lang,
                track: TRACK_LABELS[lang] || lang,
                id: topic.id,
                order: index + 1,
                label: topic.label,
                title: lesson.title || topic.label,
                category: lesson.category || 'Без категория',
                description: lesson.description || '',
                code: lesson.code || '',
                hasDetails: Boolean(lesson.detailedExplanation)
            };
        });
    });
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

    document.getElementById('metric-tracks').textContent = Object.keys(topicsByLanguage).length;
    document.getElementById('metric-lessons').textContent = rows.length;
    document.getElementById('metric-completed').textContent = completed;
    document.getElementById('metric-completed-note').textContent = `${percent}% local progress.`;
    document.getElementById('metric-issues').textContent = issues;
}

function renderTrackFilter() {
    const select = document.getElementById('track-filter');
    select.innerHTML = [
        '<option value="all">Всички теми</option>',
        ...Object.keys(topicsByLanguage).map(lang => `<option value="${lang}">${TRACK_LABELS[lang] || lang}</option>`)
    ].join('');
}

function renderTrackProgress(rows) {
    const container = document.getElementById('track-progress-list');
    container.innerHTML = Object.keys(topicsByLanguage).map(lang => {
        const trackRows = rows.filter(row => row.lang === lang);
        const completed = trackRows.filter(isCompleted).length;
        const percent = trackRows.length ? Math.round((completed / trackRows.length) * 100) : 0;
        return `
            <div class="track-row">
                <div class="track-name">${TRACK_LABELS[lang] || lang}</div>
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
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">Няма намерени уроци.</div></td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(row => {
        const issues = auditRow(row);
        const completed = isCompleted(row);
        return `
            <tr>
                <td data-label="Track">${row.track}</td>
                <td data-label="Lesson"><strong>${escapeHtml(row.title)}</strong><br><span class="metric-note">${escapeHtml(row.id)}</span></td>
                <td data-label="Category">${escapeHtml(row.category)}</td>
                <td data-label="Status"><span class="status-pill ${completed ? 'ok' : ''}">${completed ? 'Complete' : 'Open'}</span></td>
                <td data-label="Code"><span class="status-pill ${issues.length ? 'warn' : 'ok'}">${issues.length ? issues.join(', ') : 'Ready'}</span></td>
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
        exportedAt: new Date().toISOString(),
        tracks: Object.keys(topicsByLanguage).length,
        lessons: rows.length,
        completed,
        completionPercent: rows.length ? Math.round((completed / rows.length) * 100) : 0,
        byTrack: Object.keys(topicsByLanguage).map(lang => {
            const trackRows = rows.filter(row => row.lang === lang);
            return {
                lang,
                name: TRACK_LABELS[lang] || lang,
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

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
}

function renderAdmin() {
    const rows = getAllRows();
    updateMetrics(rows);
    renderTrackProgress(rows);
    renderLessonsTable(rows);
    renderAudit(rows);
}

document.addEventListener('DOMContentLoaded', () => {
    renderTrackFilter();
    renderAdmin();

    document.getElementById('track-filter').addEventListener('change', renderAdmin);
    document.getElementById('lesson-search').addEventListener('input', renderAdmin);
    document.getElementById('export-report-btn').addEventListener('click', () => exportReport(getAllRows()));
    document.getElementById('mark-track-btn').addEventListener('click', () => markSelectedTrackComplete(getAllRows()));
    document.getElementById('reset-progress-btn').addEventListener('click', resetProgress);
});

css = """:root {
    --primary-color: #4a90e2;
    --primary-hover: #357abd;
    --danger-color: #e74c3c;
    --danger-hover: #c0392b;
    --bg-color: #f5f5f5;
    --sidebar-bg: #2c3e50;
    --sidebar-text: #ecf0f1;
    --card-bg: #ffffff;
    --text-color: #333333;
    --text-light: #666666;
    --border-color: #e0e0e0;
    --preview-code-bg: #f4f4f4;
    --preview-blockquote-border: #4a90e2;
    --toast-bg: #333;
    --toast-color: #fff;
}

body.dark {
    --primary-color: #5b9fe6;
    --primary-hover: #4a8fd6;
    --danger-color: #e74c3c;
    --danger-hover: #c0392b;
    --bg-color: #1a1a2e;
    --sidebar-bg: #16213e;
    --sidebar-text: #e0e0e0;
    --card-bg: #1f1f36;
    --text-color: #e0e0e0;
    --text-light: #999;
    --border-color: #333;
    --preview-code-bg: #2a2a40;
    --preview-blockquote-border: #5b9fe6;
    --toast-bg: #444;
    --toast-color: #fff;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    height: 100vh;
    overflow: hidden;
    transition: background-color 0.3s, color 0.3s;
}

.app-container { display: flex; height: 100vh; position: relative; }

.drop-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(74, 144, 226, 0.85);
    z-index: 9999; align-items: center; justify-content: center;
}
.drop-overlay.active { display: flex; }
.drop-overlay-content { text-align: center; color: #fff; }
.drop-overlay-icon { font-size: 4rem; display: block; margin-bottom: 16px; }
.drop-overlay-text { font-size: 1.4rem; font-weight: 600; }

.hamburger {
    display: none; position: fixed; top: 12px; left: 12px; z-index: 1100;
    background: var(--sidebar-bg); color: var(--sidebar-text);
    border: none; border-radius: 6px; font-size: 1.5rem;
    width: 40px; height: 40px; cursor: pointer; line-height: 40px; text-align: center;
}
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
.sidebar-overlay.active { display: block; }

.sidebar {
    width: 300px; min-width: 300px;
    background-color: var(--sidebar-bg); color: var(--sidebar-text);
    display: flex; flex-direction: column;
    border-right: 1px solid rgba(0,0,0,0.1);
    transition: transform 0.3s, background-color 0.3s; z-index: 1000;
}
.sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.sidebar-header h1 { font-size: 1.5rem; margin-bottom: 15px; }

.btn-primary {
    width: 100%; padding: 10px 15px;
    background-color: var(--primary-color); color: white;
    border: none; border-radius: 6px; cursor: pointer;
    font-size: 1rem; transition: background-color 0.2s;
}
.btn-primary:hover { background-color: var(--primary-hover); }

.sidebar-tools { padding: 10px 20px 5px; }
.search-input {
    width: 100%; padding: 10px 15px; border: none; border-radius: 6px;
    background-color: rgba(255,255,255,0.1); color: var(--sidebar-text);
    font-size: 0.9rem; margin-bottom: 10px;
}
.search-input::placeholder { color: rgba(255,255,255,0.5); }
.search-input:focus { outline: none; background-color: rgba(255,255,255,0.15); }

.sidebar-toolbar { display: flex; gap: 6px; align-items: center; }
.sort-select {
    flex: 1; padding: 6px 8px; border: none; border-radius: 6px;
    background: rgba(255,255,255,0.1); color: var(--sidebar-text);
    font-size: 0.8rem; cursor: pointer;
}
.sort-select:focus { outline: none; }
.sort-select option { background: var(--sidebar-bg); color: var(--sidebar-text); }

.btn-icon {
    background: rgba(255,255,255,0.1); border: none; border-radius: 6px;
    color: var(--sidebar-text); width: 32px; height: 32px; cursor: pointer;
    font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
}
.btn-icon:hover { background: rgba(255,255,255,0.2); }

.notes-list { flex: 1; overflow-y: auto; padding: 10px; }
.note-item {
    padding: 15px; margin-bottom: 8px;
    background-color: rgba(255,255,255,0.05); border-radius: 8px;
    cursor: pointer; transition: all 0.2s;
}
.note-item:hover { background-color: rgba(255,255,255,0.1); }
.note-item.active { background-color: var(--primary-color); }
.note-item-title { font-weight: 600; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-item-preview { font-size: 0.85rem; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-item-date { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 8px; }

.main-content {
    flex: 1; display: flex; flex-direction: column;
    background-color: var(--card-bg); transition: background-color 0.3s; min-width: 0;
}

.editor-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; color: var(--text-light); user-select: none;
}
.editor-empty-icon { font-size: 5rem; margin-bottom: 20px; opacity: 0.4; }
.editor-empty-text { font-size: 1.2rem; opacity: 0.6; }

.editor-area { display: flex; flex-direction: column; height: 100%; }
.editor-header {
    padding: 20px 30px; border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; gap: 15px; flex-wrap: wrap;
}
.note-title-input {
    flex: 1; min-width: 200px; border: none; font-size: 1.5rem; font-weight: 600;
    color: var(--text-color); background: transparent; outline: none;
}
.note-title-input::placeholder { color: #ccc; }

.editor-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-action {
    padding: 7px 13px; border: 1px solid var(--border-color); border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; background-color: transparent;
    color: var(--text-color); transition: all 0.2s; white-space: nowrap;
}
.btn-action:hover { background-color: rgba(0,0,0,0.05); }
body.dark .btn-action:hover { background-color: rgba(255,255,255,0.08); }
.btn-preview.active { background-color: var(--primary-color); color: #fff; border-color: var(--primary-color); }

.btn-save, .btn-delete {
    padding: 7px 15px; border: none; border-radius: 6px;
    cursor: pointer; font-size: 0.9rem; transition: all 0.2s; white-space: nowrap;
}
.btn-save { background-color: var(--primary-color); color: white; }
.btn-save:hover { background-color: var(--primary-hover); }
.btn-delete { background-color: var(--danger-color); color: white; }
.btn-delete:hover { background-color: var(--danger-hover); }

.note-content {
    flex: 1; padding: 30px; border: none; resize: none;
    font-size: 1rem; line-height: 1.8; color: var(--text-color);
    background: transparent; outline: none;
}
.note-content::placeholder { color: #ccc; }

.markdown-preview {
    flex: 1; padding: 30px; overflow-y: auto; line-height: 1.8;
    font-size: 1rem; color: var(--text-color);
}
.markdown-preview h1 { font-size: 1.8rem; margin: 16px 0 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
.markdown-preview h2 { font-size: 1.5rem; margin: 14px 0 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; }
.markdown-preview h3 { font-size: 1.25rem; margin: 12px 0 8px; }
.markdown-preview h4 { font-size: 1.1rem; margin: 10px 0 6px; }
.markdown-preview p { margin: 8px 0; }
.markdown-preview strong { font-weight: 700; }
.markdown-preview em { font-style: italic; }
.markdown-preview code {
    background: var(--preview-code-bg); padding: 2px 6px; border-radius: 4px;
    font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.9em;
}
.markdown-preview pre { background: var(--preview-code-bg); padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
.markdown-preview pre code { background: transparent; padding: 0; }
.markdown-preview blockquote {
    border-left: 4px solid var(--preview-blockquote-border); padding: 8px 16px;
    margin: 12px 0; color: var(--text-light);
    background: rgba(74,144,226,0.05); border-radius: 0 6px 6px 0;
}
.markdown-preview ul, .markdown-preview ol { padding-left: 28px; margin: 8px 0; }
.markdown-preview li { margin: 4px 0; }
.markdown-preview a { color: var(--primary-color); text-decoration: underline; }
.markdown-preview hr { border: none; border-top: 1px solid var(--border-color); margin: 20px 0; }
.markdown-preview img { max-width: 100%; border-radius: 6px; }

.editor-footer {
    padding: 12px 30px; border-top: 1px solid var(--border-color);
    display: flex; justify-content: space-between; align-items: center;
    color: var(--text-light); font-size: 0.85rem;
}
.read-time { color: var(--text-light); opacity: 0.8; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--text-light); }
.empty-state-icon { font-size: 3rem; margin-bottom: 15px; opacity: 0.5; }
.empty-state-text { font-size: 0.95rem; opacity: 0.7; }

.toast-container {
    position: fixed; bottom: 30px; right: 30px; z-index: 10000;
    display: flex; flex-direction: column-reverse; gap: 10px;
}
.toast {
    background: var(--toast-bg); color: var(--toast-color);
    padding: 12px 24px; border-radius: 8px; font-size: 0.9rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s; opacity: 1;
}
@keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toastOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.3); }
body.dark ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.15); }

.auto-save-indicator {
    display: inline-block; width: 6px; height: 6px; border-radius: 50%;
    background: #2ecc71; margin-right: 6px; vertical-align: middle;
    animation: pulse 1.5s ease infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

@media (max-width: 768px) {
    .hamburger { display: block; }
    .sidebar {
        position: fixed; left: 0; top: 0; bottom: 0;
        transform: translateX(-100%); box-shadow: none;
        width: 280px; min-width: 280px;
    }
    .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
    .editor-header { padding: 15px 20px; padding-left: 60px; }
    .note-title-input { font-size: 1.2rem; }
    .note-content, .markdown-preview { padding: 15px 20px; }
    .editor-footer { padding: 10px 20px; font-size: 0.8rem; }
    .editor-actions { gap: 5px; }
    .btn-action { padding: 5px 10px; font-size: 0.75rem; }
    .btn-save, .btn-delete { padding: 5px 12px; font-size: 0.8rem; }
}

@media (max-width: 480px) {
    .editor-header { flex-direction: column; align-items: flex-start; gap: 10px; }
    .note-title-input { width: 100%; }
    .editor-actions { width: 100%; justify-content: flex-end; }
}
"""

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('OK style.css written', len(css), 'chars')

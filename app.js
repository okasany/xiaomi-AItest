
/* 笔记应用 - 主逻辑
   功能：增删改查、搜索、字数统计、文件导入导出、深色模式、Markdown预览、回收站、拖拽导入 */

// ============================================================
// 工具函数
// ============================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + ' 分钟前';
    if (hours < 24) return hours + ' 小时前';
    if (days < 7) return days + ' 天前';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function getReadTime(text) {
    const count = text.replace(/\s/g, '').length;
    const minutes = Math.max(1, Math.ceil(count / 300));
    return '阅读约 ' + minutes + ' 分钟';
}

function getCharCount(text) {
    return '字数：' + text.replace(/\s/g, '').length;
}

function simpleMarkdown(text) {
    let html = escapeHtml(text);
    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // 粗体和斜体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 行内代码
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    // 无序列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // 有序列表
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // 引用
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // 分割线
    html = html.replace(/^---$/gm, '<hr>');
    // 换行
    html = html.replace(/\n/g, '<br>');
    return html;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ============================================================
// 存储管理
// ============================================================

var NoteStorage = {
    NOTES_KEY: 'notes_app_data',
    TRASH_KEY: 'notes_app_trash',
    THEME_KEY: 'notes_app_theme',
    SORT_KEY: 'notes_app_sort',

    getNotes: function () {
        try {
            var data = localStorage.getItem(this.NOTES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveNotes: function (notes) {
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    },

    getTrash: function () {
        try {
            var data = localStorage.getItem(this.TRASH_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveTrash: function (trash) {
        localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));
    },

    getTheme: function () {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    },

    saveTheme: function (theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    },

    getSortMode: function () {
        return localStorage.getItem(this.SORT_KEY) || 'updated';
    },

    saveSortMode: function (mode) {
        localStorage.setItem(this.SORT_KEY, mode);
    }
};

// ============================================================
// 文件管理
// ============================================================

var FileManager = {
    exportNote: function (title, content) {
        var text = '# ' + title + '\n\n' + content;
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (title || '未命名笔记') + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportAll: function (notes) {
        var json = JSON.stringify(notes, null, 2);
        var blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '笔记备份_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importFile: function (callback) {
        var input = document.getElementById('fileInput');
        input.onchange = function (e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function (ev) {
                var content = ev.target.result;
                var title = file.name.replace(/\.(txt|md|json)$/i, '');

                // 如果是 JSON 备份文件
                if (file.name.endsWith('.json')) {
                    try {
                        var data = JSON.parse(content);
                        if (Array.isArray(data)) {
                            callback('json-import', data);
                            return;
                        }
                    } catch (err) {
                        alert('JSON 文件格式错误');
                        return;
                    }
                }

                // 如果是 markdown 文件，提取标题
                if (content.startsWith('# ')) {
                    var lines = content.split('\n');
                    title = lines[0].replace(/^#\s*/, '');
                    content = lines.slice(1).join('\n').trim();
                }
                callback('text-import', { title: title, content: content });
            };
            reader.readAsText(file);
            input.value = '';
        };
        input.click();
    },

    handleDrop: function (files, callback) {
        for (var i = 0; i < files.length; i++) {
            (function (file) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    var content = ev.target.result;
                    var title = file.name.replace(/\.(txt|md|json)$/i, '');
                    if (file.name.endsWith('.json')) {
                        try {
                            var data = JSON.parse(content);
                            if (Array.isArray(data)) {
                                callback('json-import', data);
                                return;
                            }
                        } catch (err) {
                            return;
                        }
                    }
                    if (content.startsWith('# ')) {
                        var lines = content.split('\n');
                        title = lines[0].replace(/^#\s*/, '');
                        content = lines.slice(1).join('\n').trim();
                    }
                    callback('text-import', { title: title, content: content });
                };
                reader.readAsText(file);
            })(files[i]);
        }
    }
};

// ============================================================
// 应用主逻辑
// ============================================================

var App = {
    currentNoteId: null,
    autoSaveTimer: null,
    previewMode: false,
    confirmCallback: null,

    init: function () {
        this.bindEvents();
        this.initTheme();
        this.renderNoteList();
        this.updateNoteCount();

        // 选中第一条笔记
        var notes = NoteStorage.getNotes();
        if (notes.length > 0) {
            this.selectNote(notes[0].id);
        } else {
            this.showEmptyState();
        }
    },

    // ---- 事件绑定 ----

    bindEvents: function () {
        var self = this;

        // 新建笔记
        document.getElementById('newNoteBtn').addEventListener('click', function () {
            self.createNote();
        });

        // 搜索
        document.getElementById('searchInput').addEventListener('input', function () {
            self.renderNoteList();
        });

        // 标题输入 - 自动保存
        document.getElementById('titleInput').addEventListener('input', function () {
            self.scheduleAutoSave();
        });

        // 内容输入 - 自动保存 + 字数统计
        document.getElementById('contentArea').addEventListener('input', function () {
            self.updateStats();
            self.scheduleAutoSave();
        });

        // 删除笔记
        document.getElementById('deleteBtn').addEventListener('click', function () {
            self.deleteCurrentNote();
        });

        // 导出笔记
        document.getElementById('exportBtn').addEventListener('click', function () {
            if (!self.currentNoteId) return;
            var notes = NoteStorage.getNotes();
            var note = notes.find(function (n) { return n.id === self.currentNoteId; });
            if (note) FileManager.exportNote(note.title, note.content);
        });

        // 导入笔记
        document.getElementById('importBtn').addEventListener('click', function () {
            FileManager.importFile(function (type, data) {
                if (type === 'text-import') {
                    self.createNote(data.title, data.content);
                } else if (type === 'json-import') {
                    self.importAllNotes(data);
                }
            });
        });

        // Markdown 预览
        document.getElementById('previewBtn').addEventListener('click', function () {
            self.togglePreview();
        });

        // 排序
        document.getElementById('sortBtn').addEventListener('click', function () {
            self.toggleSort();
        });

        // 导出全部笔记
        document.getElementById('exportAllBtn').addEventListener('click', function () {
            var notes = NoteStorage.getNotes();
            if (notes.length === 0) {
                alert('没有可导出的笔记');
                return;
            }
            FileManager.exportAll(notes);
        });

        // 回收站
        document.getElementById('trashBtn').addEventListener('click', function () {
            self.openTrash();
        });

        document.getElementById('closeTrashBtn').addEventListener('click', function () {
            document.getElementById('trashDialog').style.display = 'none';
        });

        document.getElementById('emptyTrashBtn').addEventListener('click', function () {
            self.emptyTrash();
        });

        // 确认对话框
        document.getElementById('confirmYes').addEventListener('click', function () {
            document.getElementById('confirmDialog').style.display = 'none';
            if (self.confirmCallback) self.confirmCallback();
        });

        document.getElementById('confirmNo').addEventListener('click', function () {
            document.getElementById('confirmDialog').style.display = 'none';
            self.confirmCallback = null;
        });

        // 深色模式
        document.getElementById('darkModeToggle').addEventListener('click', function () {
            self.toggleTheme();
        });

        // 移动端菜单
        document.getElementById('mobileMenuBtn').addEventListener('click', function () {
            self.toggleSidebar();
        });

        // 拖拽导入
        var editorArea = document.getElementById('editorArea');
        editorArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            editorArea.classList.add('drag-over');
        });
        editorArea.addEventListener('dragleave', function () {
            editorArea.classList.remove('drag-over');
        });
        editorArea.addEventListener('drop', function (e) {
            e.preventDefault();
            editorArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                FileManager.handleDrop(e.dataTransfer.files, function (type, data) {
                    if (type === 'text-import') {
                        self.createNote(data.title, data.content);
                    } else if (type === 'json-import') {
                        self.importAllNotes(data);
                    }
                });
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', function (e) {
            // Ctrl+N 新建
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                self.createNote();
            }
            // Ctrl+S 自动保存（阻止默认保存）
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                self.saveCurrentNote();
            }
            // Escape 关闭对话框
            if (e.key === 'Escape') {
                document.getElementById('confirmDialog').style.display = 'none';
                document.getElementById('trashDialog').style.display = 'none';
            }
        });
    },

    // ---- 笔记操作 ----

    createNote: function (title, content) {
        var notes = NoteStorage.getNotes();
        var note = {
            id: generateId(),
            title: title || '',
            content: content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(note);
        NoteStorage.saveNotes(notes);
        this.renderNoteList();
        this.selectNote(note.id);
        this.updateNoteCount();
        // 聚焦标题
        if (!title) {
            document.getElementById('titleInput').focus();
        }
    },

    selectNote: function (id) {
        this.currentNoteId = id;
        var notes = NoteStorage.getNotes();
        var note = notes.find(function (n) { return n.id === id; });
        if (!note) return;

        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('editor').style.display = 'flex';
        document.getElementById('titleInput').value = note.title;
        document.getElementById('contentArea').value = note.content;
        this.updateStats();
        this.highlightSelected();

        // 关闭预览模式
        this.previewMode = false;
        document.getElementById('markdownPreview').style.display = 'none';
        document.getElementById('contentArea').style.display = 'block';
        document.getElementById('previewBtn').textContent = '👁 预览';

        // 移动端关闭侧边栏
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
    },

    saveCurrentNote: function () {
        if (!this.currentNoteId) return;
        var notes = NoteStorage.getNotes();
        var idx = notes.findIndex(function (n) { return n.id === this.currentNoteId; }.bind(this));
        if (idx === -1) return;

        var title = document.getElementById('titleInput').value.trim();
        var content = document.getElementById('contentArea').value;

        notes[idx].title = title || '未命名笔记';
        notes[idx].content = content;
        notes[idx].updatedAt = new Date().toISOString();
        NoteStorage.saveNotes(notes);
        this.renderNoteList();
    },

    scheduleAutoSave: function () {
        var self = this;
        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(function () {
            self.saveCurrentNote();
        }, 500);
    },

    deleteCurrentNote: function () {
        if (!this.currentNoteId) return;
        var self = this;
        this.showConfirm('删除笔记', '确定要删除这条笔记吗？删除后可在回收站找回。', function () {
            var notes = NoteStorage.getNotes();
            var idx = notes.findIndex(function (n) { return n.id === self.currentNoteId; });
            if (idx === -1) return;

            // 移入回收站
            var deleted = notes.splice(idx, 1)[0];
            deleted.deletedAt = new Date().toISOString();
            var trash = NoteStorage.getTrash();
            trash.unshift(deleted);
            NoteStorage.saveTrash(trash);
            NoteStorage.saveNotes(notes);

            self.currentNoteId = null;
            self.renderNoteList();
            self.updateNoteCount();

            // 选中下一条或显示空状态
            if (notes.length > 0) {
                self.selectNote(notes[0].id);
            } else {
                self.showEmptyState();
            }
        });
    },

    importAllNotes: function (importedNotes) {
        if (!Array.isArray(importedNotes) || importedNotes.length === 0) {
            alert('没有可导入的笔记');
            return;
        }
        var self = this;
        this.showConfirm('批量导入', '确定导入 ' + importedNotes.length + ' 条笔记？', function () {
            var notes = NoteStorage.getNotes();
            importedNotes.forEach(function (n) {
                notes.push({
                    id: n.id || generateId(),
                    title: n.title || '未命名笔记',
                    content: n.content || '',
                    createdAt: n.createdAt || new Date().toISOString(),
                    updatedAt: n.updatedAt || new Date().toISOString()
                });
            });
            NoteStorage.saveNotes(notes);
            self.renderNoteList();
            self.updateNoteCount();
            alert('成功导入 ' + importedNotes.length + ' 条笔记！');
        });
    },

    // ---- 回收站 ----

    openTrash: function () {
        var trash = NoteStorage.getTrash();
        var list = document.getElementById('trashList');

        if (trash.length === 0) {
            list.innerHTML = '<p class="trash-empty">回收站为空</p>';
        } else {
            var html = '';
            trash.forEach(function (note, index) {
                html += '<div class="trash-item">';
                html += '<div class="trash-item-info">';
                html += '<span class="trash-item-title">' + escapeHtml(note.title || '未命名笔记') + '</span>';
                html += '<span class="trash-item-date">' + formatDate(note.deletedAt) + '</span>';
                html += '</div>';
                html += '<div class="trash-item-actions">';
                html += '<button class="btn btn-text btn-small" onclick="App.restoreNote(' + index + ')">恢复</button>';
                html += '</div>';
                html += '</div>';
            });
            list.innerHTML = html;
        }

        document.getElementById('trashDialog').style.display = 'flex';
    },

    restoreNote: function (index) {
        var trash = NoteStorage.getTrash();
        if (index < 0 || index >= trash.length) return;

        var note = trash.splice(index, 1)[0];
        delete note.deletedAt;

        var notes = NoteStorage.getNotes();
        notes.unshift(note);
        NoteStorage.saveNotes(notes);
        NoteStorage.saveTrash(trash);

        this.renderNoteList();
        this.updateNoteCount();
        this.openTrash(); // 刷新回收站列表
        this.selectNote(note.id);
    },

    emptyTrash: function () {
        var self = this;
        this.showConfirm('清空回收站', '确定永久删除回收站中的所有笔记？此操作不可恢复。', function () {
            NoteStorage.saveTrash([]);
            self.openTrash();
        });
    },

    // ---- UI 渲染 ----

    renderNoteList: function () {
        var notes = NoteStorage.getNotes();
        var keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        var list = document.getElementById('noteList');

        // 搜索过滤
        if (keyword) {
            notes = notes.filter(function (n) {
                return n.title.toLowerCase().indexOf(keyword) !== -1 ||
                       n.content.toLowerCase().indexOf(keyword) !== -1;
            });
        }

        // 排序
        var sortMode = NoteStorage.getSortMode();
        if (sortMode === 'title') {
            notes.sort(function (a, b) { return (a.title || '').localeCompare(b.title || ''); });
        } else if (sortMode === 'created') {
            notes.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        } else {
            notes.sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
        }

        if (notes.length === 0) {
            list.innerHTML = '<div class="note-list-empty">' +
                (keyword ? '没有找到匹配的笔记' : '暂无笔记，点击「新建」创建') +
                '</div>';
            return;
        }

        var self = this;
        var html = '';
        notes.forEach(function (note) {
            var isSelected = note.id === self.currentNoteId;
            var preview = note.content.replace(/\n/g, ' ').substring(0, 60);
            html += '<div class="note-item' + (isSelected ? ' selected' : '') + '" data-id="' + note.id + '">';
            html += '<div class="note-item-title">' + escapeHtml(note.title || '未命名笔记') + '</div>';
            html += '<div class="note-item-preview">' + escapeHtml(preview) + '</div>';
            html += '<div class="note-item-date">' + formatDate(note.updatedAt) + '</div>';
            html += '</div>';
        });
        list.innerHTML = html;

        // 绑定点击事件
        var items = list.querySelectorAll('.note-item');
        items.forEach(function (item) {
            item.addEventListener('click', function () {
                self.selectNote(item.getAttribute('data-id'));
            });
        });
    },

    highlightSelected: function () {
        var items = document.querySelectorAll('.note-item');
        items.forEach(function (item) {
            if (item.getAttribute('data-id') === this.currentNoteId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        }.bind(this));
    },

    showEmptyState: function () {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('editor').style.display = 'none';
    },

    updateStats: function () {
        var content = document.getElementById('contentArea').value;
        document.getElementById('charCount').textContent = getCharCount(content);
        document.getElementById('readTime').textContent = getReadTime(content);
    },

    updateNoteCount: function () {
        var count = NoteStorage.getNotes().length;
        document.getElementById('noteCount').textContent = count + ' 条笔记';
    },

    // ---- 预览 ----

    togglePreview: function () {
        this.previewMode = !this.previewMode;
        var textarea = document.getElementById('contentArea');
        var preview = document.getElementById('markdownPreview');
        var btn = document.getElementById('previewBtn');

        if (this.previewMode) {
            preview.innerHTML = simpleMarkdown(textarea.value);
            preview.style.display = 'block';
            textarea.style.display = 'none';
            btn.textContent = '✏️ 编辑';
        } else {
            preview.style.display = 'none';
            textarea.style.display = 'block';
            btn.textContent = '👁 预览';
        }
    },

    // ---- 排序 ----

    toggleSort: function () {
        var modes = ['updated', 'created', 'title'];
        var labels = ['按更新时间', '按创建时间', '按标题'];
        var current = NoteStorage.getSortMode();
        var idx = modes.indexOf(current);
        var next = modes[(idx + 1) % modes.length];
        NoteStorage.saveSortMode(next);
        this.renderNoteList();

        // 简单提示
        var btn = document.getElementById('sortBtn');
        btn.textContent = '↕ ' + labels[(idx + 1) % labels.length];
        setTimeout(function () {
            btn.textContent = '↕ 排序';
        }, 1500);
    },

    // ---- 深色模式 ----

    initTheme: function () {
        var theme = NoteStorage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('darkModeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
    },

    toggleTheme: function () {
        var current = NoteStorage.getTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        NoteStorage.saveTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        document.getElementById('darkModeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
    },

    // ---- 移动端侧边栏 ----

    toggleSidebar: function () {
        document.getElementById('sidebar').classList.toggle('open');
    },

    // ---- 确认对话框 ----

    showConfirm: function (title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmDialog').style.display = 'flex';
        this.confirmCallback = callback;
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', function () {
    App.init();
});

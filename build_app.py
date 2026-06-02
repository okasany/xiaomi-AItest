appjs = """'use strict';

class NotesApp {
  constructor() {
    this.notes = [];
    this.activeNoteId = null;
    this.autoSaveTimer = null;
    this.currentSort = localStorage.getItem('notes_sort') || 'updatedDesc';
    this.darkMode = localStorage.getItem('notes_dark') === 'true';
    this.previewMode = false;

    this.el = {
      newNoteBtn: document.getElementById('newNoteBtn'),
      saveBtn: document.getElementById('saveBtn'),
      deleteBtn: document.getElementById('deleteBtn'),
      searchInput: document.getElementById('searchInput'),
      notesList: document.getElementById('notesList'),
      noteTitle: document.getElementById('noteTitle'),
      noteContent: document.getElementById('noteContent'),
      charCount: document.getElementById('charCount'),
      lastSaved: document.getElementById('lastSaved'),
      readTime: document.getElementById('readTime'),
      editorEmpty: document.getElementById('editorEmpty'),
      editorArea: document.getElementById('editorArea'),
      sortSelect: document.getElementById('sortSelect'),
      darkModeBtn: document.getElementById('darkModeBtn'),
      previewBtn: document.getElementById('previewBtn'),
      markdownPreview: document.getElementById('markdownPreview'),
      bulkExportBtn: document.getElementById('bulkExportBtn'),
      bulkImportBtn: document.getElementById('bulkImportBtn'),
      hamburgerBtn: document.getElementById('hamburgerBtn'),
      sidebar: document.getElementById('sidebar'),
      sidebarOverlay: document.getElementById('sidebarOverlay'),
      dropOverlay: document.getElementById('dropOverlay'),
    };

    this.init();
  }

  init() {
    this.loadNotes();
    this.applyDarkMode();
    this.bindEvents();
    this.render();
    this.showEditorEmpty();
    if (this.el.sortSelect) this.el.sortSelect.value = this.currentSort;
  }

  bindEvents() {
    this.el.newNoteBtn.addEventListener('click', () => { this.createNote(); this.closeSidebar(); });
    this.el.saveBtn.addEventListener('click', () => this.saveNote());
    this.el.deleteBtn.addEventListener('click', () => this.deleteNote());
    this.el.searchInput.addEventListener('input', () => this.render(this.el.searchInput.value));
    this.el.noteTitle.addEventListener('input', () => this.onEditorInput());
    this.el.noteContent.addEventListener('input', () => this.onEditorInput());

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this.saveNote(); }
    });

    if (this.el.sortSelect) {
      this.el.sortSelect.addEventListener('change', () => {
        this.currentSort = this.el.sortSelect.value;
        localStorage.setItem('notes_sort', this.currentSort);
        this.render(this.el.searchInput.value);
      });
    }

    if (this.el.darkModeBtn) {
      this.el.darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
    }

    if (this.el.previewBtn) {
      this.el.previewBtn.addEventListener('click', () => this.togglePreview());
    }

    if (this.el.hamburgerBtn) {
      this.el.hamburgerBtn.addEventListener('click', () => this.toggleSidebar());
    }
    if (this.el.sidebarOverlay) {
      this.el.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
    }

    this.bindDragDrop();
  }

  // Auto-save on editor input (debounced 2 seconds)
  onEditorInput() {
    this.updateCharCount();
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveNote(true);
    }, 2000);
  }

  // localStorage
  loadNotes() {
    try {
      const data = localStorage.getItem('notes_app_data');
      this.notes = data ? JSON.parse(data) : [];
    } catch (e) {
      this.notes = [];
    }
  }

  persistNotes() {
    localStorage.setItem('notes_app_data', JSON.stringify(this.notes));
  }

  // CRUD
  createNote() {
    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.notes.unshift(note);
    this.persistNotes();
    this.activeNoteId = note.id;
    this.render();
    this.showEditor();
    this.loadActiveNoteToEditor();
    this.el.noteTitle.focus();
  }

  saveNote(silent) {
    const note = this.getActiveNote();
    if (!note) return;

    const newTitle = this.el.noteTitle.value.trim();
    const newContent = this.el.noteContent.value;

    if (note.title === newTitle && note.content === newContent && !silent) return;

    note.title = newTitle;
    note.content = newContent;
    note.updatedAt = new Date().toISOString();
    this.persistNotes();
    this.render(this.el.searchInput.value);
    if (!silent) this.showToast('已保存');
    this.showLastSaved(note.updatedAt);
  }

  deleteNote() {
    if (!this.activeNoteId) return;
    const note = this.getActiveNote();
    const label = note && note.title ? ('"' + note.title + '"') : this.el.lang;
    if (!confirm('\\u786E\\u5B9A\\u5220\\u9664' + (note && note.title ? '"' + note.title + '"' : '\\u6B64\\u7B14\\u8BB0') + '\\u5417\\uFF1F')) return;

    this.notes = this.notes.filter((n) => n.id !== this.activeNoteId);
    this.activeNoteId = this.notes.length ? this.notes[0].id : null;
    this.persistNotes();
    this.render(this.el.searchInput.value);
    if (this.activeNoteId) {
      this.loadActiveNoteToEditor();
    } else {
      this.showEditorEmpty();
    }
    this.showToast('\\u5DF2\\u5220\\u9664');
  }

  selectNote(id) {
    this.autoSaveCurrent();
    if (this.previewMode) this.togglePreview();
    this.activeNoteId = id;
    this.showEditor();
    this.loadActiveNoteToEditor();
    this.render(this.el.searchInput.value);
    this.closeSidebar();
  }

  autoSaveCurrent() {
    const note = this.getActiveNote();
    if (!note) return;
    const title = this.el.noteTitle.value.trim();
    const content = this.el.noteContent.value;
    if (note.title !== title || note.content !== content) {
      note.title = title;
      note.content = content;
      note.updatedAt = new Date().toISOString();
      this.persistNotes();
    }
  }

  getActiveNote() {
    return this.notes.find((n) => n.id === this.activeNoteId) || null;
  }

  showEditorEmpty() {
    if (this.el.editorEmpty) this.el.editorEmpty.style.display = 'flex';
    if (this.el.editorArea) this.el.editorArea.style.display = 'none';
  }

  showEditor() {
    if (this.el.editorEmpty) this.el.editorEmpty.style.display = 'none';
    if (this.el.editorArea) this.el.editorArea.style.display = 'flex';
  }

  loadActiveNoteToEditor() {
    const note = this.getActiveNote();
    if (note) {
      this.el.noteTitle.value = note.title;
      this.el.noteContent.value = note.content;
      this.showLastSaved(note.updatedAt);
    } else {
      this.el.noteTitle.value = '';
      this.el.noteContent.value = '';
      this.el.lastSaved.textContent = '';
    }
    this.updateCharCount();
  }

  updateCharCount() {
    const text = this.el.noteContent.value;
    const len = text.length;
    this.el.charCount.textContent = len + ' \\u5B57';
    // Reading time: ~300 Chinese chars per minute
    const minutes = Math.ceil(len / 300);
    if (this.el.readTime) {
      this.el.readTime.textContent = len > 0 ? '\\u2248 ' + minutes + ' \\u5206\\u949F\\u9605\\u8BFB' : '';
    }
  }

  showLastSaved(isoStr) {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    this.el.lastSaved.textContent =
      '\\u4E0A\\u6B21\\u4FDD\\u5B58\\uFF1A' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // Sorting
  sortNotes(arr) {
    const copy = arr.slice();
    switch (this.currentSort) {
      case 'updatedDesc':
        copy.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case 'createdDesc':
        copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'titleAsc':
        copy.sort((a, b) => (a.title || '\\u65E0\\u6807\\u9898').localeCompare(b.title || '\\u65E0\\u6807\\u9898', 'zh'));
        break;
      case 'titleDesc':
        copy.sort((a, b) => (b.title || '\\u65E0\\u6807\\u9898').localeCompare(a.title || '\\u65E0\\u6807\\u9898', 'zh'));
        break;
    }
    return copy;
  }

  // Render
  render(searchQuery) {
    searchQuery = searchQuery || '';
    const list = this.el.notesList;
    list.innerHTML = '';

    let filtered = this.notes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = this.notes.filter(
        (n) => n.title.toLowerCase().indexOf(q) !== -1 || n.content.toLowerCase().indexOf(q) !== -1
      );
    }

    filtered = this.sortNotes(filtered);

    if (filtered.length === 0) {
      list.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state-icon">\\uD83D\\uDCCB</div>' +
        '<div class="empty-state-text">' +
        (searchQuery ? '\\u6CA1\\u6709\\u627E\\u5230\\u5339\\u914D\\u7684\\u7B14\\u8BB0' : '\\u6682\\u65E0\\u7B14\\u8BB0\\uFF0C\\u70B9\\u51FB\\u4E0A\\u65B9\\u6309\\u94AE\\u65B0\\u5EFA') +
        '</div></div>';
      return;
    }

    filtered.forEach((note) => {
      const item = document.createElement('div');
      item.className = 'note-item' + (note.id === this.activeNoteId ? ' active' : '');

      const title = note.title || '\\u65E0\\u6807\\u9898\\u7B14\\u8BB0';
      const preview = note.content.replace(/\\n/g, ' ').slice(0, 50) || '\\u6682\\u65E0\\u5185\\u5BB9';
      const date = this.formatDate(note.updatedAt);

      item.innerHTML =
        '<div class="note-item-title">' + this.escapeHtml(title) + '</div>' +
        '<div class="note-item-preview">' + this.escapeHtml(preview) + '</div>' +
        '<div class="note-item-date">' + date + '</div>';

      item.addEventListener('click', () => this.selectNote(note.id));
      list.appendChild(item);
    });
  }

  formatDate(isoStr) {
    const d = new Date(isoStr);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    if (d.toDateString() === now.toDateString()) {
      return '\\u4ECA\\u5929 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return '\\u6628\\u5929 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Dark mode
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('notes_dark', String(this.darkMode));
    this.applyDarkMode();
  }

  applyDarkMode() {
    document.body.classList.toggle('dark', this.darkMode);
    if (this.el.darkModeBtn) {
      this.el.darkModeBtn.textContent = this.darkMode ? '\\u2600\\uFE0F' : '\\uD83C\\uDF19';
    }
  }

  // Markdown preview
  togglePreview() {
    this.previewMode = !this.previewMode;
    if (this.previewMode) {
      this.el.noteContent.style.display = 'none';
      this.el.markdownPreview.style.display = 'block';
      this.el.markdownPreview.innerHTML = this.renderMarkdown(this.el.noteContent.value);
      this.el.previewBtn.classList.add('active');
    } else {
      this.el.noteContent.style.display = 'block';
      this.el.markdownPreview.style.display = 'none';
      this.el.previewBtn.classList.remove('active');
    }
  }

  renderMarkdown(text) {
    if (!text) return '<p style="color:#999;">(empty)</p>';
    let html = this.escapeHtml(text);

    // Code blocks (``` ... ```)
    html = html.replace(/```(\\w*)\\n([\\s\\S]*?)```/g, '<pre><code>$2</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Headings
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Bold & Italic
    html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
    html = html.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    // Links
    html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank">$1</a>');
    // Unordered list items
    html = html.replace(/^[\\-\\*] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive li in ul
    html = html.replace(/(<li>[\\s\\S]*?<\\/li>)/g, function(m) { return '<ul>' + m + '</ul>'; });
    // Paragraphs (lines that are not already wrapped)
    html = html.replace(/^(?!<[a-z])((?!^$).+)$/gm, '<p>$1</p>');
    // Clean up double <ul>
    html = html.replace(/<\\/ul>\\s*<ul>/g, '');
    // Line breaks
    html = html.replace(/\\n/g, '');

    return html;
  }

  // Mobile sidebar
  toggleSidebar() {
    this.el.sidebar.classList.toggle('open');
    this.el.sidebarOverlay.classList.toggle('active');
  }

  closeSidebar() {
    if (this.el.sidebar) this.el.sidebar.classList.remove('open');
    if (this.el.sidebarOverlay) this.el.sidebarOverlay.classList.remove('active');
  }

  // Drag and drop
  bindDragDrop() {
    let dragCounter = 0;
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      this.el.dropOverlay.classList.add('active');
    });
    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        this.el.dropOverlay.classList.remove('active');
      }
    });
    document.addEventListener('dragover', (e) => { e.preventDefault(); });
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      this.el.dropOverlay.classList.remove('active');
      const files = e.dataTransfer.files;
      if (files.length > 0) this.handleDroppedFiles(files);
    });
  }

  async handleDroppedFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type && !file.type.startsWith('text') && file.name.indexOf('.json') === -1 && file.name.indexOf('.md') === -1 && file.name.indexOf('.txt') === -1) {
        this.showToast('\\u4E0D\\u652F\\u6301\\u7684\\u6587\\u4EF6\\u683C\\u5F0F\\uFF1A' + file.name);
        continue;
      }
      try {
        const text = await file.text();
        if (!this.tryImportJSON(text)) {
          this.importAsNote(file.name, text);
        }
      } catch (err) {
        this.showToast('\\u8BFB\\u53D6\\u6587\\u4EF6\\u5931\\u8D25\\uFF1A' + file.name);
      }
    }
    this.render();
    this.showToast('\\u5BFC\\u5165\\u5B8C\\u6210');
  }

  tryImportJSON(text) {
    try {
      const data = JSON.parse(text);
      if (data && data._noteAppExport && Array.isArray(data.notes)) {
        const count = data.notes.length;
        data.notes.forEach((n) => {
          this.notes.unshift({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            title: n.title || '',
            content: n.content || '',
            createdAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.updatedAt || new Date().toISOString(),
          });
        });
        this.persistNotes();
        return true;
      }
    } catch (e) { /* not JSON */ }
    return false;
  }

  importAsNote(fileName, text) {
    const title = fileName.replace(/\\.(md|txt|json)$/i, '') || '\\u5BFC\\u5165\\u7684\\u7B14\\u8BB0';
    this.notes.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: title,
      content: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.persistNotes();
  }

  // Bulk export / import
  bulkExportAll() {
    if (this.notes.length === 0) { this.showToast('\\u6CA1\\u6709\\u7B14\\u8BB0\\u53EF\\u5BFC\\u51FA'); return; }
    const data = { _noteAppExport: true, exportDate: new Date().toISOString(), notes: this.notes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes_backup_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('\\u5BFC\\u51FA\\u4E86 ' + this.notes.length + ' \\u6761\\u7B14\\u8BB0');
  }

  bulkImportAll() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (this.tryImportJSON(text)) {
          this.activeNoteId = this.notes[0] ? this.notes[0].id : null;
          this.render();
          if (this.activeNoteId) { this.showEditor(); this.loadActiveNoteToEditor(); }
          this.showToast('\\u6279\\u91CF\\u5BFC\\u5165\\u5B8C\\u6210');
        } else {
          this.showToast('\\u4E0D\\u662F\\u6709\\u6548\\u7684\\u7B14\\u8BB0\\u5907\\u4EFD\\u6587\\u4EF6');
        }
      } catch (err) {
        this.showToast('\\u8BFB\\u53D6\\u6587\\u4EF6\\u5931\\u8D25');
      }
    };
    input.click();
  }

  // Toast
  showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
  }
}


class FileManager {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    const saveAsBtn = document.getElementById('saveAsBtn');
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    const bulkImportBtn = document.getElementById('bulkImportBtn');

    if (importBtn) importBtn.addEventListener('click', () => this.importFromFile());
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportCurrentNote());
    if (saveAsBtn) saveAsBtn.addEventListener('click', () => this.saveAs());
    if (bulkExportBtn) bulkExportBtn.addEventListener('click', () => this.app.bulkExportAll());
    if (bulkImportBtn) bulkImportBtn.addEventListener('click', () => this.app.bulkImportAll());
  }

  async exportCurrentNote() {
    const note = this.app.getActiveNote();
    if (!note) { this.app.showToast('\\u8BF7\\u5148\\u9009\\u62E9\\u6216\\u65B0\\u5EFA\\u4E00\\u4E2A\\u7B14\\u8BB0'); return; }

    const title = note.title || '\\u65E0\\u6807\\u9898\\u7B14\\u8BB0';
    const content = this.buildFileContent(note);

    if (this.isFSSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: title + '.md',
          types: [{ description: 'Markdown', accept: { 'text/plain': ['.md', '.txt'] } }],
        });
        await this.writeToFileHandle(handle, content);
        this.app.showToast('\\u5DF2\\u5BFC\\u51FA\\u5230\\u6587\\u4EF6\\uFF1A' + handle.name);
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    this.downloadFile(title + '.md', content);
    this.app.showToast('\\u5DF2\\u5BFC\\u51FA');
  }

  async saveAs() {
    const note = this.app.getActiveNote();
    if (!note) { this.app.showToast('\\u8BF7\\u5148\\u9009\\u62E9\\u6216\\u65B0\\u5EFA\\u4E00\\u4E2A\\u7B14\\u8BB0'); return; }
    const title = note.title || '\\u65E0\\u6807\\u9898\\u7B14\\u8BB0';
    const content = this.buildFileContent(note);

    if (this.isFSSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: title + '.md',
          types: [{ description: 'Markdown', accept: { 'text/plain': ['.md', '.txt'] } }],
        });
        await this.writeToFileHandle(handle, content);
        this.app.showToast('\\u5DF2\\u4FDD\\u5B58\\u5230\\uFF1A' + handle.name);
      } catch (e) {
        if (e.name === 'AbortError') return;
        this.app.showToast('\\u4FDD\\u5B58\\u5931\\u8D25');
      }
    } else {
      this.downloadFile(title + '.md', content);
      this.app.showToast('\\u5DF2\\u4E0B\\u8F7D');
    }
  }

  async importFromFile() {
    if (this.isFSSupported()) {
      try {
        const handles = await window.showOpenFilePicker({
          types: [{ description: '\\u6587\\u672C\\u6587\\u4EF6', accept: { 'text/plain': ['.md', '.txt', '.json'] } }],
          multiple: false,
        });
        const file = await handles[0].getFile();
        const text = await file.text();
        if (!this.app.tryImportJSON(text)) {
          this.app.importAsNote(file.name, text);
        }
        this.app.persistNotes();
        this.app.render();
        this.app.showToast('\\u5DF2\\u5BFC\\u5165');
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
        this.app.showToast('\\u8BFB\\u53D6\\u6587\\u4EF6\\u5931\\u8D25');
        return;
      }
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.json';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!this.app.tryImportJSON(text)) {
          this.app.importAsNote(file.name, text);
        }
        this.app.persistNotes();
        this.app.render();
        this.app.showToast('\\u5DF2\\u5BFC\\u5165');
      } catch (err) {
        this.app.showToast('\\u8BFB\\u53D6\\u6587\\u4EF6\\u5931\\u8D25');
      }
    };
    input.click();
  }

  async writeToFileHandle(handle, content) {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  buildFileContent(note) {
    const lines = [];
    if (note.title) { lines.push('# ' + note.title); lines.push(''); }
    lines.push(note.content);
    return lines.join('\\n');
  }

  isFSSupported() {
    return 'showSaveFilePicker' in window;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const app = new NotesApp();
  const fileManager = new FileManager(app);
  window.__notesApp = app;
  window.__fileManager = fileManager;
});
"""

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(appjs)
print('OK app.js written', len(appjs), 'chars')

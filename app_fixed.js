
/* ==========================================
   隨碑ｮｰ蠎皮畑 - 荳ｻ騾ｻ霎・   蜉溯・・壼｢槫唖謾ｹ譟･縲∵頗邏｢縲∝ｭ玲焚扈溯ｮ｡縲∵枚莉ｶ蟇ｼ蜈･蟇ｼ蜃ｺ
   ========================================== */

class NotesApp {
  constructor() {
    this.notes = [];
    this.activeNoteId = null;

    /* DOM 蜈・ｴ */
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
    };

    this.init();
  }

  /* 蛻晏ｧ句喧 */
  init() {
    this.loadNotes();
    this.bindEvents();
    this.render();
  }

  /* 莠倶ｻｶ扈大ｮ・*/
  bindEvents() {
    this.el.newNoteBtn.addEventListener('click', () => this.createNote());
    this.el.saveBtn.addEventListener('click', () => this.saveNote());
    this.el.deleteBtn.addEventListener('click', () => this.deleteNote());
    this.el.searchInput.addEventListener('input', () => this.render(this.el.searchInput.value));

    this.el.noteTitle.addEventListener('input', () => this.updateCharCount());
    this.el.noteContent.addEventListener('input', () => this.updateCharCount());

    /* 蠢ｫ謐ｷ髞ｮ Ctrl+S / Cmd+S 菫晏ｭ・*/
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveNote();
      }
    });
  }

  /* localStorage 謖∽ｹ・喧 */
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

  /* CRUD 謫堺ｽ・*/
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
    this.el.noteTitle.focus();
  }

  saveNote() {
    const note = this.getActiveNote();
    if (!note) return;

    note.title = this.el.noteTitle.value.trim();
    note.content = this.el.noteContent.value;
    note.updatedAt = new Date().toISOString();
    this.persistNotes();
    this.render();
    this.showLastSaved(note.updatedAt);
  }

  deleteNote() {
    if (!this.activeNoteId) return;
    const note = this.getActiveNote();
    const label = note && note.title ? ('"' + note.title + '"') : '豁､隨碑ｮｰ';
    if (!confirm('遑ｮ螳壼唖髯､' + label + '蜷暦ｼ・)) return;

    this.notes = this.notes.filter((n) => n.id !== this.activeNoteId);
    this.activeNoteId = this.notes.length ? this.notes[0].id : null;
    this.persistNotes();
    this.render();
    this.loadActiveNoteToEditor();
  }

  selectNote(id) {
    /* 蜈郁・蜉ｨ菫晏ｭ伜ｽ灘燕隨碑ｮｰ */
    this.autoSaveCurrent();
    this.activeNoteId = id;
    this.loadActiveNoteToEditor();
    this.render();
  }

  /* 閾ｪ蜉ｨ菫晏ｭ假ｼ亥・謐｢隨碑ｮｰ譌ｶ・・*/
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

  /* 霎・勧譁ｹ豕・*/
  getActiveNote() {
    return this.notes.find((n) => n.id === this.activeNoteId) || null;
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
    const len = this.el.noteContent.value.length;
    this.el.charCount.textContent = len + ' 蟄・;
  }

  showLastSaved(isoStr) {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    this.el.lastSaved.textContent =
      '荳頑ｬ｡菫晏ｭ假ｼ・ + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  /* 貂ｲ譟鍋ｬ碑ｮｰ蛻苓｡ｨ */
  render(searchQuery) {
    searchQuery = searchQuery || '';
    const list = this.el.notesList;
    list.innerHTML = '';

    let filtered = this.notes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = this.notes.filter(
        (n) =>
          n.title.toLowerCase().indexOf(q) !== -1 ||
          n.content.toLowerCase().indexOf(q) !== -1
      );
    }

    if (filtered.length === 0) {
      list.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state-icon">搭</div>' +
        '<div class="empty-state-text">' +
        (searchQuery ? '豐｡譛画伽蛻ｰ蛹ｹ驟咲噪隨碑ｮｰ' : '證よ裏隨碑ｮｰ・檎せ蜃ｻ荳頑婿謖蛾聴譁ｰ蟒ｺ') +
        '</div></div>';
      return;
    }

    filtered.forEach((note) => {
      const item = document.createElement('div');
      item.className = 'note-item' + (note.id === this.activeNoteId ? ' active' : '');

      const title = note.title || '譌譬・｢倡ｬ碑ｮｰ';
      const preview = note.content.replace(/\n/g, ' ').slice(0, 50) || '證よ裏蜀・ｮｹ';
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
      return '莉雁､ｩ ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return '譏ｨ螟ｩ ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/* ==========================================
   譁・ｻｶ蜀吝・蜉溯・讓｡蝮・   ========================================== */

class FileManager {
  constructor(app) {
    this.app = app;
    this.fileHandle = null;
    this.init();
  }

  init() {
    this.injectButtons();
  }

  /* 豕ｨ蜈･譁・ｻｶ謫堺ｽ懈潔髓ｮ蛻ｰ蟾･蜈ｷ譬・*/
  injectButtons() {
    const actions = document.querySelector('.editor-actions');
    if (!actions) return;

    /* 蟇ｼ蜃ｺ蠖灘燕隨碑ｮｰ荳ｺ譁・ｻｶ */
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-file';
    exportBtn.textContent = '刀 蟇ｼ蜃ｺ譁・ｻｶ';
    exportBtn.title = '蟆・ｽ灘燕隨碑ｮｰ菫晏ｭ倅ｸｺ譛ｬ蝨ｰ譁・ｻｶ';
    exportBtn.addEventListener('click', () => this.exportCurrentNote());

    /* 莉取枚莉ｶ蟇ｼ蜈･ */
    const importBtn = document.createElement('button');
    importBtn.className = 'btn-file';
    importBtn.textContent = '唐 蟇ｼ蜈･譁・ｻｶ';
    importBtn.title = '莉取悽蝨ｰ譁・ｻｶ蟇ｼ蜈･隨碑ｮｰ';
    importBtn.addEventListener('click', () => this.importFromFile());

    /* 蜿ｦ蟄倅ｸｺ */
    const saveAsBtn = document.createElement('button');
    saveAsBtn.className = 'btn-file';
    saveAsBtn.textContent = '統 蜿ｦ蟄倅ｸｺ';
    saveAsBtn.title = '騾画叫譁・ｻｶ菴咲ｽｮ菫晏ｭ・;
    saveAsBtn.addEventListener('click', () => this.saveAs());

    /* 蝨ｨ菫晏ｭ俶潔髓ｮ蜑肴薯蜈･ */
    const saveBtn = document.getElementById('saveBtn');
    actions.insertBefore(importBtn, saveBtn);
    actions.insertBefore(exportBtn, saveBtn);
    actions.insertBefore(saveAsBtn, saveBtn);

    this.injectFileStyles();
  }

  /* 豕ｨ蜈･譁・ｻｶ謖蛾聴譬ｷ蠑・*/
  injectFileStyles() {
    const style = document.createElement('style');
    style.textContent =
      '.btn-file { padding: 8px 14px; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 0.85rem; background-color: #fff; color: var(--text-color); transition: all 0.2s; white-space: nowrap; }' +
      '.btn-file:hover { background-color: #f0f0f0; border-color: #bbb; }' +
      '@media (max-width: 768px) { .btn-file { padding: 6px 10px; font-size: 0.8rem; } }';
    document.head.appendChild(style);
  }

  /* 蟇ｼ蜃ｺ蠖灘燕隨碑ｮｰ */
  async exportCurrentNote() {
    const note = this.app.getActiveNote();
    if (!note) { alert('隸ｷ蜈磯画叫謌匁眠蟒ｺ荳荳ｪ隨碑ｮｰ'); return; }

    const title = note.title || '譌譬・｢倡ｬ碑ｮｰ';
    const content = this.buildFileContent(note);

    /* 莨伜・菴ｿ逕ｨ File System Access API (Chrome/Edge) */
    if (this.isFSSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: title + '.md',
          types: [{ description: 'Markdown 譁・ｻｶ', accept: { 'text/plain': ['.md', '.txt'] } }],
        });
        await this.writeToFileHandle(handle, content);
        alert('蟾ｲ蟇ｼ蜃ｺ蛻ｰ譁・ｻｶ・・ + handle.name);
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }

    /* 髯咲ｺｧ譁ｹ譯茨ｼ壻ｸ玖ｽｽ譁・ｻｶ */
    this.downloadFile(title + '.md', content);
  }

  /* 蜿ｦ蟄倅ｸｺ */
  async saveAs() {
    const note = this.app.getActiveNote();
    if (!note) { alert('隸ｷ蜈磯画叫謌匁眠蟒ｺ荳荳ｪ隨碑ｮｰ'); return; }

    const title = note.title || '譌譬・｢倡ｬ碑ｮｰ';
    const content = this.buildFileContent(note);

    if (this.isFSSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: title + '.md',
          types: [{ description: 'Markdown 譁・ｻｶ', accept: { 'text/plain': ['.md', '.txt'] } }],
        });
        await this.writeToFileHandle(handle, content);
        alert('蟾ｲ菫晏ｭ伜芦・・ + handle.name);
      } catch (e) {
        if (e.name === 'AbortError') return;
        alert('菫晏ｭ伜､ｱ雍･・・ + e.message);
      }
    } else {
      this.downloadFile(title + '.md', content);
    }
  }

  /* 莉取枚莉ｶ蟇ｼ蜈･ */
  async importFromFile() {
    var text = '';
    var fileName = '';

    if (this.isFSSupported()) {
      try {
        var handles = await window.showOpenFilePicker({
          types: [{ description: '譁・悽譁・ｻｶ', accept: { 'text/plain': ['.md', '.txt', '.json'] } }],
          multiple: false,
        });
        var file = await handles[0].getFile();
        text = await file.text();
        fileName = file.name;
      } catch (e) {
        if (e.name === 'AbortError') return;
        alert('隸ｻ蜿匁枚莉ｶ螟ｱ雍･・・ + e.message);
        return;
      }
    } else {
      text = await this.pickFileFallback();
      if (text === null) return;
    }

    /* 蛻､譁ｭ譏ｯ蜷ｦ荳ｺ JSON 譬ｼ蠑冗噪隨碑ｮｰ蟇ｼ蜃ｺ */
    if (this.tryImportJSON(text)) return;

    /* 譎ｮ騾壽枚譛ｬ -> 蛻帛ｻｺ譁ｰ隨碑ｮｰ */
    this.importAsNote(fileName, text);
  }

  /* 蟆晁ｯ募ｯｼ蜈･ JSON 譬ｼ蠑・*/
  tryImportJSON(text) {
    try {
      var data = JSON.parse(text);
      if (data && data._noteAppExport && Array.isArray(data.notes)) {
        var count = data.notes.length;
        if (!confirm('譽豬句芦 ' + count + ' 譚｡隨碑ｮｰ・梧弍蜷ｦ蜈ｨ驛ｨ蟇ｼ蜈･・・)) return true;

        data.notes.forEach((n) => {
          this.app.notes.unshift({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            title: n.title || '',
            content: n.content || '',
            createdAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.updatedAt || new Date().toISOString(),
          });
        });
        this.app.persistNotes();
        this.app.render();
        alert('蟾ｲ蟇ｼ蜈･ ' + count + ' 譚｡隨碑ｮｰ');
        return true;
      }
    } catch (e) {
      /* 荳肴弍 JSON・悟ｿｽ逡･ */
    }
    return false;
  }

  /* 蟇ｼ蜈･荳ｺ蜊墓擅隨碑ｮｰ */
  importAsNote(fileName, text) {
    var title = fileName.replace(/\.(md|txt)$/i, '') || '蟇ｼ蜈･逧・ｬ碑ｮｰ';

    this.app.notes.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: title,
      content: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.app.persistNotes();
    this.app.activeNoteId = this.app.notes[0].id;
    this.app.render();
    this.app.loadActiveNoteToEditor();
    alert('蟾ｲ蟇ｼ蜈･隨碑ｮｰ・・ + title);
  }

  /* 蜀吝・譁・ｻｶ蜿･譟・*/
  async writeToFileHandle(handle, content) {
    var writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /* 髯咲ｺｧ譁ｹ譯茨ｼ壻ｸ玖ｽｽ譁・ｻｶ */
  downloadFile(filename, content) {
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* 髯咲ｺｧ譁ｹ譯茨ｼ喨nput file 騾画叫 */
  pickFileFallback() {
    return new Promise((resolve) => {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.txt,.json';
      input.onchange = async () => {
        var file = input.files[0];
        if (!file) { resolve(null); return; }
        try {
          var text = await file.text();
          resolve(text);
        } catch (e) {
          alert('隸ｻ蜿匁枚莉ｶ螟ｱ雍･');
          resolve(null);
        }
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  /* 譫・ｻｺ蟇ｼ蜃ｺ譁・ｻｶ蜀・ｮｹ */
  buildFileContent(note) {
    var lines = [];
    if (note.title) { lines.push('# ' + note.title); lines.push(''); }
    lines.push(note.content);
    return lines.join('\n');
  }

  /* 譽豬・File System Access API 謾ｯ謖・*/
  isFSSupported() {
    return 'showSaveFilePicker' in window;
  }
}

/* 蜷ｯ蜉ｨ蠎皮畑 */
document.addEventListener('DOMContentLoaded', () => {
  var app = new NotesApp();
  var fileManager = new FileManager(app);

  /* 證ｴ髴ｲ蛻ｰ蜈ｨ螻譁ｹ萓ｿ隹・ｯ・*/
  window.__notesApp = app;
  window.__fileManager = fileManager;
});

import json

# Read the original app.js
with open('app.js', 'r', encoding='utf-8') as f:
    original = f.read()

# We'll build the correct app.js content
# The issue is the file got corrupted from multiple partial edits
# Let's write the correct version

content = """/* 笔记应用 - 主逻辑 */
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function formatDate(dateStr) {
    var d = new Date(dateStr); var now = new Date(); var diff = now - d;
    var minutes = Math.floor(diff / 60000); var hours = Math.floor(diff / 3600000); var days = Math.floor(diff / 86400000);
    if (minutes < 1) return '\\u521a\\u521a';
    if (minutes < 60) return minutes + ' \\u5206\\u949f\\u524d';
    if (hours < 24) return hours + ' \\u5c0f\\u65f6\\u524d';
    if (days < 7) return days + ' \\u5929\\u524d';
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
"""

# This approach won't work well with unicode escapes. Let me try writing via base64.
import base64

# Read the current file to check its state
print("Current file size:", len(original))
print("First 200 chars:", original[:200])

# NEWS & EVENTS local preview and shared publication reconciliation (2026-11-02)

When the same article ID exists in GitHub Pages public news manifest and in old browser-local demo storage, the public version now takes precedence in the News & Events frontend. Previously the local version continued to show a '本機預覽' badge even after external publication.

The editor now performs a read-only fetch of the published manifest; local records with the same ID, status, title, category, summary, body, date, URL, featured flag, tags, image count, alt text and captions are marked as already public. This avoids unnecessary re-publishing and does not require a token. It does not change the published manifest or photo files.

## Rollback
Revert the merge commit for this PR, or restore these four original files:
- history/news-prefer-public-before-fix-20261102/js/news.js
- history/news-prefer-public-before-fix-20261102/js/news-editor.js
- history/news-prefer-public-before-fix-20261102/news.html
- history/news-prefer-public-before-fix-20261102/news-editor.html

Reverting code will not delete browser localStorage entries or the three separately published articles. If local data has already been marked 'public_synced_at', the status remains until browser local storage is cleared/restored.

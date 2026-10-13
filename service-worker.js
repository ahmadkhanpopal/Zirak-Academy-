// I6H-D19: governed Dialogue level progression, pronunciation safety, Pashto status, and evidence
const CACHE_NAME = 'zirak-v1-17I6H-D20-grammar-seven-level-progression-advanced-academic-routing';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './zirak-listening-curriculum-d18.js',
  './zirak-dialogue-curriculum-d19.js',
  './zirak-grammar-curriculum-d20.js',
  './grammar-editorial-decisions-i6h-d20.json',
  './grammar-curriculum-registry-i6h-d20.json',
  './grammar-source-crosswalk-i6h-d20.json',
  './grammar-owner-review-sample-i6h-d20.json',
  './dialogue-editorial-decisions-i6h-d19.json',
  './dialogue-curriculum-registry-i6h-d19.json',
  './dialogue-title-disambiguation-map-i6h-d19.json',
  './dialogue-owner-review-sample-i6h-d19.json',
  './zirak-page-guides.js',
  './grammar-curriculum-map.js',
  './grammar-lab-engine.js',
  './grammar-lab-foundation-pack1.js',
  './grammar-lab-foundation-pack2.js',
  './grammar-lab-foundation-pack3.js',
  './grammar-lab-foundation-pack4.js',
  './grammar-lab-foundation-pack5.js',
  './grammar-lab-auto-wizard.js',
  './grammar-world.js',
  './zirak-profile.js',
  './zirak-institute-calendar.js',
  './zirak-learning-ledger.js',
  './grammar-test-blueprints.js',
  './zirak-academy-tests.js',
  './zirak-placement-bank.js',
  './zirak-placement-engine.js',
  './zirak-personal-learning-plan.js',
  './zirak-academic-program.js',
  './zirak-content-forensics.js',
  './zirak-curriculum-content.js',
  './content-governance-registry-i6h-d17.json',
  './content-work-queue-i6h-d17.json',
  './listening-editorial-decisions-i6h-d18.json',
  './listening-curriculum-registry-i6h-d18.json',
  './listening-pack-catalog-i6h-d18.json',
  './listening-pack-migration-map-i6h-d18.json',
  './listening-owner-review-sample-i6h-d18.json',
  './zirak-teacher-command-center.js',
  './zirak-achievement-center.js',
  './zirak-classpath.js',
  './zirak-classpath-content-map.js',
  './zirak-classpath-real-content-m1w1.js',
  './zirak-classpath-real-content-m1w2.js',
  './content-core.js',
  './content-wordlab.js',
  './content-grammar.js',
  './content-dialogues.js',
  './content-review.js',
  './content.js',
  './content-pack-registry.js',
  './content-pack1a.js',
  './content-pashto-patch.js',
  './interview-content-pack1.js',
  './pashto-only-migration.js',
  './pashto-display-shell.js',
  './interview-core.js',
  './quick-practice.js',
  './interview-voice-wizard.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
  // TEST-EVIDENCE intentionally NOT cached (per D19 specification)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key.startsWith('zirak-v1-'))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Skip external AI API calls (Cohere, DeepSeek placeholders)
  if (url.hostname.includes('cohere.com') ||
      url.hostname.includes('deepseek.com') ||
      url.pathname.includes('/v2/chat') ||
      url.pathname.includes('/v1/chat')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

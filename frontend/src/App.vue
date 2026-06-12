<script setup lang="ts">
// Placeholder shell. Real routing, layout, and components arrive in
// subsequent OpenSpec changes (see openspec/changes/).
</script>

<template>
  <main class="shell">
    <h1>Mitzgo Auction</h1>
    <p class="tagline">Member-invite-only premium auction — scaffold build.</p>
  </main>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1a1a1a;
  background: #fafaf7;
  padding: 2rem;
}

h1 {
  font-size: clamp(2rem, 6vw, 4rem);
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.tagline {
  color: #666;
  font-size: 1rem;
  margin: 0;
}
</style>

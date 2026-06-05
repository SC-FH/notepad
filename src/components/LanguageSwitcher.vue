<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const { isChinese, toggleLocale } = useLocale()
</script>

<template>
  <button
    class="lang-btn"
    :title="isChinese ? 'Switch to English' : '切换为中文'"
    :aria-label="isChinese ? 'Switch to English' : '切换为中文'"
    @click="toggleLocale"
  >
    <span class="lang-text">{{ isChinese ? '中' : 'EN' }}</span>
  </button>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.lang-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-2);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
  padding: 0;
  flex-shrink: 0;
  touch-action: manipulation;

  &:hover {
    border-color: var(--accent-muted);
    background: var(--cream);
    color: var(--accent);
  }

  &:active {
    background: var(--cream-dark);
  }
}

.lang-text {
  font-size: 12px;
  font-weight: 700;
  font-family: $font-ui;
  color: inherit;
  line-height: 1;
  user-select: none;
}

@media (max-width: 420px) {
  .lang-btn {
    width: 36px;
    height: 36px;
  }
}
</style>

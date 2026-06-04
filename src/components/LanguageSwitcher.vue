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
  width: 36px;
  height: 36px;
  border: none;
  background: var(--cream);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-3);
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;

  &:hover {
    background: var(--cream-dark);
    color: var(--accent);
  }

  &:active {
    transform: scale(0.95);
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
</style>

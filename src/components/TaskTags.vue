<script setup lang="ts">
import { computed } from 'vue'
import type { TaskCategory, TaskPriority } from '../db'
import { useLabels } from '../composables/useLabels'

const props = defineProps<{
  category?: TaskCategory
  priority?: TaskPriority
}>()

const { CATEGORY_LABELS, PRIORITY_LABELS } = useLabels()

const categoryLabel = computed(() => props.category ? CATEGORY_LABELS.value[props.category] : '')
const priorityLabel = computed(() => props.priority ? PRIORITY_LABELS.value[props.priority] : '')
</script>

<template>
  <div v-if="categoryLabel || priorityLabel" class="task-tags">
    <span
      v-if="categoryLabel"
      :class="['task-tag', 'tag-category', `category-${category}`]"
    >
      {{ categoryLabel }}
    </span>
    <span
      v-if="priorityLabel"
      :class="['task-tag', 'tag-priority', `priority-${priority}`]"
    >
      {{ priorityLabel }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.task-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex: 0 1 auto;
  gap: 6px;
  margin-top: 0;
  min-width: 0;
  max-width: 100%;
}

.task-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  min-height: 22px;
  padding: 2px 8px;
  font-family: $font-ui;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  border: 1px solid transparent;
}

.tag-category {
  border-radius: var(--radius-full);
  background: var(--cream);
  color: var(--ink-2);
  border-color: var(--paper-line);
}

.category-work {
  background: var(--blue-subtle);
  color: var(--blue);
  border-color: transparent;
}

.category-personal {
  background: var(--purple-subtle);
  color: var(--purple);
  border-color: transparent;
}

.category-study {
  background: var(--accent-subtle);
  color: var(--accent);
  border-color: transparent;
}

.category-health {
  background: var(--green-subtle);
  color: var(--green);
  border-color: transparent;
}

.category-other {
  background: var(--cream-dark);
  color: var(--ink-2);
  border-color: transparent;
}

.tag-priority {
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--gray-600);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px 2px 6px;
}

.tag-priority::before {
  content: '';
  width: 4px;
  height: 12px;
  border-radius: var(--radius-full);
  background: currentColor;
  flex-shrink: 0;
}

.priority-low {
  background: var(--paper);
  color: var(--gray-600);
  border-color: var(--gray-300);
}

.priority-medium {
  background: var(--paper);
  color: var(--accent);
  border-color: var(--accent-muted);
}

.priority-high {
  background: var(--amber-subtle);
  color: var(--amber);
  border-color: var(--amber);
}

.priority-urgent {
  background: var(--red-subtle);
  color: var(--red);
  border-color: var(--red);
}
</style>

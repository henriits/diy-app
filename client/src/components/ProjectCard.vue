<script lang="ts" setup>
import { computed } from 'vue'
import type { Selectable } from 'kysely'
import type { Projects } from '@server/shared/types'

interface Props {
  project: Selectable<Projects>
}

const props = defineProps<Props>()

const truncatedContent = computed(() =>
  props.project.createdAt,
)
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-700">
    <h4 class="text-xl font-semibold hover:text-blue-700">
      <RouterLink :to="`/project/${props.project.id}`">
        {{ props.project.title }}
      </RouterLink>
    </h4>
    <p class="mt-2 text-gray-600 dark:text-gray-300">{{ truncatedContent }}</p>

  </div>
</template>

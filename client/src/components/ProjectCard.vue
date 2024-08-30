<script lang="ts" setup>
import { computed } from 'vue'
import type { Selectable } from 'kysely'
import type { Projects } from '@server/shared/types'

interface Props {
  project: Selectable<Projects>
}

const props = defineProps<Props>()

const formattedDate = computed(() =>
  new Date(props.project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
)
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center p-6 bg-white shadow-lg rounded-lg dark:bg-gray-700">
    <!-- Image Section -->
    <div class="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 w-52 h-52 overflow-hidden">
      <img src="https://via.placeholder.com/200x200" alt="Project Image"
        class="w-full h-full object-cover rounded-lg shadow-md" />
    </div>
    <!-- Text Content -->
    <div class="flex-1 text-center sm:text-left">
      <h4 class="text-2xl font-bold mb-2 hover:text-blue-700">
        <RouterLink :to="`/project/${props.project.id}`">
          {{ props.project.title }}
        </RouterLink>
      </h4>
      <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
        {{ formattedDate }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed for image sizing */
</style>

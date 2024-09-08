<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import type { Selectable } from 'kysely';
import type { Projects } from '@server/shared/types';
import { trpc } from '@/trpc';

interface Props {
  project: Selectable<Projects>;
}

const props = defineProps<Props>();

const imageUrl = ref<string | null>(null); // Ref to store the image URL

// Fetch the image URL when the component is mounted
onMounted(async () => {
  imageUrl.value = await trpc.projectImages.getUrlByProjectId.query({ projectId: props.project.id });
});

const formattedDate = computed(() =>
  new Date(props.project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
);

</script>

<template>
  <RouterLink :to="`/project/${props.project.id}`">
    <div class="flex flex-col sm:flex-row items-center p-6 bg-white shadow-lg rounded-lg dark:bg-gray-700">
      <!-- Image Section -->
      <div
        class="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 w-full md:w-36 lg:w-44 h-36 lg:h-44 overflow-hidden flex items-center justify-center">
        <img
          :src="imageUrl || 'https://media.istockphoto.com/id/173033514/photo/tools-of-a-carpenter.jpg?s=612x612&w=0&k=20&c=hv3o7RuzbPM-9aWSjApjSOIHygKy04raW5aZncUxRQY='"
          alt="Project Image" class="project-image" loading="lazy" />
      </div>
      <!-- Text Content -->
      <div class="flex-1 text-center sm:text-left">
        <h4 class="text-base sm:text-xl font-bold mb-2 hover:text-blue-700">

          {{ props.project.title }}

        </h4>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {{ formattedDate }}
        </p>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

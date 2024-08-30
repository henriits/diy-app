<script setup lang="ts">
import { trpc } from '@/trpc'
import type { ProjectPublic } from '@server/shared/types'
import { FwbHeading } from 'flowbite-vue'
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/Card.vue'
import { isLoggedIn } from '@/stores/user'
import { formatInstructions } from '@/utils/formatInstructions'

const route = useRoute()
const project = ref<ProjectPublic & { username: string } | undefined>(undefined)
const isLoading = ref(true)
const error = ref<string | null>(null)

onBeforeMount(async () => {
  try {
    const projectFound = await trpc.projects.findById.query(Number(route.params.id))
    project.value = projectFound
  } catch (err) {
    error.value = 'Failed to load project details. Please try again later.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
    <div class="items-center lg:flex">Please Login to view the project!</div>
  </div>
  <div v-else>
    <div v-if="isLoading" class="text-center">Loading...</div>
    <div v-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-if="project" class="p-6">
      <FwbHeading tag="h1" class="mb-8 mt-10 text-3xl font-bold">
        {{ project.title }}
      </FwbHeading>
      <div class="flex flex-col md:flex-row items-start">
        <!-- Image Section -->
        <div class="flex-shrink-0 md:w-1/3 mb-6 md:mb-0">
          <!-- <img :src="project.imageUrl" alt="Project Image" class="project-image" />
             use this later to update image from database
          -->
          <img src="https://via.placeholder.com/800x1000" alt="Project Image"
            class="w-full h-auto rounded-lg shadow-md" />
        </div>
        <!-- Content Section -->
        <div class="flex-1 md:pl-6">
          <Card class="p-6 bg-white shadow-lg rounded-lg">
            <p class="font-semibold">Author: {{ project.username }}</p>
            <p class="mt-4"><strong>Description:</strong> {{ project.description }}</p>
            <p class="mt-4"><strong>Instructions:</strong> <span
                v-html="formatInstructions(project.instructions)"></span></p>
            <p class="mt-4"><strong>Materials:</strong> {{ project.materials }}</p>
            <p class="mt-4"><strong>Created At:</strong> {{ new Date(project.createdAt).toLocaleDateString() }}</p>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styling here */
img {
  max-width: 100%;
  height: auto;
}

.project-image {
  width: 100%;
  max-width: 800px;
  height: auto;
  max-height: 1000px;
  object-fit: cover;

}
</style>

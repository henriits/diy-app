<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { trpc } from '@/trpc'
import type { Selectable } from 'kysely'
import type { Projects } from '@server/shared/types'
import ProjectCard from '@/components/ProjectCard.vue'
import { isLoggedIn, username } from '@/stores/user'
import { FwbButton } from 'flowbite-vue'


const allProjects = ref<Selectable<Projects>[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(6) // Number of projects per page
const totalProjects = ref(0)


const fetchProjects = async () => {
  allProjects.value = await trpc.projects.findAll.query()
  updateTotalProjects()
}

const updateTotalProjects = () => {
  let filtered = allProjects.value

  if (searchQuery.value) {
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  totalProjects.value = filtered.length
}

const filteredProjects = computed(() => {
  let filtered = allProjects.value

  if (searchQuery.value) {
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Pagination
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// Watch searchQuery to reset to the first page on search
watch(searchQuery, () => {
  currentPage.value = 1
  updateTotalProjects()
})

// Watch totalProjects and currentPage to handle out-of-bounds page numbers
watch([totalProjects, currentPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

function changePage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > totalPages.value) {
    return
  }
  currentPage.value = pageNumber
}

const totalPages = computed(() => Math.ceil(totalProjects.value / pageSize.value))

// Determine if there are more pages
const hasMorePages = computed(() => currentPage.value < totalPages.value)


onMounted(fetchProjects)
</script>

<template>
  <div class="dark:bg-gray-800">
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="items-center lg:flex">
        <div class="lg:w-1/2">
          <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">DO IT YOURSELF!</h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
            A place where you can share your crafting ideas with others.
          </p>
          <div class="mt-6 flex items-center gap-2">
            <router-link to="/signup">
              <button class="px-4 py-2 bg-blue-500 text-white rounded">Sign up</button>
            </router-link>
            <router-link to="/login">
              <button class="px-4 py-2 bg-gray-500 text-white rounded">Log in</button>
            </router-link>
          </div>
        </div>
        <div class="mt-8 lg:mt-0 lg:w-1/2">
          <div class="flex items-center justify-center lg:justify-end">
            <div class="max-w-lg">
              <picture>
                <source srcset="../assets/illustration.webp" type="image/webp" />
                <img class="h-64 w-full rounded-md object-cover object-center" src="../assets/illustration.png"
                  alt="Person typing" />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 text-center">
      <div v-if="isLoggedIn">
        <p>Welcome, {{ username }}</p>
      </div>

      <!-- Search Bar -->
      <div class="my-4">
        <input v-model="searchQuery" type="text" class="px-4 py-2 border rounded" placeholder="Search projects..." />
      </div>

      <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Latest Projects</h3>
      <div v-if="filteredProjects.length" class="mt-6 grid gap-6 lg:grid-cols-3" data-testid="project-list">
        <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" />
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400">No projects found!</div>

      <!-- Pagination Controls -->
      <div class="mt-6">
        <!-- Previous Button -->
        <FwbButton @click="changePage(currentPage - 1)" :disabled="currentPage === 1" color="blue"
          class="px-4 py-2 border rounded dark:bg-gray-700">
          Previous
        </FwbButton>

        <!-- Page Number Display -->
        <span class="mx-4">Page {{ currentPage }} of {{ totalPages }}</span>

        <!-- Next Button -->
        <FwbButton @click="changePage(currentPage + 1)" :disabled="!hasMorePages" color="blue"
          class="px-4 py-2 border rounded dark:bg-gray-700">
          Next
        </FwbButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here */
</style>

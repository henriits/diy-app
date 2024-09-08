<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { trpc } from '@/trpc'
import type { Selectable } from 'kysely'
import type { Projects } from '@server/shared/types'
import ProjectCard from '@/components/ProjectCard.vue'
import { isLoggedIn, username } from '@/stores/user'



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
  <div class="">
    <div
      class="rounded-md bg-white px-6 py-8 lg:px-12 lg:py-16 flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8">
      <!-- Image Section -->
      <div class="flex items-center justify-center lg:w-1/2">
        <picture class="flex">
          <img class="h-auto max-h-64 rounded-md object-cover object-center" src="../assets/illustration.png"
            alt="Person reading blueprint" />
        </picture>
      </div>

      <!-- Text Section -->
      <div class="lg:w-1/2 text-center lg:text-left">
        <h2 class="header-shine">
          DO IT YOURSELF!
        </h2>

        <p class="mt-4 text-gray-600 dark:text-gray-400 lg:max-w-md text-lg leading-relaxed">
          Share your unique crafting ideas, get inspired by
          others, and turn your DIY dreams into reality.
        </p>

        <!-- Display Welcome Message for Logged-in Users -->
        <br>
        <div v-if="isLoggedIn" class="mt-4 text-gray-800 dark:text-gray-100">
          <p>Welcome, {{ username }}</p>
        </div>
      </div>
    </div>


    <!-- Sign Up and Log In Buttons -->
    <div v-if="!isLoggedIn" class="mt-8 flex gap-4">
      <router-link to="/signup">
        <button class="px-4 py-2 bg-blue-500 text-white rounded">Sign up</button>
      </router-link>
      <router-link to="/login">
        <button class="px-4 py-2 bg-gray-500 text-white rounded">Log in</button>
      </router-link>
    </div>

    <!-- Search Bar and Projects Section -->
    <div class="mt-12 text-center">
      <div v-if="isLoggedIn">
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
        <div class="mt-6 flex justify-center items-center gap-4 button-container">
          <!-- Previous Button -->
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="button-3d">
            <div class="button-top">
              <span v-if="currentPage > 1" class="material-icons">❮</span>
              <span v-else class="material-icons text-gray-400">❮</span> <!-- Disabled icon -->
            </div>
            <div class="button-bottom"></div>
            <div class="button-base"></div>
          </button>

          <!-- Page Number Display -->
          <span class="mx-4">Page {{ currentPage }} of {{ totalPages }}</span>

          <!-- Next Button -->
          <button @click="changePage(currentPage + 1)" :disabled="!hasMorePages" class="button-3d">
            <div class="button-top">
              <span v-if="hasMorePages" class="material-icons">❯</span>
              <span v-else class="material-icons text-gray-400">❯</span> <!-- Disabled icon -->
            </div>
            <div class="button-bottom"></div>
            <div class="button-base"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.button-3d:disabled {
  pointer-events: none;
  opacity: 0.5;

}

.button-bottom:disabled {
  background-image: linear-gradient(145deg, #999999, #cccccc);
}


.button-3d:disabled .button-top {
  background-image: linear-gradient(145deg, #999999, #cccccc);
}

.button-3d:disabled .material-icons {
  color: #999999;
}


.header-shine {
  color: #131010;
  background: linear-gradient(to right, #9f9f9f 0%, #fff 10%, #868686 20%);
  background-size: 200%;
  /* Adjust background size to cover full text */
  background-position: 0%;
  /* For Chrome and Safari 3 */
  -webkit-background-clip: text;
  /* Vendor prefix for older WebKit browsers */

  /* Standard property */
  background-clip: text;

  -webkit-text-fill-color: transparent;
  -webkit-text-fill-color: transparent;
  animation: shine 3s infinite linear;
  animation-fill-mode: forwards;
  font-weight: 600;
  font-size: 36px;
  white-space: nowrap;
  font-family: "Poppins", sans-serif;
}

@-moz-keyframes shine {
  0% {
    background-position: 0%;
  }

  60% {
    background-position: 180px;
  }

  100% {
    background-position: 200%;
  }
}

@-webkit-keyframes shine {
  0% {
    background-position: 0%;
  }

  60% {
    background-position: 180px;
  }

  100% {
    background-position: 200%;
  }
}

@-o-keyframes shine {
  0% {
    background-position: 0%;
  }

  60% {
    background-position: 180px;
  }

  100% {
    background-position: 200%;
  }
}

@keyframes shine {
  0% {
    background-position: 0%;
  }

  60% {
    background-position: 180px;
  }

  100% {
    background-position: 200%;
  }
}



/* Navigation buttons */
.button-container {
  display: flex;
  justify-content: center;
  margin: 20px;
}

.button-3d {
  -webkit-appearance: none;
  appearance: none;
  position: relative;
  border-width: 0;
  padding: 0 8px;
  min-width: 4em;
  min-height: 4em;
  box-sizing: border-box;
  background: transparent;
  font: inherit;
  cursor: pointer;
  margin: 10px;
  border-radius: 20px;
}

.button-top {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding: 8px 16px;
  transform: translateY(0);
  color: #fff;
  background-image: linear-gradient(145deg, #6a11cb, #2575fc);
  text-shadow: 0 -1px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  transition: transform 0.3s, border-radius 0.3s, background 10s;
}

.button-3d:active .button-top {
  border-radius: 10px 10px 8px 8px / 8px;
  transform: translateY(2px);
  background-image: linear-gradient(145deg, #2575fc, #6a11cb);
}

.button-bottom {
  position: absolute;
  z-index: 1;
  bottom: 4px;
  left: 4px;
  border-radius: 20px;
  padding-top: 6px;
  width: calc(100% - 8px);
  height: calc(100% - 10px);
  background-image: linear-gradient(145deg, #2575fc, #6a11cb);
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.5);
  transition: border-radius 0.2s, padding-top 0.2s;
}

.button-base {
  position: absolute;
  z-index: 0;
  top: 4px;
  left: 0;
  border-radius: 20px;
  width: 100%;
  height: calc(100% - 4px);

  transition: border-radius 0.2s, padding-top 0.2s;
}

.button-3d:active .button-bottom {
  border-radius: 10px 10px 8px 8px / 8px;
  padding-top: 0;
}

.button-3d:active .button-base {
  border-radius: 10px 10px 8px 8px / 8px;
}
</style>

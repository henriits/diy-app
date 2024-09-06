<script setup lang="ts">
import { trpc } from '@/trpc'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
// import CreateCategory from './CreateCategory.vue'

const router = useRouter()

const projectForm = ref({
  title: '',
  description: '',
  instructions: '',
  materials: '',
})

const [createProject, errorMessage] = useErrorMessage(async () => {
  const project = await trpc.projects.create.mutate(projectForm.value)

  router.push({
    name: 'Projects',
    params: { id: project.id },
  })
})

const fetchCategories = async () => {
  categories.value = await trpc.categories.findAll.query()
}

const categories = ref<{ id: number, name: string }[]>([])
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <form aria-label="Project" @submit.prevent="createProject" class="space-y-8">
      <FwbHeading tag="h1" class="text-3xl font-bold text-gray-900 text-center">Create a New Project</FwbHeading>

      <div>
        <FwbInput aria-label="Project title" v-model="projectForm.title" :minlength="2" label="Project Title"
          placeholder="My Project" class="w-full" />
      </div>

      <div>
        <FwbTextarea aria-label="Project description" v-model="projectForm.description" :rows="4"
          label="Project Description" placeholder="Describe your project here..." class="w-full" />
      </div>

      <div>
        <FwbTextarea aria-label="Project Instructions" v-model="projectForm.instructions" :rows="10"
          label="Project Instructions" placeholder="Write instructions for the project here... 
          NB! Add numbers before each instruction.
          Start by writing 1. Followed by text, then 2. With another instruction.
          This will separate instructions on a new line." class="w-full" />
      </div>

      <div>
        <FwbTextarea aria-label="Project materials" v-model="projectForm.materials" :rows="3" label="Project Materials"
          placeholder="Materials required for the project" class="w-full" />
      </div>

      <AlertError :message="errorMessage" class="mb-4" />

      <div class="mt-2">
        <button class="post-project-button w-full" type="submit">
          Post Project
        </button>
      </div>
    </form>
  </div>
</template>

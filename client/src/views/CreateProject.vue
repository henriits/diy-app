<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()

const projectForm = ref({
  title: '',
  descriptions: '',
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
</script>

<template>
  <form aria-label="Project" @submit.prevent="createProject">
    <div class="space-y-6">
      <FwbHeading tag="h1" class="text-3xl">Create a new project</FwbHeading>

      <div class="mt-6">
        <FwbInput aria-label="Project title" v-model="projectForm.title" :minlength="2" label="Project title"
          placeholder="My Project" />
      </div>

      <div class="mt-6">
        <FwbTextarea aria-label="Project description" v-model="projectForm.descriptions" :rows="4"
          label="Project description" placeholder="Describe your Project here..." />
      </div>
      <div class="mt-6">
        <FwbTextarea aria-label="Project Instructions" v-model="projectForm.instructions" :rows="10"
          label="Project instructions" placeholder="Write instructions for Project here..." />
      </div>
      <div class="mt-6">
        <FwbTextarea aria-label="Project materials" v-model="projectForm.materials" :rows="1" label="Project materials"
          placeholder="Materials required for project" />
      </div>
    </div>

    <AlertError :message="errorMessage" />

    <div class="mt-6 flex justify-end">
      <FwbButton size="lg" type="submit">Post Project</FwbButton>
    </div>
  </form>
</template>

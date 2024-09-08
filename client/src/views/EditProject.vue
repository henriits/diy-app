<script setup lang="ts">
import { trpc } from '@/trpc'
import type { ProjectPublic } from '@server/shared/types'
import { FwbHeading, FwbInput, FwbTextarea } from 'flowbite-vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import { isLoggedIn } from '@/stores/user'
import AddProjectImage from '@/components/AddProjectImage.vue'



const route = useRoute()
const router = useRouter()

const project = ref<ProjectPublic & { username: string } | undefined>(undefined)
const projectForm = ref({
    title: '',
    description: '',
    instructions: '',
    materials: '',
    username: ''
})
const isLoading = ref(true)
const error = ref<string | null>(null)

const imageUrl = ref<string | null>(null);


const handleSubmit = async () => {
    // Clear any previous error message
    error.value = null

    try {
        await trpc.projects.update.mutate({
            id: Number(route.params.id),
            data: projectForm.value,
        })

        if (project.value) {
            await router.push({
                name: 'Projects',
                params: { id: project.value.id },
            })
        } else {
            error.value = 'Project data is not available. Please try again later.'
        }

    } catch (err) {
        error.value = 'Failed to update project. Please try again later.'
    }
}

onMounted(async () => {
    try {
        const projectFound = await trpc.projects.findById.query(Number(route.params.id))
        if (projectFound) {
            project.value = projectFound
            projectForm.value = {
                title: projectFound.title || '',
                description: projectFound.description || '',
                instructions: projectFound.instructions || '',
                materials: projectFound.materials || '',
                username: projectFound.username || ''
            }
            imageUrl.value = await trpc.projectImages.getUrlByProjectId.query({ projectId: project.value.id });
        }
    } catch (err) {
        error.value = 'Failed to load project details. Please try again later.'
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
        <div class="items-center lg:flex">Please Login to edit the project!</div>
    </div>
    <div v-else class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div v-if="isLoading" class="text-center">Loading...</div>
        <div v-if="error" class="text-center text-red-500">{{ error }}</div>
        <div v-if="project" class="p-6">
            <!-- Image Section -->
            <div class="image-header">
                <h1 class="title">Upload Image</h1>
            </div>
            <div class="flex flex-col items-center">

                <div class="w-full mt-4">
                    <AddProjectImage :projectId="project.id" />
                </div>
            </div>
            <FwbHeading tag="h1" class="mb-8 mt-10 text-3xl font-bold">
                Edit Project: {{ projectForm.title }}
            </FwbHeading>
            <form @submit.prevent="handleSubmit" aria-label="edit-project">
                <div class="flex flex-col md:flex-row items-start">

                    <!-- Content Section -->
                    <div class="flex-1  w-full">
                        <Card class="p-6 bg-white shadow-lg rounded-lg">
                            <!-- Project Title with Tooltip -->
                            <div class="relative group">
                                <FwbInput aria-label="Project title" v-model="projectForm.title" :minlength="2"
                                    label="Project Title" placeholder="My Project" class="w-full"
                                    title="Enter a brief, descriptive title for your project (min. 2 characters)." />
                                <span
                                    class="absolute left-0 -top-6 text-sm text-gray-500 hidden group-hover:block">Enter
                                    a unique project
                                    title.</span>
                            </div>


                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Author</label>
                                <input v-model="projectForm.username" type="text" disabled
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="author" />
                            </div>


                            <!-- Project Description with Tooltip -->
                            <div class="relative group">
                                <FwbTextarea aria-label="Project description" v-model="projectForm.description"
                                    :rows="4" label="Project Description" placeholder="Describe your project here..."
                                    class="w-full" title="Provide a short summary of what your project is about." />
                                <span class="left-0 -top-6 text-sm text-gray-500 hidden group-hover:block">A
                                    detailed description will
                                    help others understand your project.</span>
                            </div>

                            <!-- Project Instructions with Tooltip -->
                            <div class="relative group">
                                <FwbTextarea aria-label="Project Instructions" v-model="projectForm.instructions"
                                    :rows="10" label="Project Instructions" placeholder="Write instructions for the project here... 
          1. instruction
          2. instruction
          3. instruction" class="w-full" title="Provide step-by-step instructions for completing your project." />
                                <span class="left-0 -top-6 text-sm text-gray-500 hidden group-hover:block">
                                    NB! Add numbers before each instruction. This allows separating the instructions
                                    clearly.</span>
                            </div>

                            <!-- Project Materials with Tooltip -->
                            <div class="relative group">
                                <FwbTextarea aria-label="Project materials" v-model="projectForm.materials" :rows="3"
                                    label="Project Materials" placeholder="Materials required for the project"
                                    class="w-full" title="List the materials needed to complete your project." />
                                <span class="left-0 -top-6 text-sm text-gray-500 hidden group-hover:block">Mention
                                    all necessary
                                    materials clearly.</span>
                            </div>
                            <div class="flex space-x-4">
                                <button @click="handleSubmit" class="confirm-cancel-button"><img
                                        src="../assets/icons/confirm-icon.svg" alt="confirm icon"></button>
                            </div>


                        </Card>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.project-image {
    width: 100%;
    max-width: 25rem;
    height: auto;
    max-height: 35rem;
    object-fit: cover;
}

.image-header {
    margin-bottom: 20px;
    text-align: center;
}

.title {
    font-size: 1.5em;
    color: #333;
}
</style>

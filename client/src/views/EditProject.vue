<script setup lang="ts">
import { trpc } from '@/trpc'
import type { ProjectPublic } from '@server/shared/types'
import { FwbHeading } from 'flowbite-vue'
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
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Project Title</label>
                                <input v-model="projectForm.title" type="text"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="title" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Author</label>
                                <input v-model="projectForm.username" type="text" disabled
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="author" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Description</label>
                                <textarea v-model="projectForm.description" rows="4"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="description"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Instructions</label>
                                <textarea v-model="projectForm.instructions" rows="6"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="Write instructions for the project here... 
          NB! Add numbers before each instruction.
          Start by writing 1. Followed by text, then 2. With another instruction.
          This will separate instructions on a new line."></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Materials</label>
                                <input v-model="projectForm.materials" type="text"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="materials" />
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

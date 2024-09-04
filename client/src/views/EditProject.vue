<script setup lang="ts">
import { trpc } from '@/trpc'
import type { ProjectPublic } from '@server/shared/types'
import { FwbHeading, FwbButton } from 'flowbite-vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import UploadImage from "@/components/UploadImage.vue"
import { isLoggedIn } from '@/stores/user'



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
    <div v-else>
        <div v-if="isLoading" class="text-center">Loading...</div>
        <div v-if="error" class="text-center text-red-500">{{ error }}</div>
        <div v-if="project" class="p-6">
            <FwbHeading tag="h1" class="mb-8 mt-10 text-3xl font-bold">
                Edit Project: {{ projectForm.title }}
            </FwbHeading>
            <form @submit.prevent="handleSubmit">
                <div class="flex flex-col md:flex-row items-start">
                    <!-- Image Section -->
                    <div class="flex-shrink-0 md:w-1/3 mb-6 md:mb-0">
                        <img src="https://via.placeholder.com/800x1000" alt="Project Image"
                            class="w-full h-auto rounded-lg shadow-md project-image" />
                        <div>
                            <!-- Use the UploadImage component -->
                            <UploadImage />

                        </div>
                    </div>
                    <!-- Content Section -->
                    <div class="flex-1 md:pl-6">
                        <Card class="p-6 bg-white shadow-lg rounded-lg">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Project Title</label>
                                <input v-model="projectForm.title" type="text"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Author</label>
                                <input v-model="projectForm.username" type="text" disabled
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Description</label>
                                <textarea v-model="projectForm.description" rows="4"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Instructions</label>
                                <textarea v-model="projectForm.instructions" rows="6"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Materials</label>
                                <input v-model="projectForm.materials" type="text"
                                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div class="flex space-x-4">
                                <FwbButton @click="handleSubmit" size="lg" color="blue">Save Changes</FwbButton>
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
    max-width: 800px;
    height: auto;
    max-height: 1000px;
    object-fit: cover;
}
</style>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import type { Selectable } from 'kysely'
import type { Projects } from '@server/shared/types'
import { FwbButton } from 'flowbite-vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { authUserId, isLoggedIn, username } from '@/stores/user'

const projects = ref<Selectable<Projects>[]>([])
const fetchProjects = async () => {
    try {
        if (!isLoggedIn.value) {
            // Handle the case where the user is not logged in
            console.log('User is not logged in. Redirecting or showing appropriate message.')
            return
        }

        // Fetch projects for the authenticated user
        if (authUserId.value) {
            projects.value = await trpc.projects.findByUser.query({ userId: authUserId.value })
        } else {
            console.error('User ID is not available.')
        }
    } catch (err) {
        console.error('Failed to fetch projects:', err)
    }
}


onMounted(fetchProjects)
</script>

<template>
    <div class="dark:bg-gray-800">
        <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
            <div class="items-center lg:flex">
                <div class="lg:w-1/2">
                    <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">DIY-Platform</h2>
                    <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
                        A place where you can share your crafting ideas with others.
                    </p>
                    <div class="mt-6 flex items-center gap-2">
                        <FwbButton component="RouterLink" tag="router-link" href="/signup">Sign up</FwbButton>
                        <FwbButton component="RouterLink" tag="router-link" color="alternative" href="/login">
                            Log in
                        </FwbButton>
                    </div>
                </div>
                <div class="mt-8 lg:mt-0 lg:w-1/2">
                    <div class="flex items-center justify-center lg:justify-end">
                        <div class="max-w-lg">
                            <picture>
                                <img class="h-64 w-full rounded-md object-cover object-center"
                                    src="../assets/illustration.png" alt="Person typing" />
                            </picture>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="isLoggedIn" class="mt-12 text-center">
            <div v-if="isLoggedIn">
                <p>Welcome, {{ username }}</p>
            </div>

            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100">My Projects</h3>
            <div v-if="projects.length" class="mt-6 grid gap-6 lg:grid-cols-3">
                <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
            </div>
            <div v-else class="text-center text-gray-500 dark:text-gray-400">No projects yet!</div>
        </div>
    </div>
</template>

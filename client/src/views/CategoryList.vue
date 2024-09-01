<template>
    <div class="p-6 bg-white rounded shadow-md dark:bg-gray-800">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Categories</h1>

        <div v-if="loading" class="text-gray-600 dark:text-gray-400">Loading categories...</div>

        <ul v-if="!loading && categories.length" class="space-y-2">
            <li v-for="category in categories" :key="category.id"
                class="p-4 bg-gray-100 rounded-md shadow-sm dark:bg-gray-700">
                {{ category.name }}
            </li>
        </ul>

        <div v-if="!loading && !categories.length" class="text-gray-600 dark:text-gray-400">No categories available.
        </div>

        <div v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'

const categories = ref<{ id: number, name: string }[]>([])
const errorMessage = ref('')
const loading = ref(true)

const fetchCategories = async () => {
    try {
        categories.value = await trpc.categories.findAll.query()
    } catch (error) {
        errorMessage.value = 'Failed to load categories. Please try again later.'
        console.error('Error fetching categories:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchCategories()
})
</script>

<style scoped>
/* Add any additional styles here */
</style>

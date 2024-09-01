<template>
    <div class="p-6 bg-white rounded shadow-md dark:bg-gray-800">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Create New Category</h1>

        <form @submit.prevent="submitCategory" class="space-y-4">
            <div>
                <label for="name" class="block text-gray-700 dark:text-gray-300">Category Name</label>
                <input v-model="name" id="name" type="text"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    placeholder="Enter category name" required />
                <span v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</span>
            </div>

            <FwbButton type="submit" color="blue" class="w-full" :disabled="loading">
                Create Category
            </FwbButton>

            <FwbButton @click="resetForm" color="red" class="w-full">
                Reset
            </FwbButton>
        </form>

        <div v-if="successMessage" class="mt-4 text-green-500">{{ successMessage }}</div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { FwbButton } from 'flowbite-vue'
import { trpc } from '@/trpc'


const name = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)


const submitCategory = async () => {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        await trpc.categories.create.mutate({ name: name.value })
        successMessage.value = 'Category created successfully!'
        name.value = '' // Clear the input field
    } catch (error) {
        errorMessage.value = 'Failed to create category. Please try again.'
        console.error('Error creating category:', error)
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    name.value = ''
    errorMessage.value = ''
    successMessage.value = ''
}
</script>

<style scoped>
/* Add any additional styles here */
</style>
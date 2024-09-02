<script setup lang="ts">
import { ref } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn } from '@/stores/user';

const props = defineProps<{
    projectId: number;
}>();

const emit = defineEmits<{
    (event: 'rating-submitted'): void;
}>();

const rating = ref<number>(0);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

const setRating = (star: number) => {
    rating.value = star;
};

const submitRating = async () => {
    if (rating.value < 1 || rating.value > 5) {
        error.value = 'Rating must be between 1 and 5.';
        return;
    }

    try {
        await trpc.ratings.create.mutate({
            rating: rating.value,
            projectId: props.projectId,
        });
        successMessage.value = 'Rating submitted successfully!';
        emit('rating-submitted');
    } catch (err) {
        error.value = 'Failed to submit rating. Please try again later.';
    }
};
</script>

<template>
    <div v-if="isLoggedIn" class="rating-component">
        <div class="rating-stars">
            <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= rating }"
                @click="setRating(star)">
                ★
            </span>
        </div>
        <button @click="submitRating" class="submit-button">Submit Rating</button>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="error" class="error-message">{{ error }}</div>
    </div>
    <div v-else class="not-logged-in">Please login to rate the project!</div>
</template>
<style scoped>
.rating-stars {
    display: flex;
    font-size: 2rem;
}

.star {
    cursor: pointer;
    transition: color 0.2s;
}

.star.filled {
    color: gold;
}

.submit-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
}

.submit-button:hover {
    background-color: #0056b3;
}

.success-message {
    color: green;
}

.error-message {
    color: red;
}

.not-logged-in {
    color: #6c757d;
}
</style>

<template>
    <div v-if="isLoggedIn" class="comment-component">
        <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
                <div class="comment-header">
                    <strong class="username">{{ comment.author.username }}</strong>
                    <span class="comment-date">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
            </div>
        </div>
        <textarea v-model="newComment" placeholder="Write your comment here..." rows="1"
            class="comment-input"></textarea>
        <button @click="submitComment" class="submit-button">Submit Comment</button>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="error" class="error-message">{{ error }}</div>
    </div>
    <div v-else class="not-logged-in">Please login to comment on the project!</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn } from '@/stores/user';
import type { CommentPublic } from '@server/shared/types';

const props = defineProps<{
    projectId: number;
}>();

const newComment = ref<string>('');
const comments = ref<CommentPublic[]>([]);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

const fetchComments = async () => {
    comments.value = await trpc.comments.findByProjectId.query({ projectId: props.projectId });
};

const submitComment = async () => {
    if (!newComment.value.trim()) {
        error.value = 'Comment cannot be empty.';

        setTimeout(() => {
            error.value = null;
        }, 2000);

        return;
    }

    try {
        await trpc.comments.create.mutate({
            projectId: props.projectId,
            content: newComment.value,
        });
        successMessage.value = 'Comment submitted successfully!';

        setTimeout(() => {
            successMessage.value = null;
        }, 2000);

        newComment.value = ''; // Clear the input
        await fetchComments(); // Refresh the comments list
    } catch (err) {
        error.value = 'Failed to submit comment. Please try again later.';

        setTimeout(() => {
            error.value = null;
        }, 2000);
    }
};

onMounted(fetchComments);
</script>

<style scoped>
.username {
    text-decoration: underline;
    font-size: 1.2rem;
}

.comment-component {
    margin-top: 1rem;
}

.comments-list {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.comment {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    position: relative;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #495057;
}

.comment-date {
    color: #6c757d;
}

.comment-content {
    font-size: 1rem;
    color: #212529;
}

.comment-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    resize: none;
}

.submit-button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-button:hover {
    background-color: #0056b3;
}

.success-message {
    color: green;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.error-message {
    color: red;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.not-logged-in {
    color: #6c757d;
    font-size: 0.875rem;
}
</style>

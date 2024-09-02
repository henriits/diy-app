<template>
    <div v-if="isLoggedIn" class="comment-component">
        <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
                <div class="comment-header">
                    <strong class="username">{{ comment.author.username }}</strong>
                    <span class="comment-date">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
                </div>
                <div v-if="editingCommentId === comment.id">
                    <textarea v-model="editedComment" rows="2" class="comment-edit-input"></textarea>
                    <button @click="updateComment(comment.id)" class="update-button">Update</button>
                    <button @click="cancelEdit" class="cancel-button">Cancel</button>
                </div>
                <div v-else>
                    <p class="comment-content">{{ comment.content }}</p>
                    <div v-if="isCommentAuthor(comment)" class="comment-actions">
                        <button @click="startEdit(comment.id, comment.content)" class="edit-button">Edit</button>
                        <button @click="confirmDelete(comment.id)" class="delete-button">Delete</button>
                    </div>
                </div>
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
import { ref, onMounted, computed } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn, authUserId } from '@/stores/user'; // Correct imports
import type { CommentPublic } from '@server/shared/types';

const props = defineProps<{
    projectId: number;
}>();

// Retrieve the logged-in user's ID
const userId = computed(() => authUserId.value);

const newComment = ref<string>('');
const editedComment = ref<string>('');
const editingCommentId = ref<number | null>(null);
const comments = ref<CommentPublic[]>([]);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

const fetchComments = async () => {
    comments.value = await trpc.comments.findByProjectId.query({ projectId: props.projectId });
};

const isCommentAuthor = (comment: CommentPublic) => {
    return comment.userId === userId.value; // Check if the logged-in user is the author
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

const startEdit = (commentId: number, content: string) => {
    editingCommentId.value = commentId;
    editedComment.value = content;
};

const cancelEdit = () => {
    editingCommentId.value = null;
    editedComment.value = '';
};

const updateComment = async (commentId: number) => {
    if (!editedComment.value.trim()) {
        error.value = 'Comment cannot be empty.';

        setTimeout(() => {
            error.value = null;
        }, 2000);

        return;
    }

    try {
        await trpc.comments.edit.mutate({
            id: commentId,
            content: editedComment.value,
        });
        successMessage.value = 'Comment updated successfully!';

        setTimeout(() => {
            successMessage.value = null;
        }, 2000);

        editingCommentId.value = null;
        editedComment.value = ''; // Clear the input
        await fetchComments(); // Refresh the comments list
    } catch (err) {
        error.value = 'Failed to update comment. Please try again later.';

        setTimeout(() => {
            error.value = null;
        }, 2000);
    }
};

const confirmDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        await trpc.comments.deleteComment.mutate({ id: commentId });
        successMessage.value = 'Comment deleted successfully!';
        await fetchComments(); // Refresh the comments list
    } catch (err) {
        error.value = 'Failed to delete comment. Please try again later.';
    } finally {
        setTimeout(() => {
            successMessage.value = null;
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

<template>
    <div v-if="isLoggedIn" class="comment-component">
        <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment mt-2">
                <div class="comment-header mt-2 flex space-x-4">
                    <strong class="comment-username">{{ comment.author.username }}</strong>
                    <span class="comment-date">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
                </div>

                <div v-if="editingCommentId === comment.id" class="mt-3 flex space-x-4">
                    <textarea v-model="editedComment" rows="1" class="comment-edit-input"></textarea>
                    <Button @click="updateComment(comment.id)" class="confirm-cancel-button">
                        <img src="../assets/icons/confirm-icon.svg" alt="confirm icon">
                    </Button>
                    <FwbButton @click="cancelEdit" class="confirm-cancel-button">
                        <img src="../assets/icons/cancel-icon.svg" alt="cancel icon">
                    </FwbButton>
                </div>

                <div v-else class="mt-4 flex flex-col">
                    <p class="comment-content">{{ comment.content }}</p>
                    <div v-if="isCommentAuthor(comment)" class="mt-2 flex space-x-2 comment-actions ml-auto">
                        <Button @click="startEdit(comment.id, comment.content)" class="edit-button">
                            <img class="edit-svgIcon" src="../assets/icons/edit-icon.svg" alt="Edit Icon">
                        </Button>
                        <Button @click="toggleConfirmDelete(comment.id)" class="delete-button">
                            <img class="edit-svgIcon" src="../assets/icons/delete-icon.svg" alt="Delete Icon">
                        </Button>
                    </div>
                </div>

                <!-- Custom Confirmation Dialog under the comment -->
                <div v-if="showConfirmDialog && commentToDelete === comment.id"
                    class="confirm-dialog mt-2 flex flex-col p-6 border rounded-lg">
                    <p class="confirm-message text-red-600">Are you sure you want to delete this comment?</p>
                    <div class="mt-2 flex space-x-4 confirm-actions">
                        <Button @click="handleDeleteConfirm" class="confirm-cancel-button">
                            <img src="../assets/icons/confirm-icon.svg" alt="confirm icon">
                        </Button>
                        <Button @click="handleDeleteCancel" class="confirm-cancel-button">
                            <img src="../assets/icons/cancel-icon.svg" alt="cancel icon">
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div class="mt-2 flex flex-col w-full">
            <textarea v-model="newComment" placeholder="Write your comment here..." rows="1"
                class="comment-input"></textarea>
            <Button @click="submitComment" class="submit-comment-button">Submit Comment</Button>

        </div>


    </div>
    <div v-else class="not-logged-in">Please login to comment on the project!</div>
</template>



<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn, authUserId } from '@/stores/user'; // Correct imports
import type { CommentPublic } from '@server/shared/types';
import { FwbButton } from 'flowbite-vue'; // Import Flowbite components

const props = defineProps<{
    projectId: number;
}>();

const userId = computed(() => authUserId.value);

const newComment = ref<string>('');
const editedComment = ref<string>('');
const editingCommentId = ref<number | null>(null);
const comments = ref<CommentPublic[]>([]);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

const showConfirmDialog = ref<boolean>(false);
const commentToDelete = ref<number | null>(null);

const fetchComments = async () => {
    comments.value = await trpc.comments.findByProjectId.query({ projectId: props.projectId });
};

const isCommentAuthor = (comment: CommentPublic) => {
    return comment.userId === userId.value;
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
        newComment.value = '';
        await fetchComments();
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
        editedComment.value = '';
        await fetchComments();
    } catch (err) {
        error.value = 'Failed to update comment. Please try again later.';
        setTimeout(() => {
            error.value = null;
        }, 2000);
    }
};

const toggleConfirmDelete = (commentId: number) => {
    if (showConfirmDialog.value && commentToDelete.value === commentId) {
        // If the dialog is already open for the same comment, close it
        showConfirmDialog.value = false;
        commentToDelete.value = null;
    } else {
        // Otherwise, open the dialog for the specified comment
        showConfirmDialog.value = true;
        commentToDelete.value = commentId;
    }
};

const handleDeleteConfirm = async () => {
    if (commentToDelete.value === null) return;

    try {
        await trpc.comments.deleteComment.mutate({ id: commentToDelete.value });
        successMessage.value = 'Comment deleted successfully!';
        await fetchComments();
    } catch (err) {
        error.value = 'Failed to delete comment. Please try again later.';
    } finally {
        setTimeout(() => {
            successMessage.value = null;
            error.value = null;
            showConfirmDialog.value = false;
            commentToDelete.value = null;
        }, 2000);
    }
};

const handleDeleteCancel = () => {
    showConfirmDialog.value = false;
    commentToDelete.value = null;
};

onMounted(fetchComments);
</script>



<style scoped>
.comment {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    box-shadow: 0 10px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    margin-bottom: 1.3rem;
    word-wrap: break-word;
}

.comment-content {
    font-size: 1rem;
    color: #212529;
    margin-bottom: 0.5rem;
    word-wrap: break-word;
    /* Ensure long words break and wrap */
}

.comment-username {
    font-size: 1.3rem;
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
    margin-bottom: 0.5rem;
}

.comment-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}



.comment-edit-input {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: 0.5rem;
    resize: none;
}



.comment-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    resize: none;
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

.success-message,
.error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 0.375rem;
    text-align: center;
}

.success-message {
    background-color: #d1fae5;
    /* Light green background */
    color: #065f46;
}

.error-message {
    background-color: #fee2e2;
    /* Light red background */
    color: #b91c1c;
}

.submit-comment-button {
    background-color: black;
    color: white;
    margin-top: 4px;
    height: 2rem;
    border-radius: 0.375rem;
}
</style>

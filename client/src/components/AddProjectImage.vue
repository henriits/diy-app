<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn } from '@/stores/user';
import type { ImagePublic } from '@server/shared/types';

const props = defineProps<{
    projectId: number;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const previewSrc = ref<string | null>(null);
const message = ref<string>('');
const messageClass = ref<string>('');
const fileName = ref<string>('');
const uploadedFileUrl = ref<string | null>(null);

const newImage = ref<string>('');
const Images = ref<ImagePublic[]>([]);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

const UploadCareKey = import.meta.env.VITE_UPLOADCARE_PUB_KEY;
const pubkey = UploadCareKey;

const fetchImages = async () => {
    Images.value = await trpc.projectImages.findByProjectId.query({ projectId: props.projectId });
};

const onFileChange = () => {
    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];
        fileName.value = file.name;
    }
};

const uploadFile = async () => {
    const maxSize = 6 * 1024 * 1024; // 6MB

    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];

        if (file.size > maxSize) {
            message.value = 'File size exceeds limit of 6MB';
            messageClass.value = 'error';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('UPLOADCARE_PUB_KEY', pubkey);
        formData.append('filename', file.name);

        message.value = 'Uploading file...';
        messageClass.value = '';

        try {
            const response = await fetch('https://upload.uploadcare.com/base/', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to upload file.');
            }

            const data = await response.json();
            const fileUrl = `https://ucarecdn.com/${data.file}/${file.name}`;

            message.value = 'File uploaded successfully';
            messageClass.value = 'success';
            previewSrc.value = fileUrl;
            uploadedFileUrl.value = fileUrl;
            console.log('Uploaded file URL:', fileUrl);

            newImage.value = fileUrl;
            await submitImage();

        } catch (error) {
            console.error('Upload Error:', error);
            message.value = 'Error uploading file. Please try again.';
            messageClass.value = 'error';
        }
    } else {
        message.value = 'Please select a file to upload.';
        messageClass.value = 'error';
    }
};

const submitImage = async () => {
    if (!newImage.value.trim()) {
        error.value = 'Image URL cannot be empty.';
        setTimeout(() => { error.value = null; }, 2000);
        return;
    }

    try {
        await trpc.projectImages.addImage.mutate({
            projectId: props.projectId,
            imageUrl: newImage.value,
        });
        successMessage.value = 'Image submitted successfully!';
        setTimeout(() => { successMessage.value = null; }, 2000);
        newImage.value = '';
        await fetchImages();
    } catch (err) {
        error.value = 'Failed to submit image. Please try again later.';
        setTimeout(() => { error.value = null; }, 2000);
    }
};

onMounted(fetchImages);

</script>
<template>
    <div v-if="isLoggedIn" class="image-component ">
        <div class="image-header">
            <h1 class="title">Upload Image</h1>
        </div>

        <!-- File Upload Section -->
        <div class="upload-section">
            <form @submit.prevent="uploadFile" class="upload-form">
                <input type="file" ref="fileInput" accept="image/*" @change="onFileChange"
                    class="file-input mt-2 flex space-x-4" />
                <button type="submit" class="upload-button w-full">Upload</button>
            </form>
            <p :class="messageClass" class="upload-message">{{ message }}</p>
            <img v-if="previewSrc" :src="previewSrc" :alt="fileName" class="preview-img" />
        </div>
        <h1 class="title">Have URL? Great! Add it here!</h1>
        <!-- URL Submission Section -->
        <div class="url-section">
            <textarea v-model="newImage" placeholder="Add image URL here" rows="1" class="url-input w-full"></textarea>
            <button type="button" @click="submitImage" class="submit-button w-full">Submit URL</button>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            <div v-if="error" class="error-message">{{ error }}</div>
        </div>
    </div>
    <div v-else class="not-logged-in">Please log in to manage images on this project!</div>
</template>

<style scoped>
.image-component {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-header {
    margin-bottom: 20px;
    text-align: center;
}

.title {
    font-size: 1.5em;
    color: #333;
}

.upload-section,
.url-section {
    margin-bottom: 20px;
}

.upload-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.file-input {
    margin-bottom: 10px;
}

.upload-button {
    color: #fff;
    background-image: linear-gradient(145deg, #6a11cb, #2575fc);
    margin-top: 4px;
    height: 2rem;
    border-radius: 0.375rem;
}

.upload-button:hover {
    background-color: #0056b3;
}

.upload-message {
    font-size: 0.9em;
    margin-top: 10px;
}

.upload-message.error {
    color: #dc3545;
}

.upload-message.success {
    color: #28a745;
}

.preview-img {
    margin-top: 20px;
    max-width: 100%;
    border-radius: 8px;
}



.success-message {
    color: #28a745;
    font-size: 0.9em;
    margin-top: 10px;
}

.error-message {
    color: #dc3545;
    font-size: 0.9em;
    margin-top: 10px;
}

.not-logged-in {
    text-align: center;
    font-size: 1.2em;
    color: #6c757d;
}
</style>

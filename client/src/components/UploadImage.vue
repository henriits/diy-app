<template>
    <div>
        <h1>File Uploader</h1>
        <form @submit.prevent="uploadFile">
            <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" />
            <button type="submit">Upload file</button>
        </form>
        <p :class="messageClass">{{ message }}</p>
        <img v-if="previewSrc" :src="previewSrc" :alt="fileName" width="300" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define public key for Uploadcare
const UploadCareKey = import.meta.env.VITE_UPLOADCARE_PUB_KEY;
const pubkey = UploadCareKey;

// Define refs for handling file input and feedback messages
const fileInput = ref<HTMLInputElement | null>(null);
const previewSrc = ref<string | null>(null);
const message = ref<string>('');
const messageClass = ref<string>('');
const fileName = ref<string>('');

// Function to handle file change event
const onFileChange = () => {
    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];
        fileName.value = file.name;
    }
};

// Function to handle file upload
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

            const data = await response.json();
            message.value = 'File uploaded successfully';
            messageClass.value = 'success';
            previewSrc.value = `https://ucarecdn.com/${data.file}/${file.name}`;
            const imageURL = previewSrc.value;
            console.log(imageURL);
        } catch (error) {
            console.error('Error', error);
            message.value = 'Error uploading file';
            messageClass.value = 'error';
        }
    } else {
        message.value = 'Please select a file to upload.';
        messageClass.value = 'error';
    }
};
</script>

<style scoped>
.error {
    color: red;
}

.success {
    color: green;
}
</style>

<template>
    <div>
        <uc-config ctx-name="my-uploader" :pubkey="UploadCareKey" :maxLocalFileSizeBytes="1000000000" :multiple="false"
            :imgOnly="true" source-list="local, camera" :useCloudImageEditor="false"></uc-config>

        <uc-file-uploader-regular ctx-name="my-uploader" class="my-config uc-light"></uc-file-uploader-regular>
    </div>
</template>

<script setup lang="ts">
import * as UC from '@uploadcare/file-uploader';
import "@uploadcare/file-uploader/web/uc-file-uploader-regular.min.css"

// Access the environment variable
const UploadCareKey = import.meta.env.VITE_UPLOADCARE_PUB_KEY;

UC.defineComponents(UC);
</script>

<style scoped>
.my-config {
    --uc-primary-oklch-dark: 69% 0.1768 258.4;
    --uc-primary-oklch-light: 59% 0.22 264;
}
</style>

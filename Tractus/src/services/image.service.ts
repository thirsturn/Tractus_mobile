import api from './api';

export interface ImageUploadResponse {
  id: string;
  url: string;
}

const imageService = {
  uploadImage: async (uri: string, filename: string = 'upload.jpg', type: string = 'image/jpeg'): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    
    // React Native's fetch accepts an object with uri, name, and type for files in FormData
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    return await api.post<ImageUploadResponse>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default imageService;

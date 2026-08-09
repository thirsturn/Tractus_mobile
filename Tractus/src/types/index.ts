export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
}

export interface ThreadResponse {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  author: User;
  spaceId: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface ThreadResponse {
  id: number;
  title: string;
  author: User;
  spaceId: number;
}

/// <reference types="vite/client" />

declare module 'virtual:projects' {
  export interface Project {
    id: string;
    title: string;
    description: string;
    content: string;
    image: string | null;
    tags: string[];
    liveUrl: string | null;
    githubUrl: string | null;
    gallery: string[];
    order: number;
    _filename: string;
  }

  export const projects: Project[];
}


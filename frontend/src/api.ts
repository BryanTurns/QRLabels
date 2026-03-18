import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export interface Container {
  id: number;
  name: string;
  barcode_uuid: string;
  created_at: string;
  items?: Item[];
  photos?: Photo[];
}

export interface Item {
  id: number;
  container_id: number;
  name: string;
  quantity: number;
  created_at: string;
}

export interface Photo {
  id: number;
  container_id: number;
  filename: string;
  created_at: string;
}

export const getContainers = () => api.get<Container[]>("/containers").then((r) => r.data);

export interface ItemSearchResult extends Item {
  container_name: string;
}
export interface SearchResults {
  containers: Container[];
  items: ItemSearchResult[];
}
export const searchAll = (q: string) =>
  api.get<SearchResults>("/search", { params: { q } }).then((r) => r.data);
export const createContainer = (name: string) =>
  api.post<Container>("/containers", { name }).then((r) => r.data);
export const getContainer = (id: number) =>
  api.get<Container>(`/containers/${id}`).then((r) => r.data);
export const updateContainer = (id: number, name: string) =>
  api.put<Container>(`/containers/${id}`, { name }).then((r) => r.data);
export const deleteContainer = (id: number) => api.delete(`/containers/${id}`);
export const scanContainer = (uuid: string) =>
  api.get<Container>(`/containers/scan/${uuid}`).then((r) => r.data);
export const getBarcodeUrl = (id: number) => `/api/containers/${id}/barcode`;

export const addItem = (container_id: number, name: string, quantity: number) =>
  api.post<Item>(`/containers/${container_id}/items`, { name, quantity }).then((r) => r.data);
export const updateItem = (id: number, data: Partial<Pick<Item, "name" | "quantity">>) =>
  api.put<Item>(`/items/${id}`, data).then((r) => r.data);
export const deleteItem = (id: number) => api.delete(`/items/${id}`);

export const uploadPhoto = (container_id: number, file: File) => {
  const form = new FormData();
  form.append("photo", file);
  return api.post<Photo>(`/containers/${container_id}/photos`, form).then((r) => r.data);
};
export const deletePhoto = (id: number) => api.delete(`/photos/${id}`);
export const getPhotoUrl = (filename: string) => `/api/photos/${filename}`;

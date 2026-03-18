import axios from "axios";

const api = axios.create({ baseURL: "/api" });
export default api;

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 responses clear the token and redirect to login,
// but not for auth endpoints (login/register handle their own errors)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith("/auth/");
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export interface AuthResponse {
  token: string;
  username: string;
}
export const loginUser = (username: string, password: string) =>
  api.post<AuthResponse>("/auth/login", { username, password }).then((r) => r.data);
export const registerUser = (username: string, password: string) =>
  api.post("/auth/register", { username, password }).then((r) => r.data);

export interface Container {
  id: number;
  name: string;
  barcode_uuid: string;
  created_at: string;
  preview_photo: string | null;
  items?: Item[];
  photos?: Photo[];
}

export interface ItemPhoto {
  id: number;
  item_id: number;
  filename: string;
  created_at: string;
}

export interface Item {
  id: number;
  container_id: number;
  name: string;
  quantity: number;
  created_at: string;
  photos: ItemPhoto[];
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
export const getBarcodeUrl = (id: number) => `/containers/${id}/barcode`;

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
export const getPhotoUrl = (filename: string) => `/photos/${filename}`;

export const uploadItemPhoto = (item_id: number, file: File) => {
  const form = new FormData();
  form.append("photo", file);
  return api.post<ItemPhoto>(`/items/${item_id}/photos`, form).then((r) => r.data);
};
export const deleteItemPhoto = (id: number) => api.delete(`/item-photos/${id}`);

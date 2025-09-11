import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API 응답 표준화 인터페이스
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

// API 에러 인터페이스
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

// 커스텀 API 에러 클래스
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

class ApiClient implements IApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor with proper typing
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 여기서 인증 토큰 등을 추가할 수 있습니다
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor with proper typing
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        // 전역 에러 처리
        console.error('API Error:', error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiClientError {
    const status = error.response?.status || 500;
    const apiError: ApiError = {
      message: error.message || 'An unexpected error occurred',
      status,
      code: error.code,
      details: error.response?.data,
    };

    // 특정 HTTP 상태 코드에 따른 메시지 커스터마이징
    if (status === 401) {
      apiError.message = 'Unauthorized access';
    } else if (status === 403) {
      apiError.message = 'Forbidden access';
    } else if (status === 404) {
      apiError.message = 'Resource not found';
    } else if (status >= 500) {
      apiError.message = 'Internal server error';
    }

    return new ApiClientError(apiError);
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  public async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }
}

// 유틸리티 타입 정의
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 제네릭 API 요청 타입
export interface ApiRequestConfig<D = unknown> extends AxiosRequestConfig {
  data?: D;
}

// 타입 안전한 API 클라이언트 인터페이스
export interface IApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
  put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
}

// 싱글톤 인스턴스 내보내기
export const apiClient = ApiClient.getInstance();

/*
사용 예제:

// 1. GET 요청 - 타입 안전한 응답
interface User {
  id: number;
  name: string;
  email: string;
}

try {
  const user = await apiClient.get<User>('/users/1');
  console.log(user.name); // 타입 안전함
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`API Error: ${error.message} (Status: ${error.status})`);
  }
}

// 2. POST 요청 - 타입 안전한 요청/응답
interface CreateUserRequest {
  name: string;
  email: string;
}

interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

try {
  const newUser = await apiClient.post<CreateUserResponse, CreateUserRequest>(
    '/users',
    { name: 'John Doe', email: 'john@example.com' }
  );
  console.log(newUser.id); // 타입 안전함
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`Failed to create user: ${error.message}`);
  }
}

// 3. PUT/PATCH 요청
interface UpdateUserRequest {
  name?: string;
  email?: string;
}

try {
  const updatedUser = await apiClient.patch<User, UpdateUserRequest>(
    '/users/1',
    { name: 'Jane Doe' }
  );
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`Update failed: ${error.message}`);
  }
}
*/
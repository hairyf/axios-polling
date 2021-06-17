import { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosStatic } from 'axios';
export interface AxiosPollingConfig {
    /** 当前正常轮询的总次数，初始值：0 */
    count: number;
    /** 正常轮询时，请求延迟毫秒数，默认：1000毫秒 */
    dalay: number;
    /**  轮询请求间隔递增毫秒数，默认：0毫秒（建议不要超过1000） */
    delayGaps: number;
    /** 发生错误时，当前已重试的次数，初始值：0 */
    retryCount: number;
    /** 当发生错误时请求的最大次数，默认：10次 */
    retryLimit: number;
    /** 第一次发送请求毫秒数，默认：1000毫秒 */
    retryAfter: number;
}
declare module 'axios' {
    interface AxiosRequestConfig {
        poling?: Partial<AxiosPollingConfig>;
    }
    interface AxiosInstance {
        poll: InstanceType<typeof AxiosPolling>['createPolling'];
    }
}
interface ObserveStacks {
    request: ((config: AxiosRequestConfig) => void)[];
    response: ((response: AxiosResponse) => void)[];
    error: ((error: AxiosError) => void)[];
}
declare class Observe {
    id: string;
    loop: boolean;
    stacks: ObserveStacks;
    constructor(id?: string, loop?: boolean, stacks?: ObserveStacks);
}
declare class AxiosPolling {
    private instance;
    constructor(instance?: AxiosStatic);
    /** 循环调用模型 */
    loopCallModel: (callback: () => void) => {
        call: (time?: number) => number;
    };
    /** 发送轮询请求 */
    emit: (observe: Observe, config: AxiosRequestConfig) => void;
    /** 创建轮询, 返回监视者实例 */
    createPolling: (createConfig?: AxiosRequestConfig) => {
        on: {
            (event: 'request', callback: (config: AxiosRequestConfig) => void): void;
            <T = any>(event: 'response', callback: (response: AxiosResponse<T>) => void): void;
            (event: 'error', callback: (error: AxiosError) => void): void;
        };
        off: () => void;
        emit: (config?: AxiosRequestConfig) => void;
        remove: () => void;
    };
}
/**
 * axios 轮询装饰器
 * @param axios axios 实例
 * @param config poling 配置
 */
export declare const axiosPolling: (axios: AxiosStatic, config?: Partial<AxiosPollingConfig> | undefined) => void;
export {};

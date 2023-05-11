"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosPolling = exports.AxiosPolling = void 0;
/*
 * @Author: Mr.Mao
 * @Date: 2021-06-03 09:24:39
 * @LastEditTime: 2022-01-25 15:13:01
 * @Description:
 * @LastEditors: Mr'Mao
 * @autograph: 任何一个傻子都能写出让电脑能懂的代码，而只有好的程序员可以写出让人能看懂的代码
 */
const axios_1 = require("axios");
const lodash_1 = require("lodash");
const nanoid_1 = require("nanoid");
class Observe {
    id;
    loop;
    stacks;
    constructor(id = nanoid_1.nanoid(10), loop = true, stacks = {
        request: [],
        response: [],
        error: []
    }) {
        this.id = id;
        this.loop = loop;
        this.stacks = stacks;
    }
    remove = () => {
        this['stacks']['error'] = [];
        this['stacks']['request'] = [];
        this['stacks']['response'] = [];
    };
    off = () => {
        this.loop = false;
    };
    on = (event, callback) => {
        this['stacks'][event].push(callback);
    };
}
class AxiosPolling {
    instance;
    constructor(instance = axios_1.default) {
        this.instance = instance;
    }
    /** 循环调用模型 */
    loopCallModel = (callback) => {
        const call = (time = 1000) => setTimeout(callback, time);
        return { call };
    };
    /** 发送轮询请求 */
    emit = (observe, config) => {
        observe.loop = true;
        const loopModel = this.loopCallModel(async () => {
            // 当前监视者循环调用关闭时, 阻止 loop
            if (!observe.loop)
                return undefined;
            try {
                // 调用当前监视者请求前堆栈
                observe['stacks']['request'].forEach((callback) => callback(config));
                // 再次发送请求
                const response = await this.instance(config || {});
                // 调用当前监视者请求完毕堆栈
                observe['stacks']['response'].forEach((callback) => callback(response));
                // 记录请求长度
                const poling = response.config?.poling;
                poling.delayGaps += poling.delayGaps;
                poling.count += 1;
                // 再次进入 loop
                loopModel.call(poling.delay + poling.delayGaps);
            }
            catch (e) {
                const poling = e.config?.poling;
                // 调用当前监视者失败堆栈
                observe['stacks']['error'].forEach((callback) => callback(e));
                // 当错误超出限制, 阻止 loop
                if (poling.retryCount >= poling.retryLimit)
                    return;
                // 记录失败请求长度
                poling.delayGaps += poling.delayGaps;
                poling.retryCount += 1;
                config.poling = poling;
                // 再次进入 loop
                loopModel.call(poling.delay + poling.delayGaps);
            }
        });
        // 初次调用循环请求
        loopModel.call(config?.poling?.retryAfter || this.instance['defaults'].poling?.retryAfter);
    };
    /** 创建轮询, 返回监视者实例 */
    createPolling = (createConfig = {}) => {
        const observe = new Observe();
        return {
            emit: (config = {}) => {
                this.emit(observe, lodash_1.assign(createConfig, config));
            },
            remove: observe.remove,
            on: observe.on,
            off: observe.off
        };
    };
}
exports.AxiosPolling = AxiosPolling;
/**
 * axios 轮询装饰器
 * @param axios axios 实例
 * @param config poling 配置
 */
const axiosPolling = (axios, config) => {
    const defaultConfig = {
        count: 0,
        delay: 1000,
        delayGaps: 0,
        retryCount: 0,
        retryLimit: 10,
        retryAfter: 1000
    };
    axios.poll = new AxiosPolling(axios).createPolling;
    axios['defaults'].poling = lodash_1.assign(lodash_1.cloneDeep(defaultConfig), config);
};
exports.axiosPolling = axiosPolling;

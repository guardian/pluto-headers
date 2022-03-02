import React from "react";
import { AxiosResponse } from "axios";
import "./Breadcrumb.css";
/**
 * only one of these needs to be set.  The others will be inferred from the data about it.
 * if masterId is set, the other two are ignored
 * if masterId is not set and projectId is set, then commissionId is ignored
 * if neither masterId nor projectId is set, then commisisonId is used
 */
interface BreadcrumbProps {
    masterId?: number;
    projectId?: number;
    commissionId?: number;
    plutoCoreBaseUri?: string;
}
interface BreadcrumbState {
    hasError: boolean;
    loading: boolean;
    projectName: string;
    commissionName: string;
    masterName: string;
    commissionId?: number;
    projectId?: number;
}
interface UsefulServerData {
    projectId?: number;
    commissionId?: number;
    title: string;
    workingGroupId?: number;
}
interface BaseDeliverable {
    id: bigint;
    type: number | null;
    filename: string;
    size: bigint;
    access_dt: string;
    modified_dt: string;
    changed_dt: string;
    job_id: string | null;
    online_item_id: string | null;
    nearline_item_id: string | null;
    archive_item_id: string | null;
    has_ongoing_job: boolean | null;
    status: bigint;
    type_string: string | null;
    version: bigint | null;
    duration: string | null;
    size_string: string;
    status_string: string;
    atom_id: string | null;
    absolute_path: string | null;
    linked_to_lowres: boolean | null;
}
declare class Breadcrumb extends React.Component<BreadcrumbProps, BreadcrumbState> {
    constructor(props: BreadcrumbProps);
    /**
     * implement an error boundary so we can't break the rest of the UI
     * @param error
     */
    static getDerivedStateFromError(error: any): {
        loading: boolean;
        hasError: boolean;
    };
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    /**
     * return a promise that completes when state change is complete
     */
    setStatePromise(newState: any): Promise<void>;
    /**
     * Handles an error object returned from axios. This will handle regular HTTP error codes and retry or return a rejected
     * response as appropriate
     * @param response err.response, where err is the error object from axios
     * @param url the url that was called
     * @param defaultValue return this value if the error was a 404 Not Found
     * @param cb callback that is invoked after a delay, in order to retry the operation. This is passed standard `resolve`
     * and `reject` parameters from an enclosing Promise.
     */
    handleAxiosError(response: AxiosResponse, url: string, defaultValue: any, cb: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void): any;
    plutoDeliverablesLoad(url: string): Promise<BaseDeliverable | undefined>;
    /**
     * generic function to load in data from either project or commission endpoints in pluto-core
     * @param url url to load
     */
    plutoCoreLoad(url: string): Promise<UsefulServerData>;
    loadCommissionData(): Promise<void>;
    loadProjectData(): Promise<void>;
    loadMasterData(): Promise<void>;
    /**
     * master load function that hands off to specific ones
     */
    loadData(): Promise<void>;
    componentDidUpdate(prevProps: Readonly<BreadcrumbProps>, prevState: Readonly<BreadcrumbState>, snapshot?: any): void;
    componentDidMount(): void;
    render(): JSX.Element;
}
export { Breadcrumb };

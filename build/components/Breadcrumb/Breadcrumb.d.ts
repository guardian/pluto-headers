import React from "react";
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
    componentDidMount(): void;
    render(): JSX.Element;
}
export { Breadcrumb };

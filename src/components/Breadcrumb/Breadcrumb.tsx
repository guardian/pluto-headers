import React from "react";
import axios, {AxiosError, AxiosResponse} from "axios";
import "./Breadcrumb.css";
import IconCommission from "../../static/c.svg";
import IconProject from "../../static/p.svg";
import IconMaster from "../../static/m.svg";
import {Link} from "@material-ui/core";
import { ChevronRightRounded} from "@material-ui/icons";
import {file_basename} from "./helperfuncs";

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

class Breadcrumb extends React.Component<BreadcrumbProps, BreadcrumbState> {
  constructor(props: BreadcrumbProps) {
    super(props);

    this.state = {
      hasError: false,
      loading: false,
      projectName: "",
      commissionName: "",
      masterName: "",
      commissionId: undefined,
      projectId: undefined
    };
  }

  /**
   * implement an error boundary so we can't break the rest of the UI
   * @param error
   */
  static getDerivedStateFromError(error: any) {
    return { loading: false, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "An uncaught error happened in the Breadcrumb component ",
      error,
      errorInfo
    );
  }

  /**
   * return a promise that completes when state change is complete
   */
  setStatePromise(newState: any): Promise<void> {
    return new Promise((resolve, reject) =>
      this.setState(newState, () => resolve())
    );
  }

  /**
   * Handles an error object returned from axios. This will handle regular HTTP error codes and retry or return a rejected
   * response as appropriate
   * @param response err.response, where err is the error object from axios
   * @param url the url that was called
   * @param defaultValue return this value if the error was a 404 Not Found
   * @param cb callback that is invoked after a delay, in order to retry the operation. This is passed standard `resolve`
   * and `reject` parameters from an enclosing Promise.
   */
  handleAxiosError(response:AxiosResponse, url:string, defaultValue:any, cb:(resolve: (value?: unknown) => void, reject: (reason?: any) => void)=>void) {
    switch (response.status) {
      case 404:
        return defaultValue;
      case 503:
      case 504:
        console.info(`${url} is not responding, retrying...`);

        return new Promise((resolve, reject) => {
          window.setTimeout(() => cb(resolve, reject), 2000);
        });
      default:
        break;
    }
  }

  async plutoDeliverablesLoad(url: string):Promise<BaseDeliverable|undefined> {
    try {
      const response = await axios.get(url);
      if(response.data) {
        return response.data as BaseDeliverable;
      } else {
        return undefined;
      }
    } catch(err: unknown) {
      const e = err as AxiosError
      if(e.response) {
        return this.handleAxiosError(e.response, url, undefined, (resolve, reject)=>{
          this.plutoDeliverablesLoad(url)
              .then((result)=>resolve(result))
              .catch((err)=>reject(err));
        })
      }
    }
  }

  /**
   * generic function to load in data from either project or commission endpoints in pluto-core
   * @param url url to load
   */
  async plutoCoreLoad(url: string): Promise<UsefulServerData> {
    try {
      const response = await axios.get(url);
      if (response.data && response.data.result && response.data.result.title) {
        return {
          title: response.data.result.title,
          workingGroupId: response.data.result.workingGroupId,
          commissionId: response.data.result.commissionId ?? response.data.id,
        };
      } else {
        return {
          title: "(none)",
        };
      }
    } catch (err) {
      const e = err as AxiosError
      if (e.response) { //the exception is an axios error
        return this.handleAxiosError(e.response, url, {
          title: "(none)",
        }, (resolve,reject)=>{
            this.plutoCoreLoad(url)
                .then((result) => resolve(result))
                .catch((err) => reject(err));
        })
      } else {  //something else bad happened
        console.error(err);
        throw "Could not load pluto-core data";
      }
    }
  }

  async loadCommissionData(): Promise<void> {
    await this.setStatePromise({ loading: true });
    //I could do the whole type-registration thing and validate it for the data, but really we are only interested
    //in a field or two so I might as well do it manually.
    const url = `${this.props.plutoCoreBaseUri ?? "/pluto-core"}/api/pluto/commission/${this.props.commissionId}`;

    try {
      const serverContent = await this.plutoCoreLoad(url);
      return this.setStatePromise({
        loading: false,
        commissionName: serverContent.title,
      });
    } catch (err) {
      return this.setStatePromise({ loading: false, hasError: true });
    }
  }

  async loadProjectData(): Promise<void> {
    await this.setStatePromise({ loading: true });
    const url = `${this.props.plutoCoreBaseUri ?? "/pluto-core"}/api/project/${this.props.projectId}`;

    try {
      const serverContentProject = await this.plutoCoreLoad(url);
      if (serverContentProject.commissionId) {
        const commissionUrl = `${this.props.plutoCoreBaseUri ?? "/pluto-core"}/api/pluto/commission/${serverContentProject.commissionId}`;
        const serverContentComm = await this.plutoCoreLoad(commissionUrl);
        return this.setStatePromise({
          loading: false,
          commissionName: serverContentComm.title,
          commissionId: serverContentProject.commissionId,
          projectName: serverContentProject.title,
        });
      } else {
        return this.setStatePromise({
          loading: false,
          projectName: serverContentProject.title,
        });
      }
    } catch(err: unknown) {
      const e = err as any
      console.error("Could not load project data: ", e);
      return this.setStatePromise({ loading: false, hasError: true });
    }
  }

  async loadMasterData(): Promise<void> {
    await this.setStatePromise({ loading: true });
    const url = `/deliverables/api/asset/${this.props.masterId}`;

    try {
      const deliverableData = await this.plutoDeliverablesLoad(url);
      return this.setStatePromise({
        loading: false,
        masterName: deliverableData ? `${deliverableData.type_string} ${file_basename(deliverableData.filename)}` : "(no master)"
      });
    } catch(err) {
      console.error("Could not load deliverables data: ", err);
      return this.setStatePromise({loading: false, hasError: true});
    }
  }

  /**
   * master load function that hands off to specific ones
   */
  async loadData() {
    if (this.props.masterId) {
      await this.loadMasterData();  //don't break here; we want project/commission id too
    }

    if (this.props.projectId) {
      return this.loadProjectData();
    } else if (this.props.commissionId) {
      return this.loadCommissionData();
    }

    if(!this.props.projectId && !this.props.commissionId && !this.props.masterId) {
      console.error(
        "Breadcrumb component has no master, project nor commission id."
      );
    }
  }

  componentDidUpdate(prevProps: Readonly<BreadcrumbProps>, prevState: Readonly<BreadcrumbState>, snapshot?: any) {
    if(prevProps!=this.props) this.loadData();
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="breadcrumb-container">
          <p>Could not load location data</p>
        </div>
      );
    } else {
      return (
        <div className="breadcrumb-container">
          {this.state.commissionName == "" ? null : (
            <div className="breadcrumb">
              <IconCommission style={{height: "40px", paddingRight: "0.2em"}}/>
              <Link href={`${this.props.plutoCoreBaseUri ?? "/pluto-core"}/commission/${this.props.commissionId ?? this.state.commissionId}`} className="breadcrumb-text">{this.state.commissionName}</Link>
              {
                this.state.projectName=="" ? null : <ChevronRightRounded style={{color: "#888888", height: "40px", width:"40px"}}/>
              }
            </div>
          )}
          {this.state.projectName == "" ? null : (
            <div className="breadcrumb">
              <IconProject style={{height: "40px", paddingRight: "0.2em"}}/>
              <Link href={`${this.props.plutoCoreBaseUri ?? "/pluto-core"}/project/${this.props.projectId ?? this.state.projectId}`} className="breadcrumb-text">{this.state.projectName}</Link>
              {
                this.state.masterName=="" ? null : <ChevronRightRounded style={{color: "#888888", height: "40px", width:"40px"}}/>
              }
            </div>
          )}
          {this.state.masterName == "" ? null : (
            <div className="breadcrumb">
              <IconMaster style={{height: "40px", paddingRight: "0.2em"}}/>
              <p className="breadcrumb-text">{this.state.masterName}</p>
            </div>
          )}
        </div>
      );
    }
  }
}

export { Breadcrumb };

import React from "react";
import axios from "axios";
import { Typography } from "@material-ui/core";
import "./Breadcrumb.css";
import iconCommission from "../../static/icon_commission.png";
import iconProject from "../../static/icon_project.png";
import iconMaster from "../../static/icon_master.png";
import iconBreadcrumbArrow from "../../static/breadcrumb_arrow_lightgray.png";

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
}

interface UsefulServerData {
  projectId?: number;
  commissionId?: number;
  title: string;
  workingGroupId?: number;
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
   * generic function to load in data from either project or commission endpoints in pluto-core
   * @param url url to load
   */
  async plutoCoreLoad(url: string): Promise<UsefulServerData> {
    try {
      const response = await axios.get(url);
      if (response.data && response.data.result && response.data.result.title) {
        return {
          title: response.data.result.title,
          workingGroupId: response.data.workingGroupId,
          commissionId: response.data.id,
        };
      } else {
        return {
          title: "(none)",
        };
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            console.info("No data existed for the url ", url);
            return {
              title: "(none)",
            };
          case 503 | 504:
            console.info("pluto-core is not responding, retrying...");

            return new Promise((resolve, reject) => {
              window.setTimeout(() => {
                this.plutoCoreLoad(url)
                  .then((result) => resolve(result))
                  .catch((err) => reject(err));
              }, 2000);
            });
          default:
            break;
        }

        throw "Could not load pluto-core data";
      }
    }
    return {
      title: "(none)",
    }; //we shouldn't get here but the compiler wants a return
  }

  async loadCommissionData(): Promise<void> {
    await this.setStatePromise({ loading: true });
    //I could do the whole type-registration thing and validate it for the data, but really we are only interested
    //in a field or two so I might as well do it manually.
    const url = `/pluto-core/api/pluto/commission/${this.props.commissionId}`;

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
    const url = `/pluto-core/api/project/${this.props.commissionId}`;

    try {
      const serverContentProject = await this.plutoCoreLoad(url);
      if (serverContentProject.commissionId) {
        const commissionUrl = `/pluto-core/api/pluto/commission/${serverContentProject.commissionId}`;
        const serverContentComm = await this.plutoCoreLoad(commissionUrl);
        return this.setStatePromise({
          loading: false,
          commissionName: serverContentComm.title,
          projectName: serverContentProject.title,
        });
      } else {
        return this.setStatePromise({
          loading: false,
          projectName: serverContentProject.title,
        });
      }
    } catch (err) {
      console.error("Could not load project data: ", err);
      return this.setStatePromise({ loading: false, hasError: true });
    }
  }

  async loadMasterData(): Promise<void> {
    await this.setStatePromise({ loading: true });
    const url = `/deliverables/api/asset/${this.props.masterId}`;

    console.log("loadMasterData not implemented yet");
    return this.setStatePromise({ loading: false, hasError: true });
  }

  /**
   * master load function that hands off to specific ones
   */
  async loadData() {
    if (this.props.masterId) {
      return this.loadMasterData();
    } else if (this.props.projectId) {
      return this.loadProjectData();
    } else if (this.props.commissionId) {
      return this.loadCommissionData();
    } else {
      console.error(
        "Breadcrumb component has no master, project nor commission id."
      );
    }
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
              <img
                className="breadcrumb-icon"
                src={iconCommission}
                alt="Commission"
              />
              <p className="breadcrumb-text">{this.state.commissionName}</p>
              {
                this.state.projectName=="" ? null : <img className="breadcrumb-arrow" src={iconBreadcrumbArrow} alt=">"/>
              }
            </div>
          )}
          {this.state.projectName == "" ? null : (
            <div className="breadcrumb">
              <img
                className="breadcrumb-icon"
                src={iconProject}
                alt="Project"
              />
              <p className="breadcrumb-text">{this.state.projectName}</p>
              {
                this.state.masterName=="" ? null : <img className="breadcrumb-arrow" src={iconBreadcrumbArrow} alt=">"/>
              }
            </div>
          )}
          {this.state.masterName == "" ? null : (
            <div className="breadcrumb">
              <img className="breadcrumb-icon" src={iconMaster} alt="Master" />
              <p className="breadcrumb-text">{this.state.masterName}</p>
            </div>
          )}
        </div>
      );
    }
  }
}

export { Breadcrumb };

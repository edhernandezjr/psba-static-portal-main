import { WebPartContext } from '@microsoft/sp-webpart-base';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IMib, IDeviceData, ISiteLayout } from './StaticPortal.data.types';

export interface IStaticPortalProps {
  /**
   * Web part context
   */
  context: WebPartContext;

  /**
   * SPFx web part context property indicating whether it is in edit more or not
   */
  displayMode: DisplayMode;

  /**
   * Method to set the title in the @pnp/spfx-controls-react WebPartTitle component
   */
  updateTitleProperty: (value: string) => void;

  /**
   * Title in the WebPartTitle component
   */
  title: string;

  /**
   * Where data is stored
   */
  dataServerRelativePath: string;

  /**
   * List of devices
   */
  deviceListId: string;

  /**
   * Site name
   */
  siteName: string;

  /**
   * Site layout configuration, saved as JSON string
   */
  siteLayout: string;

  /**
   * Updates configuration which is stored in the web part instance
   */
  updateSiteLayoutProperty: (site: ISiteLayout) => void;
}

export interface IStaticPortalState {
  /**
   * Data synced from Enigma into SharePoint location
   */
  siteNodeData: IDeviceData[];

  /**
   * Lates file in the JSON sync directory. Required to know when was last sync.
   */
  latestMibFile: any;
  
  /**
   * Data synced from Enigma into SharePoint location
   */
  nodeMibData: IMib[];

  /**
   * Site layout for display and editing
   */
  currentSiteLayout: ISiteLayout;

  /**
   * Poll for data retrieval
   */
  dataPoll: any;

  /**
   * Data is due for refresh
   */
  refreshDataPoll: boolean;

  /**
   * Fullscreen state
   */
  isFullscreen: boolean;
}

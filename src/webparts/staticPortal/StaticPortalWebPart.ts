import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import {
  PropertyFieldListPicker,
  PropertyFieldListPickerOrderBy
} from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp/presets/all';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';

import * as strings from 'StaticPortalWebPartStrings';
import StaticPortal from './components/StaticPortal';
import { IStaticPortalProps } from './components/StaticPortal.types';
import { ISiteLayout } from './components/StaticPortal.data.types';

import { compact, isEmpty, sortBy, uniq } from 'lodash';

export interface IStaticPortalWebPartProps {
  displayMode: DisplayMode;
  title: string;
  dataServerRelativePath: string;
  deviceListId: string;
  siteName: string;
  siteLayout: string;
}

export default class StaticPortalWebPart extends BaseClientSideWebPart<IStaticPortalWebPartProps> {
  private siteOptions: IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<IStaticPortalProps> = React.createElement(
      StaticPortal,
      {
        title: this.properties.title,
        updateTitleProperty: (title: string) => {
          this.properties.title = title;
        },
        context: this.context,
        displayMode: this.displayMode,
        dataServerRelativePath: this.properties.dataServerRelativePath,
        deviceListId: this.properties.deviceListId,
        siteName: this.properties.siteName,
        siteLayout: this.properties.siteLayout,
        updateSiteLayoutProperty: (siteLayout: ISiteLayout) => {
          this.properties.siteLayout = JSON.stringify(siteLayout);
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected async onPropertyPaneConfigurationStart() {
    if (!isEmpty(this.properties.deviceListId)) {
      const data: any[] = await this.getDeviceData(
        this.properties.deviceListId
      );
      const sites = data.map((d) => {
        return d.site_name;
      });

      this.siteOptions = sortBy(compact(uniq(sites))).map((site) => {
        return {
          key: site,
          text: site
        };
      });

      this.context.propertyPane.refresh();
      this.render();
    }
  }

  protected async onPropertyPaneFieldChanged(
    propertyPath: string,
    oldValue: any,
    newValue: any
  ) {
    if (propertyPath === 'deviceListId') {
      const data: any[] = await this.getDeviceData(newValue);
      const sites = data.map((d) => {
        return d.site_name;
      });

      this.siteOptions = sortBy(compact(uniq(sites))).map((site) => {
        return {
          key: site,
          text: site
        };
      });
    }

    this.context.propertyPane.refresh();
    this.render();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldListPicker('deviceListId', {
                  label: strings.NodeListIdFieldLabel,
                  selectedList: this.properties.deviceListId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'deviceListIdPickerFieldId'
                }),
                PropertyPaneTextField('dataServerRelativePath', {
                  label: strings.MibDataServerRelativePath
                }),
                PropertyPaneDropdown('siteName', {
                  label: 'Select a site',
                  options: this.siteOptions,
                  disabled: isEmpty(this.siteOptions)
                })
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Retrieves array of data
   *
   * @param serverRelativePath Path of JSON sync
   * @returns Array of data objects
   */
  private async getDeviceData(listId: string) {
    sp.setup({
      spfxContext: this.context
    });

    const data = await sp.web.lists.getById(listId).items.getAll();

    return data;
  }
}

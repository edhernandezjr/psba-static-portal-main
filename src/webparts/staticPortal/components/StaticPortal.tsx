import * as React from 'react';
import styles from './StaticPortal.module.scss';
import { IStaticPortalProps, IStaticPortalState } from './StaticPortal.types';
import {
  IEquipment,
  INode,
  IMib,
  ISiteLayout,
  NodeType,
  NodeTypeOptions
} from './StaticPortal.data.types';

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp/presets/all';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';

import {
  ActionButton,
  Dropdown,
  IconButton,
  Panel,
  PanelType,
  TextField
} from 'office-ui-fabric-react';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import { DisplayMode } from '@microsoft/sp-core-library';

import { filter, find, isEmpty, isEqual, remove } from 'lodash';
import { v4 } from 'uuid';
import * as moment from 'moment-timezone';

/**
 * Drag and drop UI
 */
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

/**
 * Custom portal components
 */
import { AddNodeButton } from './AddNodeButton';
import { Node } from './Node/Node';

export default class StaticPortal extends React.Component<
  IStaticPortalProps,
  IStaticPortalState
> {
  constructor(props) {
    super(props);

    this.state = {
      siteNodeData: [],
      latestMibFile: null,
      nodeMibData: [],
      currentSiteLayout: null,
      dataPoll: null,
      refreshDataPoll: false,
      isFullscreen: false
    };
  }

  public render(): React.ReactElement<IStaticPortalProps> {
    return (
      <div className={styles.staticPortal}>
        <WebPartTitle
          displayMode={this.props.displayMode}
          title={
            isEmpty(this.props.title) ? this.props.siteName : this.props.title
          }
          updateProperty={this.props.updateTitleProperty}
        />

        {this.props.displayMode === DisplayMode.Read && (
          <>
            <ActionButton
              iconProps={{
                iconName: !this.state.isFullscreen
                  ? 'FullScreen'
                  : 'BackToWindow'
              }}
              onClick={() => {
                this.setState({
                  isFullscreen: !this.state.isFullscreen
                });
              }}
              text={!this.state.isFullscreen ? 'Fullscreen' : 'Close'}
            />
            <div className={styles.lastSynced}>Last synced: {this.getLastSyncedDataTime()}</div>
            <div className={styles.equipmentRow}>
              {!isEmpty(this.state.currentSiteLayout) &&
                !isEmpty(this.state.currentSiteLayout.equipment) &&
                this.state.currentSiteLayout.equipment.map(
                  (equipment, index) => {
                    return (
                      <div key={equipment.id} className={styles.equipment}>
                        <div className={styles.equipmentInner}>
                          <h2>{equipment.label}</h2>
                          <div className={styles.equipmentNodes}>
                            {!isEmpty(equipment.nodes) &&
                              equipment.nodes.map((node) => {
                                return (
                                  <Node
                                    key={node.id}
                                    node={node}
                                    data={this.getNodeMibData(
                                      node.id,
                                      this.state.nodeMibData
                                    )}
                                  />
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
            <Panel
              type={PanelType.smallFluid}
              isOpen={this.state.isFullscreen}
              onDismiss={() => {
                this.setState({
                  isFullscreen: false
                });
              }}
            >
              <WebPartTitle
                displayMode={this.props.displayMode}
                title={
                  isEmpty(this.props.title)
                    ? this.props.siteName
                    : this.props.title
                }
                updateProperty={this.props.updateTitleProperty}
              />
              <div className={styles.lastSynced}>Last synced: {this.getLastSyncedDataTime()}</div>
              <div className={styles.staticPortal}>
                <div className={styles.equipmentRow}>
                  {!isEmpty(this.state.currentSiteLayout) &&
                    !isEmpty(this.state.currentSiteLayout.equipment) &&
                    this.state.currentSiteLayout.equipment.map(
                      (equipment, index) => {
                        return (
                          <div key={equipment.id} className={styles.equipment}>
                            <div className={styles.equipmentInner}>
                              <h2>{equipment.label}</h2>
                              <div className={styles.equipmentNodes}>
                                {!isEmpty(equipment.nodes) &&
                                  equipment.nodes.map((node) => {
                                    return (
                                      <Node
                                        key={node.id}
                                        node={node}
                                        data={this.getNodeMibData(
                                          node.id,
                                          this.state.nodeMibData
                                        )}
                                      />
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </Panel>
          </>
        )}
        {this.props.displayMode === DisplayMode.Edit && (
          <>
            <ActionButton
              onClick={() => this.addEquipment()}
              iconProps={{ iconName: 'Add' }}
            >
              Add equipment
            </ActionButton>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <div>
                <Droppable droppableId={v4()}>
                  {(dropProvided, dropSnapshot) => (
                    <div
                      ref={dropProvided.innerRef}
                      {...dropProvided.droppableProps}
                      className={styles.equipmentRow}
                    >
                      {!isEmpty(this.state.currentSiteLayout) &&
                        !isEmpty(this.state.currentSiteLayout.equipment) &&
                        this.state.currentSiteLayout.equipment.map(
                          (equipment, index) => {
                            return this.renderEquipment(equipment, index);
                          }
                        )}
                      {dropProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          </>
        )}
      </div>
    );
  }

  public async componentDidMount() {
    const { context, deviceListId, siteName, dataServerRelativePath } =
      this.props;

    let siteNodeData = [];
    let latestMibFile = null;
    let nodeMibData = [];

    if (deviceListId) {
      siteNodeData = await this.getSiteListData(
        context,
        deviceListId,
        siteName
      );
    }

    if (dataServerRelativePath) {
      latestMibFile = await this.getLatestMibFile(
        context,
        dataServerRelativePath
      );

      nodeMibData = await this.getMibFileContent(
        context,
        latestMibFile,
        siteName
      );
    }

    const siteLayout: ISiteLayout = isEmpty(this.props.siteLayout)
      ? {
          siteName,
          equipment: []
        }
      : JSON.parse(this.props.siteLayout);

    let dataPoll = null;

    if (this.props.displayMode === DisplayMode.Read) {
       dataPoll = window.setTimeout(() => {
        this.setState({
          refreshDataPoll: true
        });
      }, 10000);
    }

    console.dir(dataPoll);

    this.setState({
      siteNodeData,
      latestMibFile,
      nodeMibData,
      currentSiteLayout: siteLayout,
      dataPoll
    });
  }

  public async componentDidUpdate(
    prevProps: IStaticPortalProps,
    prevState: IStaticPortalState
  ) {
    if (!isEqual(this.props.siteLayout, prevProps.siteLayout)) {
      this.setState({
        currentSiteLayout: JSON.parse(this.props.siteLayout)
      });
    }

    if (!isEqual(this.props.displayMode, prevProps.displayMode)) {
      let dataPoll = null;

      if (this.props.displayMode === DisplayMode.Read) {
        dataPoll = window.setTimeout(() => {
          this.setState({
            refreshDataPoll: true
          });
        }, 10000);
      }
      else {
        window.clearTimeout();
      }

      this.setState({
        dataPoll
      });
    }

    if (
      !isEqual(this.state.refreshDataPoll, prevState.refreshDataPoll) &&
      this.state.refreshDataPoll
    ) {
      const { context, siteName, dataServerRelativePath } = this.props;
      
      if (siteName && dataServerRelativePath) {
        const latestMibFile = await this.getLatestMibFile(
          context,
          dataServerRelativePath
        );

        const nodeMibData = await this.getMibFileContent(
          context,
          latestMibFile,
          siteName
        );
       
        const dataPoll = window.setTimeout(() => {
          this.setState({
            refreshDataPoll: true
          });
        }, 10000);

        this.setState({
          latestMibFile,
          nodeMibData,
          dataPoll,
          refreshDataPoll: false
        });
      }
    }

    if (!isEqual(this.props.siteName, prevProps.siteName)) {
      const { context, siteName, dataServerRelativePath, deviceListId } =
        this.props;

      const siteNodeData = await this.getSiteListData(
        context,
        deviceListId,
        siteName
      );

      const latestMibFile = await this.getLatestMibFile(
        context,
        dataServerRelativePath
      );

      const nodeMibData = await this.getMibFileContent(
        context,
        latestMibFile,
        siteName
      );

      this.setState({
        latestMibFile,
        nodeMibData,
        siteNodeData
      });
    }
  }

  private onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    let reorderedLayout = { ...this.state.currentSiteLayout };

    if (result.type === 'NODE') {
      reorderedLayout = this.reorderNodes(this.state.currentSiteLayout, result);
    } else {
      reorderedLayout = this.reorderEquipment(
        this.state.currentSiteLayout,
        result
      );
    }

    this.props.updateSiteLayoutProperty(reorderedLayout);

    this.setState({
      currentSiteLayout: reorderedLayout
    });
  }

  private renderEquipment(equipment: IEquipment, index: number): JSX.Element {
    return (
      <Draggable draggableId={equipment.id} index={index} key={equipment.id}>
        {(dragProvided, dragSnapshot) => (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            className={styles.equipment}
          >
            <IconButton
              iconProps={{ iconName: 'Delete' }}
              onClick={() => {
                this.removeEquipment(equipment.id);
              }}
            />
            <div style={{ padding: '0 20px' }}>
              <TextField
                value={equipment.label}
                onChange={(ev, newValue) => {
                  this.setEquipmentLabel(equipment.id, newValue);
                }}
              />
              <AddNodeButton
                onAdd={this.addNode}
                equipment={equipment}
                nodeData={this.state.siteNodeData}
                mibData={this.state.nodeMibData}
                siteLayout={this.state.currentSiteLayout}
              />
            </div>

            <div className={styles.equipmentInner}>
              <Droppable droppableId={equipment.id} key={index} type='NODE'>
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className={styles.nodeDropzone}
                  >
                    <div className={styles.nodes}>
                      {!isEmpty(equipment.nodes) &&
                        equipment.nodes.map((node: any, nodeIndex: number) => {
                          return this.renderNode(node, nodeIndex);
                        })}
                      {dropProvided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  private renderNode(node: INode, index: number): JSX.Element {
    const nodeData = this.getNodeMibData(node.id, this.state.nodeMibData);
    const nodeComponent: JSX.Element = (
      <div
        style={{
          padding: 20,
          marginBottom: 20,
          marginLeft: 10,
          marginRight: 10,
          cursor: 'pointer',
          background: '#eeeeee'
        }}
      >
        <table>
          <tbody>
            <tr>
              <th>hst_namea</th>
              <td>{!isEmpty(nodeData) && nodeData[0].hst_namea}</td>
            </tr>
            <tr>
              <th>typ_dsc</th>
              <td>{!isEmpty(nodeData) && nodeData[0].typ_dsc}</td>
            </tr>
            <tr>
              <th>upsmib_dsc</th>
              <td>{!isEmpty(nodeData) && nodeData[0].upsmib_dsc}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <Dropdown
            label='Node type display'
            options={NodeTypeOptions}
            selectedKey={node.type}
            onChange={(ev, option) => {
              this.setNodeType(node.id, option.key as NodeType);
            }}
          />
        </div>
      </div>
    );

    return (
      <Draggable draggableId={node.id} index={index} key={node.id}>
        {(dragProvided, dragSnapshot) => (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            className={styles.nodeWrapper}
          >
            <IconButton
              iconProps={{ iconName: 'Delete' }}
              onClick={() => {
                this.removeNode(node.id);
              }}
            />
            <div key={`node-${index}`}>{nodeComponent}</div>
          </div>
        )}
      </Draggable>
    );
  }

  /**
   * Processes file JSON file content into array of MIBs
   *
   * @param context - Web part context
   * @param file - File object
   * @param siteName - Site name
   * @returns array of MIBs
   */
  private async getMibFileContent(
    context: WebPartContext,
    file: any,
    siteName: string
  ) {
    sp.setup({
      spfxContext: context
    });

    const dataText: any = await sp.web
      .getFileByServerRelativeUrl(file.ServerRelativeUrl)
      .getText();

    let data: any[] = JSON.parse(dataText.replace(/(\r\n|\n|\r)/gm, ''));
    data = filter(data, ['site_name', siteName]);

    return data;
  }

  private async getLatestMibFile(
    context: WebPartContext,
    serverRelativePath: string
  ) {
    sp.setup({
      spfxContext: context
    });
    const latestDataFile: any = await sp.web
      .getFolderByServerRelativePath(serverRelativePath)
      .files.orderBy('TimeCreated', false)
      .top(1)
      .get();

    if (!isEmpty(latestDataFile)) {
      return latestDataFile[0];
    }

    return null;
  }

  private async getSiteListData(
    context: WebPartContext,
    listId: string,
    siteName: string
  ) {
    sp.setup({
      spfxContext: context
    });

    const today = new Date();
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let items = await sp.web.lists
      .getById(listId)
      .items.filter(`site_name eq '${siteName}'`)
      .top(2000)
      .getPaged();

    let data = items.results;
    let hasNext = items.hasNext;

    while (hasNext) {
      if (items) {
        items = await items.getNext();
        data = data.concat(items.results);
        hasNext = items.hasNext;
      }
    }

    return data;
  }

  /**
   *
   * @param id Node ID (Formatted as: 'nodeData.hst_namea nodeData.upsmib_dsc')
   * @param siteNodeData Data synced from Enigma into SharePoint location
   * @returns
   */
  private getNodeMibData(id: string, siteNodeData: IMib[]) {
    const node = filter(siteNodeData, (nodeData) => {
      return id === `${nodeData.hst_namea} ${nodeData.upsmib_dsc}`;
    });

    return node;
  }

  /**
   * Reorder equipement on drag and drop
   *
   * @param siteLayout Site layout
   * @param result Result of drag and drop action
   * @returns Updated site layout
   */
  private reorderEquipment(siteLayout: ISiteLayout, result: any) {
    const [removed] = siteLayout.equipment.splice(result.source.index, 1);
    siteLayout.equipment.splice(result.destination.index, 0, removed);

    return siteLayout;
  }

  /**
   * Reorder nodes (within same equipment or another) on drag and drop
   *
   * @param siteLayout Site layout
   * @param result Result of drag and drop action
   * @returns Updated site layout
   */
  private reorderNodes(siteLayout: ISiteLayout, result: any) {
    const source = result.source;
    const destination = result.destination;

    /**
     * Node source
     */
    const sourceEquipment: any = find(siteLayout.equipment, [
      'id',
      source.droppableId
    ]);

    /**
     * The Node to be relocated
     */
    const target = find(sourceEquipment.nodes, {
      id: result.draggableId
    });

    /**
     * Drop destination
     */
    const destinationEquipment: any = find(siteLayout.equipment, [
      'id',
      destination.droppableId
    ]);

    sourceEquipment.nodes.splice(source.index, 1);
    destinationEquipment.nodes.splice(destination.index, 0, target);

    return siteLayout;
  }

  /**
   * Creates new equipment object in site layout
   *
   * @param index Position to add equipment (Optional)
   */
  private addEquipment(index: number = 0) {
    let { equipment } = this.state.currentSiteLayout;

    if (index === equipment.length) {
      /**
       * Add section to the end
       */
      equipment.push({
        id: v4(),
        nodes: []
      });
    } else {
      if (index === 0) {
        /**
         * Add section at the top
         */
        equipment.unshift({ id: v4(), nodes: [] });
      } else {
        /**
         * Add section at the bottom of the current section
         */
        equipment.splice(index, 0, { id: v4(), nodes: [] });
      }
    }

    this.props.updateSiteLayoutProperty(this.state.currentSiteLayout);
    this.forceUpdate();
  }

  /**
   * Remove equipment from layout
   *
   * @param equipmentId ID of equipment to be remove
   */
  private removeEquipment(equipmentId) {
    let { equipment } = this.state.currentSiteLayout;

    equipment = remove(equipment, ['id', equipmentId]);

    this.props.updateSiteLayoutProperty(this.state.currentSiteLayout);
    this.forceUpdate();
  }

  /**
   * Set equipment label
   *
   * @param equipmentId ID of equipment
   * @param label Label
   */
  private setEquipmentLabel(equipmentId: string, label: string) {
    let equipment = find(this.state.currentSiteLayout.equipment, [
      'id',
      equipmentId
    ]);

    equipment.label = label;

    this.props.updateSiteLayoutProperty(this.state.currentSiteLayout);
    this.forceUpdate();
  }

  /**
   * Add node to equipment
   *
   * @param nodeId Node ID (Formatted as: 'nodeData.hst_namea nodeData.upsmib_dsc')
   * @param equipmentId Target equipment
   */
  private addNode = (nodeId, equipmentId) => {
    let { nodes } = find(this.state.currentSiteLayout.equipment, [
      'id',
      equipmentId
    ]);

    nodes.push({
      id: nodeId
    });

    this.props.updateSiteLayoutProperty(this.state.currentSiteLayout);
    this.forceUpdate();
  }

  /**
   * Remove node from layout
   *
   * @param nodeId ID of node to be removed
   */
  private removeNode(nodeId) {
    for (
      let count = 0;
      count < this.state.currentSiteLayout.equipment.length;
      count++
    ) {
      const equipment = find(this.state.currentSiteLayout.equipment, [
        'id',
        this.state.currentSiteLayout.equipment[count].id
      ]);

      let { nodes } = equipment;
      nodes = remove(equipment.nodes, (node) => {
        return node.id === nodeId;
      });
    }

    this.props.updateSiteLayoutProperty(this.state.currentSiteLayout);
    this.forceUpdate();
  }

  /**
   * Set layout type for node
   *
   * @param nodeId Node ID (Formatted as: 'nodeData.hst_namea nodeData.upsmib_dsc')
   * @param type Node type selected from dropdown
   */
  private setNodeType(nodeId: string, type: NodeType) {
    const node = this.getNodeInLayout(nodeId);
    node.type = type;

    this.props.updateSiteLayoutProperty(this.state.currentSiteLayout);
    this.forceUpdate();
  }

  /**
   * Retrieves a specific node from the layout
   *
   * @param nodeId Node ID (Formatted as: 'nodeData.hst_namea nodeData.upsmib_dsc')
   * @returns Node in layout
   */
  private getNodeInLayout(nodeId: string) {
    let node: INode;

    for (
      let count = 0;
      count < this.state.currentSiteLayout.equipment.length;
      count++
    ) {
      const equipment = find(this.state.currentSiteLayout.equipment, [
        'id',
        this.state.currentSiteLayout.equipment[count].id
      ]);

      let { nodes } = equipment;
      node = find(nodes, ['id', nodeId]);

      if (node) {
        return node;
      }
    }

    return node;
  }

  /**
   * Retrieves the date time of the last JSON sync
   *
   * @returns Date time string of the last JSON sync
   */
  private getLastSyncedDataTime() {
    const { latestMibFile } = this.state;

    if (!isEmpty(latestMibFile)) {
      return moment(latestMibFile.TimeCreated).format('h:mm:ssa DD/MM/YY');
    }

    return;
  }
}

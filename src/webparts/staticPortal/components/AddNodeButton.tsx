/**
 * Add node
 *
 * Select node type
 *
 * Select specific node
 *
 * Select display
 */
import * as React from 'react';
/**
 * UI Fabric
 */
import {
  ActionButton,
  PrimaryButton,
  Callout,
  IDropdownOption,
  Dropdown,
  DropdownMenuItemType
} from 'office-ui-fabric-react';

import { compact, find, filter, isEmpty, sortBy, uniqWith, isEqual } from 'lodash';

import {
  IEquipment,
  IMib,
  IDeviceData,
  ISiteLayout
} from './StaticPortal.data.types';

interface IAddNodeButtonProps {
  onAdd: (nodeId: string, equipmentId: string) => void;
  siteLayout: ISiteLayout;
  equipment: IEquipment;
  nodeData: IDeviceData[];
  mibData: IMib[];
}

interface IAddNodeButtonState {
  nodeOptions: IDropdownOption[];
  selectedNodeKey: string;
  showCallout: boolean;
}

export class AddNodeButton extends React.Component<
  IAddNodeButtonProps,
  IAddNodeButtonState
> {
  private addButtonElement = React.createRef<HTMLSpanElement>();

  constructor(props: IAddNodeButtonProps) {
    super(props);

    this.state = {
      nodeOptions: [],
      selectedNodeKey: '',
      showCallout: false
    };
  }

  public render() {
    return (
      <span ref={this.addButtonElement}>
        <ActionButton
          iconProps={{ iconName: 'Add' }}
          onClick={this.toggleCallout}
        >
          Add new node
        </ActionButton>
        <Callout
          hidden={!this.state.showCallout}
          calloutMaxWidth={580}
          target={this.addButtonElement.current}
          onDismiss={this.onCalloutDismiss}
        >
          <div style={{ padding: '0 10px 10px', minWidth: 300 }}>
            <Dropdown
              label='Node'
              options={this.state.nodeOptions}
              placeholder='Select node'
              selectedKey={this.state.selectedNodeKey}
              onChange={(ev, option) => {
                this.setState({
                  selectedNodeKey: option.key as string
                });
              }}
              styles={{
                root: {
                  marginBottom: 8
                },
                callout: {
                  minWidth: 500
                }
              }}
            />
            <PrimaryButton
              onClick={() => {
                this.addNode();
              }}
              disabled={isEmpty(this.state.selectedNodeKey)}
            >
              Add to equipment
            </PrimaryButton>
          </div>
        </Callout>
      </span>
    );
  }

  public componentDidMount() {
    this.initNodeOptions();
  }

  public componentDidUpdate(prevProps, prevState) {
    if(!isEqual(prevProps, this.props)) {
      this.initNodeOptions();
    }
  }

  private initNodeOptions() {
    const nodeOptions = this.getNodeOptions();

    this.setState({
      nodeOptions
    });
  }

  private toggleCallout = () => {
    const nodeOptions = this.getNodeOptions();

    this.setState({
      showCallout: !this.state.showCallout,
      nodeOptions
    });
  }

  private onCalloutDismiss = () => {
    this.setState({
      showCallout: false,
      selectedNodeKey: '',
      nodeOptions: []
    });
  }

  /**
   * Add node to layout, resets the state of component
   */
  private addNode = () => {
    this.props.onAdd(this.state.selectedNodeKey, this.props.equipment.id);

    this.setState({
      showCallout: false,
      selectedNodeKey: '',
      nodeOptions: []
    });
  }

  /**
   * Creates an array of node dropdown options from synced data
   *
   * @returns Array of dropdown options for nodes (with existing nodes disabled)
   */
  private getNodeOptions() {
    const { nodeData, mibData } = this.props;
    let nodeOptions: IDropdownOption[] = [];

    nodeData.forEach((node, index) => {
      nodeOptions.push({
        key: `${node.hst_namea} ${node.hst_dsc}`,
        text: `${node.hst_namea} ${node.hst_dsc}`,
        itemType: DropdownMenuItemType.Header
      });

      const mibs = filter(mibData, ['hst_namea', node.hst_namea]);

      mibs.forEach((mib) => {
        nodeOptions.push({
          key: `${mib.hst_namea} ${mib.upsmib_dsc}`,
          text: `${mib.upsmib_dsc}`,
          disabled: this.doesExist(`${mib.hst_namea} ${mib.upsmib_dsc}`)
        });
      });
      
      nodeOptions.push({
        key: `divider-${index}`,
        text: '',
        itemType: DropdownMenuItemType.Divider
      });
    }); 

    nodeOptions = sortBy(compact(uniqWith(nodeOptions, isEqual)));

    return nodeOptions;
  }

  /**
   * Check if node was added to layout
   *
   * @param nodeId
   * @returns true if node is already added to layout
   */
  private doesExist(mibID: string) {
    let exist = false;

    for (
      let count = 0;
      count < this.props.siteLayout.equipment.length;
      count++
    ) {
      const equipment = find(this.props.siteLayout.equipment, [
        'id',
        this.props.siteLayout.equipment[count].id
      ]);

      if (find(equipment.nodes, ['id', mibID])) {
        exist = true;
        break;
      }
    }

    return exist;
  }
}

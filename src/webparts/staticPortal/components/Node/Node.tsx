import * as React from 'react';

import { Toggle } from 'office-ui-fabric-react';
import { isEmpty, trim } from 'lodash';
import * as moment from 'moment-timezone';

import { INode, IMib, NodeType } from '../StaticPortal.data.types';
import styles from '../StaticPortal.module.scss';
import nodeStyles from './Node.module.scss';
import { NodeInfo } from './NodeInfo';

interface INodeProps {
  node: INode;
  data: IMib[];
}

interface INodeState {
  thresholdDsc: number[];
  thresholdVals: number[];
  isThresholdExceed: boolean;
  isActive: boolean;
}

export class Node extends React.Component<INodeProps, INodeState> {
  constructor(props: INodeProps) {
    super(props);

    this.state = {
      thresholdDsc: [],
      thresholdVals: [],
      isThresholdExceed: false,
      isActive: false
    };
  }

  public render() {
    return (
      <div className={styles.nodeWrapper}>
        <div className={nodeStyles.node}>{this.renderComponent()}</div>
      </div>
    );
  }

  public componentDidMount() {
    this.checkThreshold();
  }

  /**
   * Check threshold
   * - Logic can be use to uniquely identify threshold values and used for custom display of MIBs
   */
  private checkThreshold() {
    const { node, data } = this.props;
    let thresholdDsc = [];
    let thresholdVals = [];
    let isThresholdExceed = false;

    if (!isEmpty(data)) {
      const lastItem = data[data.length - 1];
      isThresholdExceed =
        lastItem.mib_col_exceed_threshold_flag === 'No' ? false : true;
      thresholdDsc = lastItem.upsmib_dsc_aux
        ? lastItem.upsmib_dsc_aux.split(',').filter((i) => parseInt(i))
        : [];
      thresholdVals = lastItem.mib_col_threshold
        ? lastItem.mib_col_threshold.split(',').filter((i) => parseInt(i))
        : [];

      if (node.type === NodeType.UPS) {
        thresholdDsc = thresholdDsc.map((v) => {
          return trim(v).substr(0, 1);
        });
      }

      this.setState({
        isThresholdExceed,
        thresholdDsc,
        thresholdVals
      });
    }
  }

  /**
   * Get value to latest data sync for MIB
   *
   * @returns value for display
   */
  private getValue() {
    const { data } = this.props;
    const lastItem = data[data.length - 1];

    if (lastItem) {
      return parseInt(lastItem.mib_col_current_val);
    }

    return 0;
  }

  private renderComponent() {
    const { node, data } = this.props;
    const { isThresholdExceed } = this.state;
    const lastItem = data[data.length - 1];

    switch (node.type) {
      case NodeType.FuelTankCapacity:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconFuelCapacity} />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>

            <div style={{ height: 153 }}>
              <div className={nodeStyles.batteryText}>
                Current %:
                <div className={nodeStyles.batteryValue}>
                  {this.getValue()}%
                </div>
              </div>

              <div className={nodeStyles.fuelGaugeContainer}>
                <div className={nodeStyles.fuelGauge}>
                  <div>
                    <div
                      className={nodeStyles.power}
                      style={{
                        width: `${this.getValue()}%`
                      }}
                    />
                    <div className={nodeStyles.wrapper}>
                      <div className={nodeStyles.segment} />
                      <div className={nodeStyles.segment} />
                      <div className={nodeStyles.segment} />
                      <div className={nodeStyles.segment} />
                      <div className={nodeStyles.segment} />
                    </div>
                  </div>
                </div>
              </div>
              <div className={nodeStyles.batteryMinMax}>
                <div>
                  <b>Min:</b> 0
                </div>
                <div>
                  <b>Max:</b> 100%
                </div>
              </div>
            </div>
          </div>
        );
      case NodeType.FuelTankRuntime:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconFuelRuntime} />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div style={{ height: 153 }}>
              <div className={nodeStyles.batteryText}>
                Current runtime:
                <div className={nodeStyles.batteryValue}>{this.getValue()}</div>
              </div>
              <div className={nodeStyles.nodeStatus}>
                <div className={nodeStyles.nodeStatusLabel}>
                  {isThresholdExceed ? 'On' : 'Off'}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    marginLeft: -22,
                    background: isThresholdExceed
                      ? `radial-gradient(#59b990, #227d57)`
                      : `radial-gradient(#bf322d, #88121d)`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      case NodeType.FuelTankRuntimeAlt:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconFuelRuntime} />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div style={{ height: 153 }}>
              <div className={nodeStyles.batteryText}>
                Current runtime:
                <div className={nodeStyles.batteryValue}>{this.getValue()}</div>
              </div>
              <div className={nodeStyles.nodeStatus}>
                <div
                  style={{
                    fontWeight: !isThresholdExceed ? 700 : 400,
                    color: !isThresholdExceed ? '#707070' : '#b2b2b2'
                  }}
                >
                  Off
                </div>
                <Toggle
                  checked={isThresholdExceed}
                  styles={{
                    root: {
                      marginLeft: 12,
                      marginRight: 12,
                      marginBottom: 0,
                      height: 36
                    },
                    pill: {
                      background: isThresholdExceed
                        ? `linear-gradient(to right, #59b990 20%, #227d57 100%)`
                        : `linear-gradient(to right, #88121d 20%, #bf322d 100%)`,
                      border: '2px solid #ccc',
                      boxShadow:
                        '0 1px 10px 0 rgba(0, 0, 0, .15), 0 1px 1px 0 rgba(0, 0, 0, .15)',
                      width: 80,
                      height: 36
                    },
                    thumb: {
                      background: '#fff',
                      width: 22,
                      height: 22
                    }
                  }}
                />
                <div
                  style={{
                    fontWeight: isThresholdExceed ? 700 : 400,
                    color: isThresholdExceed ? '#707070' : '#b2b2b2'
                  }}
                >
                  On
                </div>
              </div>
            </div>
          </div>
        );
      case NodeType.BatteryCapacity:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div
                  className={nodeStyles.psbaIconBattery}
                  style={{ fontSize: 18 }}
                />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div>
              <div className={nodeStyles.batteryText}>
                Current %:
                <div className={nodeStyles.batteryValue}>
                  {this.getValue()}%
                </div>
              </div>
              <div className={nodeStyles.gauge}>
                <div
                  className={nodeStyles.gaugeFill}
                  style={{
                    width: `${this.getValue()}%`
                  }}
                />
                <div className={nodeStyles.wrapper}>
                  <div className={nodeStyles.segment} />
                  <div className={nodeStyles.segment} />
                  <div className={nodeStyles.segment} />
                  <div className={nodeStyles.segment} />
                  <div className={nodeStyles.segment} />
                </div>
              </div>
              <div className={nodeStyles.batteryMinMax}>
                <div>
                  <b>Min:</b> 0
                </div>
                <div>
                  <b>Max:</b> 100%
                </div>
              </div>
            </div>
          </div>
        );
      case NodeType.BatteryRuntime:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconBatteryRuntime} />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div style={{ height: 153 }}>
              <div className={nodeStyles.batteryText}>
                Current runtime:
                <div className={nodeStyles.batteryValue}>{this.getValue()}</div>
              </div>
              <div className={nodeStyles.nodeStatus}>
                <div className={nodeStyles.nodeStatusLabel}>
                  {isThresholdExceed ? 'On' : 'Off'}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    marginLeft: -22,
                    background: isThresholdExceed
                      ? `radial-gradient(#59b990, #227d57)`
                      : `radial-gradient(#bf322d, #88121d)`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
        case NodeType.BatteryRuntimeAlt:
          return (
            <div className={nodeStyles.nodeWrapper}>
              <div>
                <div className={nodeStyles.nodeHeader}>
                  <div className={nodeStyles.psbaIconBatteryRuntime} />
                  <div className={nodeStyles.headerText}>{node.type}</div>
                </div>
                <NodeInfo data={lastItem} />
              </div>
              <div style={{ height: 153 }}>
                <div className={nodeStyles.batteryText}>
                  Current runtime:
                  <div className={nodeStyles.batteryValue}>{this.getValue()}</div>
                </div>
                <div className={nodeStyles.nodeStatus}>
                  <div
                    style={{
                      fontWeight: !isThresholdExceed ? 700 : 400,
                      color: !isThresholdExceed ? '#707070' : '#b2b2b2'
                    }}
                  >
                    Off
                  </div>
                  <Toggle
                    checked={isThresholdExceed}
                    styles={{
                      root: {
                        marginLeft: 12,
                        marginRight: 12,
                        marginBottom: 0,
                        height: 36
                      },
                      pill: {
                        background: isThresholdExceed
                          ? `linear-gradient(to right, #59b990 20%, #227d57 100%)`
                          : `linear-gradient(to right, #88121d 20%, #bf322d 100%)`,
                        border: '2px solid #ccc',
                        boxShadow:
                          '0 1px 10px 0 rgba(0, 0, 0, .15), 0 1px 1px 0 rgba(0, 0, 0, .15)',
                        width: 80,
                        height: 36
                      },
                      thumb: {
                        background: '#fff',
                        width: 22,
                        height: 22
                      }
                    }}
                  />
                  <div
                    style={{
                      fontWeight: isThresholdExceed ? 700 : 400,
                      color: isThresholdExceed ? '#707070' : '#b2b2b2'
                    }}
                  >
                    On
                  </div>
                </div>
              </div>
            </div>
          );
      case NodeType.Temperature:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconTemperature} />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div className={nodeStyles.temperatureDisplay}>
              <div className={nodeStyles.thermometer}>
                <div className={nodeStyles.ring}>
                  <div className={nodeStyles.dialBottom}></div>
                </div>
                <div className={nodeStyles.temperatureWrapper}>
                  <div
                    className={nodeStyles.pointer}
                    style={{
                      transform: `rotate(${
                        (this.getValue() / this.state.thresholdVals[0]) * 180 +
                        229
                      }deg)`
                    }}
                  ></div>
                  <div className={nodeStyles.temperature}>
                    {this.getValue()}°C
                  </div>
                </div>
              </div>
              <div className={nodeStyles.temperatureMinMax}>
                <div>
                  <strong>Min:</strong> 0°C
                </div>
                <div>
                  <strong>Max:</strong> {this.state.thresholdVals[0]}°C
                </div>
              </div>
            </div>
          </div>
        );
      case NodeType.TemperatureAlt:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconTemperature} />
                <div className={nodeStyles.headerText}>Temperature</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div>
              <div className={nodeStyles.batteryText}>
                Current %:
                <div className={nodeStyles.batteryValue}>
                  {this.getValue()}°C
                </div>
              </div>
              <div className={nodeStyles.gauge}>
                <div
                  className={nodeStyles.gaugeFill}
                  style={{
                    width: `${
                      (this.getValue() / this.state.thresholdVals[0]) * 100
                    }%`,
                    background: `linear-gradient(to right, #4cb0ed ${
                      100 -
                      (this.getValue() / this.state.thresholdVals[0]) * 100
                    }%,  #bf332d 100%)`
                  }}
                />
                <div className={nodeStyles.wrapper}></div>
              </div>
              <div className={nodeStyles.batteryMinMax}>
                <div>
                  <b>Min:</b> °C
                </div>
                <div>
                  <b>Max:</b> {this.state.thresholdVals[0]}°C
                </div>
              </div>
            </div>
          </div>
        );
      case NodeType.Humidity:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconHumidity} />
                <div className={nodeStyles.headerText}>{node.type}</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div>
              <div className={nodeStyles.batteryText}>
                Current %:
                <div className={nodeStyles.batteryValue}>
                  {this.getValue()}%
                </div>
              </div>
              <div className={nodeStyles.gauge}>
                <div
                  className={nodeStyles.gaugeFill}
                  style={{
                    width: `${this.getValue()}%`,
                    background: `linear-gradient(to right, #37ccaa ${
                      100 - this.getValue()
                    }%,  #cc4e33 100%)`
                  }}
                />
                <div className={nodeStyles.wrapper}></div>
              </div>
              <div className={nodeStyles.batteryMinMax}>
                <div>
                  <b>Min:</b> 0
                </div>
                <div>
                  <b>Max:</b> {this.state.thresholdVals[0]}%
                </div>
              </div>
            </div>
          </div>
        );
      case NodeType.HumidityAlt:
        return (
          <div className={nodeStyles.nodeWrapper}>
            <div>
              <div className={nodeStyles.nodeHeader}>
                <div className={nodeStyles.psbaIconHumidity} />
                <div className={nodeStyles.headerText}>Humidity</div>
              </div>
              <NodeInfo data={lastItem} />
            </div>
            <div className={nodeStyles.temperatureDisplay}>
              <div className={nodeStyles.thermometer}>
                <div
                  className={`${nodeStyles.ring} ${nodeStyles.humidityRing}`}
                >
                  <div className={nodeStyles.dialBottom}></div>
                </div>
                <div className={nodeStyles.temperatureWrapper}>
                  <div
                    className={nodeStyles.pointer}
                    style={{
                      transform: `rotate(${
                        (this.getValue() / this.state.thresholdVals[0]) * 180 +
                        229
                      }deg)`
                    }}
                  ></div>
                  <div className={nodeStyles.temperature}>
                    {this.getValue()}%
                  </div>
                </div>
              </div>
              <div className={nodeStyles.temperatureMinMax}>
                <div>
                  <strong>Min:</strong> 0%
                </div>
                <div>
                  <strong>Max:</strong> {this.state.thresholdVals[0]}%
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  /**
   * Sort MIB data if array were to be used to extend display
   *
   * @param data MIB data
   * @param descending
   * @returns sorted array
   */
  private sortData(data: IMib[], descending = false) {
    if (descending) {
      return data.sort((a: IMib, b: IMib) => {
        const aVal = moment(
          a.mib_col_updated_tst,
          'DD/MM/YYYY h:mm:ss'
        ).valueOf();
        const bVal = moment(
          b.mib_col_updated_tst,
          'DD/MM/YYYY h:mm:ss'
        ).valueOf();

        if (aVal < bVal) {
          return 1;
        }
        if (aVal > bVal) {
          return -1;
        }
        return 0;
      });
    } else {
      return data.sort((a: IMib, b: IMib) => {
        const aVal = moment(
          a.mib_col_updated_tst,
          'DD/MM/YYYY h:mm:ss'
        ).valueOf();
        const bVal = moment(
          b.mib_col_updated_tst,
          'DD/MM/YYYY h:mm:ss'
        ).valueOf();

        if (aVal < bVal) {
          return -1;
        }
        if (aVal > bVal) {
          return 1;
        }
        return 0;
      });
    }
  }
}

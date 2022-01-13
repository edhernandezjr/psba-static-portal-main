import { IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react';

export interface ISiteLayout {
  siteName: string;
  equipment: IEquipment[];
}

export interface IEquipment {
  id: string;
  label?: string;
  nodes: INode[];
}

export interface INode {
  id: string;
  type?: NodeType;
}

export interface IDevice {
  device: IDeviceData;
  mib: IMib[];
}

export interface IDeviceData {
  hst_id: string;
  hst_dsc: string;
  hst_namea: string;
  hst_cst_id: string;
  status_dsc: string;
  cst_dsc: string;
  cst_code: string;
  site_name: string;
  site_code: string;
}

export interface IMib {
  hst_namea: string;
  hst_ip: string;
  hst_dsc: string;
  cst_code: string;
  cst_dsc: string;
  typ_dsc: string;
  site_name: string;
  site_code: string;
  mib_col_updated_tst: string;
  upsmib_dsc_aux: string;
  mib_col_threshold: string;
  mib_col_exceed_threshold_flag: string;
  mib_type_dsc: string;
  lo_up_tst: string;
  mib_col_current_val: string;
  upsmib_dsc: string;
  Created: string;
}

export enum NodeType {
  FuelTankCapacity = 'Fuel Tank Capacity',
  FuelTankRuntime = 'Fuel Tank Runtime',
  FuelTankRuntimeAlt = 'Fuel Tank Runtime Indicator',
  UPS = 'UPS',
  BatteryCapacity = 'Battery Capacity',
  BatteryRuntime = 'Battery Runtime',
  BatteryRuntimeAlt = 'Battery Runtime Indicator',
  Temperature = 'Temperature',
  TemperatureAlt = 'Temperature 2',
  Humidity = 'Humidity',
  HumidityAlt = 'Humidity 2',
}

export enum UpsStatus {
  Other = 1,
  Normal = 3,
  Bypass = 4,
  Battery = 5,
  Booster = 6,
  Reducer = 7
}

export const NodeTypeOptions: IDropdownOption[] = [
  {
    key: 'FuelTankHeader',
    text: 'Fuel Tank',
    itemType: DropdownMenuItemType.Header
  },
  {
    key: NodeType.FuelTankCapacity,
    text: NodeType.FuelTankCapacity
  },
  {
    key: NodeType.FuelTankRuntime,
    text: 'Fuel Tank Runtime Signal'
  },
  {
    key: NodeType.FuelTankRuntimeAlt,
    text:  'Fuel Tank Runtime Indicator'
  },
  {
    key: 'BatteryHeader',
    text: 'Battery',
    itemType: DropdownMenuItemType.Header
  },
  {
    key: NodeType.BatteryCapacity,
    text: NodeType.BatteryCapacity
  },
  {
    key: NodeType.BatteryRuntime,
    text: 'Battery Runtime Signal'
  },
  {
    key: NodeType.BatteryRuntimeAlt,
    text: 'Battery Runtime Indicator'
  },
  {
    key: 'HumidityHeader',
    text: 'Humidity',
    itemType: DropdownMenuItemType.Header
  },
  {
    key: NodeType.Humidity,
    text: NodeType.Humidity
  },
  {
    key: NodeType.HumidityAlt,
    text: 'Humidity alt'
  },
  {
    key: 'TemperatureHeader',
    text: 'Temperature',
    itemType: DropdownMenuItemType.Header
  },
  {
    key: NodeType.Temperature,
    text: NodeType.Temperature
  },
  {
    key: NodeType.TemperatureAlt,
    text: 'Temperature alt'
  },
];

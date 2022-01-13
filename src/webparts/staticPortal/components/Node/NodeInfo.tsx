import * as React from 'react';

import { IMib } from '../StaticPortal.data.types';
import nodeStyles from './Node.module.scss';

interface INodeInfoProps {
  data: IMib;
}

/**
 * Displays 
 * 
 * data.hst_namea
 * data.typ_dsc
 * data.mib_type_dsc
 * data.hst_dsc
 */
export class NodeInfo extends React.Component<INodeInfoProps, {}> {
  public render() {
    const { data } = this.props;

    return (
      <div className={nodeStyles.nodeInfo}>
        <div>{data.hst_dsc}</div>
      </div>
    );
  }
}

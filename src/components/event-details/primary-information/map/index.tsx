import React, { Component } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { Marker } from '@react-google-maps/api';
import { IPosition } from './autocomplete';

interface IMapProps {
  position: IPosition;
}
class Map extends Component<IMapProps> {
  render() {
    return (
      <GoogleMap
        id="circle-example"
        mapContainerStyle={{
          height: '100%',
          width: '100%',
        }}
        zoom={13}
        center={this.props.position}
      >
        <Marker position={this.props.position} />
      </GoogleMap>
    );
  }
}
export default Map;

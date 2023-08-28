import axios from 'axios';
import React from 'react';
// import { MapContainer, TileLayer } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Map } from 'leaflet';

// 以后再写吧
class SSSMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.initialLoad = true;
    this.state = {
      markers: {}
    }
  }

  handleMarkerClick = (id) => {
    console.log(`Clicked marker with ID: ${id}`);
    this.props.setClickID(id);
  };

  componentDidMount() {
    this.map = window.L.map('sssmap').setView([30.8, 114.5], 10);

    window.L.tileLayer('http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}', {
      minZoom: 1,
      maxZoom: 19,
      attribution: 'Map data &copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // window.L.marker([39.9035, 116.3972]).addTo(this.map)
    //   .bindPopup('天安门广场')
    //   .on('click', (e) => {
    //     e.target.openPopup();
    //     e.target._popup._isOpen = false; // 阻止事件冒泡
    //   });

    // 在组件加载后手动触发地图的 invalidateSize 方法
    // setTimeout(() => {
    //   this.map.invalidateSize()
    // }, 0);
    // this.map.on('load', () => {
    //   if (this.initialLoad) {
    //     this.initialLoad = false;
    //     setTimeout(() => {
    //       this.map.invalidateSize();
    //     }, 0);
    //   }
    // });

    // 第一次渲染界面，调用load api往地图上加载点
    axios.get(global.config.url + 'sss/load')
      .then(response => {
        const markers = response.data;
        this.setState({ markers : markers }, () => {
          Object.keys(markers).map(key => {
            window.L.marker(markers[key]).addTo(this.map)
              .bindPopup(`采样点 ${key}`)
              .on('click', () => this.handleMarkerClick(key));
            // console.log('key = ' + key)
            // console.log('position = ' + this.state.markers[key])
          })
        });
      })
      .catch(error => {
        console.error(error);
      });

    // Object.keys(this.state.markers).map(key => {
    //   window.L.marker(this.state.markers[key]).addTo(this.map)
    //     .bindPopup(key)
    //     .on('click', () => this.handleMarkerClick(key));
    //   console.log('key = ' + key)
    //   console.log('position = ' + this.state.markers[key])
    // })
    // this.state.markers.map(([id, position]) => {
    //   window.L.marker(position).addTo(this.map)
    //     .bindPopup(id)
    //     .on('click', () => this.handleMarkerClick(id));
    // })
    // console.log(this.state.markers)
    console.log('test')
  }

  render() {
    return <div style={{ height: '400px', width: '600px' }} id='sssmap'></div>;
  }
}

export default SSSMap;

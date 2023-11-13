import {BorderOutlined} from '@ant-design/icons'
import {message} from 'antd'
import React from 'react'
import L from 'leaflet'
import {useMap} from 'react-leaflet'

class MapPanel extends React.Component {
    drawButton

    rect
    createDrawButton () {
        const MapHelp = L.Control.extend({
            onAdd: (map)=> {
                const drawButton = L.DomUtil.create('button', '')
                this.drawButton = drawButton
                drawButton.innerHTML = <BorderOutlined />
                drawButton.addEventListener('click', () => {
                    message.info("Please draw a rectangle.");
                    map.getContainer().classList.add('crosshair-cursor');
                    this.rect = map.editTools.startRectangle()
                })
                return drawButton
            }
        })
        return new MapHelp({position: 'topleft'})
    }

    componentDidMount() {
        const {map} = this.props
        const control = this.createDrawButton()
        control.addTo(map)
    }

    componentWillUnmount() {
        this.drawButton.remove()
    }

    render() {
        return null
    }
}

function withMap(Component) {
    return function WrappedComponent(props) {
        const map = useMap()
        return <Component {...props} map={map} />
    }
}

export default withMap(MapPanel)
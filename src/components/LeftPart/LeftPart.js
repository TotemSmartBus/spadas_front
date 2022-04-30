import React, { Component } from 'react'
import {Tabs,Tab} from 'react-bootstrap';

import Augmentarea from '../Augmentarea/Augmentarea'
import ParamSetting from '../ParamSetting/ParamSetting'
import SearchDetail from '../SearchDetail/SearchDetail'
import SearchHits from '../SearchHits/SeachHits'





export default class LeftPart extends Component {
    state ={data:null}

    // handleClickDs2Detail = (data) => {
    //     console.log(data)
    //     this.setState({data:data})
    // }

    render() {
        return (
            <div>
                <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                    <Tab eventKey={1} title="Search Tab">                
                        <ParamSetting/>
                        
                        <SearchHits onClickedDsChange={this.props.onClickedDsChange} />
                    </Tab>
                    <Tab eventKey={2} title="Augment Tab">
                        <Augmentarea/>
                    </Tab>
                </Tabs>
            </div>
        )
    }
}

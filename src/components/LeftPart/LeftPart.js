import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap';

import Augmentarea from '../Augmentarea/Augmentarea'
import KeywordsSearch from '../KeywordsSearch/KeywordsSearch';
import ParamSetting from '../ParamSetting/ParamSetting'
import SearchDetail from '../SearchDetail/SearchDetail'
import SeachHits from '../SearchHits/SeachHits';
import SearchHits from '../SearchHits/SeachHits';
import Option from '../Option/Option';





export default class LeftPart extends Component {
    state = { data: null }

    // handleClickDs2Detail = (data) => {
    //     console.log(data)
    //     this.setState({data:data})
    // }

    render() {
        return (
            <div>
                {/* 删除Option组件 */}
                {/* <p>
                    <Option />
                </p> */}

                {/* <p>
                    <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                        <Tab eventKey={1} title="Setting Tab">
                            <ParamSetting />
                        </Tab>
                        <Tab eventKey={2} title="Augment Tab">
                            <Augmentarea />
                        </Tab>
                        <Tab eventKey={3} title="Keywords Tab">
                            <KeywordsSearch />
                        </Tab>
                    </Tabs>
                </p> */}

                <div>
                    <ParamSetting />
                    <Augmentarea />
                    <KeywordsSearch />
                </div>

                <p>
                    <SeachHits onClickedDsChange={this.props.onClickedDsChange} disabled='true' />
                </p>
            </div>
        )
    }
}

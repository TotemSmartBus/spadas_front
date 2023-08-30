import axios from 'axios'
import React, { Component } from 'react'
import PubSub from 'pubsub-js'

export default class KeywordsSearch extends Component {
    state = { keywords: null }

    KeywordsChanged = e => {
        this.setState({
            keywords: e.target.value
        })
    }

    setBtnClicked = () => {
        console.log(this.state.keywords)
        axios.post(global.config.url + 'keywordsquery', { kws: this.state.keywords })
            .then(res => {
                console.log(res.data)
                if (res.data.nodes.length == 0) {
                    alert('Search not found!')
                }
                var nodeList = res.data.nodes.map(item => item.node);
                PubSub.publish('searchhits', {
                    data: nodeList,
                    isTopk: false
                });
            })
    }

    render() {
        return (
            <div className='input-group mb-3 mt-5'>
                <input type="text" className="form-control" placeholder="Keywords" onChange={this.KeywordsChanged} />
                <div className="input-group-append">
                    <button className="btn btn-outline-primary" type="button" id="button-addon2" onClick={this.setBtnClicked}>Search</button>
                </div>
            </div>
        )
    }
}
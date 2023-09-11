import React, { Component } from 'react';
import { Collapse, Select } from 'antd';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';

export default class Option extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }));
    }

    render() {
        const { isOpen } = this.state;

        return (
            <div style={{ width: '100%' }}>
                <div onClick={this.toggleDropdown} style={{ cursor: 'pointer' }}>
                    Option
                </div>
                {isOpen && (
                    <div style={{ marginTop: '10px' }}>
                        <input type="checkbox" id="checkbox1" />
                        <label htmlFor="checkbox1">Option 1</label>
                        <br />
                        <input type="checkbox" id="checkbox2" />
                        <label htmlFor="checkbox2">Option 2</label>
                        <br />
                        <input type="checkbox" id="checkbox3" />
                        <label htmlFor="checkbox3">Option 3</label>
                    </div>
                )}
                <Collapse>
                    <CollapsePanel header="Option" key="1">
                        <div style={{ marginBottom: '10px' }}>
                            <Select style={{ width: '100%' }}>
                                <option value="test 1">value 1</option>
                                <option value="test 2">value 2</option>
                                <option value="test 3">value 3</option>
                                {/* <SelectOption value="Option 1">Option 1</SelectOption>
                                <SelectOption value="Option 2">Option 2</SelectOption>
                                <SelectOption value="Option 3">Option 3</SelectOption> */}
                            </Select>
                            <label style={{ marginLeft: '10px' }}>Explanation 1</label>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Select style={{ width: '100%' }}>
                            <option value="test 1">value 1</option>
                                <option value="test 2">value 2</option>
                                <option value="test 3">value 3</option>
                                {/* <SelectOption value="Option 4">Option 4</SelectOption>
                                <SelectOption value="Option 5">Option 5</SelectOption>
                                <SelectOption value="Option 6">Option 6</SelectOption> */}
                            </Select>
                            <label style={{ marginLeft: '10px' }}>Explanation 2</label>
                        </div>
                        {/* <div style={{ marginBottom: '10px' }}>
                            <Select style={{ width: '100%' }}>
                                <SelectOption value="Option 7">Option 7</SelectOption>
                                <SelectOption value="Option 8">Option 8</SelectOption>
                                <SelectOption value="Option 9">Option 9</SelectOption>
                            </Select>
                            <label style={{ marginLeft: '10px' }}>Explanation 3</label>
                        </div> */}
                    </CollapsePanel>
                </Collapse>
            </div>
        );
    }
}
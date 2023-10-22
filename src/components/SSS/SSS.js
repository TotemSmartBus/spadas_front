import React from 'react';
import { Layout, Row, Col } from 'antd';
import SSSMap from '../SSSMap/SSSMap'
import SSSData from './SSSData'

class SSS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickID: null
    };
    this.setClickID = this.setClickID.bind(this);
  }

  setClickID(id) {
    this.setState({ clickID: id });
  }

  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '900px' }}>
        <Layout>
          <Row>
            <Col className="d-flex justify-content-center" style={{ marginTop: '20px' }}>
              <SSSMap setClickID={this.setClickID} />
            </Col>
          </Row>
          <div style={{ margin: '20px' }}></div> {/* 间距为 20px */}
          <Row>
            <Col>
              <SSSData clickID={this.state.clickID} />
            </Col>
          </Row>
        </Layout>
      </div>
    );
  }
}

export default SSS;

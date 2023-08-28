import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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
      // <div style={{height: '800px'}}>
      //   <SSSMap />
      // </div>);
      // <Container className="h-100 d-flex align-items-center justify-content-center" style={{ height: '800px' }}>
      //   <Row>
      //     <Col>
      //       <SSSMap />
      //     </Col>
      //   </Row>
      //   <Row>
      //     <Col>
      //       <SSSData />
      //     </Col>
      //   </Row>
      // </Container>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '900px' }}>
        <Container>
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
        </Container>
      </div>
    );
  }
}

export default SSS;

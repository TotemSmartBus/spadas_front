import React, { Component } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { Download } from 'react-feather';

class SSSData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCardIndex: 0, // 默认选择第一个卡片
            // 要展示的数据
            selectedData: [],
            columnNames: [],
            cardData: [],
            selectedCard: []
        };
    }

    // 点击卡片
    handleCardClick = (index) => {
        this.setState({ selectedCardIndex: index });
    };

    // fetchData = async () => {
    //     try {
    //         const response = await axios.get(global.config.url + 'sss/data');
    //         const { data } = response;
    //         const columnNames = Object.keys(data[0] || {});
    //         this.setState({ selectedData: response.data, columnNames });
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // 这个函数还要优化
    componentDidUpdate(prevProps, prevState) {
        const id = this.props.clickID ? this.props.clickID : 0;
        // console.log(`previous card data = ${prevState.cardData}`);
        console.log(`click id = ${id}`);

        // console.log(prevState.cardData);
        // const cardData = this.state.cardData;
        // console.log(cardData);
        var cardData = this.state.cardData;
        // console.log(`previous state = ${prevState.cardData}`);
        // console.log(`current state = ${cardData}`);

        axios.get(global.config.url + 'sss/get/' + id)
            .then(response => {
                // console.log(response);
                // console.log(response.data);
                // console.log(prevState.cardData);
                const res = response.data;
                console.log(`card data = ${res.data}`);

                // 分析一下
                // 1. 初始情况，需要显示全部数据
                // 2. 用户点击地图上的某采样点后，需要显示该采样点对应的全部数据
                // 3. 显示数据意味着状态改变，就会再次调用update函数，因此需要判断

                // 如果当前状态为空，代表第一次加载，因此需要更新状态为显示全部数据
                if (cardData.length == 0) {
                    console.log('第一次加载')
                    this.setState({ cardData: response.data, selectedCardIndex: 0 });
                } else {
                    // if (response.data[0].id !== prevState.cardData[0].id) {
                    //     console.log('id !== id')
                    //     this.setState({ cardData: response.data });
                    // }
                    if (response.data.length !== prevState.cardData.length) {
                        console.log('length !== length')
                        this.setState({ cardData: response.data, selectedCardIndex: 0 });
                    } else {
                        if (response.data[0].id !== prevState.cardData[0].id) {
                            console.log('id !== id')
                            this.setState({ cardData: response.data, selectedCardIndex: 0 });
                        }
                    }
                }

            })
            .catch(error => {
                console.error(error);
            })

        // console.log(`previous state = ${prevState.cardData}`);
        // console.log(`current state = ${cardData}`);
    }

    componentDidMount() {
        // this.fetchData();

        // axios.get(global.config.url + 'sss/get/0')
        //     .then(response => {
        //         const { data } = response;
        //         console.log(data);
        //         const columnNames = Object.keys(data[0] || {});
        //         this.setState({ selectedData: response.data, columnNames });
        //     })
        // .catch(error => {
        //     console.error(error);
        // })
    }

    render() {
        // const cardData = [];
        // for (let i = 1; i <= 20; i++) {
        //     cardData.push({ number: i, name: `Card ${i}` });
        // }

        var { selectedCardIndex, selectedData, columnNames, cardData, selectedCard } = this.state;
        // var selectedCard = null;
        if (cardData.length > 0) {
            console.log(selectedCardIndex);
            selectedCard = cardData[this.state.selectedCardIndex];
            // 这里使用到了global.config.url, 耦合度较高
            var downloadURL = global.config.url + "sss/file/" + this.state.selectedCardIndex;
            columnNames = selectedCard.previewData[0];
            selectedData = selectedCard.previewData.slice(1);
        }

        console.log(selectedCard)
        // const columnNames = selectedCard;
        // const selectedData = selectedCard;

        return (
            <Container>
                <Row>
                    <Col md={4} style={{
                        height: '550px',
                        overflow: 'auto',
                        // border: '1px solid black'
                    }}>
                        {cardData.map((card, index) => (
                            <Card key={index} onClick={() => this.handleCardClick(index)} style={{
                                marginTop: '10px',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                backgroundColor: selectedCardIndex === index ? 'lightblue' : 'white'
                            }}>
                                <Card.Body>
                                    <Card.Title>{card.name}</Card.Title>
                                    <Card.Text>id: {card.id}</Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                    {selectedCard && (
                        <Col md={8}>
                            <Button href={`${downloadURL}`} target="_blank" download>Download</Button>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        {columnNames.map((columnName, index) => (
                                            <th key={index}>{columnName}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {columnNames.map((columnName, columnIndex) => (
                                                <td key={columnIndex}>{row[columnIndex]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    )}
                </Row>
            </Container>
        );
    }
}

export default SSSData;

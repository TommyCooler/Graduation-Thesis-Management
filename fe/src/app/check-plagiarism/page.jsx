'use client';
import { useState } from 'react';
import { Layout, Typography, Card, Upload, Button, Progress, Tabs, Table, Tag, Divider, Spin, Row, Col, Alert, Space, Checkbox, Radio, Slider, Statistic } from 'antd';
import { InboxOutlined, FileTextOutlined, UploadOutlined, HistoryOutlined, SettingOutlined, CheckCircleOutlined, WarningOutlined, DatabaseOutlined, LockOutlined } from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;

export default function CheckPlagiarismPage() {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [activeTab, setActiveTab] = useState('1');

    // Xử lý tải tệp lên
    const handleUpload = () => {
        if (fileList.length === 0) return;
        
        setUploading(true);
        
        // Mô phỏng quá trình tải lên
        setTimeout(() => {
            setUploading(false);
            setScanning(true);
            
            // Mô phỏng quá trình quét
            setTimeout(() => {
                setScanning(false);
                setResults({
                    score: 18, // Phần trăm đạo văn phát hiện
                    totalWords: 3245,
                    originalWords: 2661,
                    suspectedWords: 584,
                    sources: [
                        { id: 1, url: 'https://example.com/research-paper-1', similarity: 12, matchedText: 'Các phương pháp phát hiện đạo văn dựa trên kỹ thuật...' },
                        { id: 2, url: 'https://university.edu/thesis/3245', similarity: 5, matchedText: 'Nghiên cứu này tập trung vào việc phân tích...' },
                        { id: 3, url: 'https://journal.org/article/492', similarity: 1, matchedText: 'Kết quả cho thấy phương pháp đề xuất...' },
                    ],
                    passages: [
                        { id: 1, text: 'Các phương pháp phát hiện đạo văn dựa trên kỹ thuật xử lý ngôn ngữ tự nhiên...', similarity: 92, source: 'https://example.com/research-paper-1' },
                        { id: 2, text: 'Nghiên cứu này tập trung vào việc phân tích và đánh giá hiệu quả của các thuật toán...', similarity: 85, source: 'https://university.edu/thesis/3245' },
                    ]
                });
                setActiveTab('2');
            }, 3000);
        }, 1500);
    };

    // Props cho Upload
    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            // Kiểm tra định dạng file
            const isPDF = file.type === 'application/pdf';
            const isDoc = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            
            if (!isPDF && !isDoc) {
                alert('Chỉ hỗ trợ tải lên file PDF hoặc DOCX!');
                return Upload.LIST_IGNORE;
            }
            
            setFileList([file]);
            return false; // Ngăn tự động tải lên
        },
        fileList,
    };

    // Columns cho bảng nguồn tham khảo
    const sourcesColumns = [
        {
            title: 'Nguồn',
            dataIndex: 'url',
            key: 'url',
            render: (text) => <a href={text} target="_blank" rel="noreferrer">{text}</a>,
        },
        {
            title: 'Mức độ tương đồng',
            dataIndex: 'similarity',
            key: 'similarity',
            render: (similarity) => (
                <Tag color={similarity > 10 ? 'red' : similarity > 5 ? 'orange' : 'green'}>
                    {similarity}%
                </Tag>
            ),
            sorter: (a, b) => a.similarity - b.similarity,
        },
    ];

    return (
        <Layout className="min-h-screen">
            <Header />
            
            <Content>
                {/* Banner */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
                    padding: '40px 24px',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Title level={1} style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                            <span style={{ color: '#ff6b35' }}>Kiểm tra đạo văn</span>
                        </Title>
                        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '0' }}>
                            Công cụ kiểm tra đạo văn hiện đại giúp đảm bảo tính nguyên bản của nội dung nghiên cứu
                        </Paragraph>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ padding: '40px 24px', background: '#f9f9f9' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab} 
                            type="card" 
                            style={{ marginBottom: 32 }}
                            items={[
                                {
                                    key: "1",
                                    label: (
                                        <span><UploadOutlined /> Tải tệp lên</span>
                                    ),
                                    children: (
                                        <Card bordered={false}>
                                            <Paragraph style={{ marginBottom: 24 }}>
                                                Tải lên tài liệu của bạn để kiểm tra tính nguyên bản và phát hiện đạo văn. 
                                                Hệ thống hỗ trợ các định dạng PDF và DOCX.
                                            </Paragraph>
                                            
                                            <div style={{ marginBottom: 24 }}>
                                                <Dragger {...uploadProps} disabled={uploading || scanning}>
                                                    <p className="ant-upload-drag-icon">
                                                        <InboxOutlined style={{ color: '#ff6b35' }} />
                                                    </p>
                                                    <p className="ant-upload-text">
                                                        Kéo thả file vào đây hoặc nhấp để tải lên
                                                    </p>
                                                    <p className="ant-upload-hint">
                                                        Hỗ trợ file PDF, DOCX với kích thước tối đa 30MB
                                                    </p>
                                                </Dragger>
                                            </div>
                                            
                                            {(uploading || scanning) && (
                                                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                                                    <Spin />
                                                    <Paragraph style={{ marginTop: 16 }}>
                                                        {uploading ? 'Đang tải tệp lên...' : 'Đang quét và phân tích nội dung...'}
                                                    </Paragraph>
                                                </div>
                                            )}
                                            
                                            <div style={{ textAlign: 'center' }}>
                                                <Button
                                                    type="primary"
                                                    onClick={handleUpload}
                                                    disabled={fileList.length === 0 || uploading || scanning}
                                                    loading={uploading}
                                                    style={{ 
                                                        background: '#ff6b35', 
                                                        borderColor: '#ff6b35',
                                                        minWidth: 150
                                                    }}
                                                >
                                                    {uploading ? 'Đang tải lên' : 'Bắt đầu kiểm tra'}
                                                </Button>
                                            </div>
                                        </Card>
                                    ),
                                },
                                {
                                    key: "2",
                                    label: (
                                        <span><FileTextOutlined /> Kết quả kiểm tra</span>
                                    ),
                                    children: (
                                        <div>
                                            {!results ? (
                                                <Card bordered={false}>
                                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                                        <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                                                        <Paragraph>
                                                            Chưa có kết quả kiểm tra nào. Vui lòng tải lên tài liệu để bắt đầu kiểm tra.
                                                        </Paragraph>
                                                    </div>
                                                </Card>
                                            ) : (
                                                <>
                                                    <Card bordered={false} style={{ marginBottom: 24 }}>
                                                        <Row gutter={[24, 24]} align="middle">
                                                            <Col xs={24} md={8}>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <Progress
                                                                        type="dashboard"
                                                                        percent={100 - results.score}
                                                                        format={() => `${100 - results.score}%`}
                                                                        strokeColor={
                                                                            results.score < 20 ? '#52c41a' : 
                                                                            results.score < 40 ? '#faad14' : '#f5222d'
                                                                        }
                                                                    />
                                                                    <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                                                                        Tính nguyên bản
                                                                    </Title>
                                                                </div>
                                                            </Col>
                                                            <Col xs={24} md={16}>
                                                                <Alert
                                                                    message={
                                                                        results.score < 20 ? 
                                                                        "Tài liệu của bạn có tính nguyên bản cao" : 
                                                                        results.score < 40 ? 
                                                                        "Tài liệu có một số phần trùng lặp cần xem xét" :
                                                                        "Tài liệu có nhiều nội dung trùng lặp"
                                                                    }
                                                                    type={
                                                                        results.score < 20 ? "success" : 
                                                                        results.score < 40 ? "warning" : "error"
                                                                    }
                                                                    showIcon
                                                                    icon={results.score < 20 ? <CheckCircleOutlined /> : <WarningOutlined />}
                                                                    style={{ marginBottom: 16 }}
                                                                />
                                                                
                                                                <Row gutter={16}>
                                                                    <Col span={8}>
                                                                        <Statistic title="Tổng số từ" value={results.totalWords} />
                                                                    </Col>
                                                                    <Col span={8}>
                                                                        <Statistic title="Từ nguyên bản" value={results.originalWords} />
                                                                    </Col>
                                                                    <Col span={8}>
                                                                        <Statistic 
                                                                            title="Từ nghi đạo văn" 
                                                                            value={results.suspectedWords} 
                                                                            valueStyle={{ color: '#ff4d4f' }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                    
                                                    <Card 
                                                        title="Các nguồn tài liệu tương đồng" 
                                                        bordered={false} 
                                                        style={{ marginBottom: 24 }}
                                                    >
                                                        <Table 
                                                            dataSource={results.sources} 
                                                            columns={sourcesColumns}
                                                            rowKey="id"
                                                            pagination={false}
                                                        />
                                                    </Card>
                                                    
                                                    <Card 
                                                        title="Đoạn văn nghi đạo văn" 
                                                        bordered={false}
                                                    >
                                                        {results.passages.map((passage) => (
                                                            <div key={passage.id} style={{ marginBottom: 16, padding: 16, background: '#fff8f0', borderRadius: 8 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                                    <Text strong>Đoạn văn #{passage.id}</Text>
                                                                    <Tag color={passage.similarity > 80 ? 'red' : 'orange'}>
                                                                        {passage.similarity}% tương đồng
                                                                    </Tag>
                                                                </div>
                                                                <Paragraph style={{ marginBottom: 8 }}>
                                                                    "{passage.text}"
                                                                </Paragraph>
                                                                <Text type="secondary">
                                                                    Nguồn: <a href={passage.source} target="_blank" rel="noreferrer">{passage.source}</a>
                                                                </Text>
                                                            </div>
                                                        ))}
                                                    </Card>
                                                </>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: "3",
                                    label: (
                                        <span><HistoryOutlined /> Lịch sử kiểm tra</span>
                                    ),
                                    children: (
                                        <Card bordered={false}>
                                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                                <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                                                <Paragraph>
                                                    Lịch sử kiểm tra sẽ hiển thị ở đây sau khi bạn đăng nhập vào hệ thống.
                                                </Paragraph>
                                                <Button type="primary" style={{ background: '#ff6b35', borderColor: '#ff6b35' }}>
                                                    Đăng nhập
                                                </Button>
                                            </div>
                                        </Card>
                                    ),
                                },
                                {
                                    key: "4",
                                    label: (
                                        <span><SettingOutlined /> Cài đặt kiểm tra</span>
                                    ),
                                    children: (
                                        <Card bordered={false}>
                                            <Paragraph style={{ marginBottom: 24 }}>
                                                Tùy chỉnh các thiết lập kiểm tra đạo văn để phù hợp với yêu cầu của bạn.
                                            </Paragraph>
                                            
                                            <div style={{ marginBottom: 24 }}>
                                                <Title level={5}>Nguồn kiểm tra</Title>
                                                <Checkbox.Group
                                                    options={[
                                                        { label: 'Internet', value: 'internet', defaultChecked: true },
                                                        { label: 'Cơ sở dữ liệu học thuật', value: 'academic', defaultChecked: true },
                                                        { label: 'Tạp chí khoa học', value: 'journals', defaultChecked: true },
                                                        { label: 'Kho lưu trữ nội bộ', value: 'internal' },
                                                    ]}
                                                />
                                            </div>
                                            
                                            <div style={{ marginBottom: 24 }}>
                                                <Title level={5}>Ngôn ngữ</Title>
                                                <Radio.Group defaultValue="vi">
                                                    <Radio value="vi">Tiếng Việt</Radio>
                                                    <Radio value="en">Tiếng Anh</Radio>
                                                    <Radio value="both">Cả hai</Radio>
                                                </Radio.Group>
                                            </div>
                                            
                                            <div style={{ marginBottom: 24 }}>
                                                <Title level={5}>Ngưỡng cảnh báo</Title>
                                                <Slider
                                                    defaultValue={20}
                                                    marks={{
                                                        5: '5%',
                                                        20: '20%',
                                                        40: '40%',
                                                        60: '60%',
                                                    }}
                                                />
                                            </div>
                                        </Card>
                                    ),
                                },
                            ]}
                        />
                        
                        <Divider />
                        
                        <Card bordered={false} title="Về công nghệ kiểm tra đạo văn của chúng tôi">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={8}>
                                    <Card 
                                        bordered={false} 
                                        style={{ height: '100%', textAlign: 'center' }}
                                    >
                                        <div style={{ 
                                            width: 64, 
                                            height: 64, 
                                            borderRadius: '50%', 
                                            background: '#fff5f0', 
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: '0 auto 16px'
                                        }}>
                                            <CheckCircleOutlined style={{ fontSize: 32, color: '#ff6b35' }} />
                                        </div>
                                        <Title level={4}>Độ chính xác cao</Title>
                                        <Paragraph>
                                            Sử dụng thuật toán AI tiên tiến để phát hiện nội dung trùng lặp với độ chính xác lên đến 98.5%
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card 
                                        bordered={false} 
                                        style={{ height: '100%', textAlign: 'center' }}
                                    >
                                        <div style={{ 
                                            width: 64, 
                                            height: 64, 
                                            borderRadius: '50%', 
                                            background: '#fff5f0', 
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: '0 auto 16px'
                                        }}>
                                            <DatabaseOutlined style={{ fontSize: 32, color: '#ff6b35' }} />
                                        </div>
                                        <Title level={4}>Cơ sở dữ liệu rộng lớn</Title>
                                        <Paragraph>
                                            Kết nối với hơn 1 tỷ trang web, 70 triệu bài báo học thuật và các nguồn dữ liệu chuyên ngành
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card 
                                        bordered={false} 
                                        style={{ height: '100%', textAlign: 'center' }}
                                    >
                                        <div style={{ 
                                            width: 64, 
                                            height: 64, 
                                            borderRadius: '50%', 
                                            background: '#fff5f0', 
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: '0 auto 16px'
                                        }}>
                                            <LockOutlined style={{ fontSize: 32, color: '#ff6b35' }} />
                                        </div>
                                        <Title level={4}>Bảo mật tối đa</Title>
                                        <Paragraph>
                                            Dữ liệu của bạn được mã hóa và bảo vệ. Chúng tôi không lưu trữ hoặc chia sẻ nội dung tài liệu
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </div>
            </Content>
            
            <Footer />
        </Layout>
    );
}
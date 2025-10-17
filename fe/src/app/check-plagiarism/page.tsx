'use client';
import { useState } from 'react';
import { Layout, Typography, Card, Upload, Button, Progress, Tabs, Table, Tag, Divider, Spin, Row, Col, Alert, Checkbox, Radio, Slider, Statistic, message } from 'antd';
import { InboxOutlined, FileTextOutlined, UploadOutlined, HistoryOutlined, SettingOutlined, CheckCircleOutlined, WarningOutlined, DatabaseOutlined, LockOutlined } from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import { 
    PlagiarismResult, 
    PlagiarismMatch, 
    DetailedAnalysis, 
    UploadFile,
    FileUploadStatus,
    SimilarityLevel,
    FileType
} from '../../types';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;

export default function CheckPlagiarismPage() {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [actualFile, setActualFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>('idle');
    const [results, setResults] = useState<PlagiarismResult | null>(null);
    const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState('1');
    const [lectureId] = useState<number>(1); // Default lecturer ID

    // API Base URL through Gateway
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Helper function to determine similarity level
    const getSimilarityLevel = (percentage: number): SimilarityLevel => {
        if (percentage < 20) return 'low';
        if (percentage < 40) return 'medium';
        return 'high';
    };

    // Helper function to get file type
    const getFileType = (file: File): FileType | null => {
        if (file.type === 'application/pdf') return 'pdf';
        if (file.type === 'application/msword' || 
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
        if (file.type === 'text/plain') return 'txt';
        return null;
    };

    // Helper function to get alert message
    const getAlertMessage = (similarityLevel: SimilarityLevel): string => {
        switch (similarityLevel) {
            case 'low': return "Tài liệu của bạn có tính nguyên bản cao";
            case 'medium': return "Tài liệu có một số phần trùng lặp cần xem xét";
            case 'high': return "Tài liệu có nhiều nội dung trùng lặp";
            default: return "";
        }
    };

    // Helper function to get alert type
    const getAlertType = (similarityLevel: SimilarityLevel): "success" | "warning" | "error" => {
        switch (similarityLevel) {
            case 'low': return "success";
            case 'medium': return "warning";
            case 'high': return "error";
            default: return "warning";
        }
    };

    // Helper function to get alert icon
    const getAlertIcon = (similarityLevel: SimilarityLevel) => {
        return similarityLevel === 'low' ? <CheckCircleOutlined /> : <WarningOutlined />;
    };

    // Helper function to get progress stroke color
    const getProgressStrokeColor = (similarityPercentage: number): string => {
        if (similarityPercentage < 20) return '#52c41a';
        if (similarityPercentage < 40) return '#faad14';
        return '#f5222d';
    };

    // Helper function to get chunk background color
    const getChunkBackgroundColor = (similarity: number): string => {
        if (similarity > 70) return '#fff1f0';
        if (similarity > 50) return '#fffbe6';
        return '#f6ffed';
    };

    // Helper function to get chunk border color
    const getChunkBorderColor = (similarity: number): string => {
        if (similarity > 70) return '#ffccc7';
        if (similarity > 50) return '#ffe58f';
        return '#b7eb8f';
    };

    // Helper function to get tag color
    const getTagColor = (similarity: number): string => {
        if (similarity > 70) return 'red';
        if (similarity > 50) return 'orange';
        return 'green';
    };

    // Helper function to get highlight color
    const getHighlightColor = (similarity: number): string => {
        if (similarity > 70) return '#ff4d4f';
        if (similarity > 50) return '#faad14';
        return '#52c41a';
    };

    // Upload file and check plagiarism
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Vui lòng chọn file để tải lên');
            return;
        }

        if (!actualFile) return;
        
        const formData = new FormData();
        formData.append('file', actualFile);
        formData.append('lectureId', lectureId.toString());

        setUploadStatus('uploading');

        try {
            const response = await fetch(`${API_BASE_URL}/api/plagiarism/upload-and-check`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setUploadStatus('scanning');
            const result: PlagiarismResult = await response.json();
            setResults(result);
            setActiveTab('2');
            setUploadStatus('completed');
            message.success('Kiểm tra đạo văn hoàn thành!');
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('error');
            message.error('Có lỗi xảy ra khi kiểm tra đạo văn. Vui lòng thử lại.');
        }
    };

    // Get detailed analysis
    const getDetailedAnalysis = async (reportId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/plagiarism/analysis/${reportId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const analysis: DetailedAnalysis = await response.json();
            setDetailedAnalysis(analysis);
            return analysis;
        } catch (error) {
            console.error('Error getting detailed analysis:', error);
            message.error('Không thể lấy phân tích chi tiết');
            return null;
        }
    };

    // Handle file upload
    const uploadProps = {
        onRemove: (file: UploadFile) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
            setActualFile(null);
        },
        beforeUpload: (file: File) => {
            // Check file format using helper function
            const fileType = getFileType(file);
            if (!fileType) {
                message.error('Chỉ hỗ trợ file PDF, DOCX hoặc TXT!');
                return Upload.LIST_IGNORE;
            }

            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                message.error('File quá lớn! Kích thước tối đa là 50MB');
                return Upload.LIST_IGNORE;
            }

            const uploadFile: UploadFile = {
                uid: file.name + Date.now(),
                name: file.name,
                type: file.type,
                size: file.size,
                status: 'done'
            };
            setFileList([uploadFile]);
            setActualFile(file);
            return false; // Prevent auto upload
        },
        fileList,
    };

    // Columns for sources table
    const sourcesColumns = [
        {
            title: 'Nguồn',
            dataIndex: 'source',
            key: 'source',
            render: (text: string) => (
                <a href={text} target="_blank" rel="noreferrer">
                    {text.length > 50 ? `${text.substring(0, 50)}...` : text}
                </a>
            ),
        },
        {
            title: 'Mức độ tương đồng',
            dataIndex: 'similarity_percentage',
            key: 'similarity_percentage',
            render: (similarity: number) => (
                <Tag color={getTagColor(similarity)}>
                    {similarity}%
                </Tag>
            ),
            sorter: (a: PlagiarismMatch, b: PlagiarismMatch) => a.similarity_percentage - b.similarity_percentage,
        },
    ];    
    // Highlight text based on similarity
    const highlightText = (text: string, similarity: number) => {
        let bgClass = '';
        if (similarity > 70) bgClass = 'bg-red-100';
        else if (similarity > 50) bgClass = 'bg-yellow-100';
        else bgClass = 'bg-green-100';
        
        return (
            <span className={`${bgClass} px-1 py-0.5 rounded`}>
                {text}
            </span>
        );
    };

    return (
        <Layout className="min-h-screen">
            <Header />
            
            <Content>                {/* Banner */}
                <div className="bg-gradient-to-br from-orange-50 to-white py-10 px-6">
                    <div className="max-w-6xl mx-auto">
                        <Title level={1} className="text-4xl mb-4">
                            <span className="text-orange-500">Kiểm tra đạo văn</span>
                        </Title>
                        <Paragraph className="text-base text-gray-600 mb-0">
                            Công cụ kiểm tra đạo văn hiện đại sử dụng AI và Vector Database để đảm bảo tính nguyên bản của nội dung nghiên cứu
                        </Paragraph>
                    </div>
                </div>                {/* Main Content */}
                <div className="py-10 px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab} 
                            type="card" 
                            className="mb-8"
                            items={[
                                {
                                    key: "1",
                                    label: (
                                        <span><UploadOutlined /> Tải tệp lên</span>
                                    ),
                                    children: (                                        <Card bordered={false}>
                                            <Paragraph className="mb-6">
                                                Tải lên tài liệu của bạn để kiểm tra tính nguyên bản và phát hiện đạo văn. 
                                                Hệ thống hỗ trợ các định dạng PDF, DOCX và TXT.
                                            </Paragraph>
                                            
                                            <div className="mb-6">
                                                <Dragger {...uploadProps} disabled={uploadStatus !== 'idle' && uploadStatus !== 'error'}>
                                                    <p className="ant-upload-drag-icon">
                                                        <InboxOutlined className="text-orange-500" />
                                                    </p>
                                                    <p className="ant-upload-text">
                                                        Kéo thả file vào đây hoặc nhấp để tải lên
                                                    </p>
                                                    <p className="ant-upload-hint">
                                                        Hỗ trợ file PDF, DOCX, TXT với kích thước tối đa 50MB
                                                    </p>
                                                </Dragger>
                                            </div>
                                              {(uploadStatus === 'uploading' || uploadStatus === 'scanning') && (
                                                <div className="text-center my-6">
                                                    <Spin />
                                                    <Paragraph className="mt-4">
                                                        {uploadStatus === 'uploading' ? 'Đang tải tệp lên...' : 'Đang quét và phân tích nội dung...'}
                                                    </Paragraph>
                                                </div>
                                            )}
                                            
                                            <div className="text-center">
                                                <Button
                                                    type="primary"
                                                    onClick={handleUpload}
                                                    disabled={fileList.length === 0 || uploadStatus === 'uploading' || uploadStatus === 'scanning'}
                                                    loading={uploadStatus === 'uploading'}
                                                    className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600 min-w-[150px]"
                                                >
                                                    {uploadStatus === 'uploading' ? 'Đang tải lên' : 'Bắt đầu kiểm tra'}
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
                                        <div>                                            {!results ? (
                                                <Card bordered={false}>
                                                    <div className="text-center py-10">
                                                        <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
                                                        <Paragraph>
                                                            Chưa có kết quả kiểm tra nào. Vui lòng tải lên tài liệu để bắt đầu kiểm tra.
                                                        </Paragraph>
                                                    </div>
                                                </Card>
                                            ) : (
                                                <>                                                    <Card bordered={false} className="mb-6">
                                                        <Row gutter={[24, 24]} align="middle">
                                                            <Col xs={24} md={8}>
                                                                <div className="text-center">
                                                                    <Progress
                                                                        type="dashboard"
                                                                        percent={100 - results.similarityPercentage}
                                                                        format={() => `${100 - results.similarityPercentage}%`}
                                                                        strokeColor={getProgressStrokeColor(results.similarityPercentage)}
                                                                    />
                                                                    <Title level={4} className="mt-4 mb-0">
                                                                        Tính nguyên bản
                                                                    </Title>
                                                                </div>
                                                            </Col>
                                                            <Col xs={24} md={16}>                                                                <Alert
                                                                    message={getAlertMessage(getSimilarityLevel(results.similarityPercentage))}
                                                                    type={getAlertType(getSimilarityLevel(results.similarityPercentage))}
                                                                    showIcon
                                                                    icon={getAlertIcon(getSimilarityLevel(results.similarityPercentage))}
                                                                    className="mb-4"
                                                                />
                                                                
                                                                <Row gutter={16}>
                                                                    <Col span={8}>
                                                                        <Statistic title="Tổng số matches" value={results.totalMatches} />
                                                                    </Col>
                                                                    <Col span={8}>
                                                                        <Statistic title="Độ tương đồng" value={`${results.similarityPercentage}%`} />
                                                                    </Col>                                                                    <Col span={8}>
                                                                        <Statistic 
                                                                            title="Trạng thái" 
                                                                            value={results.status}
                                                                            className="[&_.ant-statistic-content-value]:text-blue-500"
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                      <Card 
                                                        title="Các nguồn tài liệu tương đồng" 
                                                        bordered={false} 
                                                        className="mb-6"
                                                    >
                                                        <Table 
                                                            dataSource={results.matches} 
                                                            columns={sourcesColumns}
                                                            rowKey="source"
                                                            pagination={false}
                                                        />
                                                    </Card>
                                                    
                                                    <Card 
                                                        title="Phân tích chi tiết" 
                                                        bordered={false}
                                                        extra={                                                            <Button 
                                                                type="primary" 
                                                                onClick={() => getDetailedAnalysis(results.reportId)}
                                                                className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                                                            >
                                                                Xem chi tiết
                                                            </Button>
                                                        }
                                                    >                                                        {detailedAnalysis ? (
                                                            <div>
                                                                {detailedAnalysis.detailedAnalysis.map((chunk) => {
                                                                    const similarity = chunk.similarity * 100;
                                                                    let bgClass = '';
                                                                    let borderClass = '';
                                                                    
                                                                    if (similarity > 70) {
                                                                        bgClass = 'bg-red-50';
                                                                        borderClass = 'border-red-200';
                                                                    } else if (similarity > 50) {
                                                                        bgClass = 'bg-yellow-50';
                                                                        borderClass = 'border-yellow-200';
                                                                    } else {
                                                                        bgClass = 'bg-green-50';
                                                                        borderClass = 'border-green-200';
                                                                    }
                                                                    
                                                                    return (
                                                                        <div key={chunk.chunkIndex} className={`mb-4 p-4 rounded-lg border ${bgClass} ${borderClass}`}>
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <Text strong>Đoạn văn #{chunk.chunkIndex + 1}</Text>
                                                                                <Tag color={getTagColor(chunk.similarity * 100)}>
                                                                                    {Math.round(chunk.similarity * 100)}% tương đồng
                                                                                </Tag>
                                                                            </div>
                                                                            <Paragraph className="mb-2">
                                                                                {highlightText(chunk.text, chunk.similarity * 100)}
                                                                            </Paragraph>
                                                                            {chunk.matches.length > 0 && (
                                                                                <Text type="secondary">
                                                                                    Nguồn: {chunk.matches.map((match: any, index: number) => (
                                                                                        <span key={`match-${chunk.chunkIndex}-${index}`}>
                                                                                            <a href={match.payload?.url || '#'} target="_blank" rel="noreferrer">
                                                                                                {match.payload?.url || 'Nguồn không xác định'}
                                                                                            </a>
                                                                                            {index < chunk.matches.length - 1 && ', '}
                                                                                        </span>
                                                                                    ))}
                                                                                </Text>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-5">
                                                                <Text type="secondary">Nhấn "Xem chi tiết" để phân tích từng đoạn văn</Text>
                                                            </div>
                                                        )}
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
                                    children: (                                        <Card bordered={false}>
                                            <div className="text-center py-10">
                                                <HistoryOutlined className="text-5xl text-gray-300 mb-4" />
                                                <Paragraph>
                                                    Lịch sử kiểm tra sẽ hiển thị ở đây sau khi bạn đăng nhập vào hệ thống.
                                                </Paragraph>
                                                <Button type="primary" className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600">
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
                                    children: (                                        <Card bordered={false}>
                                            <Paragraph className="mb-6">
                                                Tùy chỉnh các thiết lập kiểm tra đạo văn để phù hợp với yêu cầu của bạn.
                                            </Paragraph>
                                            
                                            <div className="mb-6">
                                                <Title level={5}>Nguồn kiểm tra</Title>
                                                <Checkbox.Group
                                                    defaultValue={['internet', 'academic', 'journals']}
                                                    options={[
                                                        { label: 'Internet', value: 'internet' },
                                                        { label: 'Cơ sở dữ liệu học thuật', value: 'academic' },
                                                        { label: 'Tạp chí khoa học', value: 'journals' },
                                                        { label: 'Kho lưu trữ nội bộ', value: 'internal' },
                                                    ]}
                                                />                                            </div>
                                            
                                            <div className="mb-6">
                                                <Title level={5}>Ngôn ngữ</Title>
                                                <Radio.Group defaultValue="vi">
                                                    <Radio value="vi">Tiếng Việt</Radio>
                                                    <Radio value="en">Tiếng Anh</Radio>
                                                    <Radio value="both">Cả hai</Radio>
                                                </Radio.Group>
                                            </div>
                                            
                                            <div className="mb-6">
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
                            <Row gutter={[24, 24]}>                                <Col xs={24} md={8}>
                                    <Card 
                                        bordered={false} 
                                        className="h-full text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex justify-center items-center mx-auto mb-4">
                                            <CheckCircleOutlined className="text-3xl text-orange-500" />
                                        </div>
                                        <Title level={4}>Vector Database</Title>
                                        <Paragraph>
                                            Sử dụng Qdrant Vector Database và AI để phát hiện nội dung trùng lặp với độ chính xác cao
                                        </Paragraph>
                                    </Card>
                                </Col>                                <Col xs={24} md={8}>
                                    <Card 
                                        bordered={false} 
                                        className="h-full text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex justify-center items-center mx-auto mb-4">
                                            <DatabaseOutlined className="text-3xl text-orange-500" />
                                        </div>
                                        <Title level={4}>AWS S3 Storage</Title>
                                        <Paragraph>
                                            Lưu trữ tài liệu an toàn trên AWS S3 với khả năng mở rộng và bảo mật cao
                                        </Paragraph>
                                    </Card>
                                </Col>                                <Col xs={24} md={8}>
                                    <Card 
                                        bordered={false} 
                                        className="h-full text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex justify-center items-center mx-auto mb-4">
                                            <LockOutlined className="text-3xl text-orange-500" />
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

'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout, Card, Typography, Space, Button, Tag, Descriptions } from 'antd';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';
import { CalendarOutlined, FieldTimeOutlined, LinkOutlined, ArrowLeftOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function MyCouncilTopicDetailPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const title = searchParams.get('title') || '';
	const description = searchParams.get('description') || '';
	const fileUrl = searchParams.get('fileUrl') || '';
	const defenseTime = searchParams.get('defenseTime') || '';
	const defenseDate = searchParams.get('defenseDate') || '';
	const councilName = searchParams.get('councilName') || '';
	const semester = searchParams.get('semester') || '';

	return (
		<Layout className="min-h-screen">
			<Header />

			<Content className="p-10 bg-gray-50">
				<div className="max-w-4xl mx-auto">
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => router.back()}
						size="large"
						className="mb-6"
					>
						Quay lại
					</Button>

					<Card className="shadow-lg">
						<div className="mb-4 flex items-center justify-between flex-wrap gap-3">
							<div className="flex items-center gap-2">
								<FileTextOutlined className="text-orange-500" />
								<Title level={3} className="!mb-0">{title}</Title>
							</div>
							<Space wrap>
								{semester && <Tag color="orange">{semester}</Tag>}
							</Space>
						</div>

						<Descriptions bordered column={1} size="middle" className="mb-4">
							{councilName && (
								<Descriptions.Item label="Hội đồng">
									<Space>
										<TeamOutlined />
										<Text strong>{councilName}</Text>
									</Space>
								</Descriptions.Item>
							)}
							{defenseDate && (
								<Descriptions.Item label="Ngày chấm">
									<Space>
										<CalendarOutlined />
										<Text>{defenseDate}</Text>
									</Space>
								</Descriptions.Item>
							)}
							{defenseTime && (
								<Descriptions.Item label="Giờ chấm">
									<Space>
										<FieldTimeOutlined />
										<Text>{defenseTime.substring(0, 5)}</Text>
									</Space>
								</Descriptions.Item>
							)}
						</Descriptions>

						{description && (
							<div className="mb-4">
								<Title level={5}>Mô tả</Title>
								<Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
									{description}
								</Paragraph>
							</div>
						)}

						{fileUrl && (
							<Button
								type="primary"
								icon={<LinkOutlined />}
								href={fileUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								Mở file đề tài
							</Button>
						)}
					</Card>
				</div>
			</Content>

			<Footer />
		</Layout>
	);
}



'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Layout, Card, Descriptions, Spin, Tag, List, Divider, Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import reviewCouncilService from '@/services/reviewCouncilService';
import { accountService, CurrentUser } from '@/services/accountService';
import Header from '@/components/combination/Header';
import Footer from '@/components/combination/Footer';




const { Content } = Layout;

export default function ReviewCouncilDetailPage() {
  const searchParams = useSearchParams();
  const councilID = searchParams.get('id');
  const router = useRouter();
  const [council, setCouncil] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [isGrading, setIsGrading] = useState(false);
  const [comment, setComment] = useState('');
  const [decision, setDecision] = useState<'ACCEPT' | 'REJECT' | 'NOT_DECIDED'>('NOT_DECIDED');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)



  // lấy thông tin người đang đăng nhập
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response: any = await accountService.getMe();
        if (response && response.data && response.code === 200) {
          console.log('Lấy thông tin user thành công:', response.data);
          setCurrentUser(response.data);
        } else {
          console.error('Lỗi khi lấy user, response không hợp lệ:', response);
          toast.error('Không thể xác thực người dùng.');
        }
      } catch (err) {
        console.error('Lỗi nghiêm trọng khi fetch user:', err);
        toast.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
      }
    };

    fetchCurrentUser();
  }, []);


  useEffect(() => {
    if (councilID) fetchCouncilDetail(councilID);
  }, [councilID]);

  const fetchCouncilDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = await reviewCouncilService.getCouncilById(Number(id));
      setCouncil(data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin hội đồng:', err);
    } finally {
      setLoading(false);
    }
  };

  // kiểm tra người đang đăng nhập có phải người nằm trong hội đồng hay không
  const isLecturerInCouncil = useMemo(() => {
    if (!currentUser || !council) return false;

    const isLecturer = currentUser.role === 'LECTURER';

    const inCouncil = council.lecturers?.some(
      (lec: any) =>
        lec.accountEmail === currentUser.email ||
        lec.accountName === currentUser.name
    );

    console.log(`[Phân quyền] Là Lecturer: ${isLecturer}, Có trong hội đồng: ${inCouncil}`);
    return isLecturer && inCouncil;
  }, [currentUser, council]);


  const submitGrade = async () => {
    if (!councilID) return;

    setIsConfirmLoading(true);

    try {
      await reviewCouncilService.gradeCouncilMember(Number(councilID), comment, decision);
      toast.success('Chấm bài thành công!');


      setIsGrading(false);
      setComment('');
      setDecision('NOT_DECIDED');

      await fetchCouncilDetail(councilID);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể chấm bài');
    } finally {
      setIsConfirmLoading(false);
      setIsConfirmOpen(false);
    }
  };

  // đánh giá
  const handleGrade = () => {

    if (!comment.trim() || decision === 'NOT_DECIDED') {
      toast.warning('Vui lòng nhập nhận xét và chọn quyết định trước khi gửi!');
      return;
    }

    setIsConfirmOpen(true);
  };

  // Kiểm tra xem giảng viên hiện tại đã chấm bài chưa
  const currentLecturerDecision = useMemo(() => {
    if (!currentUser || !council) return null;

    const lecturer = council.lecturers?.find(
      (lec: any) =>
        lec.accountEmail === currentUser.email ||
        lec.accountName === currentUser.name
    );

    return lecturer ? lecturer.decision : null;
  }, [currentUser, council]);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Đạt':
        return 'green';
      case 'Không đạt':
        return 'red';
      case 'Chưa có':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getMilestoneColor = (milestone: string) => {
    switch (milestone) {
      case 'WEEK 4':
        return 'orange';
      case 'WEEK 8':
        return 'cyan';
      case 'WEEK 12':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="p-6 bg-gray-100 min-h-[80vh] flex justify-center">
        {loading || !council ? (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ maxWidth: 800, width: '100%' }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/review-council')}
              style={{ marginBottom: 16, paddingLeft: 0 }}
            >
              Quay lại danh sách hội đồng
            </Button>
            <Card
              title={`Chi tiết hội đồng: ${council.name}`}
              variant="outlined"
              className="shadow-md rounded-lg"
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Đề tài" span={2} >
                  {council.topicTitle}
                </Descriptions.Item>

                <Descriptions.Item label="Mốc review">
                  <Tag color={getMilestoneColor(council.milestone)}>
                    {council.milestone}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Ngày review">
                  {dayjs(council.reviewDate).format('DD/MM/YYYY')}
                </Descriptions.Item>

                <Descriptions.Item label="Hình thức" >
                  {council.reviewFormat}
                </Descriptions.Item>

                {council.reviewFormat === 'ONLINE' ? (
                  <Descriptions.Item label="Link meeting" >
                    {council.meetingLink ? (
                      <a
                        href={council.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      // style={{ color: '#1677ff', textDecoration: 'underline' }}
                      >
                        Link
                      </a>
                    ) : (
                      <i>Chưa có link</i>
                    )}
                  </Descriptions.Item>
                ) : (
                  <Descriptions.Item label="Phòng" >
                    {council.roomNumber || <i>Chưa có số phòng</i>}
                  </Descriptions.Item>
                )}


                <Descriptions.Item label="Trạng thái" >
                  <Tag
                    color={
                      council.status === 'Đã lập'
                        ? 'blue'
                        : council.status === 'Hoàn thành'
                          ? 'green'
                          : council.status === 'Đã hủy'
                            ? 'red'
                            : 'gray'
                    }
                  >
                    {council.status}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Kết quả" >
                  <Tag color={getResultColor(council.result)}>
                    {council.result}
                  </Tag>
                </Descriptions.Item>



              </Descriptions>

              <Divider orientation="left" style={{ marginTop: 24 }}>
                Thành viên hội đồng
              </Divider>

              <List
                dataSource={council.lecturers || []}
                renderItem={(lec: any, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div className="flex justify-between items-center w-full">
                          <Tag color={index % 2 === 0 ? 'purple' : 'cyan'}>
                            {lec.accountName}
                          </Tag>

                          {/* 🔹 Hiển thị trạng thái chấm của từng giảng viên */}
                          {lec.decision === 'Chấp nhận' && <Tag color="green">Chấp nhận</Tag>}
                          {lec.decision === 'Từ chối' && <Tag color="red">Từ chối</Tag>}
                          {lec.decision === 'Chưa chấm' && <Tag color="gray">Chưa chấm</Tag>}
                        </div>
                      }
                      description={lec.overallComments || <em>Chưa có nhận xét</em>}
                    />
                  </List.Item>
                )}
              />

              {isLecturerInCouncil && (
                <div className="mt-4">
                  {!isGrading ? (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setIsGrading(true)}
                        disabled={currentLecturerDecision && currentLecturerDecision !== 'Chưa chấm'}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-white ${currentLecturerDecision && currentLecturerDecision !== 'Chưa chấm'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                      >
                        {currentLecturerDecision && currentLecturerDecision !== 'Chưa chấm'
                          ? 'Đã chấm bài'
                          : 'Chấm bài'}
                      </button>
                    </div>
                  ) : (

                    <Card title="Chấm bài hội đồng" className="mt-4 shadow-md">
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="font-semibold">Nhận xét tổng quát:</label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="Nhập nhận xét của bạn..."
                          />
                        </div>

                        <div>
                          <label className="font-semibold">Quyết định:</label>
                          <select
                            value={decision}
                            onChange={(e) =>
                              setDecision(e.target.value as 'ACCEPT' | 'REJECT' | 'NOT_DECIDED')
                            }
                            className="w-full border border-gray-300 rounded-md p-2"
                          >
                            <option value="NOT_DECIDED">Chưa chấm</option>
                            <option value="ACCEPT">Chấp nhận</option>
                            <option value="REJECT">Từ chối</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setIsGrading(false)}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleGrade}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                          >
                            Gửi chấm điểm
                          </button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

            </Card>
          </div>
        )}
      </Content>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />


      <Modal // modal xác nhận 
        title="Xác nhận chấm bài"
        open={isConfirmOpen}
        onOk={submitGrade}
        onCancel={() => setIsConfirmOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okType="primary"
        confirmLoading={isConfirmLoading}
      >
        <div>
          <p>Bạn có chắc chắn muốn gửi chấm bài cho hội đồng này không?</p>
          <p style={{ marginTop: 8 }}>
            <strong>Nhận xét:</strong> {comment}
          </p>
          <p>
            <strong>Quyết định:</strong>{' '}
            {decision === 'ACCEPT' ? 'Chấp nhận' : decision === 'REJECT' ? 'Từ chối' : 'Chưa chấm'}
          </p>
        </div>
      </Modal>
    </Layout>
  );
}

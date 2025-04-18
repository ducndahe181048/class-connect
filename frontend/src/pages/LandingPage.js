import React from 'react';
import { Button, Card, CardGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImageHero from "../assets/hero-image.png";
import Image1 from "../assets/image-1.png";
import Image2 from "../assets/image-2.png";
import Image3 from "../assets/image-3.png";
import "../css/LandingPage.css";

function LandingPage() {
    return (
        <>
            <div className='navbar'>
                <div className='logo'>ClassConnect</div>
                <div className='navbar-right'>
                    <a href="#second-section" className='feature'>Tính năng</a>
                    <a href="#third-section" className='value'>Đánh giá</a>
                    <a href="#faq-section" className='faq'>FAQ</a>
                    <Button as={Link} to="/signup" className='button'>Đăng ký ngay</Button>
                </div>
            </div>

            <div className='first-section'>
                <img className='image-hero' src={ImageHero} alt="HeroImage" />
                <div className='overlay-text'>
                    <h1>Giải pháp quản lý lớp học hiệu quả</h1>
                    <br />
                    <p>ClassConnect giúp giáo viên và học sinh dễ dàng quản lý lớp học, theo dõi tiến độ và cải thiện trải nghiệm học tập.</p>
                    <br />
                    <Button as={Link} to="/login" className='button'>Bắt đầu ngay</Button>
                </div>
            </div>

            <div className='second-section' id='second-section'>
                <h1 className='section-heading'>Tính năng nổi bật</h1>
                <br />
                <div className='subheading-container'>
                    <div className='subheading'>
                        <img className='image-second-section' src={Image1} alt="Example" />
                        <br />
                        <br />
                        <div className='subheading-text'>
                            <b>Quản lý lớp học</b>
                            <br />
                            <p>Dễ dàng tạo và tổ chức lớp học, thêm học viên, và theo dõi tiến độ.</p>
                        </div>
                    </div>

                    <div className='subheading'>
                        <img className='image-second-section' src={Image2} alt="Example" />
                        <br />
                        <br />
                        <div className='subheading-text'>
                            <b>Lịch học thông minh</b>
                            <br />
                            <p>Tự động sắp xếp lịch học, gửi nhắc nhở và đồng bộ với Google Calendar.</p>
                        </div>
                    </div>

                    <div className='subheading'>
                        <img className='image-second-section' src={Image3} alt="Example" />
                        <br />
                        <br />
                        <div className='subheading-text'>
                            <b>Tương tác trực tuyến</b>
                            <br />
                            <p>Tích hợp công cụ thảo luận, chấm điểm và gửi phản hồi ngay trong ứng dụng.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='third-section' id='third-section'>
                <h1 className='section-heading'>Người dùng nói gì về ClassConnect?</h1>
                <br />
                <div className='testimonials-container'>
                    <CardGroup>
                        <Card>
                            <Card.Body>
                                <Card.Title>Nguyễn Văn A - Giáo viên</Card.Title>
                                <Card.Text>
                                    "Với ClassConnect, giáo viên và học sinh đều có được sự chủ động trong việc dạy và học.
                                    Các em đã biết tự lên kế hoạch học bài - làm bài, có thể xem được lời giải và video hướng dẫn.
                                    Giáo viên có thể theo dõi tiến độ làm bài tập của các em, dựa vào thống kê để rút ra các kiến thức mà nhiều em còn chưa vững để điều chỉnh bài tập
                                    cho phù hợp."
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Body>
                                <Card.Title>Trần Thị B - Học viên</Card.Title>
                                <Card.Text>
                                    "ClassConnect đã giúp cho việc dạy học của giáo viên được thuận lợi và hiệu quả hơn. Mình hài lòng về các tính năng hiện có trên ClassConnect."
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Body>
                                <Card.Title>Phạm Minh C - Học viên</Card.Title>
                                <Card.Text>
                                    "Mình thấy phần mềm dễ dùng, mình sẽ vẫn dùng và chia sẻ với mọi người.
                                    Chúc các bạn phát triển rộng rãi phần mềm của mình và cải tiến phần mềm ngày càng tích hợp nhiều tính năng hơn nữa nhé!"
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </CardGroup>
                </div>
            </div>

            <div className='faq-section' id='faq-section'>
                <h1 className='section-heading'>Câu hỏi thường gặp (FAQ)</h1>
                <div className='faq-container'>
                    <div className='faq-item'>
                        <b>📌 ClassConnect có miễn phí không?</b>
                        <p>✅ Có! ClassConnect cung cấp gói miễn phí cho giáo viên cá nhân và lớp học nhỏ.</p>
                    </div>
                    <div className='faq-item'>
                        <b>📌 Tôi có thể dùng thử bao lâu?</b>
                        <p>✅ Bạn có thể dùng thử gói miễn phí cho đến khi quyết định nâng cấp lên bản cao cấp.</p>
                    </div>
                    <div className='faq-item'>
                        <b>📌 ClassConnect hỗ trợ nền tảng nào?</b>
                        <p>✅ Hiện tại, ClassConnect chỉ hỗ trợ trên trình duyệt web.</p>
                    </div>
                    <div className='faq-item'>
                        <b>📌 Tôi có thể liên hệ hỗ trợ ở đâu?</b>
                        <p>✅ Bạn có thể liên hệ qua email: support@classconnect.com hoặc gọi 0344420156 để được hỗ trợ.</p>
                    </div>
                </div>
            </div>

            <div className='footer'>
                <div className='footer-container'>
                    <div className='footer-logo'>
                        <h2>ClassConnect</h2>
                        <p>Giải pháp quản lý lớp học hiệu quả.</p>
                    </div>
                    <div className='footer-links'>
                        <h3>Liên kết nhanh</h3>
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li><Link to="/">Tính năng</Link></li>
                            <li><Link to="/">Giá cả</Link></li>
                            <li><Link to="/">Liên hệ</Link></li>
                        </ul>
                    </div>
                    <div className='footer-contact'>
                        <h3>Liên hệ</h3>
                        <p>Email: support@classconnect.com</p>
                        <p>Điện thoại: 0344420156</p>
                        <p>Địa chỉ: 123 Đường ABC, Thành phố Hà Nội</p>
                    </div>
                </div>
                <div className='footer-bottom'>
                    <p>© 2025 ClassConnect. All rights reserved.</p>
                </div>
            </div>
        </>
    )
}

export default LandingPage

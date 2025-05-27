// src/components/Footer.js
import React from 'react';
import { FaEnvelope, FaGithub, FaFacebook, FaUniversity } from 'react-icons/fa';

const footerStyle = {
    background: '#20232a',
    color: '#e0e3eb',
    padding: '36px 0 14px 0',
    borderTop: '3.5px solid #1677ff',
    fontFamily: 'Montserrat, sans-serif'
};
const linkStyle = {
    color: '#4fc3f7',
    textDecoration: 'none',
    margin: '0 10px',
    transition: 'color 0.15s'
};
const iconStyle = {
    marginRight: 8,
    verticalAlign: 'middle'
};
const sectionTitle = {
    fontWeight: 700,
    color: '#fff',
    fontSize: 17,
    marginBottom: 8
};

const Footer = () => {
    return (
        <footer style={footerStyle}>
            <div
                className="container"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: 60,
                    maxWidth: 850,
                    margin: '0 auto',
                    padding: '0 8px'
                }}
            >
                {/* Logo + mô tả */}
                <div
                    style={{
                        minWidth: 260,
                        maxWidth: 360,
                        flex: '1 1 320px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // Căn giữa mọi thứ trong cột
                        textAlign: 'center'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, justifyContent: 'center' }}>
                        <img src="/logo192.png" alt="logo" width={32} />
                        <span style={{ fontWeight: 900, fontSize: 23, color: '#1677ff' }}>
                            LMS
                        </span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: '#b5c0d0', maxWidth: 320 }}>
                        Nền tảng học trực tuyến hiện đại, dễ sử dụng. Học tập mọi lúc, mọi nơi.
                    </div>
                </div>
                {/* Contact */}
                <div
                    style={{
                        minWidth: 260,
                        maxWidth: 360,
                        flex: '1 1 320px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // Căn giữa
                        textAlign: 'center'
                    }}
                >
                    <div style={sectionTitle}>Contact</div>
                    <div style={{ fontSize: 15, marginBottom: 8 }}>
                        <FaEnvelope style={iconStyle} /> thangchien62@gmail.com<br />
                        <FaEnvelope style={iconStyle} /> lecongthanhyahho@gmail.com<br />
                        <FaUniversity style={iconStyle} /> HCMUTE, Viet Nam
                    </div>
                    <div style={{ fontSize: 19 }}>
                        <a href="https://github.com/VictoryP623" target="_blank" rel="noopener noreferrer" style={linkStyle} title="Github"><FaGithub /></a>
                        <a href="https://www.facebook.com/Pham.Chien.Thang.06.02.2003" target="_blank" rel="noopener noreferrer" style={linkStyle} title="Facebook"><FaFacebook /></a>
                        <a href="https://www.facebook.com/MrMikeyyyy" target="_blank" rel="noopener noreferrer" style={linkStyle} title="Facebook"><FaFacebook /></a>
                    </div>
                </div>
            </div>
            <div
                style={{
                    marginTop: 28,
                    borderTop: '1.2px solid #384150',
                    textAlign: 'center',
                    color: '#8e99b3',
                    fontSize: 15,
                    paddingTop: 13
                }}
            >
                &copy; 2025 <span style={{ color: "#4fc3f7", fontWeight: 700 }}>Learning Management System</span>. All rights reserved.
            </div>
        </footer>

    );
};

export default Footer;

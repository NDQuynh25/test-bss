import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlashSale = () => {
    const [data, setData] = useState(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = 'http://localhost:5000/api';

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/product-status`);
            setData(res.data);
        } catch (error) {
            console.error("Lỗi kết nối server", error);
            setError("Không thể kết nối với máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    
    const normalizePhone = (phone) => {
        let p = phone.trim();
        if (p.startsWith('+84')) {
            p = '0' + p.slice(3);
        }
        return p;
    };


    const isValidPhone = (phone) => {
        const regex = /^(0)[0-9]{9}$/;
        return regex.test(phone);
    };

    const handleOrder = async () => {
        setError('');
        setSuccess('');

        if (!phone.trim()) {
            setError("Số điện thoại không được bỏ trống!");
            return;
        }

        if (phone.length > 20) {
            setError("Số điện thoại tối đa 20 ký tự!");
            return;
        }

        const normalizedPhone = normalizePhone(phone);

        if (!isValidPhone(normalizedPhone)) {
            setError("Số điện thoại không hợp lệ! (VD: 098xxxxxxx hoặc +8498xxxxxxx)");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/order`, { phone: normalizedPhone });
            setSuccess(res.data.message);
            setPhone('');
            fetchStatus();
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra khi đặt hàng.");
        }
    };

    if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

    if (!data || data.status === 'NO_PRODUCT') {
        return (
            <div className="no-product-container">
                <h1 style={{ color: '#888' }}>No product</h1>
                <p>Hiện không có chương trình Flash Sale nào đang diễn ra.</p>
            </div>
        );
    }

    const isOutOfStock = data.remaining <= 0;
    const normalizedPhone = normalizePhone(phone);
    const canSubmit = isValidPhone(normalizedPhone);

    return (
        <div className="flash-sale-container">
            <div className="product-card">
                <div className="badge">Flash Sale</div>

                <img
                    src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692923777972"
                    alt="Iphone 15"
                    className="product-image"
                />

                <div className="product-info">
                    <h2>{data.product.name}</h2>
                    <p className="price">Giá: {data.product.price} USD</p>
                    <p className="stock">
                        Sản phẩm còn lại: <strong>{data.remaining}</strong>
                    </p>

                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại:</label>

                        <input
                            id="phone"
                            type="text"
                            placeholder="Nhập số điện thoại của bạn"
                            value={phone}
                            maxLength={20}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9+]/g, '');
                                setPhone(value);
                            }}
                        />

                        {error && <p className="error-msg">{error}</p>}
                        {success && <p className="success-msg">{success}</p>}
                    </div>

                    {!isOutOfStock ? (
                        <button
                            className="btn-add"
                            onClick={handleOrder}
                            disabled={!canSubmit}
                        >
                            Add to cart
                        </button>
                    ) : (
                        <button className="btn-out" disabled>
                            Out of stock
                        </button>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .flash-sale-container {
                    display: flex;
                    justify-content: center;
                    padding: 20px;
                }
                .product-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    width: 100%;
                    max-width: 400px;
                    overflow: hidden;
                    position: relative;
                }
                .badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: #ff3b30;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 12px;
                }
                .product-image {
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                }
                .product-info {
                    padding: 20px;
                }
                h2 { margin-bottom: 10px; }
                .price { color: #ff3b30; font-weight: bold; }
                .stock { margin-bottom: 20px; }
                input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                }
                .btn-add {
                    width: 100%;
                    padding: 14px;
                    background: #0071e3;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .btn-add:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                .btn-out {
                    width: 100%;
                    padding: 14px;
                    background: #ccc;
                    border-radius: 8px;
                    border: none;
                }
                .error-msg { color: red; }
                .success-msg { color: green; }
                `
            }} />
        </div>
    );
};

export default FlashSale;
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';



export default function AddCardPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        monthlyRefreshed: false,
        monthlyConsumed: false,
        annualCount: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardTemplates, setCardTemplates] = useState<string[]>([]);

    // Fetch card templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/card-templates');
                if (res.ok) {
                    const data = await res.json();
                    if (data.templates) {
                        setCardTemplates(data.templates);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch card templates', error);
            }
        };
        fetchTemplates();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                alert('新增失敗');
            }
        } catch (error) {
            console.error(error);
            alert('發生錯誤');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
            <div className="card">
                <h1 className="mb-4 text-center">新增 JCB 卡片</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>卡片名稱</label>
                        <input
                            list="card-list"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="輸入或選擇卡片名稱"
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
                        />
                        <datalist id="card-list">
                            {cardTemplates.map((card) => (
                                <option key={card} value={card} />
                            ))}
                        </datalist>
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>目前悠遊卡餘額 (選填)</label>
                        <input
                            type="number"
                            value={formData.balance}
                            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                            placeholder="0"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
                        />
                    </div>

                    <div className="mb-4" style={{ display: 'flex', gap: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.monthlyRefreshed}
                                onChange={(e) => setFormData({ ...formData, monthlyRefreshed: e.target.checked })}
                                style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
                            />
                            本月已登錄回饋
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.monthlyConsumed}
                                onChange={(e) => setFormData({ ...formData, monthlyConsumed: e.target.checked })}
                                style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
                            />
                            本月已完成自動加值
                        </label>
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>本年度已完成次數 (登錄)</label>
                        <select
                            value={formData.annualCount}
                            onChange={(e) => setFormData({ ...formData, annualCount: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
                        >
                            <option value="" disabled>請選擇次數</option>
                            {[0, 1, 2, 3].map((num) => (
                                <option key={num} value={num}>
                                    {num} 次
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/" className="btn" style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--foreground)', textAlign: 'center' }}>
                            取消
                        </Link>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? '新增中...' : '確認新增'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

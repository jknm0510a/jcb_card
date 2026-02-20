'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COMMON_CARDS = [
    '玉山JCB悠遊信用卡',
    '富邦JCB悠遊信用卡',
    '聯邦JCB悠遊信用卡',
    '中信JCB悠遊信用卡',
    '國泰JCB悠遊信用卡',
    '永豐JCB悠遊信用卡',
    '遠東JCB悠遊信用卡',
];

export default function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        monthlyRefreshed: false,
        monthlyConsumed: false,
        annualCount: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchInitialCard = async () => {
            try {
                // Since our API currently doesn't have a single GET endpoint other than the list,
                // we'll fetch the list and isolate the card we're editing.
                const res = await fetch('/api/cards');
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();

                if (data.cards) {
                    const existingCard = data.cards.find((c: any) => c.id === parseInt(resolvedParams.id));
                    if (existingCard) {
                        setFormData({
                            name: existingCard.name,
                            balance: existingCard.balance.toString(),
                            monthlyRefreshed: existingCard.monthlyRefreshed,
                            monthlyConsumed: existingCard.monthlyConsumed,
                            annualCount: existingCard.annualCount.toString(),
                        });
                    } else {
                        alert('找不到該卡片資料');
                        router.push('/');
                    }
                }
            } catch (error) {
                console.error('Failed to load card details', error);
                alert('無法載入卡片資料');
            } finally {
                setIsFetching(false);
            }
        };

        fetchInitialCard();
    }, [resolvedParams.id, router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm('確認要修改卡片資料嗎？')) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/cards/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    balance: parseInt(formData.balance) || 0,
                    monthlyRefreshed: formData.monthlyRefreshed,
                    monthlyConsumed: formData.monthlyConsumed,
                    annualCount: parseInt(formData.annualCount) || 0,
                }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                alert('修改失敗');
            }
        } catch (error) {
            console.error(error);
            alert('發生錯誤');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="container text-center mt-4">載入中...</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div className="card">
                <h1 className="mb-4 text-center">修改 JCB 卡片</h1>
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
                            {COMMON_CARDS.map((card) => (
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

                    <div className="mb-4" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
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
                            {isLoading ? '儲存中...' : '確認修改'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

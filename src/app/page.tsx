'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Card {
  id: number;
  name: string;
  balance: number;
  monthlyRefreshed: boolean;
  monthlyConsumed: boolean;
  annualCount: number;
}

const getNextRegistrationTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  // Potential upcoming slots within the current month
  const targetDates = [
    new Date(year, month, 1, 9, 0, 0),
    new Date(year, month, 11, 9, 0, 0),
    new Date(year, month, 21, 9, 0, 0),
    // And the first slot of the NEXT month
    new Date(year, month + 1, 1, 9, 0, 0),
  ];

  // Find the first slot that is strictly greater than `now`
  const nextTarget = targetDates.find((date) => date > now);

  if (!nextTarget) {
    // Should never reach here due to the next month's 1st being included, but fallback
    return new Date(year, month + 1, 1, 9, 0, 0);
  }

  return nextTarget;
};

export default function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextRegTime, setNextRegTime] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCards();
    setNextRegTime(getNextRegistrationTime());
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Failed to fetch cards', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這張卡片嗎？')) return;

    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCards(cards.filter((c) => c.id !== id));
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error(error);
      alert('發生錯誤');
    }
  };

  if (isLoading) return <div className="container text-center mt-4">載入中...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>我的 JCB 卡片</h1>
        <Link href="/add" className="btn btn-primary">
          + 新增卡片
        </Link>
      </div>

      {nextRegTime && (
        <div style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
          下次搶登錄時間為 {nextRegTime.getFullYear()}年{nextRegTime.getMonth() + 1}月{nextRegTime.getDate()}日09時00分
        </div>
      )}

      {cards.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>目前沒有卡片資料</p>
          <Link href="/add" className="btn btn-primary">
            立即新增第一張卡片
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {cards.map((card) => {
            const isMaxedOut = card.monthlyRefreshed && card.monthlyConsumed && card.annualCount >= 3;
            // Style for maxed out cards: grayed out
            const cardStyle = isMaxedOut
              ? { opacity: 0.6, filter: 'grayscale(100%)' }
              : {};

            return (
              <div key={card.id} className="card" style={{ ...cardStyle, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{card.name}</h3>
                  <button
                    onClick={() => handleDelete(card.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      cursor: 'pointer',
                      padding: '0 0.5rem',
                    }}
                    title="刪除"
                  >
                    &times;
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>餘額</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${card.balance}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ padding: '0.5rem', background: card.monthlyRefreshed ? '#c6f6d5' : '#fed7d7', borderRadius: '4px', textAlign: 'center', color: card.monthlyRefreshed ? '#22543d' : '#822727' }}>
                    {card.monthlyRefreshed ? '已登錄本月' : '未登錄本月'}
                  </div>
                  <div style={{ padding: '0.5rem', background: card.monthlyConsumed ? '#c6f6d5' : '#fed7d7', borderRadius: '4px', textAlign: 'center', color: card.monthlyConsumed ? '#22543d' : '#822727' }}>
                    {card.monthlyConsumed ? '已完成自動加值' : '未完成自動加值'}
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--secondary)', fontSize: '0.9rem', color: '#718096', display: 'flex', justifyContent: 'space-between' }}>
                  <span>年度次數: {card.annualCount} / 3</span>
                  {isMaxedOut && <span style={{ color: '#e53e3e', fontWeight: 600 }}>已達上限</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

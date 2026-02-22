'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Card {
  id: number;
  bankName: string;
  cardName: string;
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

interface FilterState {
  bankName: string;
  monthlyRefreshed: string; // 'all', 'yes', 'no'
  monthlyConsumed: string; // 'all', 'yes', 'no'
  annualCount: string; // 'all', '0', '1', '2', '3'
}

const initialFilterState: FilterState = {
  bankName: 'all',
  monthlyRefreshed: 'all',
  monthlyConsumed: 'all',
  annualCount: 'all',
};

export default function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextRegTime, setNextRegTime] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterState>(initialFilterState);
  const [tempFilter, setTempFilter] = useState<FilterState>(initialFilterState);

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

  const handleUpdateCard = async (id: number, updates: Partial<Card>) => {
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setCards(cards.map((c) => (c.id === id ? data.card : c)));
      } else {
        alert('更新失敗');
      }
    } catch (error) {
      console.error('Failed to update card', error);
      alert('發生錯誤');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      } else {
        alert('登出失敗');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('發生錯誤');
    }
  };

  if (isLoading) return <div className="container text-center mt-4">載入中...</div>;

  // Extract unique bank names from our cards for the filter dropdown
  const uniqueBanks = Array.from(new Set(cards.map(c => c.bankName))).sort();

  // Apply filters
  const filteredCards = cards.filter(card => {
    if (activeFilter.bankName !== 'all' && card.bankName !== activeFilter.bankName) return false;

    if (activeFilter.monthlyRefreshed === 'yes' && !card.monthlyRefreshed) return false;
    if (activeFilter.monthlyRefreshed === 'no' && card.monthlyRefreshed) return false;

    if (activeFilter.monthlyConsumed === 'yes' && !card.monthlyConsumed) return false;
    if (activeFilter.monthlyConsumed === 'no' && card.monthlyConsumed) return false;

    if (activeFilter.annualCount !== 'all' && card.annualCount.toString() !== activeFilter.annualCount) return false;

    return true;
  });

  const handleOpenFilter = () => {
    setTempFilter(activeFilter);
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    setActiveFilter(tempFilter);
    setIsFilterOpen(false);
  };

  const handleClearFilter = () => {
    setTempFilter(initialFilterState);
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>我的 JCB 卡片</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleOpenFilter}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'white',
              border: '1px solid var(--secondary)',
              color: 'var(--primary)'
            }}
          >
            <svg viewBox="0 0 512 512" style={{ width: '1em', height: '1em', fill: 'currentColor' }}>
              <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
            </svg>
            篩選
          </button>
          <Link href="/add" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            + 新增卡片
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{
              background: '#e2e8f0',
              color: '#4a5568',
              border: '1px solid #cbd5e0'
            }}
          >
            登出
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>篩選卡片</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>銀行</label>
              <select
                value={tempFilter.bankName}
                onChange={(e) => setTempFilter({ ...tempFilter, bankName: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
              >
                <option value="all">全部銀行</option>
                {uniqueBanks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>本月已登錄回饋活動</label>
              <select
                value={tempFilter.monthlyRefreshed}
                onChange={(e) => setTempFilter({ ...tempFilter, monthlyRefreshed: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
              >
                <option value="all">全部</option>
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>本月已完成自動加值</label>
              <select
                value={tempFilter.monthlyConsumed}
                onChange={(e) => setTempFilter({ ...tempFilter, monthlyConsumed: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
              >
                <option value="all">全部</option>
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>年度次數</label>
              <select
                value={tempFilter.annualCount}
                onChange={(e) => setTempFilter({ ...tempFilter, annualCount: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--secondary)' }}
              >
                <option value="all">全部</option>
                <option value="0">0 次</option>
                <option value="1">1 次</option>
                <option value="2">2 次</option>
                <option value="3">3 次 (已滿)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleCloseFilter} className="btn" style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#4a5568' }}>取消</button>
                <button onClick={handleApplyFilter} className="btn btn-primary" style={{ flex: 1 }}>確定</button>
              </div>
              <button
                onClick={handleClearFilter}
                className="btn"
                style={{ width: '100%', backgroundColor: 'transparent', border: '1px dashed #cbd5e0', color: '#718096', marginTop: '0.5rem' }}
              >
                清除所有篩選項
              </button>
            </div>
          </div>
        </div>
      )}

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
      ) : filteredCards.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>沒有符合條件的卡片</p>
          <button onClick={() => setActiveFilter(initialFilterState)} className="btn btn-primary">
            清除所有篩選項
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredCards.map((card) => {
            const isMaxedOut = card.monthlyRefreshed && card.monthlyConsumed && card.annualCount >= 3;
            // Style for maxed out cards: grayed out
            const cardStyle = isMaxedOut
              ? { opacity: 0.6, filter: 'grayscale(100%)' }
              : {};

            return (
              <div key={card.id} className="card" style={{ ...cardStyle, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{card.bankName} - {card.cardName}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link
                      href={`/edit/${card.id}`}
                      style={{
                        fontSize: '1.2rem',
                        textDecoration: 'none',
                        padding: '0 0.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="修改"
                    >
                      <svg viewBox="0 0 512 512" style={{ width: '1em', height: '1em', fill: '#ecc94b' }}>
                        <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
                      </svg>
                    </Link>
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
                </div>

                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                  <div>
                    <p style={{ color: '#4a5568', fontSize: '0.9rem', marginBottom: '0.25rem' }}>悠遊卡餘額</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>${card.balance}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newBalanceStr = window.prompt(`修改「${card.bankName} - ${card.cardName}」的餘額`, card.balance.toString());
                      if (newBalanceStr !== null) {
                        const newBalance = parseInt(newBalanceStr, 10);
                        if (!isNaN(newBalance) && newBalance >= 0) {
                          handleUpdateCard(card.id, { balance: newBalance });
                        } else {
                          alert('請輸入有效的數字');
                        }
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e0',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: '#4a5568',
                    }}
                    title="修改餘額"
                  >
                    ✏️ 編輯
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <button
                    onClick={() => handleUpdateCard(card.id, { monthlyRefreshed: !card.monthlyRefreshed })}
                    style={{
                      padding: '0.5rem',
                      background: card.monthlyRefreshed ? '#c6f6d5' : '#fed7d7',
                      borderRadius: '4px',
                      textAlign: 'center',
                      color: card.monthlyRefreshed ? '#22543d' : '#822727',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {card.monthlyRefreshed ? '已登錄本月' : '未登錄本月'}
                  </button>
                  <button
                    onClick={() => handleUpdateCard(card.id, { monthlyConsumed: !card.monthlyConsumed })}
                    style={{
                      padding: '0.5rem',
                      background: card.monthlyConsumed ? '#c6f6d5' : '#fed7d7',
                      borderRadius: '4px',
                      textAlign: 'center',
                      color: card.monthlyConsumed ? '#22543d' : '#822727',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {card.monthlyConsumed ? '已完成自動加值' : '未完成自動加值'}
                  </button>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--secondary)', fontSize: '0.9rem', color: '#718096', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>年度次數: {card.annualCount} / 3</span>
                    {!isMaxedOut && (
                      <button
                        onClick={() => handleUpdateCard(card.id, {
                          annualCount: card.annualCount + 1,
                          monthlyRefreshed: false,
                          monthlyConsumed: false,
                        })}
                        style={{
                          background: '#ebf8ff',
                          color: '#3182ce',
                          border: '1px solid #bee3f8',
                          borderRadius: '4px',
                          padding: '0.1rem 0.4rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                        title="增加一次年度登錄並重置本月狀態"
                      >
                        +1
                      </button>
                    )}
                  </div>
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

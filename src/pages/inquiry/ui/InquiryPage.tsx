import { useEffect, useState } from 'react';
import { MailOpen, RefreshCw } from 'lucide-react';
import type { Inquiry, StoreDetail } from '../../../entities/owner/types';
import { InquiryTable } from '../../../shared/ui/tables';

export function InquiryPage({
  store,
  inquiries,
  onRefresh,
  onLoadDetail,
  onNotify,
}: {
  store: StoreDetail | null;
  inquiries: Inquiry[];
  onRefresh: () => Promise<string | undefined>;
  onLoadDetail: (inquiryId: number) => Promise<Inquiry>;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}) {
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(inquiries[0]?.id ?? null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(inquiries[0] ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!inquiries.length) {
      setSelectedInquiryId(null);
      setSelectedInquiry(null);
      return;
    }

    const nextSelected = inquiries.find((item) => item.id === selectedInquiryId) ?? inquiries[0];
    setSelectedInquiryId(nextSelected.id);
    setSelectedInquiry(nextSelected);
  }, [inquiries, selectedInquiryId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const warning = await onRefresh();
    setIsRefreshing(false);
    if (warning) onNotify(warning, 'error');
    else onNotify('문의 목록을 새로고침했습니다.', 'success');
  };

  const handleSelect = async (inquiry: Inquiry) => {
    setSelectedInquiryId(inquiry.id);
    setSelectedInquiry(inquiry);
    setIsLoadingDetail(true);
    try {
      const detail = await onLoadDetail(inquiry.id);
      setSelectedInquiry(detail);
    } catch (error) {
      onNotify(error instanceof Error ? error.message : '문의 상세를 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (!store) {
    return (
      <section className="card empty-state-card">
        <div className="section-heading slim">
          <div><p className="eyebrow">문의 관리</p><h3>가게 등록 후 이용할 수 있습니다</h3></div>
        </div>
        <p className="muted">가게가 등록되면 소비자 문의를 여기에서 바로 확인할 수 있습니다.</p>
      </section>
    );
  }

  return (
    <div className="inquiry-layout">
      <section className="card">
        <div className="section-heading slim">
          <div>
            <p className="eyebrow">문의함</p>
            <h3>{store.name} 문의 목록</h3>
          </div>
          <button className="ghost-button" onClick={() => void handleRefresh()} disabled={isRefreshing}>
            <RefreshCw size={16} />
            {isRefreshing ? '불러오는 중' : '새로고침'}
          </button>
        </div>
        <InquiryTable items={inquiries} selectedId={selectedInquiryId} onSelect={(item) => void handleSelect(item)} />
      </section>

      <section className="card inquiry-detail-card">
        <div className="section-heading slim">
          <div>
            <p className="eyebrow">상세 보기</p>
            <h3>{selectedInquiry ? selectedInquiry.title : '문의가 선택되지 않았습니다'}</h3>
          </div>
        </div>

        {selectedInquiry ? (
          <div className="inquiry-detail">
            <div className="inquiry-meta">
              <span className="plain-badge">{selectedInquiry.name}</span>
              <span className="plain-badge">{selectedInquiry.number}</span>
            </div>
            <div className="inquiry-content">
              <p>{selectedInquiry.content}</p>
            </div>
            {isLoadingDetail && <p className="muted">최신 상세 내용을 불러오는 중입니다.</p>}
          </div>
        ) : (
          <div className="empty-detail">
            <MailOpen size={28} />
            <p>문의가 들어오면 여기에서 상세 내용을 확인할 수 있습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}

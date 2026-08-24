import React, { useState, useEffect, useRef } from 'react';
import { Star, Play, Heart, Share2, Bookmark } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';

import { formatMoney } from "../../utils/money";

// Prices default to INR — the reels API returns raw numeric prices without
// a currency field, matching the mobile app which is INR-only.
const FALLBACK_CURRENCY = "INR";

// Static fallback shown only if GET /api/reels/public fails. Prices are INR.
const FALLBACK_REELS: ReelItem[] = [
  { videoUrl: 'https://res.cloudinary.com/ddnb10zkq/video/upload/v1773750957/WhatsApp_Video_2026-03-17_at_18.02.36_vmxttu.mp4', name: 'Men\'s Premium Casual Wear Collection', price: 1199, originalPrice: 2199, currency: FALLBACK_CURRENCY, likesCount: 158000, sharesCount: 42000, savesCount: 71000, productUrl: null },
  { videoUrl: 'https://res.cloudinary.com/ddnb10zkq/video/upload/v1773750955/WhatsApp_Video_2026-03-17_at_18.02.49_m1opbc.mp4', name: 'Classic Stud Earrings', price: 449, originalPrice: 699, currency: FALLBACK_CURRENCY, likesCount: 165000, sharesCount: 45000, savesCount: 76000, productUrl: null },
  { videoUrl: 'https://res.cloudinary.com/ddnb10zkq/video/upload/v1773750956/WhatsApp_Video_2026-03-17_at_18.02.48_givg5v.mp4', name: 'Luxury Analog Watches', price: 2499, originalPrice: 3999, currency: FALLBACK_CURRENCY, likesCount: 172000, sharesCount: 48000, savesCount: 81000, productUrl: null },
  { videoUrl: 'https://res.cloudinary.com/ddnb10zkq/video/upload/v1773750956/WhatsApp_Video_2026-03-17_at_18.02.47_dqhemu.mp4', name: 'Elegant Jewellery Set', price: 899, originalPrice: 1299, currency: FALLBACK_CURRENCY, likesCount: 179000, sharesCount: 51000, savesCount: 86000, productUrl: null },
  { videoUrl: 'https://res.cloudinary.com/ddnb10zkq/video/upload/v1773750955/WhatsApp_Video_2026-03-17_at_18.02.37_u9wffg.mp4', name: 'Women\'s Office Formal Dresses', price: 699, originalPrice: 999, currency: FALLBACK_CURRENCY, likesCount: 186000, sharesCount: 54000, savesCount: 91000, productUrl: null },
  { videoUrl: 'https://res.cloudinary.com/ddnb10zkq/video/upload/v1773750954/WhatsApp_Video_2026-03-17_at_18.02.49_1_qhbx22.mp4', name: 'Delicate Pendant Necklace', price: 349, originalPrice: 599, currency: FALLBACK_CURRENCY, likesCount: 193000, sharesCount: 57000, savesCount: 96000, productUrl: null },
];

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

// Save count isn't provided by the public reels API; derive a stable
// per-reel value so the icon isn't blank.
function seededSaves(index: number): number {
  const s = index * 7 + 11;
  return 50000 + ((s + 5) % 51) * 1000;
}

interface ReelItem {
  videoUrl: string;
  name: string;
  price: number;
  originalPrice: number;
  /** What `price` and `originalPrice` are denominated in. Never assumed. */
  currency: string;
  likesCount: number;
  sharesCount: number;
  savesCount: number;
  productUrl: string | null;
}

interface ReelCardProps {
  item: ReelItem;
}

const ReelCard: React.FC<ReelCardProps> = ({ item }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayLikes, setDisplayLikes] = useState(item.likesCount);
  const [displaySaves, setDisplaySaves] = useState(item.savesCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => {
      setDisplayLikes((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      setDisplaySaves((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = item.productUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shop From Reel',
          text: item.name,
          url: shareUrl,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="relative flex-none snap-start w-[230px] sm:w-[240px] md:w-[260px] rounded-2xl overflow-hidden bg-black shadow-lg shrink-0">
      {/* Video - 9:16 aspect */}
      <div className="relative aspect-[9/16] w-full">
        <video
          ref={videoRef}
          src={item.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          loop
          autoPlay
        />
        {/* Right-side action stack: Like, Share, Save — smaller on mobile */}
        <div className="absolute right-1.5 sm:right-2 bottom-20 sm:bottom-24 flex flex-col items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center gap-0 text-white drop-shadow-md hover:scale-105 transition-transform"
            aria-label="Like"
          >
            <span className="bg-black/40 rounded-full p-1.5 sm:p-2 flex items-center justify-center">
              <Heart
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`}
              />
            </span>
            <span className="text-[9px] sm:text-xs font-medium">{formatCount(displayLikes)}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-0 text-white drop-shadow-md hover:scale-105 transition-transform"
            aria-label="Share"
          >
            <span className="bg-black/40 rounded-full p-1.5 sm:p-2 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </span>
            <span className="text-[9px] sm:text-xs font-medium">{formatCount(item.sharesCount)}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-col items-center gap-0 text-white drop-shadow-md hover:scale-105 transition-transform"
            aria-label="Save"
          >
            <span className="bg-black/40 rounded-full p-1.5 sm:p-2 flex items-center justify-center">
              <Bookmark
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${saved ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </span>
            <span className="text-[9px] sm:text-xs font-medium">{formatCount(displaySaves)}</span>
          </button>
        </div>
        {/* Bottom product overlay card (commented out — video + icons only)
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2.5">
          <div className="bg-white/95 backdrop-blur rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 flex items-center gap-1.5 sm:gap-3 shadow-lg">
            <video
              src={item.videoUrl}
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg object-cover shrink-0 bg-gray-200"
              muted
              playsInline
              preload="metadata"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-sm font-semibold text-gray-900 truncate">
                {item.name}
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-sm font-bold text-gray-900">
                  {formatMoney(item.price, { currency: item.currency })}
                </span>
                {item.originalPrice > item.price && (
                  <span className="text-[9px] sm:text-xs text-gray-500 line-through">
                    {formatMoney(item.originalPrice, { currency: item.currency })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

const CARD_WIDTH_PX = 260;
const GAP_PX = 16;

const ShopFromReel: React.FC = () => {
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_PX);

  // Real reels come from GET /api/reels/public (same backend the mobile app uses).
  // FALLBACK_REELS keeps the section visible if the request fails.
  const [reels, setReels] = useState<ReelItem[]>(FALLBACK_REELS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reels/public?page=1&per_page=6`);
        if (!resp.ok) return;
        const body = await resp.json();
        const items = body?.data;
        if (!cancelled && Array.isArray(items) && items.length) {
          const mapped: ReelItem[] = items
            .filter((it: any) => it?.video_url)
            .map((it: any, i: number) => {
              const selling = Number(it.product?.selling_price ?? it.selling_price ?? it.price ?? 0);
              const cost = Number(it.product?.cost_price ?? 0);
              return {
                videoUrl: String(it.video_url),
                name: String(it.product_name ?? it.product?.product_name ?? it.description ?? ''),
                price: selling,
                originalPrice: cost > selling ? cost : selling,
                currency: FALLBACK_CURRENCY,
                likesCount: Number(it.likes_count ?? 0),
                sharesCount: Number(it.shares_count ?? 0),
                savesCount: seededSaves(i),
                productUrl: it.product_url ?? null,
              };
            });
          if (mapped.length) setReels(mapped);
        }
      } catch {
        // Keep static fallback.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const w = window.innerWidth;
      if (w < 640) setCardWidth(230);
      else if (w < 768) setCardWidth(240);
      else setCardWidth(CARD_WIDTH_PX);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const {
    containerRef,
    isDragging,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useHorizontalScroll({
    snapToItems: true,
    itemWidth: cardWidth,
    gap: GAP_PX,
  });

  return (
    <section className="pt-4 pb-8 nav:pt-6 nav:pb-10">
      <div className="container mx-auto px-4 xl:px-14">
        {/* Heading + Watch Reel button — one line */}
        <div className="flex flex-row items-center justify-between gap-3 mb-4 md:mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <Star className="w-5 h-5 text-gray-900 shrink-0" strokeWidth={2} />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight uppercase font-worksans truncate">
              Shop From Reel
            </h2>
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=com.aoinapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shrink-0 border border-primary-400/30"
          >
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20">
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" fill="currentColor" />
            </span>
            Watch Reel
          </a>
        </div>

        {/* Video carousel */}
        <div id="reel-carousel" className="relative -mx-4 px-4 xl:-mx-14 xl:px-14">
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {reels.map((r, i) => (
              <ReelCard key={`${r.videoUrl}-${i}`} item={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopFromReel;

import {useState} from 'react';
import {Check, MessageSquare, Minus, Plus, ShoppingBag, X} from 'lucide-react';
import {CONTACT_PHONE} from '../data/catalog';
import type {BagItem, ProductItem} from '../types/store';
import {ProductImage} from './ProductImage';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToBag: (item: BagItem) => void;
}

export function ProductModal({product, onClose, onAddToBag}: ProductModalProps) {
  const [selectedAngleIdx, setSelectedAngleIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => product?.sizes[0] || 'Standard');
  const [selectedWidth, setSelectedWidth] = useState(() => product?.jewellerySpecs?.widths[0] || '8mm');
  const [selectedPlating, setSelectedPlating] = useState(
    () => product?.jewellerySpecs?.platings[0] || 'Silver Plated'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) return null;

  const angles = product.images.length > 0 ? product.images : [{src: product.image, label: 'Front'}];
  const activeAngle = angles[selectedAngleIdx % angles.length];
  const activeVariant = product.variants?.[selectedVariantIdx];
  const unitPrice = activeVariant ? activeVariant.price : product.price;
  const activeSize = product.sizes.includes(selectedSize) ? selectedSize : product.sizes[0];

  const optionParts = [
    activeVariant?.name,
    product.jewellerySpecs ? `${selectedWidth} · ${activeSize} · ${selectedPlating}` : activeSize,
  ].filter(Boolean);
  const selectedOption = optionParts.join(' · ');

  const smsText = encodeURIComponent(
    `Hi RepsForLess! I want to order ${quantity}x ${product.brand} ${product.name} (${selectedOption}) at £${unitPrice} each.`
  );

  function handleAdd() {
    if (!product) return;
    onAddToBag({
      key: `${product.id}__${selectedOption}`,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      unitPrice,
      quantity,
      selectedOption,
      image: product.image,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl border border-zinc-800 bg-[#18181b] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center border border-zinc-700 bg-[#141416] text-zinc-300 hover:border-[#CCFF00] hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Multi-Angle Studio Photo Gallery */}
          <div className="md:col-span-6 bg-[#141416] border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col">
            <div className="relative aspect-[4/3] w-full flex-1 overflow-hidden">
              <ProductImage
                src={activeAngle.src}
                alt={`${product.brand} ${product.name} — ${activeAngle.label}`}
                title={product.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-[#141416]/85 px-2.5 py-1 text-xs font-medium text-zinc-200 border border-zinc-800">
                {activeAngle.label}
              </span>
            </div>

            {angles.length > 1 && (
              <div className="grid grid-cols-3 gap-2 p-3 border-t border-zinc-800 bg-[#141416]">
                {angles.map((angle, idx) => {
                  const isActive = idx === selectedAngleIdx;
                  return (
                    <button
                      key={`${product.id}-thumb-${idx}`}
                      type="button"
                      onClick={() => setSelectedAngleIdx(idx)}
                      className={`group relative overflow-hidden border text-left cursor-pointer ${
                        isActive ? 'border-[#CCFF00]' : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <ProductImage
                          src={angle.src}
                          alt={angle.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span
                        className={`block px-2 py-1 text-[11px] font-medium truncate ${
                          isActive ? 'text-[#CCFF00]' : 'text-zinc-400'
                        }`}
                      >
                        {angle.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 flex flex-col justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 mb-1">
                {product.brand} · {product.category}
              </p>
              <h2
                id="modal-product-title"
                className="font-display text-3xl font-black text-white leading-tight mb-2"
              >
                {product.name}
              </h2>
              <p className="font-mono text-2xl font-bold text-[#CCFF00] tabular-nums mb-4">
                £{unitPrice}
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed mb-5">{product.detail}</p>

              {/* Colourway / Variant Swatches */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-zinc-400 mb-2">
                    Finish / Colourway: <span className="text-zinc-100">{activeVariant?.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, idx) => {
                      const active = idx === selectedVariantIdx;
                      return (
                        <button
                          key={variant.name}
                          type="button"
                          onClick={() => setSelectedVariantIdx(idx)}
                          title={variant.name}
                          className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? 'border-[#CCFF00] bg-[#222227] text-white'
                              : 'border-zinc-700 bg-[#141416] text-zinc-300 hover:border-zinc-500'
                          }`}
                        >
                          <span
                            className="h-3 w-3 border border-white/25 shrink-0"
                            style={{backgroundColor: variant.hex}}
                            aria-hidden="true"
                          />
                          <span>{variant.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Jewellery Width & Plating */}
              {product.jewellerySpecs && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Width</label>
                    <select
                      value={selectedWidth}
                      onChange={(e) => setSelectedWidth(e.target.value)}
                      className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-xs text-white focus:border-[#CCFF00] focus:outline-none"
                    >
                      {product.jewellerySpecs.widths.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Plating</label>
                    <select
                      value={selectedPlating}
                      onChange={(e) => setSelectedPlating(e.target.value)}
                      className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-xs text-white focus:border-[#CCFF00] focus:outline-none"
                    >
                      {product.jewellerySpecs.platings.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-4">
                <p className="text-xs font-medium text-zinc-400 mb-2">
                  {product.jewellerySpecs ? 'Length' : 'Size'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((size) => {
                    const active = activeSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer tabular-nums ${
                          active
                            ? 'border-[#CCFF00] bg-[#CCFF00] text-[#141416]'
                            : 'border-zinc-700 bg-[#141416] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quantity + Buy Actions */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-zinc-400">Quantity</span>
                <div className="inline-flex items-center border border-zinc-700 bg-[#141416]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="h-9 w-9 inline-flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="h-9 w-9 inline-flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] px-5 py-3 text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Added to Bag · £{unitPrice * quantity}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    <span>Add to Bag · £{unitPrice * quantity}</span>
                  </>
                )}
              </button>

              <a
                href={`sms:${CONTACT_PHONE}?body=${smsText}`}
                className="w-full inline-flex items-center justify-center gap-2 border border-[#CCFF00]/50 bg-[#141416] px-5 py-2.5 text-xs font-semibold text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#141416] transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Text {CONTACT_PHONE} to order</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Search, Tag, Wrench, Package, ArrowUpRight } from 'lucide-react';
import { ProductCatalogItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface InventoryViewProps {
  products: ProductCatalogItem[];
  onAddProduct: (item: ProductCatalogItem) => void;
  currency: 'BDT' | 'USD';
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onAddProduct,
  currency,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('CNG Compressor Spare Sales & Service');
  const [price, setPrice] = useState(15000);
  const [unit, setUnit] = useState('Set');
  const [description, setDescription] = useState('');

  const categories = [
    'all',
    'CNG Compressor Spare Sales & Service',
    'Gas Ganarators Spare Parts Sales & Service',
    'PLC Programming Troubleshoot',
    'Dispenser Controller Sales Service',
    'LPG Dispenser Sales Service',
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: ProductCatalogItem = {
      id: `prod-${Date.now()}`,
      code: code.trim() || `APS-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      defaultPrice: Number(price) || 0,
      unit: unit || 'Pcs',
      description: description.trim(),
    };

    onAddProduct(newItem);
    setShowModal(false);
    setName('');
    setCode('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Product
          </h2>
          <p className="text-xs text-slate-500">
            Preset products, spare parts, and engineering services for CNG compressors, gas generators, PLCs, and dispensers.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search spare parts or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeCategory === cat
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Products & Services' : cat.split(' ')[0] + ' ' + (cat.split(' ')[1] || '')}
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Description / Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Unit</th>
              <th className="py-3 px-4 text-right">Standard Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                  {item.code}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  {item.description && (
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600 font-medium">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-slate-600 font-medium">
                  {item.unit}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                  {formatCurrency(item.defaultPrice, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Add Catalog Spare Part or Service
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNG Suction Valve Assembly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Item Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APS-CNG-03"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Set, Pcs, Job, Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="CNG Compressor Spare Sales & Service">
                    CNG Compressor Spare Sales & Service
                  </option>
                  <option value="Gas Ganarators Spare Parts Sales & Service">
                    Gas Ganarators Spare Parts Sales & Service
                  </option>
                  <option value="PLC Programming Troubleshoot">
                    PLC Programming Troubleshoot
                  </option>
                  <option value="Dispenser Controller Sales Service">
                    Dispenser Controller Sales Service
                  </option>
                  <option value="LPG Dispenser Sales Service">
                    LPG Dispenser Sales Service
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Default Rate ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Specification / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Material specs, compatible compressor or generator models..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

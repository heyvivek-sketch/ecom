import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { Product } from '../../types';
import { Plus, Trash2, Edit2, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { CURRENCY, CATEGORIES, CLOUDINARY_CONFIG } from '../../constants';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(dbService.getProducts());
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', 
    price: 0, 
    description: '', 
    category: 'Electronics', 
    stock: 10, 
    imageUrl: '', 
    images: []
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      dbService.deleteProduct(id);
      setProducts(dbService.getProducts());
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
        data.append("cloud_name", CLOUDINARY_CONFIG.cloudName);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
          { method: "POST", body: data }
        );

        const fileData = await res.json();
        if (fileData.secure_url) {
          newImages.push(fileData.secure_url);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
        imageUrl: prev.imageUrl || newImages[0] // Set first image as primary if none exists
      }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed. Please check your Cloudinary configuration.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => {
      const updatedImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updatedImages,
        imageUrl: updatedImages.length > 0 ? updatedImages[0] : '' // Update primary image
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have at least one image
    const finalImages = formData.images?.length ? formData.images : ['https://picsum.photos/400/400'];
    const finalImageUrl = finalImages[0];

    const newProduct: Product = {
      id: formData.id || Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      price: formData.price!,
      description: formData.description!,
      category: formData.category!,
      stock: formData.stock!,
      imageUrl: finalImageUrl,
      images: finalImages
    };

    dbService.saveProduct(newProduct);
    setProducts(dbService.getProducts());
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      price: 0, 
      description: '', 
      category: 'Electronics', 
      stock: 10, 
      imageUrl: '', 
      images: [] 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover" src={p.imageUrl} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{CURRENCY} {p.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input 
                type="text" 
                placeholder="Product Name" 
                required 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Price" 
                  required 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                />
                <input 
                  type="number" 
                  placeholder="Stock" 
                  required 
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                />
              </div>
              <select 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <textarea 
                placeholder="Description" 
                required 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />

              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  {isUploading ? (
                     <div className="flex items-center text-indigo-600">
                       <Loader2 className="h-6 w-6 animate-spin mr-2" />
                       <span>Uploading to Cloudinary...</span>
                     </div>
                  ) : (
                    <>
                      <label htmlFor="file-upload" className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 flex items-center">
                        <Upload className="h-4 w-4 mr-2" /> Upload Images
                      </label>
                      <input 
                        id="file-upload" 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                      <p className="text-xs text-gray-500">Supports JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </div>

                {/* Image Previews */}
                {(formData.images && formData.images.length > 0) && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="Preview" className="h-16 w-full object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center rounded-b-lg">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
                {formData.id ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
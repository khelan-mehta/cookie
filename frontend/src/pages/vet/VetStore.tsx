import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, TextArea } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { Modal, ConfirmModal } from '../../components/common/Modal';
import { storeService, Product, CreateProductData } from '../../services/store';
import { uploadService } from '../../services/upload';

export const VetStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    isAvailable: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await storeService.getVetProducts();
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        isAvailable: product.isAvailable,
      });
      setImagePreview(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
        isAvailable: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price must be non-negative');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        const compressed = await uploadService.compressImage(imageFile);
        const result = await uploadService.uploadProductImage(compressed);
        imageUrl = result.imageUrl;
      }

      const productData = { ...formData, imageUrl };

      if (editingProduct) {
        await storeService.updateProduct(editingProduct._id, productData);
        toast.success('Product updated');
      } else {
        await storeService.createProduct(productData);
        toast.success('Product created');
      }

      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error('Failed to save product');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      await storeService.deleteProduct(deleteProduct._id);
      toast.success('Product deleted');
      setDeleteProduct(null);
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const result = await storeService.toggleProductAvailability(product._id);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isAvailable: result.isAvailable } : p
        )
      );
    } catch (err) {
      toast.error('Failed to update availability');
      console.error(err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Store</h1>
          <Button onClick={() => handleOpenModal()}>
            <FiPlus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Button onClick={() => handleOpenModal()}>
                <FiPlus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product._id}>
                <CardBody>
                  <div className="flex items-center gap-4">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-rose-600 font-medium">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`p-2 rounded-lg ${
                          product.isAvailable
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-400 bg-gray-50'
                        }`}
                      >
                        {product.isAvailable ? (
                          <FiToggleRight className="h-5 w-5" />
                        ) : (
                          <FiToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteProduct(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter product name"
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Product description"
              rows={3}
            />

            <Input
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              min={0}
            />

            <Input
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="e.g., Medicine, Food, Accessories"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={!!deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
};

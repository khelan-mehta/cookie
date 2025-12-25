import { useState, useEffect } from 'react';
import { FiSearch, FiPhone } from 'react-icons/fi';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { storeService, Product } from '../../services/store';

export const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await storeService.getAllProducts();
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    setIsLoading(true);
    try {
      const data = await storeService.searchProducts(searchQuery);
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pet Store</h1>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            <FiSearch className="h-5 w-5" />
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card
                key={product._id}
                hoverable
                onClick={() => setSelectedProduct(product)}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                )}
                <CardBody>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-rose-600 font-medium mt-1">
                    {formatPrice(product.price)}
                  </p>
                  {product.vetId?.clinicName && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                      By {product.vetId.clinicName}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct?.name}
          size="lg"
        >
          {selectedProduct && (
            <div>
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-rose-600">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                {selectedProduct.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.category && (
                  <div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {selectedProduct.category}
                    </span>
                  </div>
                )}

                {selectedProduct.vetId && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Sold by</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {selectedProduct.vetId.clinicName || 'Veterinary Clinic'}
                        </p>
                        {selectedProduct.vetId.clinicAddress && (
                          <p className="text-sm text-gray-500">
                            {selectedProduct.vetId.clinicAddress}
                          </p>
                        )}
                      </div>
                      <Button variant="secondary" size="sm">
                        <FiPhone className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { BriefcaseIcon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { OpenAIVectorStoreService } from '../../services/OpenAIVectorStoreService';
import toast from 'react-hot-toast';
import { BaseModal } from '../ui/BaseModal';

interface ProductCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (newProduct: Product) => void; // Callback after successful creation
}

const ProductCreationModal: React.FC<ProductCreationModalProps> = ({ isOpen, onClose, onProductCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when modal opens/closes or user changes
    if (!isOpen) {
      setName('');
      setDescription('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a product.');
      return;
    }
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create product in Supabase
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: user.id,
          // openai_vector_store_id will be set after vector store creation
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (newProduct) {
        // Step 2: Create OpenAI Vector Store
        let vectorStoreId: string | null = null;
        try {
          const vectorStoreService = new OpenAIVectorStoreService();
          const storeName = `product_vs_${newProduct.id}`.substring(0, 500); // Max 500 chars for name
          const metadata = {
            productId: newProduct.id,
            userId: user.id,
            createdAt: new Date().toISOString(),
          };
          console.log(`Creating OpenAI vector store with name: ${storeName} and metadata:`, metadata);
          const vectorStore = await vectorStoreService.createEmptyVectorStore(storeName, metadata);
          vectorStoreId = vectorStore.id;
          console.log(`Successfully created vector store ID: ${vectorStoreId} for product ID: ${newProduct.id}`);

          // Step 3: Update product in Supabase with Vector Store ID
          const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ openai_vector_store_id: vectorStoreId })
            .eq('id', newProduct.id)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to update product with vector store ID:', updateError);
            // Potentially alert user or queue for retry. For now, product exists without VS ID linked.
            toast.error(`Product created, but failed to link vector store. Error: ${updateError.message}`);
            // Pass the original product data, as the update failed.
            onProductCreated(newProduct as Product); 
          } else if (updatedProduct) {
            console.log('Product successfully updated with vector store ID.');
            onProductCreated(updatedProduct as Product);
          }

        } catch (vsError: any) {
          console.error('Failed to create OpenAI vector store or update product:', vsError);
          toast.error(`Product created, but failed to create/link vector store. Error: ${vsError.message}`);
          // Product was created, but vector store creation/linking failed. 
          // Call onProductCreated with the initial product data so it still appears in the UI.
          // The openai_vector_store_id field will be null.
          onProductCreated(newProduct as Product);
        }

        onClose(); // Close modal on success or partial success
      }
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Product"
      size="md"
      theme="dark"
      contentClassName="bg-secondary-800 border border-secondary-700"
    >
      {/* Custom header with icon to match original design */}
      <div className="flex items-center mb-4 px-6 pt-2">
        <BriefcaseIcon className='h-5 w-5 mr-2 text-primary-400'/>
        <h3 className="text-lg font-medium text-white">Create New Product</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="px-6 pb-6">
        <div className="mb-4">
          <label htmlFor="productName" className="block text-sm font-medium text-gray-100 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="productName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-secondary-700 border-secondary-600 text-black shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 py-2 px-3"
            placeholder="Enter product name"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-100 mb-1">
            Product Description (Optional)
          </label>
          <textarea
            id="productDescription"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md bg-secondary-700 border-secondary-600 text-black shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 py-2 px-3"
            placeholder="Enter product description (optional)"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-900/30 text-red-400 border border-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-secondary-700 rounded-md hover:bg-secondary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-800 focus-visible:ring-primary-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-800 focus-visible:ring-primary-500 disabled:opacity-50 disabled:bg-primary-800"
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProductCreationModal;

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductAnalysis } from '../../types/product/types';
import { ProductCardCapabilities } from './ProductCardCapabilities';
import { ProductCardCompetitorAnalysis } from './ProductCardCompetitorAnalysis';
import { ProductCardActions } from './ProductCardActions';
import { EditableField } from './EditableField';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { useAutoSave } from '../../hooks/useAutoSave';
import { CompetitorAnalysis } from './CompetitorAnalysis';
import { ImageUploader } from '../ui/ImageUploader';
import { getUserCompanyName } from '../../utils/mediaLibraryUtils';
import { useAuth } from '../../lib/auth';
import { UploadResult } from '../../lib/storage';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

// Premium Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  description, 
  children, 
  icon, 
  gradientColors,
  accentColor,
  defaultExpanded = true,
  count
}: { 
  title: string; 
  description: string;
  children: React.ReactNode; 
  icon: React.ReactNode; 
  gradientColors: string;
  accentColor: string;
  defaultExpanded?: boolean;
  count?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Update isExpanded when defaultExpanded prop changes
  React.useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Premium Header */}
      <div 
        className="relative overflow-hidden rounded-xl border border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-500 p-6 group cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(248, 250, 252, 0.9) 50%, 
              rgba(241, 245, 249, 0.95) 100%
            )
          `,
          backdropFilter: 'blur(10px) saturate(180%)',
        }}
      >
        {/* Floating decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-2 left-8 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className={`p-3 ${gradientColors} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                {icon}
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${accentColor} rounded-full border-2 border-white shadow-sm animate-pulse`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-all duration-300">
                  {title}
                </h4>
                {count !== undefined && count > 0 && (
                  <span 
                    className={`px-3 py-1 ${accentColor} text-white text-xs font-bold rounded-full shadow-sm transform transition-transform duration-200 group-hover:scale-110`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors duration-200 mt-1">
                {description}
              </p>
            </div>
          </div>
          
          {/* Enhanced Chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/60 group-hover:bg-white/80 group-hover:border-gray-300/60 transition-all duration-300 shadow-sm"
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </motion.div>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div 
              className="relative overflow-hidden rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.98) 0%, 
                    rgba(248, 250, 252, 0.95) 50%, 
                    rgba(241, 245, 249, 0.98) 100%
                  )
                `,
                backdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              {/* Content background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-12 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-12 w-16 h-16 bg-gradient-to-br from-pink-400/30 to-orange-500/30 rounded-full blur-lg"></div>
              </div>
              
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ProductCardContentProps {
  product: ProductAnalysis;
  isExpanded?: boolean;
  maxItems?: number;
  showExpandButton?: boolean;
  researchResultId?: string;
  approvedProductId?: string;
  // User information for AirOps integration
  userUUID?: string;
  userEmail?: string;
  userCompanyName?: string;
  onGenerateArticle?: () => void;
  // Phase 2 action handlers
  onSave?: (product: ProductAnalysis) => Promise<void>;
  onApprove?: (product: ProductAnalysis) => Promise<void>;
  onExport?: (product: ProductAnalysis, format: 'pdf' | 'json' | 'csv') => Promise<void>;
  onEdit?: (product: ProductAnalysis) => void;
  onDelete?: (product: ProductAnalysis) => void;
  onShare?: (product: ProductAnalysis) => void;
  onUpdateSection?: (productIndex: number, sectionType: keyof ProductAnalysis, newValue: any) => Promise<void>;
  context?: 'history' | 'product' | 'admin';
  showCapabilities?: boolean;
  showCompetitorAnalysis?: boolean;
  showActions?: boolean;
  enableEditing?: boolean;
  index?: number;
}

// Content section wrapper with enhanced styling
const ContentSection = ({ 
  title, 
  children, 
  icon, 
  styles 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode; 
  styles: any; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="space-y-3"
    >
      <div className="flex items-center space-x-3 mb-4">
        {icon && <div className={`${styles.accentText}`}>{icon}</div>}
        <h4 className={`${styles.primaryText} text-sm font-semibold uppercase tracking-wide`}>
          {title}
        </h4>
      </div>
      {children}
    </motion.div>
  );
};

// List component with enhanced styling and animations
const AnimatedList = ({ 
  items, 
  maxItems = 12, 
  showExpandButton = true,
  styles,
  isReducedMotion,
  emptyMessage
}: { 
  items: string[]; 
  maxItems?: number; 
  showExpandButton?: boolean;
  styles: any;
  isReducedMotion: boolean;
  emptyMessage?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Always start expanded
  
  if (!items || items.length === 0) {
    return emptyMessage ? (
      <div className={`${styles.secondaryText} text-sm italic opacity-60`}>
        {emptyMessage}
      </div>
    ) : null;
  }

  // Always show all items since user wants all fields visible
  const displayItems = items;

  return (
    <div className="space-y-2">
      {/* Remove AnimatePresence to prevent key conflicts */}
      {displayItems.map((item, index) => (
        <div
          key={`list-item-${index}-${item.substring(0, 20)}`} // More unique key
          className={`
            ${styles.secondaryText}
            text-sm p-3 rounded-lg
            bg-gray-50 border border-gray-200
            hover:bg-gray-100 hover:border-gray-300
            transition-all duration-200
          `}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

// Business overview component with enhanced layout
const BusinessOverview = ({ 
  businessOverview, 
  styles 
}: { 
  businessOverview: ProductAnalysis['businessOverview']; 
  styles: any; 
}) => {
  if (!businessOverview.mission && !businessOverview.industry && !businessOverview.keyOperations) {
    return null;
  }

  return (
    <ContentSection 
      title="Business Overview" 
      styles={styles}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 8l4-4 4 4" />
        </svg>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessOverview.mission && (
          <div className={`${styles.secondaryText} text-sm p-3 rounded-lg bg-gray-50 border border-gray-200`}>
            <strong className={styles.primaryText}>Mission:</strong> {businessOverview.mission}
          </div>
        )}
        {businessOverview.industry && (
          <div className={`${styles.secondaryText} text-sm p-3 rounded-lg bg-gray-50 border border-gray-200`}>
            <strong className={styles.primaryText}>Industry:</strong> {businessOverview.industry}
          </div>
        )}
        {businessOverview.keyOperations && (
          <div className={`${styles.secondaryText} text-sm p-3 rounded-lg bg-gray-50 border border-gray-200 md:col-span-2`}>
            <strong className={styles.primaryText}>Key Operations:</strong> {businessOverview.keyOperations}
          </div>
        )}
      </div>
    </ContentSection>
  );
};

// Target persona component with enhanced styling
const TargetPersona = ({ 
  targetPersona, 
  styles,
  isReducedMotion 
}: { 
  targetPersona: ProductAnalysis['targetPersona']; 
  styles: any;
  isReducedMotion: boolean;
}) => {
  if (!targetPersona.primaryAudience && !targetPersona.demographics && 
      !targetPersona.industrySegments && !targetPersona.psychographics) {
    return null;
  }

  const personaData = [
    { label: 'Primary Audience', value: targetPersona.primaryAudience, icon: '👥' },
    { label: 'Demographics', value: targetPersona.demographics, icon: '📊' },
    { label: 'Industry Segments', value: targetPersona.industrySegments, icon: '🏢' },
    { label: 'Psychographics', value: targetPersona.psychographics, icon: '🧠' },
  ].filter(item => item.value);

  return (
    <ContentSection 
      title="Target Persona" 
      styles={styles}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {personaData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={!isReducedMotion ? { opacity: 0, y: 10 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`
              ${styles.secondaryText} text-sm p-3 rounded-lg
              bg-gray-50 border border-gray-200
              hover:border-gray-300 transition-colors duration-200
            `}
          >
            <div className="flex items-start space-x-2">
              <span className="text-sm">{item.icon}</span>
              <div>
                <strong className={`${styles.primaryText} text-xs uppercase tracking-wide`}>
                  {item.label}
                </strong>
                <div className="mt-1">{item.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ContentSection>
  );
};

export function ProductCardContent({
  product,
  isExpanded = false,
  maxItems = 12,
  showExpandButton = true,
  researchResultId,
  approvedProductId,
  userUUID,
  userEmail,
  userCompanyName,
  onGenerateArticle,
  onSave,
  onApprove,
  onExport,
  onEdit,
  onDelete,
  onShare,
  onUpdateSection,
  context = 'product',
  showCapabilities = true,
  showCompetitorAnalysis = true,
  showActions = true,
  enableEditing = false,
  index,
}: ProductCardContentProps) {
  

  const { user } = useAuth();
  const [editableProduct, setEditableProduct] = useState<ProductAnalysis>(product);
  const [autoSaveCount, setAutoSaveCount] = useState(0);
  const isUpdatingCompetitors = useRef(false);



  // Add state for capabilities collapse (collapsed by default)
  const [isCapabilitiesExpanded, setIsCapabilitiesExpanded] = useState(false);
  
  // Add state for controlling all sections based on isExpanded prop
  const [sectionsExpanded, setSectionsExpanded] = useState(isExpanded);

  // Update sectionsExpanded when isExpanded prop changes
  React.useEffect(() => {
    setSectionsExpanded(isExpanded);
  }, [isExpanded]);

  // Update editable product when the original product changes
  React.useEffect(() => {
    // Check if the new product has the same competitor data we just set
    const currentCompetitors = editableProduct.competitors;
    const newCompetitors = product.competitors;
    
    // If we're updating competitors, check if parent now has the same data
    if (isUpdatingCompetitors.current && currentCompetitors && newCompetitors) {
      const currentTotal = (currentCompetitors.direct_competitors?.length || 0) + 
                          (currentCompetitors.niche_competitors?.length || 0) + 
                          (currentCompetitors.broader_competitors?.length || 0);
      const newTotal = (newCompetitors.direct_competitors?.length || 0) + 
                      (newCompetitors.niche_competitors?.length || 0) + 
                      (newCompetitors.broader_competitors?.length || 0);
      
      if (currentTotal > 0 && newTotal > 0 && currentTotal === newTotal) {
        console.log("ProductCardContent useEffect: Parent product now has same competitors - clearing flag and allowing sync");
        isUpdatingCompetitors.current = false;
        // Don't return here - allow normal sync to proceed
      } else if (currentTotal > 0 && newTotal === 0) {
        console.log("ProductCardContent useEffect: Still waiting for parent to reflect competitors, skipping sync");
        return;
      }
    }
    
    // Don't reset if we're currently updating competitors
    if (isUpdatingCompetitors.current) {
      console.log("ProductCardContent useEffect: Skipping product update due to competitor update in progress");
      return;
    }
    
    // If competitors are the same, don't update to avoid unnecessary re-renders
    if (currentCompetitors && newCompetitors) {
      const currentTotal = (currentCompetitors.direct_competitors?.length || 0) + 
                          (currentCompetitors.niche_competitors?.length || 0) + 
                          (currentCompetitors.broader_competitors?.length || 0);
      const newTotal = (newCompetitors.direct_competitors?.length || 0) + 
                      (newCompetitors.niche_competitors?.length || 0) + 
                      (newCompetitors.broader_competitors?.length || 0);
      
      if (currentTotal > 0 && newTotal > 0 && currentTotal === newTotal) {
        console.log("ProductCardContent useEffect: Skipping update - competitors data appears unchanged");
        return;
      }
    }
    
    console.log("ProductCardContent useEffect: Updating editableProduct from product prop", {
      productId: product.companyName,
      hasNewCompetitors: !!newCompetitors,
      newCompetitorsCount: newCompetitors ? 
        (newCompetitors.direct_competitors?.length || 0) + 
        (newCompetitors.niche_competitors?.length || 0) + 
        (newCompetitors.broader_competitors?.length || 0) : 0,
      currentCompetitorsCount: currentCompetitors ? 
        (currentCompetitors.direct_competitors?.length || 0) + 
        (currentCompetitors.niche_competitors?.length || 0) + 
        (currentCompetitors.broader_competitors?.length || 0) : 0,
    });
    
    // Preserve local changes (like framework selection) that may not be reflected in the prop yet
    setEditableProduct(prev => {
      const mergedProduct = { ...product };
      
      // If we have a local framework selection and the incoming prop doesn't have one,
      // preserve the local selection to prevent it from being reset
      if (prev.framework && !product.framework) {
        console.log("🔄 ProductCardContent: Preserving local framework selection:", prev.framework);
        mergedProduct.framework = prev.framework;
      }
      
      // You can add other fields here that should be preserved during prop updates
      
      return mergedProduct;
    });
  }, [product]);

  // Debug logging for competitor data flow and framework tracking
  useEffect(() => {
    console.log("[ProductCardContent] editableProduct updated:", editableProduct);
    console.log("[ProductCardContent] editableProduct.competitors:", editableProduct.competitors);
    
    // Special tracking for framework field
    if (editableProduct.framework) {
      console.log("🎯 [ProductCardContent] Framework is set:", editableProduct.framework);
    } else {
      console.log("🚫 [ProductCardContent] Framework is not set or undefined");
    }
  }, [editableProduct]);

  // Auto-save functionality
  const handleAutoSave = useCallback(async (updatedProduct: ProductAnalysis): Promise<boolean> => {
    try {
      if (onUpdateSection) {
        // We need to determine what changed and call onUpdateSection for each change
        const changes: Array<{ section: keyof ProductAnalysis, value: any }> = [];
        
        // Compare all sections and collect changes - Use proper deep comparison for arrays
        Object.keys(updatedProduct).forEach(key => {
          const sectionKey = key as keyof ProductAnalysis;
          const originalValue = product[sectionKey];
          const newValue = updatedProduct[sectionKey];
          
          // Handle array comparison properly to prevent corruption
          if (Array.isArray(newValue) && Array.isArray(originalValue)) {
            // For arrays, compare length and content directly
            if (newValue.length !== originalValue.length || 
                !newValue.every((item, index) => item === originalValue[index])) {
              console.log(`🔍 Array change detected for ${sectionKey}:`, { 
                original: originalValue, 
                new: newValue,
                isValidArray: Array.isArray(newValue)
              });
              changes.push({ section: sectionKey, value: newValue });
            }
          } else if (Array.isArray(newValue) && !Array.isArray(originalValue)) {
            // New array where there wasn't one before
            console.log(`🔍 New array detected for ${sectionKey}:`, { 
              original: originalValue, 
              new: newValue,
              isValidArray: Array.isArray(newValue)
            });
            changes.push({ section: sectionKey, value: newValue });
          } else if (!Array.isArray(newValue) && Array.isArray(originalValue)) {
            // Array was removed/changed to non-array
            console.log(`🔍 Array removed for ${sectionKey}:`, { 
              original: originalValue, 
              new: newValue 
            });
            changes.push({ section: sectionKey, value: newValue });
          } else {
            // For non-arrays, use JSON comparison but with safety checks
            try {
              const originalStr = originalValue !== undefined ? JSON.stringify(originalValue) : 'undefined';
              const newStr = newValue !== undefined ? JSON.stringify(newValue) : 'undefined';
              
              if (originalStr !== newStr) {
                changes.push({ section: sectionKey, value: newValue });
              }
            } catch (error) {
              console.warn(`Failed to JSON stringify values for ${sectionKey}:`, error);
              // Fallback to strict equality
              if (originalValue !== newValue) {
                changes.push({ section: sectionKey, value: newValue });
              }
            }
          }
        });

        // Apply changes sequentially with additional logging
        for (const change of changes) {
          console.log(`🚀 Applying change for ${change.section}:`, {
            value: change.value,
            isArray: Array.isArray(change.value),
            type: typeof change.value
          });
          await onUpdateSection(index ?? 0, change.section, change.value);
        }
      } else if (onSave) {
        await onSave(updatedProduct);
      }
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }, [onUpdateSection, onSave, product, index]);

  const {
    hasUnsavedChanges,
    lastSaved,
    saveStatus
  } = useAutoSave({
    data: editableProduct,
    onSave: handleAutoSave,
    enabled: enableEditing && (!!onUpdateSection || !!onSave),
    delay: 2000
  });

  // Update field handlers
  const updateField = useCallback((field: keyof ProductAnalysis, value: any) => {
    console.log('🔄 ProductCardContent: updateField called:', { field, value });
    setEditableProduct(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('🔄 ProductCardContent: editableProduct updated:', { field, newValue: value });
      
      // Special logging for framework field
      if (field === 'framework') {
        console.log('🎯 ProductCardContent: Framework field specifically updated:', {
          previousFramework: prev.framework,
          newFramework: value,
          fullUpdatedProduct: updated
        });
      }
      
      return updated;
    });
  }, []);

  const updateNestedField = useCallback((section: keyof ProductAnalysis, field: string, value: any) => {
    setEditableProduct(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null && !Array.isArray(currentSection)) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: value
          }
        };
      }
      return prev;
    });
  }, []);

  // Default styles for the remaining static sections
  const defaultStyles = {
    primaryText: 'text-gray-900',
    secondaryText: 'text-gray-700',
    accentText: 'text-blue-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 pb-6"
    >
      {/* Save Status Indicator */}
      {enableEditing && (
        <SaveStatusIndicator
          status={saveStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
          className="mb-4"
        />
      )}

      {/* Always show all editable fields */}
      <div className="space-y-8">
        {/* Basic Information - Premium Collapsible */}
        <CollapsibleSection
          title="Basic Information"
          description="Core company and product details"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 8l4-4 4 4" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
          accentColor="bg-emerald-400"
          defaultExpanded={sectionsExpanded}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <EditableField
                label=""
                value={editableProduct.companyName || ''}
                onSave={(value) => updateField('companyName', value as string)}
                type="text"
                placeholder="Enter company name"
                maxLength={100}
                disabled={!enableEditing}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <EditableField
                label=""
                value={editableProduct.productDetails?.name || ''}
                onSave={(value) => updateNestedField('productDetails', 'name', value as string)}
                type="text"
                placeholder="Enter product name"
                maxLength={100}
                disabled={!enableEditing}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Business Overview - Premium Collapsible */}
        <CollapsibleSection
          title="Business Overview"
          description="Company mission, industry, and operations"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 8l4-4 4 4" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600"
          accentColor="bg-amber-400"
          defaultExpanded={sectionsExpanded}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Mission Statement</label>
                <EditableField
                  label=""
                  value={editableProduct.businessOverview?.mission || ''}
                  onSave={(value) => updateNestedField('businessOverview', 'mission', value as string)}
                  type="textarea"
                  placeholder="Define your company's mission and core purpose..."
                  maxLength={500}
                  disabled={!enableEditing}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <EditableField
                  label=""
                  value={editableProduct.businessOverview?.industry || ''}
                  onSave={(value) => updateNestedField('businessOverview', 'industry', value as string)}
                  type="text"
                  placeholder="e.g., SaaS, FinTech, Healthcare, E-commerce..."
                  maxLength={100}
                  disabled={!enableEditing}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Key Operations</label>
              <EditableField
                label=""
                value={editableProduct.businessOverview?.keyOperations || []}
                onSave={(value) => updateNestedField('businessOverview', 'keyOperations', value)}
                type="array"
                arrayItemPlaceholder="Add key operational area (e.g., Product Development, Customer Support)..."
                disabled={!enableEditing}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Target Persona - Premium Collapsible */}
        <CollapsibleSection
          title="Target Persona"
          description="Define your ideal customer profile"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600"
          accentColor="bg-rose-400"
          defaultExpanded={sectionsExpanded}
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Primary Audience</label>
              <EditableField
                label=""
                value={editableProduct.targetPersona?.primaryAudience || ''}
                onSave={(value) => updateNestedField('targetPersona', 'primaryAudience', value as string)}
                type="textarea"
                placeholder="Describe your primary target audience - who they are, what they do, their needs..."
                maxLength={500}
                disabled={!enableEditing}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Demographics</label>
                <EditableField
                  label=""
                  value={editableProduct.targetPersona?.demographics || []}
                  onSave={(value) => updateNestedField('targetPersona', 'demographics', value)}
                  type="array"
                  arrayItemPlaceholder="Add demographic detail (e.g., Age: 25-45, Income: $50k+)..."
                  disabled={!enableEditing}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Industry Segments</label>
                <EditableField
                  label=""
                  value={editableProduct.targetPersona?.industrySegments || []}
                  onSave={(value) => updateNestedField('targetPersona', 'industrySegments', value)}
                  type="array"
                  arrayItemPlaceholder="Add industry segment (e.g., Technology, Finance, Healthcare)..."
                  disabled={!enableEditing}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Psychographics</label>
              <EditableField
                label=""
                value={editableProduct.targetPersona?.psychographics || []}
                onSave={(value) => updateNestedField('targetPersona', 'psychographics', value)}
                type="array"
                arrayItemPlaceholder="Add psychographic detail (e.g., Values innovation, Early adopter)..."
                disabled={!enableEditing}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Value Propositions - Premium Collapsible */}
        <CollapsibleSection
          title="Value Propositions"
          description="What makes your product unique and valuable"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600"
          accentColor="bg-cyan-400"
          defaultExpanded={sectionsExpanded}
          count={(editableProduct.usps?.length || 0) + (editableProduct.painPoints?.length || 0)}
        >
          <div className="space-y-6">
            {/* USPs */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <label className="block text-sm font-semibold text-gray-700">Unique Selling Points</label>
              </div>
              <EditableField
                label=""
                value={editableProduct.usps || []}
                onSave={(value) => updateField('usps', value)}
                type="array"
                arrayItemPlaceholder="Add unique selling point (e.g., 10x faster processing, No-code solution)..."
                disabled={!enableEditing}
              />
            </div>

            {/* Pain Points */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gradient-to-br from-red-100 to-rose-100 rounded-lg border border-red-200">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <label className="block text-sm font-semibold text-gray-700">Pain Points Addressed</label>
              </div>
              <EditableField
                label=""
                value={editableProduct.painPoints || []}
                onSave={(value) => updateField('painPoints', value)}
                type="array"
                arrayItemPlaceholder="Add pain point (e.g., Manual data entry, Lack of real-time insights)..."
                disabled={!enableEditing}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Features and Capabilities - Enhanced Production-Ready Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <button
              onClick={() => setIsCapabilitiesExpanded(!isCapabilitiesExpanded)}
              className="flex items-center gap-4 flex-1 text-left w-full p-6 hover:bg-white/50 rounded-xl transition-all duration-300 group"
            >
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                    Features and Capabilities
                  </h4>
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {editableProduct.capabilities?.length || 0}
                  </div>
                </div>
                <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors duration-200">
                  Define your product's key capabilities and features
                </p>
              </div>
              <div className="flex items-center gap-3">
                {enableEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCapability = {
                        title: '',
                        description: '',
                        content: '',
                        images: []
                      };
                      const updatedCapabilities = [...(editableProduct.capabilities || []), newCapability];
                      updateField('capabilities', updatedCapabilities);
                      // Expand the section when adding a new capability
                      if (!isCapabilitiesExpanded) {
                        setIsCapabilitiesExpanded(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-yellow-600"
                    title="Add new capability"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                )}
                <div className="p-2 rounded-lg bg-white/60 group-hover:bg-white transition-all duration-200">
                  {isCapabilitiesExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Capability Items */}
          <AnimatePresence>
            {isCapabilitiesExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="space-y-6"
              >
                {editableProduct.capabilities && editableProduct.capabilities.length > 0 ? (
                  editableProduct.capabilities.map((capability, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Capability Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border border-blue-200">
                              <span className="text-lg font-bold text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <EditableField
                                label=""
                                value={capability.title || ''}
                                onSave={(value) => {
                                  const updatedCapabilities = [...(editableProduct.capabilities || [])];
                                  updatedCapabilities[index] = {
                                    ...updatedCapabilities[index],
                                    title: value as string
                                  };
                                  updateField('capabilities', updatedCapabilities);
                                }}
                                type="text"
                                placeholder="Capability title (e.g., Real-time Analytics)"
                                maxLength={100}
                                disabled={!enableEditing}
                                className="text-lg font-semibold"
                              />
                            </div>
                          </div>
                          {enableEditing && (
                            <button
                              onClick={() => {
                                const updatedCapabilities = editableProduct.capabilities?.filter((_, i) => i !== index) || [];
                                updateField('capabilities', updatedCapabilities);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Remove capability"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Capability Content */}
                      <div className="p-6 space-y-6">
                        {/* Detailed Content */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detailed Description
                          </label>
                          <EditableField
                            label=""
                            value={capability.content || ''}
                            onSave={(value) => {
                              const updatedCapabilities = [...(editableProduct.capabilities || [])];
                              updatedCapabilities[index] = {
                                ...updatedCapabilities[index],
                                content: value as string
                              };
                              updateField('capabilities', updatedCapabilities);
                            }}
                            type="textarea"
                            placeholder="Detailed explanation of how this capability works, its benefits, and technical details..."
                            maxLength={1000}
                            disabled={!enableEditing}
                          />
                        </div>

                        {/* Images Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Images & Media
                            </label>
                          </div>
                          
                          {/* Image Uploader - Now using unified media library */}
                          {enableEditing && user && (
                            <div className="mb-4">
                              <ImageUploader
                                onUpload={async (result: UploadResult) => {
                                  console.log('🖼️ ProductCardContent: Image upload completed:', result);
                                  
                                  if (result.url && !result.error) {
                                    const updatedCapabilities = [...(editableProduct.capabilities || [])];
                                    const currentImages = updatedCapabilities[index].images || [];
                                    updatedCapabilities[index] = {
                                      ...updatedCapabilities[index],
                                      images: [...currentImages, result.url]
                                    };
                                    
                                    // Update local state
                                    updateField('capabilities', updatedCapabilities);
                                    
                                    // Immediately save to parent to prevent data loss
                                    if (onUpdateSection) {
                                      try {
                                        await onUpdateSection(index ?? 0, 'capabilities', updatedCapabilities);
                                        console.log('✅ Image upload: Successfully updated capabilities in parent');
                                      } catch (error) {
                                        console.error('Image upload: Failed to update capabilities in parent:', error);
                                      }
                                    }
                                  }
                                }}
                                userId={user.id}
                                capabilityId={`${editableProduct.research_result_id || editableProduct.companyName || 'temp'}-capability-${index}`}
                                companyName={userCompanyName}
                                disabled={!enableEditing}
                                maxFiles={5}
                                currentImages={capability.images || []}
                                className="mb-3"
                              />
                            </div>
                          )}
                          
                          {/* Images Display */}
                          {capability.images && capability.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {capability.images.map((imageUrl, imageIndex) => (
                                <div key={imageIndex} className="relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img
                                      src={imageUrl}
                                      alt={`Capability ${index + 1} - Image ${imageIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Handle broken images
                                        const target = e.target as HTMLImageElement;
                                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='0.3em'%3EImage not found%3C/text%3E%3C/svg%3E";
                                      }}
                                    />
                                  </div>
                                  {enableEditing && (
                                    <button
                                      onClick={async () => {
                                        // Note: Image deletion from storage should be handled separately
                                        // This only removes the image reference from the UI
                                        
                                        // Remove from UI
                                        const updatedCapabilities = [...(editableProduct.capabilities || [])];
                                        const currentImages = updatedCapabilities[index].images || [];
                                        updatedCapabilities[index] = {
                                          ...updatedCapabilities[index],
                                          images: currentImages.filter((_, i) => i !== imageIndex)
                                        };
                                        
                                        // Update local state
                                        updateField('capabilities', updatedCapabilities);
                                        
                                        // Immediately save to parent to prevent data loss
                                        if (onUpdateSection) {
                                          try {
                                            await onUpdateSection(index ?? 0, 'capabilities', updatedCapabilities);
                                            console.log('Image deletion: Successfully updated capabilities in parent');
                                          } catch (error) {
                                            console.error('Image deletion: Failed to update capabilities in parent:', error);
                                          }
                                        }
                                      }}
                                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                  {/* Image Preview Overlay */}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <button
                                      onClick={() => {
                                        // Open image in new tab for full view
                                        window.open(imageUrl, '_blank');
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                    >
                                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Capability Footer with metadata */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Capability {index + 1}</span>
                          <div className="flex items-center gap-4">
                            {capability.images && capability.images.length > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {capability.images.length} image{capability.images.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {capability.content && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {capability.content.length} chars
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : null}
                
                {/* Add button at the end of capabilities list */}
                {enableEditing && editableProduct.capabilities && editableProduct.capabilities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex justify-center pt-4"
                  >
                    <button
                      onClick={() => {
                        const newCapability = {
                          title: '',
                          description: '',
                          content: '',
                          images: []
                        };
                        const updatedCapabilities = [...(editableProduct.capabilities || []), newCapability];
                        updateField('capabilities', updatedCapabilities);
                      }}
                                             className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-200 shadow-lg border-2 border-dashed border-yellow-600 hover:border-yellow-700"
                    >
                      <Plus size={18} />
                      Add Another Capability
                    </button>
                  </motion.div>
                )}
                
                {/* Empty state */}
                {(!editableProduct.capabilities || editableProduct.capabilities.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300"
                  >
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No capabilities defined yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start building your product's capability profile by adding core features and functionalities that make your product unique.
                    </p>
                    {enableEditing && (
                      <button
                        onClick={() => {
                          const newCapability = {
                            title: '',
                            description: '',
                            content: '',
                            images: []
                          };
                          const updatedCapabilities = [...(editableProduct.capabilities || []), newCapability];
                          updateField('capabilities', updatedCapabilities);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
                      >
                        <Plus size={18} />
                        Add Your First Capability
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Competitor Analysis - Premium Collapsible */}
      {showCompetitorAnalysis && (
        <div className="mt-8">
          <CollapsibleSection
          title="Competitor Analysis"
          description="Analyze your competitive landscape"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-red-500 via-pink-500 to-purple-600"
          accentColor="bg-red-400"
          defaultExpanded={sectionsExpanded}
          count={
            ((editableProduct.competitors?.direct_competitors?.length || 0) +
             (editableProduct.competitors?.niche_competitors?.length || 0) +
             (editableProduct.competitors?.broader_competitors?.length || 0)) || 0
          }
        >
          <CompetitorAnalysis
            product={editableProduct}
            onUpdate={(url: string) => {
              // Update the competitor analysis URL in the product
              const updatedProduct = {
                ...editableProduct,
                competitorAnalysisUrl: url,
                google_doc: url
              };
              setEditableProduct(updatedProduct);
              
              // Also call the parent update if available
              if (onUpdateSection) {
                onUpdateSection(index ?? 0, 'competitorAnalysisUrl', url);
              }
            }}
            onUpdateCompetitors={(competitors: any) => {
              console.log("ProductCardContent.onUpdateCompetitors called with:", competitors);
              
              // Set flag to prevent useEffect from resetting competitors
              isUpdatingCompetitors.current = true;
              
              // Update the competitors data in the product immediately
              const updatedProduct = {
                ...editableProduct,
                competitors: competitors
              };
              
              console.log("ProductCardContent setting editableProduct with competitors:", updatedProduct.competitors);
              setEditableProduct(updatedProduct);
              
              // Immediately call the parent update to persist the data
              if (onUpdateSection) {
                console.log("ProductCardContent calling onUpdateSection with competitors:", competitors);
                onUpdateSection(index ?? 0, 'competitors', competitors).then(() => {
                  console.log("ProductCardContent: onUpdateSection completed successfully");
                  // DO NOT clear the flag here - let the useEffect handle it when parent prop updates
                  console.log("ProductCardContent: Waiting for parent product prop to reflect competitors before clearing flag");
                }).catch(error => {
                  console.error("Failed to update competitors in parent:", error);
                  // Clear flag on error
                  setTimeout(() => {
                    isUpdatingCompetitors.current = false;
                  }, 1000);
                });
              } else {
                console.warn("ProductCardContent: onUpdateSection is not available");
                // Clear flag if no onUpdateSection available
                setTimeout(() => {
                  isUpdatingCompetitors.current = false;
                }, 1000);
              }
            }}
          />
        </CollapsibleSection>
        </div>
      )}

      {/* Framework Selection Section - Admin Only */}
      {context === 'admin' && (
        <CollapsibleSection
          title="Content Framework"
          description="Select the strategic framework for content generation"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
          accentColor="bg-blue-500"
          defaultExpanded={sectionsExpanded}
          count={editableProduct.framework ? 1 : 0}
        >
          <div className="space-y-6">
            {/* Framework Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                {
                  id: 'product-walkthrough',
                  title: 'Product Walkthrough Framework',
                  description: 'Ideal for step-by-step overviews of how the product works',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  gradient: 'from-emerald-500 to-teal-600',
                  hoverGradient: 'from-emerald-600 to-teal-700',
                  bgPattern: 'from-emerald-50 to-teal-50',
                  borderColor: 'border-emerald-200'
                },
                {
                  id: 'differentiation',
                  title: 'Differentiation Framework',
                  description: 'Highlights how this product stands out from the competition to build trust and reduce the need for comparison',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  gradient: 'from-amber-500 to-orange-600',
                  hoverGradient: 'from-amber-600 to-orange-700',
                  bgPattern: 'from-amber-50 to-orange-50',
                  borderColor: 'border-amber-200'
                },
                {
                  id: 'triple-threat',
                  title: 'Triple Threat Framework',
                  description: 'Used to compare three or more solutions, emphasizing our value proposition while acknowledging competitor strengths',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  gradient: 'from-purple-500 to-indigo-600',
                  hoverGradient: 'from-purple-600 to-indigo-700',
                  bgPattern: 'from-purple-50 to-indigo-50',
                  borderColor: 'border-purple-200'
                },
                {
                  id: 'case-study',
                  title: 'Case Study Framework',
                  description: 'Builds credibility by showcasing real-world results and testimonials from existing customers',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  gradient: 'from-rose-500 to-pink-600',
                  hoverGradient: 'from-rose-600 to-pink-700',
                  bgPattern: 'from-rose-50 to-pink-50',
                  borderColor: 'border-rose-200'
                },
                {
                  id: 'benefit',
                  title: 'Benefit Framework',
                  description: 'Focuses on the core benefits of the product based on common user pain points and goals',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  gradient: 'from-cyan-500 to-blue-600',
                  hoverGradient: 'from-cyan-600 to-blue-700',
                  bgPattern: 'from-cyan-50 to-blue-50',
                  borderColor: 'border-cyan-200'
                }
              ].map((framework, index) => {
                const isSelected = editableProduct.framework === framework.id;
                return (
                  <motion.div
                    key={framework.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`
                      relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer group
                      ${isSelected 
                        ? `${framework.borderColor} shadow-lg scale-[1.02] ring-2 ring-blue-400/30` 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                      }
                    `}
                    onClick={() => {
                      if (enableEditing) {
                        const newFramework = isSelected ? undefined : framework.id;
                        updateField('framework', newFramework);
                      }
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background Pattern */}
                    <div 
                      className={`
                        absolute inset-0 opacity-30 bg-gradient-to-br 
                        ${isSelected ? framework.bgPattern : 'from-gray-50 to-white'}
                      `}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.1),transparent_60%)]"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_60%)]"></div>
                    </div>

                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-3 right-3 z-10"
                        >
                          <div className={`p-1.5 bg-gradient-to-r ${framework.gradient} rounded-full shadow-lg`}>
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative z-10 p-6">
                      {/* Icon and Title */}
                      <div className="flex items-start gap-4 mb-3">
                        <div 
                          className={`
                            p-3 rounded-xl shadow-sm transition-all duration-300
                            ${isSelected 
                              ? `bg-gradient-to-r ${framework.gradient} text-white shadow-lg transform scale-110` 
                              : 'bg-white text-gray-600 group-hover:bg-gray-50'
                            }
                          `}
                        >
                          {framework.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className={`
                            font-bold text-lg leading-tight transition-colors duration-200
                            ${isSelected ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'}
                          `}>
                            {framework.title}
                          </h5>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1"
                            >
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                bg-gradient-to-r ${framework.gradient} text-white shadow-sm
                              `}>
                                Selected
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`
                        text-sm leading-relaxed transition-colors duration-200
                        ${isSelected ? 'text-gray-700' : 'text-gray-600 group-hover:text-gray-700'}
                      `}>
                        {framework.description}
                      </p>

                      {/* Bottom Gradient Line */}
                      <div className={`
                        absolute bottom-0 left-0 right-0 h-1 transition-all duration-300
                        ${isSelected 
                          ? `bg-gradient-to-r ${framework.gradient} opacity-100` 
                          : 'bg-gray-200 opacity-0 group-hover:opacity-50'
                        }
                      `} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Current Selection Display */}
            {editableProduct.framework && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/60">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h6 className="font-semibold text-blue-900">Selected Framework</h6>
                  </div>
                  <p className="text-sm text-blue-800 font-medium">
                    {(() => {
                      const frameworkMap = {
                        'product-walkthrough': 'Product Walkthrough Framework',
                        'differentiation': 'Differentiation Framework',
                        'triple-threat': 'Triple Threat Framework',
                        'case-study': 'Case Study Framework',
                        'benefit': 'Benefit Framework'
                      };
                      return frameworkMap[editableProduct.framework as keyof typeof frameworkMap] || editableProduct.framework;
                    })()}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Clear Selection Button */}
            {editableProduct.framework && enableEditing && (
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateField('framework', undefined)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear Selection
                </motion.button>
              </div>
            )}

            {/* Admin Instructions */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/60">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">Framework Selection Guide:</p>
                  <p>Choose the strategic approach that best aligns with your content goals. This framework will guide the tone, structure, and focus of generated content briefs and articles.</p>
                </div>
              </div>
            </div>

            {/* Admin Badge */}
            <div className="flex justify-end">
              <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                Admin Only
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Keywords Section - Admin Only */}
      {context === 'admin' && (
        <CollapsibleSection
          title="Keywords & Tags"
          description="Identify and manage keywords for content brief generation"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          gradientColors="bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600"
          accentColor="bg-yellow-400"
          defaultExpanded={sectionsExpanded}
          count={editableProduct.keywords?.length}
        >
          <div className="space-y-4">
            {/* Keywords Display and Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Content Keywords
                  <span className="text-xs text-gray-500 font-normal">
                    ({(editableProduct.keywords || []).length} keyword{(editableProduct.keywords || []).length !== 1 ? 's' : ''})
                  </span>
                </span>
              </label>

              <EditableField
                label=""
                value={editableProduct.keywords || []}
                onSave={(value) => updateField('keywords', value)}
                type="array"
                arrayItemPlaceholder="Add keyword (e.g., automation, productivity, SaaS, analytics)..."
                disabled={!enableEditing}
                className="rounded-lg"
              />
            </div>

            {/* Keywords Preview */}
            {editableProduct.keywords && editableProduct.keywords.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Keyword Tags
                </h5>
                
                <div className="flex flex-wrap gap-2">
                  {editableProduct.keywords.map((keyword, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Admin Keywords:</p>
                  <p>These keywords will be included when sending data to AirOps for content brief generation. Keywords help improve content relevance and SEO targeting.</p>
                </div>
              </div>
            </div>

            {/* Admin Badge */}
            <div className="flex justify-end">
              <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                Admin
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Advanced sections - only show when expanded and needed */}
      {isExpanded && (
        <div className="space-y-6 mt-6 pt-6 border-t border-gray-200">
          {/* Actions */}
          {showActions && (
            <ProductCardActions
              product={editableProduct}
              context={context}
              onSave={onSave}
              onApprove={onApprove}
              onExport={onExport}
              onEdit={onEdit}
              onDelete={onDelete}
              onShare={onShare}
              researchResultId={researchResultId}
              approvedProductId={approvedProductId}
              userUUID={userUUID}
              userEmail={userEmail}
              userCompanyName={userCompanyName}
            />
          )}
        </div>
      )}
    </motion.div>
  );
} 